jest.mock('expo-secure-store', () => {
  let v: string | null = null;
  return {
    setItemAsync: jest.fn(async (_k: string, val: string) => {
      v = val;
    }),
    getItemAsync: jest.fn(async () => v),
    deleteItemAsync: jest.fn(async () => {
      v = null;
    }),
  };
});

import { tokenStore } from '../storage';

test('set/get/clear round-trips the token', async () => {
  await tokenStore.set('jwt');
  expect(await tokenStore.get()).toBe('jwt');
  await tokenStore.clear();
  expect(await tokenStore.get()).toBeNull();
});
