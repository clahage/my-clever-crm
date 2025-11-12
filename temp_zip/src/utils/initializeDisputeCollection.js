import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function initializeDisputeCollection() {
  try {
    // Create a sample structure (then delete it)
    const sampleDispute = {
      _placeholder: true,
      structure: {
        clientId: 'string',
        clientName: 'string',
        items: 'array of dispute items',
        bureaus: 'array of bureau names',
        letterType: 'initial|reinvestigation|directCreditor',
        status: 'draft|pending_send|sent|responded',
        createdAt: 'timestamp',
        sentAt: 'timestamp or null',
        faxIds: 'object with bureau names as keys'
      }
    };
    
    await setDoc(doc(db, 'disputes', '_structure'), sampleDispute);
    console.log('Dispute collection initialized');
  } catch (error) {
    console.error('Error initializing dispute collection:', error);
  }
}