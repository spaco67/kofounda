// This script is for deploying Firestore rules directly using the Firebase Admin SDK
// No need to install the Firebase CLI for this specific task
// Run this script with: node scripts/deploy-firestore-rules.js

const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const https = require('https');

const firebaseConfig = {
  apiKey: 'AIzaSyAiPhci5uziTomiUXm9y5dvdKiVchq6bjI',
  authDomain: 'kofounda-79d3b.firebaseapp.com',
  projectId: 'kofounda-79d3b',
  storageBucket: 'kofounda-79d3b.firebasestorage.app',
  messagingSenderId: '262610611862',
  appId: '1:262610611862:web:37cb2081e75941999d5cb7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Read the rules file
const rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');
const rules = fs.readFileSync(rulesPath, 'utf8');

console.log('Firestore rules to deploy:');
console.log(rules);
console.log('\nTo deploy these rules:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/kofounda-79d3b/firestore/rules');
console.log('2. Replace the current rules with the rules above');
console.log('3. Click "Publish"');

// Since deploying rules requires the Firebase CLI or direct access to the Management API
// which requires additional authentication, we'll provide instructions for manual deployment
console.log('\nAlternatively, use Firebase CLI if installed:');
console.log('firebase deploy --only firestore:rules');

// Function to sign in as admin to test rules if needed
async function signInAsAdmin() {
  try {
    console.log('\nTo test the rules, you can sign in as admin:');
    // This step requires user interaction, so we're just providing guidance
    console.log('Run in browser console:');
    console.log(`
    firebase.auth().signInWithEmailAndPassword('your-admin-email@example.com', 'your-password')
      .then(userCredential => {
        console.log('Signed in as admin:', userCredential.user.uid);
      })
      .catch(error => {
        console.error('Error signing in:', error);
      });
    `);
  } catch (error) {
    console.error('Error:', error);
  }
}

signInAsAdmin();
