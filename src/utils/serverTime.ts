import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

let serverOffset = 0;

// Listen to the server time offset
const offsetRef = ref(db, '.info/serverTimeOffset');
onValue(offsetRef, (snap) => {
  serverOffset = snap.val() || 0;
});

/**
 * Returns the current time synchronized with the Firebase server.
 * This ensures that even if local system clocks are out of sync,
 * all clients will calculate the exact same timestamp.
 */
export function getServerTime(): number {
  return Date.now() + serverOffset;
}
