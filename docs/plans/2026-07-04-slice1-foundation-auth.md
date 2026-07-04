# Lahza Mobile — Slice 1: Foundation + Splash + Onboarding + Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Expo app with its full design foundation (tokens, fonts, motion, native scaffolding) and a working, real-API auth flow — sign up, sign in, stay signed in — so the owner can run it on their phone and log into the live backend.

**Architecture:** A fresh Expo Router (file-based) app. A typed `fetch` client wraps the FastAPI backend with a single error-mapping layer that turns every failure into a friendly, human message (no raw errors). JWT is held in `expo-secure-store` behind an auth context; TanStack Query owns server state. Screens are thin; logic (client, error map, auth store, boot routing) is pure and unit-tested. Visuals are verified on-device via Expo Go.

**Tech Stack:** Expo (managed, latest SDK) · Expo Router · TypeScript · Reanimated 3 · Moti · react-native-gesture-handler · expo-haptics · expo-image · expo-font · expo-secure-store · @tanstack/react-query · Jest + @testing-library/react-native.

## Global Constraints

- **Real API only.** No client-side mock-fallback that fabricates real content. Backend base URL from `EXPO_PUBLIC_API_BASE_URL`.
- **No raw errors in the UI.** Every network/HTTP failure maps to a friendly `StateView` message. No status codes or stack traces shown.
- **Demonstration content only replaces empty states** (arrives in later slices; the mechanism/`StateView` lands here).
- **Brand palette is LOCKED (verbatim):** teal `#0b3b3a` / `#14514f` / `#1d6b68`; cream `#faf4e8` / `#f1e7d3`; orange `#c8562a` / `#ab4620`; glow-teal `#37d6c4`; glow-hot `#ff6a3d`.
- **Body-legal text colors on cream:** `#0b3b3a` and `#1d6b68` only. `#a2795a` is metadata captions ONLY (≈3:1), never body/placeholder.
- **Login is form-encoded:** `POST /auth/jwt/login` uses `application/x-www-form-urlencoded` with `username`=email, `password`. Returns `{access_token, token_type}`.
- **Register:** `POST /auth/register` JSON `{email, password, name}` → returns user, NO token; follow with login.
- **Me:** `GET /users/me` with `Authorization: Bearer <token>` → `{id, email, name, is_active, is_superuser, is_verified}`.
- **Owner commits, never the agent.** Each task ends at an owner checkpoint with a suggested message. **No AI attribution** in any commit message.
- **Reduced motion honored** on every animation.

---

### Task 1: Scaffold the Expo app

**Files:**
- Create: `la2etha-mobile/` (Expo project root — run all subsequent paths relative to it)
- Create: `la2etha-mobile/package.json` (generated), `app.json`, `tsconfig.json`, `.gitignore`, `.env` (gitignored), `jest.config.js`
- Create: `la2etha-mobile/app/_layout.tsx`, `la2etha-mobile/app/index.tsx` (temporary)

**Interfaces:**
- Produces: a runnable Expo app; `EXPO_PUBLIC_API_BASE_URL` env available at runtime.

- [ ] **Step 1: Scaffold** (from `la2etha/` — the docs/ folder already exists in `la2etha-mobile/`; scaffold in place)

```bash
cd la2etha
npx create-expo-app@latest la2etha-mobile --template blank-typescript
cd la2etha-mobile
```
> If the folder isn't empty due to `docs/`, scaffold into a temp dir and move files in, or pass `--yes` and merge. Keep `docs/`.

- [ ] **Step 2: Install runtime deps**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar \
  react-native-reanimated react-native-gesture-handler moti \
  expo-font expo-image expo-haptics expo-secure-store \
  @tanstack/react-query @shopify/flash-list
```

- [ ] **Step 3: Install dev deps + test tooling**

```bash
npm i -D jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest
```

- [ ] **Step 4: Configure Expo Router entry + Reanimated plugin**

`package.json` → set `"main": "expo-router/entry"`.
`app.json` → add `"scheme": "lahza"`, `"plugins": ["expo-router"]`, and under `experiments` `"typedRoutes": true`.
Create `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // MUST be last
  };
};
```

- [ ] **Step 5: Jest config**

`jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@shopify/flash-list|moti|react-native-reanimated))',
  ],
};
```
Add to `package.json` scripts: `"test": "jest"`, `"start": "expo start"`.

- [ ] **Step 6: Minimal root layout + temp index**

`app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

`app/index.tsx`:

```tsx
import { Text, View } from 'react-native';
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Lahza — booting</Text>
    </View>
  );
}
```

- [ ] **Step 7: Env file**

`.env` (gitignored): `EXPO_PUBLIC_API_BASE_URL=http://localhost:8000`
Confirm `.gitignore` includes `.env`, `node_modules/`, `.expo/`.

- [ ] **Step 8: Verify it boots**

```bash
npx expo start
```
Expected: Metro starts, QR code prints. (Owner scans with Expo Go → sees "Lahza — booting".)

- [ ] **Step 9: ✋ Owner checkpoint** — verify on phone, then commit.

```bash
git add -A && git commit -m "chore: scaffold Expo app with router, reanimated, test tooling"
```

---

### Task 2: Design tokens, fonts, and motion presets

