// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6ulT7ksapB68ncJknvc-D2c6ag1lv0-U",
  authDomain: "manasvipothu-999.firebaseapp.com",
  projectId: "manasvipothu-999",
  storageBucket: "manasvipothu-999.firebasestorage.app",
  messagingSenderId: "720089531747",
  appId: "1:720089531747:web:2f0591031357b1a45c3f56",
  measurementId: "G-3RD8EYPFTT"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };



