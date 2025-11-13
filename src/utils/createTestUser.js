import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Create a new user account
 *
 * IMPORTANT: This is a production-ready function.
 * Replace the example values below with real user data.
 *
 * @param {string} email - User's email address
 * @param {string} password - User's password (min 6 characters)
 * @param {string} role - User role (admin, manager, user, client, etc.)
 * @param {string} displayName - User's display name
 */
export const createUser = async (email, password, role = 'user', displayName = '') => {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: role,
      createdAt: new Date(),
      displayName: displayName || email.split('@')[0]
    });

    console.log('User created successfully!');
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Example usage:
// createUser('user@yourdomain.com', 'securePassword123', 'admin', 'Admin User');
