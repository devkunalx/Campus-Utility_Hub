
  const firebaseConfig = {
    apiKey: "AIzaSyAVNSn7h0uhdAz2Dbei9y9uWCwo67_h0CE",
    authDomain: "fir-project-1e7f1.firebaseapp.com",
    projectId: "fir-project-1e7f1",
    storageBucket: "fir-project-1e7f1.firebasestorage.app",
    messagingSenderId: "779214604042",
    appId: "1:779214604042:web:ca1ef7a99aaf7db2ef5cf3",
    measurementId: "G-1XR5LS492G"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Utility to read current user role from Firestore
  async function getCurrentUserRole() {
    const user = auth.currentUser;
    if (!user) return null;
    const snap = await db.collection('users').doc(user.uid).get();
    return snap.exists ? snap.data().role : null;
  }

