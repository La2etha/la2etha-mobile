import * as SecureStore from 'expo-secure-store';

const KEY = 'lahza.onboarded';

// true = the user has never completed onboarding.
export const firstRun = {
  get: async () => (await SecureStore.getItemAsync(KEY)) === null,
  complete: () => SecureStore.setItemAsync(KEY, '1'),
};
