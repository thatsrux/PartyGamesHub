import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// TODO: Sostituisci questo con la configurazione fornita dall'utente
const firebaseConfig = {
  apiKey: "AIzaSyAw0CDSH-ng-T6iqeloZ1LoRxzfihdo_sI",
  authDomain: "partygames-c9dc1.firebaseapp.com",
  databaseURL: "https://partygames-c9dc1-default-rtdb.firebaseio.com",
  projectId: "partygames-c9dc1",
  storageBucket: "partygames-c9dc1.firebasestorage.app",
  messagingSenderId: "768870647952",
  appId: "1:768870647952:web:13ab422a1d58c3050b3015",
  measurementId: "G-QB31P4EJLX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { app, db, auth };
