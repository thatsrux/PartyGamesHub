import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import fs from 'fs';

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const data = JSON.parse(fs.readFileSync('./src/data/footballers.json', 'utf8'));

set(ref(db, 'games_data/footballers'), data)
  .then(() => {
    console.log("Database popolato con successo!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Errore durante il caricamento:", error);
    process.exit(1);
  });