**Files:**
- Create: `src/theme/tokens.ts`, `src/theme/typography.ts`, `src/theme/motion.ts`, `src/theme/index.ts`
- Create: `assets/fonts/` (Fraunces, HankenGrotesk, IBMPlexSansArabic, SpaceMono `.ttf`s)
- Create: `src/theme/useFonts.ts`
- Test: `src/theme/__tests__/tokens.test.ts`

**Interfaces:**
- Produces: `colors` (object with the locked hexes), `space`, `radius`, `type` (font-family + scale), `motion` (durations, easings), `useAppFonts(): boolean`.

- [ ] **Step 1: Write the failing test** (`src/theme/__tests__/tokens.test.ts`)

```ts
import { colors, bodyLegalOnCream } from '../tokens';

test('locked brand hexes are exact', () => {
  expect(colors.ink).toBe('#0b3b3a');
  expect(colors.paper).toBe('#faf4e8');
  expect(colors.stamp).toBe('#c8562a');
  expect(colors.glowTeal).toBe('#37d6c4');
});

test('faint caption color is NOT body-legal on cream', () => {
  expect(bodyLegalOnCream).toContain(colors.ink);
  expect(bodyLegalOnCream).toContain(colors.inkSoft);
  expect(bodyLegalOnCream).not.toContain(colors.inkFaint);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tokens`
Expected: FAIL (`Cannot find module '../tokens'`).

- [ ] **Step 3: Implement tokens** (`src/theme/tokens.ts`)

```ts
export const colors = {
  paper: '#faf4e8', paperSunk: '#f1e7d3', card: '#ffffff',
  ink: '#0b3b3a', inkSoft: '#1d6b68', inkFaint: '#a2795a',
  line: '#eaddc4',
  stamp: '#c8562a', stampDeep: '#ab4620',
  glowTeal: '#37d6c4', glowHot: '#ff6a3d',
  success: '#2f8f6b', warning: '#c8892a', danger: '#b5432a', info: '#1d6b68',
} as const;

// Shadows/recessed surfaces carry a teal-biased tint (anti-generic guardrail §2.5).
export const tint = { shadow: 'rgba(11,59,58,0.14)', shadowSoft: 'rgba(11,59,58,0.08)' } as const;

export const bodyLegalOnCream = [colors.ink, colors.inkSoft] as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 40 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tokens`
Expected: PASS.

- [ ] **Step 5: Add fonts** — download the `.ttf` families into `assets/fonts/` (Fraunces variable or 9/24/72pt, HankenGrotesk Regular/Medium/SemiBold/Bold, IBMPlexSansArabic Regular/SemiBold, SpaceMono Regular). Create `src/theme/typography.ts`:

```ts
export const fontFamily = {
  display: 'Fraunces', body: 'Hanken', bodyMedium: 'Hanken-Medium',
  bodySemibold: 'Hanken-SemiBold', bodyBold: 'Hanken-Bold',
  arabic: 'PlexArabic', mono: 'SpaceMono',
} as const;

export const type = {
  display: { fontFamily: fontFamily.display, fontSize: 34, letterSpacing: -0.5, lineHeight: 38 },
  h1: { fontFamily: fontFamily.bodyBold, fontSize: 24, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamily.bodySemibold, fontSize: 18, letterSpacing: -0.2 },
  body: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: 14 },
  caption: { fontFamily: fontFamily.body, fontSize: 12.5, lineHeight: 17 },
  mono: { fontFamily: fontFamily.mono, fontSize: 11.5, letterSpacing: 0.5 },
} as const;
```

- [ ] **Step 6: Font loader** (`src/theme/useFonts.ts`)

```ts
import { useFonts } from 'expo-font';

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    Fraunces: require('../../assets/fonts/Fraunces.ttf'),
    Hanken: require('../../assets/fonts/HankenGrotesk-Regular.ttf'),
    'Hanken-Medium': require('../../assets/fonts/HankenGrotesk-Medium.ttf'),
    'Hanken-SemiBold': require('../../assets/fonts/HankenGrotesk-SemiBold.ttf'),
    'Hanken-Bold': require('../../assets/fonts/HankenGrotesk-Bold.ttf'),
    PlexArabic: require('../../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });
  return loaded;
}
```

- [ ] **Step 7: Motion presets** (`src/theme/motion.ts`)

```ts
import { Easing } from 'react-native-reanimated';
// ease-out expo/quint, no bounce/elastic (§3 discipline).
export const motion = {
  fast: 180, base: 260, slow: 420,
  easeOut: Easing.out(Easing.exp),
  easeOutQuint: Easing.bezier(0.22, 1, 0.36, 1),
  spring: { damping: 18, stiffness: 160, mass: 1 }, // no overshoot
} as const;
```

- [ ] **Step 8: Barrel** (`src/theme/index.ts`): `export * from './tokens'; export * from './typography'; export * from './motion'; export * from './useFonts';`

- [ ] **Step 9: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(theme): brand tokens, fonts, typography and motion presets"
```

---

### Task 3: API config, typed fetch client, and friendly error mapping

**Files:**
- Create: `src/api/config.ts`, `src/api/errors.ts`, `src/api/client.ts`
- Test: `src/api/__tests__/errors.test.ts`, `src/api/__tests__/client.test.ts`

**Interfaces:**
- Produces:
  - `API_BASE_URL: string`
  - `class ApiError extends Error { status: number; friendly: string }`
  - `toFriendly(status: number, kind: 'network'|'http'): string`
  - `apiFetch<T>(path: string, opts?: { method?; jsonBody?; formBody?; token?: string }): Promise<T>` — throws `ApiError` with a `.friendly` message on any failure.

- [ ] **Step 1: Write the failing test** (`src/api/__tests__/errors.test.ts`)

```ts
import { toFriendly } from '../errors';

