# EduPortal Soal System Overhaul + UI Fix Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Overhaul the question (soal) system so each game has its own independent soal management accessible from the portal, fix mobile UI collisions, and remove the broken shared system.

**Architecture:** 
- Each game gets its own `soal.json` data file + management UI
- Portal gets a centralized "Kelola Soal" page that manages all games' questions
- Shared `edu-soal.js` becomes a thin loader only (no upload UI per-game)
- Mobile-first responsive fixes

**Tech Stack:** Vanilla JS, CSS, HTML (static site, no framework)

---

## Phase 1: Fix Mobile UI (Ular Tangga)

### Task 1.1: Fix Home Screen Mobile Layout

**Objective:** Fix overlapping elements on mobile home screen

**Files:**
- Modify: `Ular Tanga Edukasi/js/ui.js:53-73` (renderHome)
- Modify: `Ular Tanga Edukasi/css/style.css` (responsive styles)

**Changes:**
1. Add `@media (max-width: 480px)` rules for:
   - Font sizes (clamp smaller)
   - Tag row: stack vertically or smaller padding
   - Button padding: reduce for mobile
   - Bottom emoji row: hide or shrink
2. In `renderHome()`: use CSS classes instead of inline styles for responsiveness

**Verification:** Open on mobile (375px width), no overlapping elements

**Commit:** `fix(ular-tangga): mobile home screen layout`

---

### Task 1.2: Fix Game Board Mobile Layout

**Objective:** Fix board grid, player tabs, and bottom bar on small screens

**Files:**
- Modify: `Ular Tanga Edukasi/js/ui.js:177-282` (renderBoard)
- Modify: `Ular Tanga Edukasi/css/style.css` (board responsive)

**Changes:**
1. Player tabs: horizontal scroll on mobile
2. Board grid: ensure 10x10 fits in viewport (min cell size)
3. Bottom bar: stack vertically if needed
4. Roll button: full width on mobile

**Verification:** Play a round on 375px screen, all elements accessible

**Commit:** `fix(ular-tangga): mobile board layout`

---

## Phase 2: Portal-Level Soal Management

### Task 2.1: Create Portal Soal Manager Page

**Objective:** Build a centralized "Kelola Soal" page accessible from portal homepage

**Files:**
- Create: `soal-manager.html` (portal-level)
- Create: `js/soal-manager.js` (portal-level)
- Modify: `index.html` (add "Kelola Soal" button in navbar or hero)

**Features:**
1. List all games with their soal counts
2. Per-game: show categories, question counts, difficulty breakdown
3. Per-game: upload custom `soal.json`
4. Per-game: download template
5. Per-game: reset to default
6. Global: upload all soal at once (zip or multi-file)

**Data Structure:**
```
/soal/
  ular-tangga/
    default.json (embedded default)
    custom.json (uploaded by user, stored in localStorage)
  game-2/
    default.json
    custom.json
```

**Verification:** Open portal → click "Kelola Soal" → see all games → manage per-game

**Commit:** `feat(portal): add centralized soal management page`

---

### Task 2.2: Refactor edu-soal.js to Be Loader-Only

**Objective:** Simplify shared library to just load questions, remove per-game upload UI

**Files:**
- Modify: `shared/edu-soal.js`
- Modify: `shared/edu-soal.css` (remove uploader styles, keep basic styles)

**Changes:**
1. Keep: `init()`, `getQuestion()`, `getDifficulty()`, `getPoints()`, etc.
2. Remove: `mountUploader()`, `uploadJSON()`, `_downloadTemplate()`, etc.
3. Add: `loadFromStorage(gameId)` — loads custom soal from localStorage
4. Add: `getDefaultData()` — returns embedded default data

**Verification:** Ular Tangga still loads and plays normally

**Commit:** `refactor(edu-soal): simplify to loader-only, remove per-game uploader`

---

### Task 2.3: Update Ular Tangga to Use New System

**Objective:** Remove "Kelola Soal" button from Ular Tangga home, use portal manager instead

**Files:**
- Modify: `Ular Tanga Edukasi/js/ui.js:64` (remove button)
- Modify: `Ular Tanga Edukasi/js/questions.js` (use new edu-soal API)

**Changes:**
1. Remove "📋 Kelola Soal" button from renderHome()
2. Update `QuestionManager.load()` to use new `edu-soal.loadFromStorage('ular-tangga')`
3. Add link back to portal in home screen (already exists: "🏠 Portal")

**Verification:** Ular Tangga home screen cleaner, questions still load

**Commit:** `refactor(ular-tangga): remove per-game soal UI, use portal manager`

---

## Phase 3: Prepare for Future Games

### Task 3.1: Create Game Registry System

**Objective:** Make it easy to add new games with their own soal

**Files:**
- Create: `shared/game-registry.js`
- Modify: `soal-manager.html` (use registry)

**Registry Structure:**
```javascript
const GAME_REGISTRY = [
  {
    id: 'ular-tangga',
    name: 'Ular Tangga Edukasi',
    icon: '🎲',
    path: 'Ular Tanga Edukasi/',
    soalPath: 'soal/ular-tangga/default.json',
    categories: 10,
    questions: 110
  },
  // Future games added here
];
```

**Verification:** Soal manager shows all registered games

**Commit:** `feat(shared): add game registry system`

---

### Task 3.2: Add "Add New Game" Placeholder

**Objective:** Show coming soon games in portal with disabled state

**Files:**
- Modify: `index.html` (games grid)
- Modify: `soal-manager.html` (show future games greyed out)

**Changes:**
1. Add 2-3 placeholder game cards with "Coming Soon" badge
2. Soal manager shows them greyed out with "Belum tersedia"

**Verification:** Portal shows future games, soal manager shows them disabled

**Commit:** `feat(portal): add coming soon game placeholders`

---

## Phase 4: Cleanup & Polish

### Task 4.1: Remove Dead Code

**Objective:** Clean up unused shared code

**Files:**
- Review: `shared/edu-theme.js` (check if still used)
- Review: `shared/edu-projector.js` (check if still used)
- Remove: any dead imports

**Verification:** No console errors, all features still work

**Commit:** `chore: remove dead code`

---

### Task 4.2: Update README

**Objective:** Document new soal management system

**Files:**
- Modify: `README.md`

**Changes:**
1. Add "Kelola Soal" section explaining portal-level management
2. Update "Cara Upload Soal" instructions
3. Add game registry documentation

**Commit:** `docs: update README with new soal system`

---

## Execution Order

1. Task 1.1 → 1.2 (mobile fixes, quick wins)
2. Task 2.1 → 2.2 → 2.3 (core soal system refactor)
3. Task 3.1 → 3.2 (future-proofing)
4. Task 4.1 → 4.2 (cleanup)

**Total estimated time:** 2-3 hours
