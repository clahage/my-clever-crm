import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const createTestUser = async () => {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'test@speedycreditrepair.com',
      'Test123!'
    );
    
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: 'test@speedycreditrepair.com',
      role: 'admin',
      createdAt: new Date(),
      displayName: 'Test User'
    });
    
    console.log('Test user created successfully!');
    console.log('Email: test@speedycreditrepair.com');
    console.log('Password: Test123!');
    return user;
  } catch (error) {
    console.error('Error creating test user:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.log('Test user already exists. Try logging in with:');
      console.log('Email: test@speedycreditrepair.com');
      console.log('Password: Test123!');
    }
  }
};

// Run this function
createTestUser();
