# Lahza Mobile — Spec 006: UI Vitality — Design Brief

**Status:** Design approved via brainstorming (2026-07-04). Ready for speckit (`/speckit.specify` → `/speckit.plan`).
**Scope:** Re-skin and re-navigate the **existing** mobile app into a lively, teal-forward design system. **No new product features** — those are specs 002 (video), 003 (discovery/CV toolkit), 004 (identity & host policy), 005 (photo editor). 006 is the visual/navigation foundation every later spec builds on.
**Supersedes where noted:** the empty-state rule in `2026-07-04-lahza-mobile-design.md` (§7 "demonstration gallery") — see Empty States below.

---

## 1. Direction

Fully realize the approved **"Warm Lumen"** language (calm cream paper world that ignites on recognition) but **warmer and more playful**, and **teal-forward**. Today's screens are text-only lists with no icons, imagery, or visual cues; this spec fixes that everywhere without abandoning the brand.

## 2. Palette rebalance (the core rule)

The brand hexes are unchanged (constitution-locked). What changes is **role assignment**, to stop the app reading as "Claude orange":

- **Teal is the app's voice** — primary CTAs, active navigation, energy, accents, counts, and the CV-glow moments (`glow.teal`). The primary button (`GlowButton`) shifts from orange fill to a **teal fill**.
- **Orange (`stamp`/`stampDeep`) is reserved for *you / identity only*** — your face halo, the "You" tag, "This is me", your avatar ring, and the HOST stamp. It stays rare, which is what keeps it meaningful.
- Cream/paper and teal-tinted shadows unchanged. Body-legal contrast rules unchanged (`ink`/`inkSoft` on cream; `inkFaint` = metadata only).

## 3. Signature component — the event pass (elevated ticket)

Keep the beloved ticket stub (dashed tear + punched notches + HOST stamp); elevate it into one "event pass" family with two variants chosen by data:

- **Boarding pass** (when the event has a cover) — a perforated left stub with the **join code down the edge** (teal on dark ink), cover thumbnail, title, counts. This perforation is the anchor for the **tear-to-enter transition**.
- **People ticket** (no cover) — leads with a row of **face avatars** of people in the event (your avatar ringed orange), title, counts, code.

Event cover source: host-chosen, or auto-picked "best group shot" (the auto-pick is a nice-to-have that overlaps spec 003; 006 only needs the cover slot + a manual/host path + a graceful default).

## 4. Navigation

- **Root (across events):** a bottom **tab bar — `Events · Profile`** — with icons and a **raised center ＋** for Create/Join. Events tab shows the event-pass list; Profile replaces today's temporary header sign-out link.
- **Inside an event — Hybrid:**
  - **First run (not yet enrolled):** a guided **action-card launcher** (Enroll → Add → Gallery/Search), icon-rich, cover header. Cards are the language the owner likes.
  - **Once set up (enrolled):** the event opens straight into a **tabbed shell — `Gallery · Search · ＋Add · You`** with a raised teal ＋. Enroll/re-enroll lives under **You**.
- Transition: opening an event **tears** the pass along its perforation into the hub (reduced-motion → crossfade).

## 5. Empty states (supersedes the old demo-gallery rule)

**Illustrated** everywhere: the brand **scan-bracket motif** + playful copy + tasteful emoji + a teal CTA. Applies to gallery-empty, search-no-results, permissions-denied, offline/error. (This replaces the previous "faded demonstration gallery" idea — the owner chose the illustrated treatment.)

## 6. Component kit (the deliverable)

A reusable, individually-testable kit that all screens adopt:

- **Icon** + **IconButton** — bundled offline icon set (recommend `@expo/vector-icons`, ships with Expo, works in Expo Go; pick one family, e.g. Ionicons/Feather, for consistency). Every action gets **icon + label** (never icon-only — accessibility).
- **Avatar** (face thumbnail, optional orange "you" ring) and **AvatarRow** (+N overflow).
- **Chip / Tag** — teal filter/count chips; **event-type chip** (💍 Wedding, 🎓 Grad, 🍽️ Iftar…) that generalizes events (data comes from spec 004).
- **PrimaryButton** (teal, breathing glow — recolor existing `GlowButton`) and **SecondaryButton** (teal outline).
- **TabBar** + **RaisedActionButton (FAB ＋)**.
- **EventPass** (boarding / people variants) — evolves `TicketStub`.
- **CoverImage** (expo-image, blurhash-ready) and **SectionHeader**.
- **EmptyState** (illustrated) and **Menu / ActionSheet** (formalize the lightbox "⋯" pattern).
- **FaceLabel** — the **name-on-faces** chip for the trust overlay: **You** (orange), a recognized member by **username** (teal), an un-enrolled **Guest** (grey). *006 ships the component; the backend `name` field + who-may-see-names policy is spec 004 — until then it renders `is_me`→"You" / else "Guest".*

## 7. Motion & delight

Build on what exists (breathing teal CTA, morph-open lightbox, staggered cards, count-up). Add:
- **Tear-to-enter** the event from its pass.
- A restrained **confetti/bloom** on event-create and gallery-unlock (playful, teal+orange, one-shot).
- All effects honor `useReducedMotion` (degrade to crossfade/instant).

## 8. Emoji policy

Tasteful and meaningful, not spam: action affordances (📸 enroll, 🖼️ gallery, 🔍 search, 🎉 create) and event-type chips. Never in body copy or error states that need to stay calm.

## 9. Accessibility & constraints

- Icon **and** text label on actions; maintain WCAG (cream-on-teal CTA verified; body-legal colors unchanged).
- Bundled assets only (icons, illustrations as local SVG/PNG) — no network fonts/icons.
- Reduced-motion honored throughout.

## 10. Scope

**In:** design tokens delta (teal-forward roles), the component kit, root tab bar + hybrid event navigation, re-skin of all existing screens (auth, events, hub, enroll, add, gallery, lightbox, search, profile, host review) into the kit, illustrated empty states, tear + confetti delight.
**Out:** any new feature behavior (video, discovery/CV toolkit, host policy data, name-resolution backend, photo editor) — those are specs 002–005. The `name-on-faces` **backend** and event-type **data** are consumed here only if 004 lands first; otherwise 006 renders graceful placeholders.

## 11. Dependencies & sequencing

- 006 is **first**; specs 002–005 build their screens on this kit.
- Full **name-on-faces** needs spec 004's backend `name` field on `GET /photos/{id}/faces`. Event-type chips need 004's event-type attribute. 006 degrades gracefully without them.

## 12a. Shipped delta (implementation, 2026-07-04)

Built per `specs/002-ui-vitality/` (plan/tasks). Matches this brief with two deltas:

- **Icon set:** Feather via `@expo/vector-icons` (already bundled with Expo — no new dependency), not Ionicons.
- **Illustrations:** `EmptyState`'s art is drawn inline with `react-native-svg` (`src/components/illustrations.tsx`) rather than shipped as raster/SVG files under `assets/illustrations/` — same bundled-no-network guarantee, fewer files.
- **`EventPass` member preview:** always renders non-identifying monogram avatars (never real host-visible faces), because there is no `GET /events/{id}/members` client wrapper yet and per-card member fetches on the events list would add N+1 calls. Strictly more private than this brief's "real faces for host" idea — not a downgrade in the constitution's privacy sense, just a smaller version. Revisit once an event cover-image field (spec 003) makes the boarding-pass variant reachable and a members hook is worth adding.
- **Enrolled state:** no backend "am I enrolled" flag exists — persisted client-side in SecureStore (`src/features/events/enrolledStore.ts`), set the moment an enroll job finishes. Swap for a server field if one ships.

## 12. Acceptance criteria

1. Every actionable control has an icon + label; no screen is text-only.
2. Primary CTAs are teal; orange appears only on identity elements (you/host).
3. Root shows `Events · Profile` tabs + raised ＋; events render as the elevated pass (boarding when cover, people when not).
4. Entering an event follows the hybrid rule (launcher pre-enroll, tabbed gallery post-enroll) with the tear transition.
5. All empty/error states use the illustrated treatment.
6. `FaceLabel` renders You/username/Guest correctly from the faces payload.
7. Reduced-motion disables tear/confetti/breathing without breaking layout.
8. The component kit is reused (no bespoke re-styling per screen).
