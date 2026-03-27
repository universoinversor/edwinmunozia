const firebaseConfig = {
  apiKey: "AIzaSyABw4YfD-DBMMQMXpk3q5SiHai176hvvYc",
  authDomain: "portafolio-a100a.firebaseapp.com",
  projectId: "portafolio-a100a",
  storageBucket: "portafolio-a100a.firebasestorage.app",
  messagingSenderId: "341173562110",
  appId: "1:341173562110:web:415ded3b022b885a7f53af",
  measurementId: "G-PGWVVCG0N3"
};

try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    console.log("Firebase Global Initialized");
} catch(e) {
    console.warn("Firebase no se pudo inicializar.", e);
}
