import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { tokenStore } from './storage';
import { login as apiLogin, register as apiRegister, me as apiMe, User } from '../api/auth';

type Status = 'loading' | 'signedOut' | 'signedIn';

type Ctx = {
  user: User | null;
  token: string | null;
  status: Status;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    (async () => {
      const t = await tokenStore.get();
      if (!t) return setStatus('signedOut');
      try {
        setUser(await apiMe(t));
        setToken(t);
        setStatus('signedIn');
      } catch {
        await tokenStore.clear();
        setStatus('signedOut');
      }
    })();
  }, []);

  async function finish(token: string) {
    await tokenStore.set(token);
    setUser(await apiMe(token));
    setToken(token);
    setStatus('signedIn');
  }

  const signIn = async (email: string, password: string) => finish(await apiLogin(email, password));
  const signUp = async (email: string, password: string, name: string) => {
    await apiRegister(email, password, name);
    await finish(await apiLogin(email, password));
  };
  const signOut = async () => {
    await tokenStore.clear();
    setUser(null);
    setToken(null);
    setStatus('signedOut');
  };

  return (
    <AuthCtx.Provider value={{ user, token, status, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