test('network failure is friendly, no codes', () => {
  const m = toFriendly(0, 'network');
  expect(m).toMatch(/reach Lahza/i);
  expect(m).not.toMatch(/\b(0|500|error)\b/i);
});

test('503 reads as feature-not-on, not a crash', () => {
  expect(toFriendly(503, 'http')).toMatch(/not (available|switched on)/i);
});

test('401 reads as sign-in needed', () => {
  expect(toFriendly(401, 'http')).toMatch(/sign in/i);
});

test('unknown 5xx is calm and blameless', () => {
  const m = toFriendly(500, 'http');
  expect(m).not.toMatch(/500|stack|exception/i);
  expect(m.length).toBeGreaterThan(10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- errors`
Expected: FAIL (`Cannot find module '../errors'`).

- [ ] **Step 3: Implement errors** (`src/api/errors.ts`)

```ts
export class ApiError extends Error {
  status: number; friendly: string;
  constructor(status: number, friendly: string, message?: string) {
    super(message ?? friendly); this.status = status; this.friendly = friendly;
  }
}

export function toFriendly(status: number, kind: 'network' | 'http'): string {
  if (kind === 'network' || status === 0)
    return "Can't reach Lahza right now. Check your connection and pull to retry.";
  switch (status) {
    case 400: return "Something in that request didn't look right. Give it another go.";
    case 401: return 'Please sign in to continue.';
    case 403: return "You don't have access to that.";
    case 404: return "We couldn't find that.";
    case 409: return 'That already exists.';
    case 422: return 'Please check the details and try again.';
    case 503: return "That feature isn't switched on for this event yet.";
    default:
      return status >= 500
        ? 'Lahza is having a moment on our end. Please try again shortly.'
        : 'Something went off-script. Please try again.';
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- errors`
Expected: PASS.

- [ ] **Step 5: Write the failing client test** (`src/api/__tests__/client.test.ts`)

```ts
import { apiFetch } from '../client';
import { ApiError } from '../errors';

const g: any = global;
afterEach(() => { g.fetch = undefined; });

test('sends bearer token and parses JSON', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ name: 'Ziad' }) });
  const out = await apiFetch<{ name: string }>('/users/me', { token: 'abc' });
  expect(out.name).toBe('Ziad');
  const [, init] = g.fetch.mock.calls[0];
  expect(init.headers.Authorization).toBe('Bearer abc');
});

test('form body is url-encoded, not JSON', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: 't', token_type: 'bearer' }) });
  await apiFetch('/auth/jwt/login', { method: 'POST', formBody: { username: 'a@b.com', password: 'pw' } });
  const [, init] = g.fetch.mock.calls[0];
  expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
  expect(init.body).toContain('username=a%40b.com');
});

test('http failure throws ApiError with friendly message', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) });
  await expect(apiFetch('/x')).rejects.toMatchObject({ status: 503 } as Partial<ApiError>);
});

