// Unified Contact Pipeline Service - Handles all contact creation and categorization
import { collection, doc, setDoc, updateDoc, onSnapshot, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

class ContactPipelineService {
  constructor() {
    this.listeners = new Map();
    this.initializeListeners();
  }

  // Initialize all real-time listeners
  initializeListeners() {
    // Listen for new AI receptionist calls
    this.listenToAIReceptionistCalls();
    
    // Listen for contact activity changes
    this.listenToContactActivity();
    
    // Listen for external integrations (placeholder for Yelp, Google, etc.)
    this.listenToExternalSources();
  }

  // Process ALL incoming AI calls automatically
  listenToAIReceptionistCalls() {
    const q = query(
      collection(db, 'aiReceptionistCalls'),
      where('convertedToContact', '!=', true)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          const callData = { id: change.doc.id, ...change.doc.data() };
          
          // Only process if it has required fields
          if (callData.processed && callData.leadScore !== undefined) {
            await this.processIncomingLead(callData, 'ai-receptionist');
          }
        }
      }
    });

    this.listeners.set('aiCalls', unsubscribe);
  }

  // Process any lead from any source
  async processIncomingLead(data, source) {
    try {
      // Determine initial category based on data
      const category = this.determineInitialCategory(data);
      
      // Check if contact already exists
      const existingContact = await this.findExistingContact(data.caller || data.phone || data.email);
      
      if (existingContact) {
        // Update existing contact with new interaction
        await this.updateExistingContact(existingContact.id, data, source);
      } else {
        // Create new contact
        await this.createNewContact(data, category, source);
      }
      
      // Mark source as processed
      if (source === 'ai-receptionist' && data.id) {
        await updateDoc(doc(db, 'aiReceptionistCalls', data.id), {
          convertedToContact: true,
          processedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error processing lead:', error);
    }
  }

  // Determine category based on lead score and engagement
  determineInitialCategory(data) {
    // High-value indicators
    const hasHighScore = (data.leadScore || 0) >= 8;
    const hasUrgency = data.urgencyLevel === 'high';
    const hasCriticalNeeds = (data.painPoints || []).some(p => 
      ['collections', 'bankruptcy', 'foreclosure'].some(c => p.toLowerCase().includes(c))
    );
    
    // Existing customer check (would need additional data)
    const isExistingCustomer = data.isCustomer || false;
    
    // Categorization logic
    if (isExistingCustomer) return 'client';
    if (hasHighScore || hasUrgency || hasCriticalNeeds) return 'lead';
    if (data.isVendor) return 'vendor';
    if (data.isEmployee) return 'employee';
    if (data.isAffiliate) return 'affiliate';
    
    // Default to lead for unknown contacts
    return 'lead';
  }

  // Find existing contact by phone, email, or name
  async findExistingContact(identifier) {
    if (!identifier) return null;
    
    // Try phone number first
    if (identifier.includes('+')) {
      const q = query(collection(db, 'contacts'), where('phone', '==', identifier));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    }
    
    // Try email
    if (identifier.includes('@')) {
      const q = query(collection(db, 'contacts'), where('email', '==', identifier));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
    }
    
    return null;
  }

  // Create new contact with full categorization
  async createNewContact(data, category, source) {
    const contactData = {
      // Identity
      name: data.callerName || data.name || 'Unknown Contact',
      phone: data.caller || data.phone || '',
      email: data.email || '',
      
      // Categorization
      category: category,
      status: this.determineStatus(data, category),
      leadScore: data.leadScore || 0,
      
      // Engagement tracking
      interactions: [{
        date: new Date(),
        type: source,
        summary: data.summary || '',
        sentiment: data.sentiment || {},
        duration: data.duration || 0
      }],
      totalInteractions: 1,
      lastInteraction: serverTimestamp(),
      
      // Business intelligence
      urgencyLevel: data.urgencyLevel || 'low',
      painPoints: data.painPoints || [],
      conversionProbability: data.conversionProbability || 0,
      lifetime_value: 0,
      
      // Source tracking
      source: source,
      originalSourceId: data.id || null,
      
      // Metadata
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      tags: this.generateTags(data, category),
      
      // Automation flags
      autoCreated: true,
      requiresReview: category === 'lead' && (data.leadScore || 0) >= 8
    };
    
    const contactRef = doc(collection(db, 'contacts'));
    await setDoc(contactRef, contactData);
    
    console.log(`Created new ${category} contact: ${contactData.name}`);
    return contactRef.id;
  }

  // Update existing contact with new interaction
  async updateExistingContact(contactId, newData, source) {
    const contactRef = doc(db, 'contacts', contactId);
    
    // Get current data
    const snapshot = await getDocs(query(collection(db, 'contacts'), where('__name__', '==', contactId)));
    const currentData = snapshot.docs[0]?.data() || {};
    
    // Add new interaction
    const interactions = currentData.interactions || [];
    interactions.push({
      date: new Date(),
      type: source,
      summary: newData.summary || '',
      sentiment: newData.sentiment || {},
      duration: newData.duration || 0
    });
    
    // Recalculate metrics
    const totalInteractions = interactions.length;
    const avgLeadScore = this.calculateAverageScore(currentData, newData);
    
    // Check if category should change
    const newCategory = this.shouldChangeCategory(currentData, newData, interactions);
    
    const updates = {
      interactions,
      totalInteractions,
      lastInteraction: serverTimestamp(),
      updatedAt: serverTimestamp(),
      leadScore: avgLeadScore
    };
    
    // Update category if needed
    if (newCategory && newCategory !== currentData.category) {
      updates.category = newCategory;
      updates.categoryChangedAt = serverTimestamp();
      updates.previousCategory = currentData.category;
      console.log(`Contact ${currentData.name} moved from ${currentData.category} to ${newCategory}`);
    }
    
    await updateDoc(contactRef, updates);
  }

  // Determine if category should change based on behavior
  shouldChangeCategory(currentData, newData, interactions) {
    const currentCategory = currentData.category;
    
    // Lead to Client: Multiple positive interactions or purchase
    if (currentCategory === 'lead') {
      const positiveInteractions = interactions.filter(i => 
        i.sentiment?.positive > 50 || i.type === 'purchase'
      ).length;
      
      if (positiveInteractions >= 3 || newData.madePayment) {
        return 'client';
      }
      
      // Lead to Do Not Call: Negative sentiment or request
      if (newData.requestedNoContact || interactions.length > 5 && currentData.leadScore < 3) {
        return 'do-not-call';
      }
    }
    
    // Client to Previous Client: No interaction for 6 months
    if (currentCategory === 'client') {
      const lastInteractionDate = currentData.lastInteraction?.toDate() || new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (lastInteractionDate < sixMonthsAgo) {
        return 'previous-client';
      }
    }
    
    // Previous Client to Lead: Re-engagement
    if (currentCategory === 'previous-client' && newData.leadScore >= 5) {
      return 'lead';
    }
    
    return null; // No change
  }

  // Calculate average lead score across interactions
  calculateAverageScore(currentData, newData) {
    const scores = [currentData.leadScore || 0];
    if (newData.leadScore) scores.push(newData.leadScore);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Determine status within category
  determineStatus(data, category) {
    if (category === 'lead') {
      if (data.leadScore >= 8) return 'hot';
      if (data.leadScore >= 5) return 'warm';
      return 'cold';
    }
    
    if (category === 'client') {
      // Could be based on payment history, engagement, etc.
      return 'active';
    }
    
    return 'standard';
  }

  // Generate automatic tags
  generateTags(data, category) {
    const tags = [category];
    
    if (data.source) tags.push(`source-${data.source}`);
    if (data.leadScore >= 8) tags.push('hot-lead');
    if (data.urgencyLevel === 'high') tags.push('urgent');
    if (data.painPoints?.length > 2) tags.push('multiple-needs');
    
    return tags;
  }

  // Monitor all contacts for activity-based changes
  listenToContactActivity() {
    const q = query(collection(db, 'contacts'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'modified') {
          const contact = { id: change.doc.id, ...change.doc.data() };
          
          // Check for category change triggers
          await this.evaluateContactStatus(contact);
        }
      }
    });
    
    this.listeners.set('contacts', unsubscribe);
  }

  // Evaluate if contact needs status change
  async evaluateContactStatus(contact) {
    // Check engagement patterns
    const interactions = contact.interactions || [];
    const recentInteractions = interactions.filter(i => {
      const interactionDate = i.date?.toDate() || new Date(i.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return interactionDate > thirtyDaysAgo;
    });
    
    // Hot lead cooling down
    if (contact.status === 'hot' && recentInteractions.length === 0) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        status: 'warm',
        statusChangedAt: serverTimestamp()
      });
    }
    
    // Cold lead warming up
    if (contact.status === 'cold' && recentInteractions.length >= 2) {
      await updateDoc(doc(db, 'contacts', contact.id), {
        status: 'warm',
        statusChangedAt: serverTimestamp()
      });
    }
  }

  // Placeholder for external source integration
  listenToExternalSources() {
    // This would connect to:
    // - Google My Business API
    // - Yelp API
    // - Email webhook
    // - SMS webhook
    // - Social media APIs
    console.log('External source listeners initialized (placeholder)');
  }

  // Clean up all listeners
  dispose() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }
}

// Create singleton instance
const contactPipeline = new ContactPipelineService();

export default contactPipeline;