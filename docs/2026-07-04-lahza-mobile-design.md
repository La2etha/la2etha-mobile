# Lahza Mobile — Design Spec

**App:** Lahza · لحظة — React Native (Expo) mobile client
**Concept:** *A warm paper world that lights up when it finds you.* Photos **develop** — resolving from blur to sharp like a darkroom print — so the CV act of *finding you* reads as an image *appearing*.
**Status:** Design approved (art direction: **Lamma + Lumina's glow**). Audited (impeccable + Expo `building-native-ui`). Ready for implementation planning.
**Date:** 2026-07-04

---

## 1. What we're building

A native iOS/Android app for Lahza: pool everyone's photos into one event, enroll your face once, and open a **private gallery of only the photos you're in** — powered by the existing custom CV backend. This is a *new, separate* Expo app; the existing web frontend (`la2etha-frontend`) is a throwaway PoC and is **never touched or referenced** beyond the shared brand palette and logo.

### Fixed constraints (non-negotiable)
- **Brand palette (locked):** dark teal `#0b3b3a`/`#14514f`/`#1d6b68`, cream `#faf4e8`/`#f1e7d3`, burnt orange `#c8562a`/`#ab4620`.
- **Logo:** the finger-points-to-you scan mark (`transparent_logo.png`). The scan bracket is core brand DNA.
- **Backend:** existing FastAPI REST/JWT API. The app is a client only — no new product scope.
- **Dev loop:** Expo Go on a physical phone (QR + hot reload). iOS + Android.
- **Everything else is a free design decision:** type, layout, motion, components, mood.

### Data & honesty rules (owner directive)
- **Real API only.** No client-side mock-fallback layer that masks backend failures.
- **No raw errors shown to the user.** Every failure maps to a warm, descriptive state with a clear next action.
- **Demonstration gallery replaces the empty state.** When a user has no real gallery yet, show a clearly-labeled sample/demo gallery instead of a barren screen. This is the *only* place non-real content appears.
- **Lean on backend fallbacks.** Where graceful degradation is needed (e.g. search disabled, GPU down), rely on the backend's existing 503/fallback behavior; extend it in the backend if insufficient — not in the client.

---

## 2. Design language — "Warm Lumen"

The base is warm, tactile, editorial (**Lamma**). Luminous **glow** (from **Lumina**) is a *scarce resource*, spent only where the CV/AI does its magic. Calm 90% of the time; ignites on recognition.

### 2.1 Color tokens
| Token | Hex | Role |
|-------|-----|------|
| `paper` | `#faf4e8` | primary background |
| `paper.sunk` | `#f1e7d3` | recessed surfaces, wells |
| `card` | `#ffffff` | raised cards, ticket stubs, polaroid frames |
| `ink` | `#0b3b3a` | primary text, headlines |
| `ink.soft` | `#1d6b68` | secondary text, teal UI |
| `ink.faint` | `#a2795a` | warm muted captions/metadata |
| `line` | `#eaddc4` | hairlines, dashed tears |
| `stamp` | `#c8562a` | orange accent, "you", stamps |
| `stamp.deep` | `#ab4620` | pressed/active orange |
| `glow.teal` | `#37d6c4` | luminous teal (AI moments only) |
| `glow.hot` | `#ff6a3d` | luminous orange (AI moments only) |

**Semantic (separate from accent):** success `#2f8f6b`, warning `#c8892a`, danger `#b5432a`, info `#1d6b68`.

**Night variant (deferred, not v1):** Lumina's dark-teal ground for low-light viewing. Design tokens should be structured so a second theme is possible later without rework, but v1 ships single warm theme (deliberate, like a printed photo).

### 2.2 Typography
| Role | Face | Use |
|------|------|-----|
| Display | **Fraunces** (soft optical serif) | greetings, event names, emotional headlines |
| UI / body | **Hanken Grotesk** (rounded humanist, echoes logo) | all functional text, buttons, labels |
| Arabic | **IBM Plex Sans Arabic** | لحظة, bilingual touches |
| Micro / data | a mono (e.g. **Space Mono**), sparingly | counts, confidence %, timestamps — subtle "it's smart" signal |

Loaded locally via `expo-font` (no CDN/CSP concerns). Type scale fixed and adhered to; headlines get balanced wrapping; uppercase micro-labels get letter-spacing.

### 2.3 Material & elevation
Photos and events are treated as **physical objects**: white polaroid frames (thick bottom border), ticket stubs with dashed tear lines, soft warm drop shadows, occasional tape/rotation. Paper grain is subtle. Corners are generously rounded to echo the logo.

### 2.4 The glow rule
Glow (`glow.teal`/`glow.hot`, conic gradients, bloom, rings) appears **only** in:
1. Enroll face-scan ring.
2. Gallery-unlock moment (light bloom + count-up).
3. "That's you" match halo.
4. Primary CTAs (warm gradient *fill* with a faint breathing bloom — never gradient *text*).
Everywhere else stays flat, warm, paper.

### 2.5 Anti-generic guardrails (audit-mandated)
Warm cream + serif is the saturated AI-design default of 2026 — and our palette is cream. Cream is a **locked constitutional constraint and a deliberate owner choice**, so we don't abandon it; we make it *impossible to mistake for SaaS-cream* through execution. Enforced rules:
- **The cream is never a flat warm near-white.** Shadows and recessed surfaces carry a **teal-biased tint** (the brand's own hue), not generic warmth. Paper has a faint cool depth, like a real photo print.
- **Commit to a specific material world, not "warm editorial."** The vocabulary is Egyptian gathering print culture: developed photographs, ticket stubs, hand-stamps, dashed tears, tape — concrete objects, not a mood.
- **The identity is the *contrast*, not the cream.** A calm paper world that *ignites* on recognition (the glow rule) is the memorable thing; the cream is just the resting state.
- **Develop, don't fade.** Photo entrances resolve blur→sharp (darkroom develop), never a generic fade-up.
- **No AI-scaffold tells:** no uppercase tracked eyebrow above every section; no `01/02/03` numbered markers unless the content is a real sequence (e.g. enroll steps); no gradient text; no decorative glassmorphism; no side-stripe accent borders.

### 2.6 Contrast & legibility (WCAG)
Body text ≥ 4.5:1; large/bold ≥ 3:1; placeholders held to body contrast.
- **Body-legal on cream:** `ink` (`#0b3b3a`) and `ink.soft` (`#1d6b68`) only.
- **`ink.faint` (`#a2795a`) ≈ 3:1 on cream — metadata captions & timestamps ONLY, never body copy or placeholders.**
- On teal/glow grounds (enroll, night moments), text is `paper`/`card`; verify each glow surface individually.
- Orange `stamp` is an accent/state color, not body text.

---

## 3. Motion system

UI-thread animation via **Reanimated 3** + **Gesture Handler**, declarative sugar via **Moti**, tactile feedback via **Expo Haptics**. All motion respects reduced-motion settings.

Signature motions (each specific to what it reveals — **no single uniform entrance applied to everything**):
- **Photo develop-in** — Expo Image blurhash resolves blur→sharp (darkroom develop), not a fade-up.
- **Flick-to-browse stacks** — physical throw/settle on polaroid stacks.
- **Glowing scan ring** — rotating conic gradient + pulse during multi-angle enroll.
- **Gallery-unlock bloom** — warm light sweep + numeric count-up ("126 photos of you").
- **Ticket-stub tear** — event card tears along its dashed line to open the Event Hub.
- **Shared-element zoom** — grid photo → fullscreen lightbox.
- **Stamp-thunk** — scale-punch + haptic when a photo is confirmed "you".
- **Breathing CTA** — primary buttons carry a slow, subtle gradient-fill glow.

**Motion discipline (audit-mandated):**
- Easing: ease-out (expo/quint) or *gentle* springs tuned to **no overshoot**. No bounce, no elastic.
- Animate transform/opacity/blur/clip — not layout properties.
- **Reduced motion:** honor `AccessibilityInfo.isReduceMotionEnabled`; every effect degrades to a crossfade or instant state (the scan ring becomes a static progress arc; the develop-in becomes a fade).
- Content is visible by default; reveals enhance, never gate visibility.

---

## 4. Navigation architecture

Event-scoped, because the product lives inside events.

```
Root (authed)
├── Events  (tab)          ← home: greeting + event stubs
│   └── Event Hub (stack)  ← per-event context
│       ├── Gallery (tab)
│       ├── Search  (tab)
│       ├── Add     (tab, raised glowing button)
│       └── You     (tab)  ← enroll status / re-enroll
│   ├── Create Event (stack/modal)
│   └── Join Event   (stack/modal)
├── Profile (tab)          ← identity, settings, sign out
└── Photo Lightbox (modal, shared-element, global)

Unauthed: Splash → Onboarding(first run) → Login / Register
```

Expo Router (file-based). Auth gate redirects to login when no valid token.

---

## 5. Component vocabulary

Reusable, single-purpose components (each testable in isolation):
- `TicketStub` — event card with dashed tear line, cover, counts, open action.
- `PolaroidStack` — flickable stack of photo frames with rotation.
- `PhotoCard` — gallery cell; optional scan-bracket + "YOU · 98%" tag.
- `ScanRing` — glowing multi-angle enroll ring with progress pips.
- `GlowButton` — primary gradient CTA with breathing bloom + haptic.
- `FaceOverlay` — trust-toggle bbox overlay (normalized 0..1), own face haloed orange with a "You" tag.
- `CountUp` — animated numeric for the unlock moment.
- `StateView` — unified **loading / empty→demo / error** presenter (see §7).
- `Stamp` — orange "confirmed you" stamp animation.

---

## 6. Screens (each with states + API)

Every screen defines **loading**, **empty/demo**, and **error** states, not just the happy path.

| # | Screen | Purpose | Signature moment | Primary API |
|---|--------|---------|------------------|-------------|
| 1 | **Splash** | Brand open | Scan bracket draws → finds the orange dot → warm bloom | — |
| 2 | **Onboarding** | 3 slides: the لمّة problem → one shared pool → only-your-photos, private | Warm photo-stack storytelling; first run only, skippable | — |
| 3 | **Login** | Email/password sign-in | — | `POST /auth/jwt/login`, `GET /users/me` |
| 4 | **Register** | Name/email/password sign-up | — | `POST /auth/register` |
| 5 | **Events (Home)** | Greeting + events as ticket stubs + create/join | "Ahlan, {name}" + stub stack | `GET /events` |
| 6 | **Create Event** | Name + cover; share join code/QR/link | Stub "prints" out | `POST /events` |
| 7 | **Join Event** | Enter code / scan QR / paste link | — | `POST /events/join` |
| 8 | **Event Hub** | Event overview + your enroll/gallery status; host controls if host | Ticket-stub tear-in | `GET /events/{id}` |
| 9 | **Enroll (Face)** ⭐ | Multi-angle capture (photos / ~3s video) | **Glowing scan ring** (Lumina peak) + haptics | `POST /events/{id}/enroll` |
| 10 | **Add / Pool photos** | Pick from camera roll (multi) + optional Google Drive import + live progress | Upload → processing pulse | `POST /events/{id}/photos`, `GET .../photos/processing` |
| 11 | **Gallery** ⭐ | Private photos: main relevance + collapsible "maybe not you" (demoted) section | **Unlock light bloom + count-up** | `GET /events/{id}/gallery` |
| 12 | **Search** | Natural-language search ("gamb el-torta"/"near the cake") | Warm query field, animated results reveal | `GET /events/{id}/gallery/search` |
| 13 | **Photo / Lightbox** | Fullscreen + "Show faces" trust toggle; actions | Shared-element zoom; own face haloed orange | `GET /photos/{id}`, `GET /photos/{id}/faces` |
| 14 | **Claim** | "This is me / not me" correction | Stamp-thunk + haptic | `POST` / `DELETE /photos/{id}/claim` |
| 15 | **Privacy Export** | Remove strangers' faces before sharing | Faces dissolve out | `POST /photos/{id}/export` |
| 16 | **AI Edit** *(stretch)* | Prompt-edit your **solo** photos (consent required) | Shimmer generate | `POST /photos/{id}/edit` |
| 17 | **Host Review** | Promote demoted photos; view pool (host only) | Host controls | `GET /events/{id}/demoted`, `.../promote`, `GET /events/{id}/pool` |
| 18 | **Profile / Settings** | Identity, delete identity, delete account, storage/import prefs, sign out | — | `DELETE /users/me/identity` |

⭐ = emotional peaks where glow is spent.

Feature availability (search F5, export F6, edit F7) is gated by backend capability — if an endpoint returns 503 (feature/GPU unavailable), the screen shows a friendly "not available right now" state, never an error.

---

## 7. Data & API layer

- **Typed API client** wrapping the FastAPI endpoints; base URL from env (`EXPO_PUBLIC_API_BASE_URL`).
- **Auth:** JWT stored in `expo-secure-store`; attached to requests; 401 → auth gate.
- **Server state:** TanStack Query (caching, retries, loading/error surfaces) — mirrors the web PoC's data approach but re-implemented cleanly.
- **Error mapping (single place):** HTTP/network failures → friendly `StateView` messages. No raw status codes or stack traces reach the UI. Examples:
  - network down → "Can't reach Lahza right now. Check your connection and pull to retry."
  - 503 feature-off → "Search isn't switched on for this event yet."
  - 404 photo (access guard) → treated as not-found, never "you're not allowed" (matches backend privacy design).
- **Demonstration gallery:** when a real gallery is empty (no enrollment / no matches yet), `StateView` renders a clearly-labeled demo gallery so the screen feels alive, with a CTA to enroll / add photos. Demo content is visibly marked as a sample.
- **No mock-fallback for real content.** If the backend is down, we show the error state — we do not fabricate a fake gallery pretending to be real.

---

## 8. Tech stack & project structure

**Stack:** Expo (managed) · Expo Router · React Native · TypeScript · Reanimated 3 · Moti · Gesture Handler · Expo Haptics · Expo Camera / Image Picker · Secure Store · TanStack Query · expo-font.

```
la2etha-mobile/
├── app/                 Expo Router routes (screens map to §6)
├── src/
│   ├── api/             typed client + endpoint modules + error mapping
│   ├── components/      component vocabulary (§5)
│   ├── theme/           tokens (§2), fonts, motion presets
│   ├── features/        screen-level composition & hooks
│   └── lib/             query client, secure storage, haptics, utils
├── assets/              fonts, logo, icons, demo-gallery images
└── docs/                this spec + implementation plan
```

Fonts (Fraunces, Hanken Grotesk, IBM Plex Sans Arabic, Space Mono) bundled as local `.ttf` in `assets/fonts`. Pairing is on a real contrast axis (soft serif + rounded sans + Arabic + mono); mono is used *sparingly* for data only.

### 8.5 Native fidelity (from Expo `building-native-ui`)
The app must feel native, not like a web page in a shell:
- **Native tab bar** and platform navigation feel; raised center Add/Enroll action.
- **Safe-area insets** respected on every screen (notch, home indicator).
- **Photo grids use FlashList** (virtualized) — never `ScrollView`/`.map()` over hundreds of photos.
- **Expo Image** for every photo: disk caching, `contentFit`, and **blurhash placeholders** that power the develop-in.
- **`expo-haptics`** on the designed peaks (stamp-thunk, unlock, capture, tab-press).
- **Gesture Handler + Reanimated** for flick stacks, shared-element zoom, pull-to-refresh — all UI-thread.
- Native camera/permissions via `expo-camera`; graceful permission-denied state (not a crash).

### 8.6 Hierarchy & cognitive load (audit-mandated)
- **One primary action per screen** (the glow CTA); everything else is secondary/tertiary.
- **Gallery:** the "maybe not you" (demoted) section is **collapsed by default**; main relevance leads.
- **Lightbox:** per-photo actions (claim, export, edit, show-faces) live behind **one action sheet**, not a row of competing buttons.
- Summary before detail; state encoded in form (stamp, halo, chip) as well as text.

---

## 9. Build order (vertical slices)

Shipped so the owner sees real progress on-device early. Each slice runs end-to-end (screen + API + states) before the next.

1. **Foundation + Splash + Onboarding + Auth** — Expo app, theme, fonts, navigation, secure auth, login/register. On-device milestone: sign in for real.
2. **Events + Create + Join + Event Hub** — event lifecycle, ticket-stub components, tear transition.
3. **Enroll + Add photos** — camera, glowing scan ring, upload + live processing. (First "wow".)
4. **Gallery + Photo/Lightbox + Search + Claim** — the core payoff: unlock bloom, trust toggle, search, corrections.
5. **Export + Host Review + Profile/Settings + AI Edit (stretch)** — privacy, host tools, account.

---

## 10. Out of scope (v1)
- Night/dark theme (tokens future-proofed, not shipped).
- Offline sync / persistence beyond query cache.
- Push notifications.
- The web PoC (untouched).
- AI Edit (F7) is stretch, built last, behind backend capability.

---

## 11. Open questions
- None blocking. Font final picks (Fraunces/Hanken/Plex Arabic/Space Mono) can be swapped during slice 1 if any feels off on-device.
- A future "impeccable" polish pass is planned by the owner (separate phase, not this build).