test('network failure throws friendly ApiError', async () => {
  g.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
  await expect(apiFetch('/x')).rejects.toHaveProperty('friendly', expect.stringMatching(/reach Lahza/i));
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- client`
Expected: FAIL.

- [ ] **Step 7: Implement config + client** (`src/api/config.ts`, `src/api/client.ts`)

`config.ts`:

```ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
```

`client.ts`:

```ts
import { API_BASE_URL } from './config';
import { ApiError, toFriendly } from './errors';

type Opts = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  jsonBody?: unknown;
  formBody?: Record<string, string>;
  token?: string;
};

export async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: string | undefined;
  if (opts.jsonBody !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(opts.jsonBody); }
  if (opts.formBody) { headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = Object.entries(opts.formBody).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method: opts.method ?? 'GET', headers, body });
  } catch {
    throw new ApiError(0, toFriendly(0, 'network'));
  }
  if (!res.ok) throw new ApiError(res.status, toFriendly(res.status, 'http'), `HTTP ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- client errors`
Expected: PASS (all).

- [ ] **Step 9: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(api): typed fetch client with single friendly error-mapping layer"
```

---

### Task 4: Auth — secure token storage, endpoints, context, and Query client

**Files:**
- Create: `src/auth/storage.ts`, `src/api/auth.ts`, `src/auth/AuthContext.tsx`, `src/lib/query.ts`
- Test: `src/api/__tests__/auth.test.ts`, `src/auth/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `apiFetch` (Task 3).
- Produces:
  - `tokenStore.set/get/clear(): Promise<...>` (wraps `expo-secure-store`)
  - `register(email,password,name): Promise<User>`; `login(email,password): Promise<string>` (returns token); `me(token): Promise<User>`
  - `type User = { id: string; email: string; name: string }`
  - `useAuth(): { user; status: 'loading'|'signedOut'|'signedIn'; signIn; signUp; signOut }`
  - `queryClient`

- [ ] **Step 1: Write the failing auth-endpoint test** (`src/api/__tests__/auth.test.ts`)

```ts
import { login, register, me } from '../auth';
const g: any = global;
afterEach(() => { g.fetch = undefined; });

test('login posts form-encoded username=email and returns token', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ access_token: 'jwt123', token_type: 'bearer' }) });
  const token = await login('ziad@x.com', 'pw');
  expect(token).toBe('jwt123');
  const [url, init] = g.fetch.mock.calls[0];
  expect(url).toMatch(/\/auth\/jwt\/login$/);
  expect(init.body).toContain('username=ziad%40x.com');
});

test('register posts JSON name+email+password', async () => {
  g.fetch = jest.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: '1', email: 'z@x.com', name: 'Ziad' }) });
  const u = await register('z@x.com', 'pw', 'Ziad');
  expect(u.name).toBe('Ziad');
  const [, init] = g.fetch.mock.calls[0];
  expect(JSON.parse(init.body)).toEqual({ email: 'z@x.com', password: 'pw', name: 'Ziad' });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- api/__tests__/auth`
Expected: FAIL.

- [ ] **Step 3: Implement auth endpoints** (`src/api/auth.ts`)

```ts
import { apiFetch } from './client';
export type User = { id: string; email: string; name: string };

export function register(email: string, password: string, name: string): Promise<User> {
  return apiFetch<User>('/auth/register', { method: 'POST', jsonBody: { email, password, name } });
}
export async function login(email: string, password: string): Promise<string> {
  const r = await apiFetch<{ access_token: string }>('/auth/jwt/login', {
    method: 'POST', formBody: { username: email, password },
  });
  return r.access_token;
}
export function me(token: string): Promise<User> {
  return apiFetch<User>('/users/me', { token });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- api/__tests__/auth`
Expected: PASS.

- [ ] **Step 5: Write the failing storage test** (`src/auth/__tests__/storage.test.ts`)

```ts
jest.mock('expo-secure-store', () => {
  let v: string | null = null;
  return { setItemAsync: jest.fn(async (_k, val) => { v = val; }),
           getItemAsync: jest.fn(async () => v),
           deleteItemAsync: jest.fn(async () => { v = null; }) };
});
import { tokenStore } from '../storage';

test('set/get/clear round-trips the token', async () => {
  await tokenStore.set('jwt');
  expect(await tokenStore.get()).toBe('jwt');
  await tokenStore.clear();
  expect(await tokenStore.get()).toBeNull();
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- storage`
Expected: FAIL.

- [ ] **Step 7: Implement storage + context + query client**

`src/auth/storage.ts`:

```ts
import * as SecureStore from 'expo-secure-store';
const KEY = 'lahza.jwt';
export const tokenStore = {
  set: (t: string) => SecureStore.setItemAsync(KEY, t),
  get: () => SecureStore.getItemAsync(KEY),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
```

`src/lib/query.ts`:

```ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
```

`src/auth/AuthContext.tsx`:

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { tokenStore } from './storage';
import { login as apiLogin, register as apiRegister, me as apiMe, User } from '../api/auth';

type Status = 'loading' | 'signedOut' | 'signedIn';
type Ctx = { user: User | null; status: Status;
  signIn: (e: string, p: string) => Promise<void>;
  signUp: (e: string, p: string, n: string) => Promise<void>;
  signOut: () => Promise<void>; };

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => { (async () => {
    const t = await tokenStore.get();
    if (!t) return setStatus('signedOut');
    try { setUser(await apiMe(t)); setStatus('signedIn'); }
    catch { await tokenStore.clear(); setStatus('signedOut'); }
  })(); }, []);

  async function finish(token: string) {
    await tokenStore.set(token);
    setUser(await apiMe(token));
    setStatus('signedIn');
  }
  const signIn = async (e: string, p: string) => finish(await apiLogin(e, p));
  const signUp = async (e: string, p: string, n: string) => { await apiRegister(e, p, n); await finish(await apiLogin(e, p)); };
  const signOut = async () => { await tokenStore.clear(); setUser(null); setStatus('signedOut'); };

  return <AuthCtx.Provider value={{ user, status, signIn, signUp, signOut }}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- storage api/__tests__/auth`
Expected: PASS.

- [ ] **Step 9: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(auth): secure token storage, endpoints, auth context, query client"
```

---

### Task 5: Core UI primitives — Screen, StateView, GlowButton, Logo

**Files:**
- Create: `src/components/Screen.tsx`, `src/components/StateView.tsx`, `src/components/GlowButton.tsx`, `src/components/Logo.tsx`, `src/components/Text.tsx`
- Create: `assets/logo.png` (copy from `la2etha-frontend/public/transparent_logo.png`)
- Test: `src/components/__tests__/StateView.test.tsx`, `src/components/__tests__/GlowButton.test.tsx`

**Interfaces:**
- Produces:
  - `<Screen>` — safe-area + paper background wrapper.
  - `<AppText variant="display|h1|h2|body|label|caption|mono" color?>` — typed text using `type` tokens.
  - `<StateView kind="loading"|"error"|"empty" title message? actionLabel? onAction? />`
  - `<GlowButton label onPress loading? disabled? />` — gradient-fill CTA, haptic on press, reduced-motion aware.
  - `<Logo size? />`

- [ ] **Step 1: Write the failing StateView test**

```tsx
import { render } from '@testing-library/react-native';
import { StateView } from '../StateView';

test('error state shows the friendly message and a retry action', () => {
  const { getByText } = render(
    <StateView kind="error" title="Can't load" message="Check your connection." actionLabel="Retry" onAction={() => {}} />
  );
  getByText('Check your connection.');
  getByText('Retry');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- StateView`
Expected: FAIL.

