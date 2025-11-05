// src/utils/initializeCollections.js
// Run this ONCE to create all necessary collections with sample data
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const initializeDisputeCollections = async () => {
  console.log('🚀 Initializing Dispute System Collections...');
  
  try {
    // 1. Create disputeTemplates collection with default templates
    console.log('Creating disputeTemplates...');
    const templates = [
      {
        id: 'default-initial',
        name: 'Initial Dispute - Basic',
        category: 'bureau',
        type: 'initial',
        content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP]

[Credit Bureau Name]
[Credit Bureau Address]

RE: Request for Investigation of Inaccurate Information

Dear Sir/Madam:

I am writing to dispute the following information in my file. The items I dispute are circled on the attached copy of my credit report.

[List disputed items]

This item is inaccurate because [reason]. I am requesting that the item be removed to correct the information.

Sincerely,
[Your signature]
[Your name]`,
        variables: ['clientName', 'clientAddress', 'bureau', 'creditorName'],
        successRate: 75,
        aiOptimized: true,
        createdAt: serverTimestamp()
      }
    ];
    
    for (const template of templates) {
      await setDoc(doc(db, 'disputeTemplates', template.id), template);
    }
    console.log('✅ disputeTemplates created');
    
    // 2. Create disputeLetters collection (will be populated as users create letters)
    console.log('Creating disputeLetters collection...');
    await setDoc(doc(db, 'disputeLetters', 'placeholder'), {
      note: 'Collection initialized',
      createdAt: serverTimestamp()
    });
    console.log('✅ disputeLetters created');
    
    // 3. Create disputeHistory collection
    console.log('Creating disputeHistory collection...');
    await setDoc(doc(db, 'disputeHistory', 'placeholder'), {
      note: 'Collection initialized',
      createdAt: serverTimestamp()
    });
    console.log('✅ disputeHistory created');
    
    // 4. Create disputeResponses collection
    console.log('Creating disputeResponses collection...');
    await setDoc(doc(db, 'disputeResponses', 'placeholder'), {
      note: 'Collection initialized',
      createdAt: serverTimestamp()
    });
    console.log('✅ disputeResponses created');
    
    // 5. Create permissions collection
    console.log('Creating permissions collection...');
    await setDoc(doc(db, 'permissions', 'default'), {
      role: 'user',
      create_disputes: true,
      view_templates: true,
      use_ai_generation: true,
      mail_delivery: true,
      createdAt: serverTimestamp()
    });
    console.log('✅ permissions created');
    
    // 6. Create settings collection
    console.log('Creating settings collection...');
    await setDoc(doc(db, 'settings', 'system'), {
      aiEnabled: true,
      autoSave: true,
      autoFollowUp: true,
      responseTracking: true,
      batchProcessing: true,
      certifiedMailIntegration: true,
      faxIntegration: true,
      emailIntegration: true,
      portalUpload: true,
      maxDisputesPerDay: 100,
      defaultStrategy: 'moderate',
      requireApproval: false,
      apiRateLimit: 100,
      dataRetentionDays: 365,
      debugMode: false,
      createdAt: serverTimestamp()
    });
    console.log('✅ settings created');
    
    // 7. Create automationRules collection
    console.log('Creating automationRules collection...');
    await setDoc(doc(db, 'automationRules', 'rule-followup'), {
      name: 'Auto Follow-up',
      trigger: 'no_response_30_days',
      action: 'send_followup',
      enabled: true,
      conditions: { daysSinceSent: 30, status: 'sent' },
      createdAt: serverTimestamp()
    });
    console.log('✅ automationRules created');
    
    // 8. Create mailingQueue collection
    console.log('Creating mailingQueue collection...');
    await setDoc(doc(db, 'mailingQueue', 'placeholder'), {
      note: 'Collection initialized',
      createdAt: serverTimestamp()
    });
    console.log('✅ mailingQueue created');
    
    console.log('🎉 All collections created successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    return false;
  }
};

// Function to run initialization
export const runInitialization = async () => {
  const confirmed = window.confirm(
    'This will create all necessary Firebase collections for the Dispute System.\n\n' +
    'Collections to create:\n' +
    '• disputeTemplates\n' +
    '• disputeLetters\n' +
    '• disputeHistory\n' +
    '• disputeResponses\n' +
    '• permissions\n' +
    '• settings\n' +
    '• automationRules\n' +
    '• mailingQueue\n\n' +
    'Continue?'
  );
  
  if (confirmed) {
    const success = await initializeDisputeCollections();
    if (success) {
      alert('✅ All collections created successfully!');
    } else {
      alert('❌ Error creating collections. Check console for details.');
    }
  }
};