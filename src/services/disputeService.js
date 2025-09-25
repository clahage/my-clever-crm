import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'disputeLetters';

const disputeService = {
  // Create a new dispute letter
  async createLetter(userId, letterData) {
    try {
      const letterWithMeta = {
        ...letterData,
        userId,
        status: letterData.status || 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sentAt: null,
        resolvedAt: null
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), letterWithMeta);
      
      // Return the created letter with its ID
      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...newDoc.data(),
        createdAt: newDoc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: newDoc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating dispute letter:', error);
      throw error;
    }
  },

  // Get all letters for a user
  async getLetters(userId, options = {}) {
    try {
      const { status, bureauFilter, limit: queryLimit = 100, lastDoc } = options;
      
      let q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      // Add status filter if provided
      if (status && status !== 'all') {
        q = query(
          collection(db, COLLECTION_NAME),
          where('userId', '==', userId),
          where('status', '==', status),
          orderBy('createdAt', 'desc')
        );
      }

      // Add bureau filter if provided
      if (bureauFilter && bureauFilter !== 'all') {
        q = query(
          collection(db, COLLECTION_NAME),
          where('userId', '==', userId),
          where('bureau', '==', bureauFilter),
          orderBy('createdAt', 'desc')
        );
      }

      // Add pagination
      if (queryLimit) {
        q = query(q, limit(queryLimit));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const letters = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        letters.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          sentAt: data.sentAt?.toDate?.()?.toISOString() || data.sentAt,
          resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || data.resolvedAt
        });
      });

      return letters;
    } catch (error) {
      console.error('Error fetching dispute letters:', error);
      // Return empty array if collection doesn't exist yet
      return [];
    }
  },

  // Get a single letter by ID
  async getLetter(letterId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, letterId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Letter not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        sentAt: data.sentAt?.toDate?.()?.toISOString() || data.sentAt,
        resolvedAt: data.resolvedAt?.toDate?.()?.toISOString() || data.resolvedAt
      };
    } catch (error) {
      console.error('Error fetching dispute letter:', error);
      throw error;
    }
  },

  // Update a dispute letter
  async updateLetter(letterId, updates) {
    try {
      const docRef = doc(db, COLLECTION_NAME, letterId);
      
      // Add update timestamp
      const updatesWithMeta = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Handle status changes
      if (updates.status === 'sent' && !updates.sentAt) {
        updatesWithMeta.sentAt = serverTimestamp();
      }
      if (updates.status === 'resolved' && !updates.resolvedAt) {
        updatesWithMeta.resolvedAt = serverTimestamp();
      }

      await updateDoc(docRef, updatesWithMeta);
      
      // Return the updated letter
      return await this.getLetter(letterId);
    } catch (error) {
      console.error('Error updating dispute letter:', error);
      throw error;
    }
  },

  // Delete a dispute letter
  async deleteLetter(letterId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, letterId);
      await deleteDoc(docRef);
      return { success: true, id: letterId };
    } catch (error) {
      console.error('Error deleting dispute letter:', error);
      throw error;
    }
  },

  // Batch update multiple letters
  async batchUpdateLetters(letterIds, updates) {
    try {
      const updatePromises = letterIds.map(id => 
        this.updateLetter(id, updates)
      );
      
      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error batch updating letters:', error);
      throw error;
    }
  },

  // Get letter statistics for a user
  async getLetterStats(userId) {
    try {
      const letters = await this.getLetters(userId);
      
      const stats = {
        total: letters.length,
        draft: 0,
        sent: 0,
        pending: 0,
        resolved: 0,
        byBureau: {
          Equifax: 0,
          Experian: 0,
          TransUnion: 0
        },
        byReason: {}
      };

      letters.forEach(letter => {
        // Count by status
        if (letter.status) {
          stats[letter.status] = (stats[letter.status] || 0) + 1;
        }

        // Count by bureau
        if (letter.bureau && stats.byBureau[letter.bureau] !== undefined) {
          stats.byBureau[letter.bureau]++;
        }

        // Count by reason
        if (letter.reason) {
          stats.byReason[letter.reason] = (stats.byReason[letter.reason] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating letter statistics:', error);
      throw error;
    }
  },

  // Generate a letter template
  generateTemplate(type, data) {
    const templates = {
      validation: {
        title: 'Debt Validation Letter',
        content: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Bureau/Creditor Name]
[Address]
[City, State ZIP]

Re: Account Number: ${data.accountNumber || '[Account Number]'}

Dear Sir/Madam,

I am writing to request validation of the debt referenced above that appears on my credit report. Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request validation of any debt.

Please provide the following:
1. Proof that I am responsible for this debt
2. A complete payment history
3. A copy of the original signed contract or agreement
4. Proof that you have the legal right to collect this debt

Until you provide this validation, please cease all collection activities and remove this item from my credit report.

Sincerely,
[Your Signature]
[Your Name]`
      },
      dispute: {
        title: 'Credit Report Dispute Letter',
        content: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

${data.bureau || '[Credit Bureau Name]'}
Dispute Department
[Bureau Address]

Re: Dispute of Inaccurate Information

Dear Dispute Department,

I am writing to dispute the following inaccurate information on my credit report:

Account: ${data.accountNumber || '[Account Number]'}
Creditor: ${data.creditorName || '[Creditor Name]'}
Reason for Dispute: ${data.reason || '[Reason for dispute]'}

${data.explanation || '[Detailed explanation of why this information is inaccurate]'}

Under the Fair Credit Reporting Act, you are required to investigate this dispute within 30 days. Please remove this inaccurate information from my credit report immediately.

Enclosed are the following supporting documents:
${data.supportingDocs || '[List of enclosed documents]'}

Please send me written confirmation that this information has been removed from my credit file.

Sincerely,
[Your Signature]
[Your Name]

SSN: XXX-XX-${data.ssnLast4 || 'XXXX'}
DOB: ${data.dateOfBirth || '[Date of Birth]'}`
      },
      goodwill: {
        title: 'Goodwill Letter',
        content: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

${data.creditorName || '[Creditor Name]'}
[Address]
[City, State ZIP]

Re: Goodwill Request for Account ${data.accountNumber || '[Account Number]'}

Dear ${data.creditorName || '[Creditor Name]'} Customer Service,

I am writing to request a goodwill adjustment to my credit report regarding the above-referenced account.

${data.explanation || '[Explain your history with the company and the circumstances that led to the late payment(s)]'}

I take full responsibility for the late payment(s) and have since taken steps to ensure this doesn't happen again. I have been a customer for ${data.customerLength || '[length of time]'} and have maintained a good payment history except for this incident.

I would be extremely grateful if you would consider removing the late payment(s) from my credit report as a gesture of goodwill. This would greatly help me as I ${data.purpose || '[explain why you need good credit - mortgage, job, etc.]'}.

Thank you for considering my request and for your continued excellent service.

Sincerely,
[Your Signature]
[Your Name]
Account Number: ${data.accountNumber || '[Account Number]'}`
      },
      cease: {
        title: 'Cease and Desist Letter',
        content: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Collection Agency Name]
[Address]
[City, State ZIP]

Re: Cease and Desist - Account ${data.accountNumber || '[Account Number]'}

Dear Sir/Madam,

This letter is to formally notify you to cease and desist all communication with me regarding the above-referenced account.

Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request that you stop contacting me about this alleged debt. I am exercising that right.

Do not contact me by:
- Phone (home, work, or mobile)
- Email
- Text message
- Mail (except as required by law)
- In person

Any further contact from your organization, except as expressly allowed by law, will be considered harassment and will be reported to the appropriate authorities, including:
- Consumer Financial Protection Bureau (CFPB)
- Federal Trade Commission (FTC)
- [Your State] Attorney General's Office

Please confirm receipt of this letter in writing.

Sincerely,
[Your Signature]
[Your Name]`
      }
    };

    return templates[type] || templates.dispute;
  },

  // Search letters
  async searchLetters(userId, searchTerm) {
    try {
      // Note: This is a basic implementation. For production, consider using
      // a full-text search solution like Algolia or Elasticsearch
      const allLetters = await this.getLetters(userId);
      
      const searchLower = searchTerm.toLowerCase();
      return allLetters.filter(letter => 
        letter.title?.toLowerCase().includes(searchLower) ||
        letter.content?.toLowerCase().includes(searchLower) ||
        letter.bureau?.toLowerCase().includes(searchLower) ||
        letter.accountNumber?.toLowerCase().includes(searchLower) ||
        letter.reason?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching letters:', error);
      throw error;
    }
  },

  // Export letters to JSON
  async exportLetters(userId) {
    try {
      const letters = await this.getLetters(userId);
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        letterCount: letters.length,
        letters: letters
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting letters:', error);
      throw error;
    }
  }
};

export default disputeService;