- [ ] **Step 3: Implement `AppText` then `StateView`** (`src/components/Text.tsx`, `src/components/StateView.tsx`)

```tsx
// Text.tsx
import { Text, TextProps } from 'react-native';
import { type as t, colors } from '../theme';
type V = keyof typeof t;
export function AppText({ variant = 'body', color = colors.ink, style, ...p }: TextProps & { variant?: V; color?: string }) {
  return <Text style={[t[variant], { color }, style]} {...p} />;
}
```

```tsx
// StateView.tsx
import { View } from 'react-native';
import { AppText } from './Text';
import { GlowButton } from './GlowButton';
import { colors, space } from '../theme';

export function StateView({ kind, title, message, actionLabel, onAction }: {
  kind: 'loading' | 'error' | 'empty'; title: string; message?: string;
  actionLabel?: string; onAction?: () => void;
}) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
      <AppText variant="h1" style={{ textAlign: 'center' }}>{title}</AppText>
      {message ? <AppText variant="body" color={colors.inkSoft} style={{ textAlign: 'center' }}>{message}</AppText> : null}
      {actionLabel && onAction ? <GlowButton label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
```
> `kind` drives the visual (loading → spinner/scan shimmer added on-device; empty → demo hook in later slices). Copy always friendly.

- [ ] **Step 4: Implement GlowButton** (`src/components/GlowButton.tsx`) — write a smoke test first:

`__tests__/GlowButton.test.tsx`:

```tsx
import { render, fireEvent } from '@testing-library/react-native';
import { GlowButton } from '../GlowButton';
test('fires onPress with the label visible', () => {
  const fn = jest.fn();
  const { getByText } = render(<GlowButton label="Continue" onPress={fn} />);
  fireEvent.press(getByText('Continue'));
  expect(fn).toHaveBeenCalled();
});
```

Then implement:

```tsx
import { Pressable, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './Text';
import { colors, radius, space } from '../theme';

export function GlowButton({ label, onPress, loading, disabled }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.stampDeep : colors.stamp,
        opacity: disabled ? 0.5 : 1, borderRadius: radius.md,
        paddingVertical: space.md + 2, paddingHorizontal: space.xl,
        alignItems: 'center', minWidth: 200,
        shadowColor: colors.glowHot, shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
      })}
    >
      {loading ? <ActivityIndicator color={colors.paper} /> : <AppText variant="h2" color={colors.paper}>{label}</AppText>}
    </Pressable>
  );
}
```
> The breathing-glow + gradient fill (LinearGradient/reanimated) is layered on-device in polish; the shadow gives the base glow. Gradient *fill* only — never gradient text.

- [ ] **Step 5: Implement Logo** (`src/components/Logo.tsx`)

```tsx
import { Image } from 'expo-image';
export function Logo({ size = 120 }: { size?: number }) {
  return <Image source={require('../../assets/logo.png')} style={{ width: size, height: size }} contentFit="contain" />;
}
```
Copy the asset: `cp ../la2etha-frontend/public/transparent_logo.png assets/logo.png`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- StateView GlowButton`
Expected: PASS.

- [ ] **Step 7: Screen wrapper** (`src/components/Screen.tsx`)

```tsx
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ViewProps } from 'react-native';
import { colors } from '../theme';
export function Screen({ style, children, ...p }: ViewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }}>
      <View style={[{ flex: 1 }, style]} {...p}>{children}</View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 8: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(ui): Screen, AppText, StateView, GlowButton, Logo primitives"
```

---

### Task 6: Boot routing + Splash screen

**Files:**
- Create: `src/boot/route.ts`, `app/_layout.tsx` (replace), `app/splash.tsx`
- Create: `src/lib/firstRun.ts`
- Test: `src/boot/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `useAuth().status`, `firstRun.get()`.
- Produces: `decideBootRoute({ status, firstRun }): '/splash'|'/onboarding'|'/(auth)/login'|'/(app)'` ; `firstRun.get()/complete()`.

- [ ] **Step 1: Write the failing routing test** (`src/boot/__tests__/route.test.ts`)

```ts
import { decideBootRoute } from '../route';

test('still loading → stay on splash', () => {
  expect(decideBootRoute({ status: 'loading', firstRun: true })).toBe('/splash');
});
test('signed out + first run → onboarding', () => {
  expect(decideBootRoute({ status: 'signedOut', firstRun: true })).toBe('/onboarding');
});
test('signed out + returning → login', () => {
  expect(decideBootRoute({ status: 'signedOut', firstRun: false })).toBe('/(auth)/login');
});
test('signed in → app home', () => {
  expect(decideBootRoute({ status: 'signedIn', firstRun: false })).toBe('/(app)');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- boot`
Expected: FAIL.

- [ ] **Step 3: Implement** (`src/boot/route.ts`, `src/lib/firstRun.ts`)

```ts
// route.ts
type Args = { status: 'loading' | 'signedOut' | 'signedIn'; firstRun: boolean };
export function decideBootRoute({ status, firstRun }: Args) {
  if (status === 'loading') return '/splash' as const;
  if (status === 'signedIn') return '/(app)' as const;
  return (firstRun ? '/onboarding' : '/(auth)/login') as const;
}
```

```ts
// firstRun.ts
import * as SecureStore from 'expo-secure-store'; // small flag; SecureStore is fine
const KEY = 'lahza.onboarded';
export const firstRun = {
  get: async () => (await SecureStore.getItemAsync(KEY)) === null,
  complete: () => SecureStore.setItemAsync(KEY, '1'),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- boot`
