import * as SecureStore from 'expo-secure-store';

const KEY = 'lahza.jwt';

export const tokenStore = {
  set: (t: string) => SecureStore.setItemAsync(KEY, t),
  get: () => SecureStore.getItemAsync(KEY),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
