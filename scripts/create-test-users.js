const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAiPhci5uziTomiUXm9y5dvdKiVchq6bjI',
  authDomain: 'kofounda-79d3b.firebaseapp.com',
  projectId: 'kofounda-79d3b',
  storageBucket: 'kofounda-79d3b.firebasestorage.app',
  messagingSenderId: '262610611862',
  appId: '1:262610611862:web:37cb2081e75941999d5cb7',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestUser(email, password, role) {
  try {
    console.log(`Creating ${role} account: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    console.log(`User created with ID: ${userId}`);

    const userData = {
      uid: userId,
      email: email,
      role: role,
      tokensUsed: 0,
      isSubscribed: true,
      subscriptionTier: 'pro',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      profile: {
        displayName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        bio: `This is a test ${role} account.`,
        avatarUrl: null,
      },
      permissions: {
        canAccessAdmin: role === 'admin' || role === 'developer',
        canManageUsers: role === 'admin',
        canViewAnalytics: role === 'admin' || role === 'developer',
        maxTokensPerMonth: role === 'admin' ? 100000 : 50000,
        maxProjectsAllowed: role === 'admin' ? 100 : 20,
      },
      verified: true,
    };

    await setDoc(doc(db, 'users', userId), userData);
    console.log('User document created successfully');
    return userId;
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
}

async function updateUserToRole(userId, role) {
  try {
    console.log(`Updating user to ${role}: ${userId}`);

    const roleData = {
      role: role,
      permissions: {
        canAccessAdmin: role === 'admin' || role === 'developer',
        canManageUsers: role === 'admin',
        canViewAnalytics: role === 'admin' || role === 'developer',
        maxTokensPerMonth: role === 'admin' ? 100000 : 50000,
        maxProjectsAllowed: role === 'admin' ? 100 : 20,
      },
      isSubscribed: true,
      subscriptionTier: 'pro',
      verified: true,
    };

    await updateDoc(doc(db, 'users', userId), roleData);
    console.log(`User updated to ${role} successfully`);
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function main() {
  try {
    // Create new test users
    // await createTestUser('admin@kofounda.test', 'Admin123!', 'admin');
    // await createTestUser('developer@kofounda.test', 'Developer123!', 'developer');

    // Or update an existing user (use your actual user ID)
    const existingUserId = '9nlO0vQpJbhX41ysDclaZFmn2q62';
    await updateUserToRole(existingUserId, 'admin');

    console.log('All operations completed successfully');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    process.exit(0);
  }
}

main();