Expected: PASS.

- [ ] **Step 5: Root layout wires providers + safe-area + fonts + gesture root** (`app/_layout.tsx`)

```tsx
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/auth/AuthContext';
import { queryClient } from '../src/lib/query';
import { useAppFonts } from '../src/theme';

export default function RootLayout() {
  const fontsReady = useAppFonts();
  if (!fontsReady) return null; // splash covers this frame
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 6: Splash screen with the scan-bracket animation** (`app/splash.tsx`, also make it `app/index.tsx`'s redirect target)

Behavior: cream ground; Logo fades in; an orange scan-bracket draws around the mark and a dot "locks" (Moti), then routes via `decideBootRoute`. Honors reduced motion (instant show).

```tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';
import { MotiView } from 'moti';
import { Screen } from '../src/components/Screen';
import { Logo } from '../src/components/Logo';
import { useAuth } from '../src/auth/AuthContext';
import { firstRun } from '../src/lib/firstRun';
import { decideBootRoute } from '../src/boot/route';
import { colors } from '../src/theme';

export default function Splash() {
  const { status } = useAuth();
  const router = useRouter();
  const [reduce, setReduce] = useState(false);
  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled().then(setReduce); }, []);
  useEffect(() => {
    if (status === 'loading') return;
    (async () => {
      const fr = await firstRun.get();
      const dest = decideBootRoute({ status, firstRun: fr });
      setTimeout(() => router.replace(dest as any), reduce ? 0 : 900);
    })();
  }, [status, reduce]);

  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }}>
      <MotiView from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: reduce ? 0 : 500 }}>
        <Logo size={140} />
      </MotiView>
    </Screen>
  );
}
```
Set `app/index.tsx` to `import { Redirect } from 'expo-router'; export default () => <Redirect href="/splash" />;`

- [ ] **Step 7: Verify on device** — `npx expo start`; owner scans. Expected: cream splash, logo animates, routes to onboarding (fresh install).

- [ ] **Step 8: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(boot): providers, boot routing, animated splash"
```

---

### Task 7: Onboarding (3 slides, skippable, first-run persisted)

**Files:**
- Create: `app/onboarding.tsx`, `src/features/onboarding/slides.ts`
- Test: `src/features/onboarding/__tests__/slides.test.ts`

**Interfaces:**
- Consumes: `firstRun.complete()`, router.
- Produces: `slides: { key; title; body }[]` (3 entries mapping to §6 screen 2 story).

- [ ] **Step 1: Write the failing test**

```ts
import { slides } from '../slides';
test('three slides tell the pool→private story', () => {
  expect(slides).toHaveLength(3);
  expect(slides.map(s => s.key)).toEqual(['pool', 'find', 'private']);
});
```

- [ ] **Step 2: Run to verify it fails** — `npm test -- slides` → FAIL.

- [ ] **Step 3: Implement slides** (`src/features/onboarding/slides.ts`)

```ts
export const slides = [
  { key: 'pool', title: 'One place for the whole لمّة', body: 'Everyone drops their photos into a single event — no more “send me the pics”.' },
  { key: 'find', title: 'We find you in the crowd', body: 'Enroll your face once. Lahza scans every photo and lights up the ones you’re in.' },
  { key: 'private', title: 'Only yours, always private', body: 'You see only the photos you appear in. Nobody sees anyone else’s.' },
] as const;
```

- [ ] **Step 4: Run to verify it passes** — `npm test -- slides` → PASS.

- [ ] **Step 5: Implement the pager** (`app/onboarding.tsx`) — horizontal paged FlatList of the 3 slides over cream, teal ink, a "Skip" link and a GlowButton that advances then, on the last slide, calls `firstRun.complete()` and `router.replace('/(auth)/register')`. Body text uses `colors.inkSoft` (body-legal). Reduced-motion: no parallax.

```tsx
import { useRef, useState } from 'react';
import { FlatList, View, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { AppText } from '../src/components/Text';
import { GlowButton } from '../src/components/GlowButton';
import { firstRun } from '../src/lib/firstRun';
import { slides } from '../src/features/onboarding/slides';
import { colors, space } from '../src/theme';

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const ref = useRef<FlatList>(null);
  const [i, setI] = useState(0);
  const last = i === slides.length - 1;
  async function next() {
    if (last) { await firstRun.complete(); router.replace('/(auth)/register'); }
    else ref.current?.scrollToIndex({ index: i + 1 });
  }
  return (
    <Screen>
      <Pressable onPress={async () => { await firstRun.complete(); router.replace('/(auth)/login'); }}
        style={{ alignSelf: 'flex-end', padding: space.lg }}>
        <AppText variant="label" color={colors.inkSoft}>Skip</AppText>
      </Pressable>
      <FlatList ref={ref} data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        keyExtractor={s => s.key}
        onMomentumScrollEnd={e => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={{ width, padding: space.xl, gap: space.md, justifyContent: 'center' }}>
            <AppText variant="display">{item.title}</AppText>
            <AppText variant="body" color={colors.inkSoft}>{item.body}</AppText>
          </View>
        )} />
      <View style={{ padding: space.xl }}>
        <GlowButton label={last ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </Screen>
  );
}
```

- [ ] **Step 6: Verify on device** — swipe 3 slides, Skip works, Get started → register.

