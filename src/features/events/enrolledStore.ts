import * as SecureStore from 'expo-secure-store';

// ponytail: no backend "am I enrolled" endpoint exists yet — persist the flag
// locally the moment enrollment finishes. Swap for a server field if/when one ships.
const key = (eventId: string) => `lahza.enrolled.${eventId}`;

export const enrolledStore = {
  get: (eventId: string) => SecureStore.getItemAsync(key(eventId)).then((v) => v === '1'),
  set: (eventId: string) => SecureStore.setItemAsync(key(eventId), '1'),
};