- [ ] **Step 7: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(onboarding): 3-slide first-run story, skippable"
```

---

### Task 8: Login screen (real API, friendly errors)

**Files:**
- Create: `app/(auth)/_layout.tsx`, `app/(auth)/login.tsx`, `src/features/auth/validate.ts`
- Test: `src/features/auth/__tests__/validate.test.ts`

**Interfaces:**
- Consumes: `useAuth().signIn`, `ApiError.friendly`.
- Produces: `validateLogin({email,password}): { ok: boolean; error?: string }`.

- [ ] **Step 1: Write the failing validation test**

```ts
import { validateLogin } from '../validate';
test('rejects empty email with a helpful message', () => {
  expect(validateLogin({ email: '', password: 'x' })).toMatchObject({ ok: false });
});
test('accepts a plausible email + password', () => {
  expect(validateLogin({ email: 'a@b.com', password: 'secret' }).ok).toBe(true);
});
```

- [ ] **Step 2: Run to verify it fails** — `npm test -- validate` → FAIL.

- [ ] **Step 3: Implement** (`src/features/auth/validate.ts`)

```ts
export function validateLogin({ email, password }: { email: string; password: string }) {
  if (!email.includes('@')) return { ok: false, error: 'Enter the email you signed up with.' };
  if (password.length < 1) return { ok: false, error: 'Enter your password.' };
  return { ok: true };
}
```

- [ ] **Step 4: Run to verify it passes** — `npm test -- validate` → PASS.

- [ ] **Step 5: Auth group layout** (`app/(auth)/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
export default function AuthLayout() { return <Stack screenOptions={{ headerShown: false }} />; }
```

- [ ] **Step 6: Login screen** (`app/(auth)/login.tsx`) — cream; Logo; email + password fields (`ink` text, placeholder `inkSoft` for contrast — never `inkFaint`); GlowButton "Sign in"; inline friendly error via `catch (e) { setError((e as ApiError).friendly) }`; link to register.

```tsx
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { Logo } from '../../src/components/Logo';
import { useAuth } from '../../src/auth/AuthContext';
import { validateLogin } from '../../src/features/auth/validate';
import { ApiError } from '../../src/api/errors';
import { colors, radius, space, type } from '../../src/theme';

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  async function submit() {
    const v = validateLogin({ email, password });
    if (!v.ok) return setError(v.error!);
    setBusy(true); setError(null);
    try { await signIn(email.trim(), password); router.replace('/(app)'); }
    catch (e) { setError(e instanceof ApiError ? e.friendly : 'Something went off-script. Please try again.'); }
    finally { setBusy(false); }
  }
  const input = { ...type.body, color: colors.ink, borderColor: colors.line, borderWidth: 1,
    borderRadius: radius.md, padding: space.md, backgroundColor: colors.card } as const;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.lg }}><Logo size={96} /></View>
      <AppText variant="display">Welcome back</AppText>
      <TextInput style={input} placeholder="Email" placeholderTextColor={colors.inkSoft}
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={input} placeholder="Password" placeholderTextColor={colors.inkSoft}
        secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label="Sign in" onPress={submit} loading={busy} />
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft}>New here?</AppText>
        <Link href="/(auth)/register"><AppText variant="label" color={colors.stamp}>Create account</AppText></Link>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 7: Verify on device** — wrong password shows a friendly line (no code); backend-down shows the "Can't reach Lahza" line; correct creds → app home.

- [ ] **Step 8: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(auth): login screen wired to real API with friendly errors"
```

---

### Task 9: Register screen (register → auto-login)

**Files:**
- Create: `app/(auth)/register.tsx`
- Modify: `src/features/auth/validate.ts` (add `validateRegister`)
- Test: `src/features/auth/__tests__/validate.test.ts` (extend)

**Interfaces:**
- Consumes: `useAuth().signUp`.
- Produces: `validateRegister({name,email,password}): { ok; error? }`.

- [ ] **Step 1: Extend the failing test**

```ts
import { validateRegister } from '../validate';
test('register needs a name', () => {
  expect(validateRegister({ name: '', email: 'a@b.com', password: 'secret1' }).ok).toBe(false);
});
test('register needs a 6+ char password', () => {
  expect(validateRegister({ name: 'Ziad', email: 'a@b.com', password: '123' }).ok).toBe(false);
});
test('valid registration passes', () => {
  expect(validateRegister({ name: 'Ziad', email: 'a@b.com', password: 'secret1' }).ok).toBe(true);
});
```

- [ ] **Step 2: Run to verify it fails** — `npm test -- validate` → FAIL.

- [ ] **Step 3: Implement `validateRegister`** (append to `validate.ts`)

```ts
export function validateRegister({ name, email, password }: { name: string; email: string; password: string }) {
  if (name.trim().length < 2) return { ok: false, error: 'What should we call you?' };
  if (!email.includes('@')) return { ok: false, error: 'Enter a valid email.' };
  if (password.length < 6) return { ok: false, error: 'Use at least 6 characters for your password.' };
  return { ok: true };
}
```

- [ ] **Step 4: Run to verify it passes** — `npm test -- validate` → PASS.

- [ ] **Step 5: Register screen** (`app/(auth)/register.tsx`) — same visual language as login, adds a Name field; on submit calls `signUp` (register→login) then `router.replace('/(app)')`; friendly errors (e.g. 400 “already exists” → "That email already has an account. Try signing in."). Reuse the `input` style pattern from Task 8.

```tsx
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { Logo } from '../../src/components/Logo';
import { useAuth } from '../../src/auth/AuthContext';
import { validateRegister } from '../../src/features/auth/validate';
import { ApiError } from '../../src/api/errors';
import { colors, radius, space, type } from '../../src/theme';

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  async function submit() {
    const v = validateRegister({ name, email, password });
    if (!v.ok) return setError(v.error!);
    setBusy(true); setError(null);
    try { await signUp(email.trim(), password, name.trim()); router.replace('/(app)'); }
    catch (e) {
      const msg = e instanceof ApiError
        ? (e.status === 400 || e.status === 409 ? 'That email already has an account. Try signing in.' : e.friendly)
        : 'Something went off-script. Please try again.';
      setError(msg);
    } finally { setBusy(false); }
  }
  const input = { ...type.body, color: colors.ink, borderColor: colors.line, borderWidth: 1,
    borderRadius: radius.md, padding: space.md, backgroundColor: colors.card } as const;

  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: space.lg }}><Logo size={96} /></View>
      <AppText variant="display">Join the لمّة</AppText>
      <TextInput style={input} placeholder="Your name" placeholderTextColor={colors.inkSoft} value={name} onChangeText={setName} />
      <TextInput style={input} placeholder="Email" placeholderTextColor={colors.inkSoft}
        autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={input} placeholder="Password" placeholderTextColor={colors.inkSoft}
        secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <AppText variant="label" color={colors.danger}>{error}</AppText> : null}
      <GlowButton label="Create account" onPress={submit} loading={busy} />
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        <AppText variant="body" color={colors.inkSoft}>Have an account?</AppText>
        <Link href="/(auth)/login"><AppText variant="label" color={colors.stamp}>Sign in</AppText></Link>
      </View>
    </Screen>
  );
}
```

- [ ] **Step 6: Verify on device** — new account → lands in app home; duplicate email → friendly "already has an account".

- [ ] **Step 7: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(auth): register screen with register→auto-login"
```

---

### Task 10: App-group auth gate + Home placeholder + slice verification

**Files:**
- Create: `app/(app)/_layout.tsx`, `app/(app)/index.tsx`
- Test: manual on-device slice acceptance (documented below)

**Interfaces:**
- Consumes: `useAuth()` (status/user/signOut).
- Produces: a protected `(app)` group that bounces signed-out users to login; a Home placeholder greeting the real user by name + Sign out (proves the full round-trip).

- [ ] **Step 1: Protected group layout** (`app/(app)/_layout.tsx`)

```tsx
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { Screen } from '../../src/components/Screen';
import { StateView } from '../../src/components/StateView';

export default function AppLayout() {
  const { status } = useAuth();
  if (status === 'loading') return <Screen><StateView kind="loading" title="One moment…" /></Screen>;
  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Home placeholder** (`app/(app)/index.tsx`) — greets `user.name` (proves `/users/me` works) with a Sign out button. Real Events home replaces this in Slice 2.

```tsx
import { View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { AppText } from '../../src/components/Text';
import { GlowButton } from '../../src/components/GlowButton';
import { useAuth } from '../../src/auth/AuthContext';
import { colors, space } from '../../src/theme';

export default function Home() {
  const { user, signOut } = useAuth();
  return (
    <Screen style={{ padding: space.xl, gap: space.lg, justifyContent: 'center' }}>
      <AppText variant="display">Ahlan, {user?.name ?? 'friend'} 👋</AppText>
      <AppText variant="body" color={colors.inkSoft}>Your لمّة starts here. Events land in the next update.</AppText>
      <View style={{ height: space.xl }} />
      <GlowButton label="Sign out" onPress={signOut} />
    </Screen>
  );
}
```

- [ ] **Step 3: Run the full unit suite**

Run: `npm test`
Expected: PASS (tokens, errors, client, auth, storage, StateView, GlowButton, boot, slides, validate).

- [ ] **Step 4: On-device slice acceptance (Expo Go)** — with the backend running (`uvicorn app.main:app --reload` reachable at `EXPO_PUBLIC_API_BASE_URL`):
  1. Fresh install → splash → onboarding (3 slides) → register.
  2. Create a new account → lands on "Ahlan, {name}".
  3. Kill app, reopen → splash → **stays signed in** → Home (token persisted).
  4. Sign out → login. Sign in again → Home.
  5. Stop the backend, try to sign in → friendly "Can't reach Lahza" (no raw error).
  6. Toggle OS reduce-motion → splash shows instantly, no animation.

- [ ] **Step 5: ✋ Owner checkpoint**

```bash
git add -A && git commit -m "feat(app): protected route group and home greeting; slice 1 complete"
```

---

## Notes for later slices (not built here)
- **Slice 2:** Events home (ticket stubs) · Create · Join · Event Hub — its own plan.
- **Slice 3:** Enroll (glowing scan ring) + Add/Upload — its own plan.
- **Slice 4:** Gallery (unlock bloom, demoted section) · Photo/Lightbox (trust toggle) · Search · Claim — its own plan.
- **Slice 5:** Export · Host Review · Profile/Settings · AI Edit (stretch) — its own plan.
- `EXPO_PUBLIC_API_BASE_URL` must be reachable from the **phone** (use the dev machine's LAN IP, e.g. `http://192.168.x.x:8000`, or a Cloudflare Tunnel URL — `localhost` won't resolve from the device).
