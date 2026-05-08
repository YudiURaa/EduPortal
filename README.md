# EduPortal - Game Edukasi Interaktif

Platform game edukasi berbasis web untuk siswa SD, SMP, dan SMA/SMK.  
Zero dependencies. Tanpa build step. Buka file langsung di browser.

---

## Arsitektur

```
EduPortal/
├── index.html                              Portal utama (game catalog)
├── README.md
│
├── shared/                                 Shared libraries (reusable semua game)
│   ├── edu-soal.js         [15 KB]        Question loader, uploader, validator v2
│   ├── edu-soal.css        [4 KB]         Styling uploader component
│   ├── edu-sequence.js     [5.5 KB]       Interactive sequencing (tipe soal urutan)
│   ├── edu-sequence.css    [4.6 KB]       Styling sequence component
│   ├── edu-theme.js        [4.4 KB]       Adaptive theme system (3 jenjang)
│   └── edu-theme.css       [4.4 KB]       CSS variables per tema
│
├── Ular Tanga Edukasi/                     Game 1: Ular Tangga
│   ├── index.html                          Entry point
│   ├── data/
│   │   ├── soal.json       [18 KB]        118 soal, 11 kategori
│   │   ├── board-config.json               Konfigurasi papan
│   │   └── tutorial.md                     Panduan edit soal
│   ├── js/
│   │   ├── data.js                         Embedded soal (file:// fallback)
│   │   ├── game.js                         Game logic, state machine
│   │   ├── ui.js                           UI renderer (semua screen)
│   │   ├── dice-3d.js                      Three.js dadu 3D (top-down view)
│   │   ├── questions.js                    QuestionManager (wrapper EduSoal)
│   │   ├── audio.js                        Web Audio API sound system
│   │   ├── storage.js                      LocalStorage save/load
│   │   └── main.js                         Entry point, keyboard/touch
│   ├── css/
│   │   ├── main.css                        Base styles
│   │   ├── board.css                       Board layout (responsive fullscreen)
│   │   ├── components.css                  UI components
│   │   └── dice-3d.css                     Dice overlay
│   └── lib/
│       └── three.min.js    [603 KB]        Three.js (lokal, bukan CDN)
│
└── Labirin Bahasa Inggris/                 Game 2: Labirin
    ├── labirin bahasa inggris.html         Single-file game
    └── data/
        └── soal.json       [21 KB]         70 soal, 9 kategori
```

---

## Workflow: Cara Kerja Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    PORTAL (index.html)                    │
│  - Catalog semua game                                    │
│  - Fetch soal.json tiap game → hitung total soal         │
│  - Filter, search, stats                                 │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Game 1      │  │ Game 2      │  │ Game N...   │
│ Ular Tangga │  │ Labirin     │  │ (future)    │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────────────┐
│                  SHARED LIBRARIES                         │
│                                                          │
│  edu-soal.js ─── Load soal, upload, validate, filter     │
│  edu-sequence.js ─── Tipe soal urutan langkah            │
│  edu-theme.js ─── Tema adaptif per jenjang               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow per Game

```
1. Game load
   ├── Check localStorage (custom uploaded soal?)
   │   └── YES → parse & use
   │   └── NO ──┐
   │             ├── Check embedded data (js/data.js)
   │             │   └── YES → parse & use (file:// protocol)
   │             │   └── NO ──┐
   │             │             └── Fetch data/soal.json (http/https)
   │             │                 └── YES → parse & use
   │             │                 └── NO → fallback minimal
   │
2. Game play
   ├── getQuestion() → random dari pool (shuffled)
   ├── type === 'choice' → render pilihan ganda
   ├── type === 'sequence' → render EduSequence component
   │
3. Scoring
   ├── Choice: benar = +poin, salah = mundur ke preRollPosition
   ├── Sequence: partial scoring
   │   ├── 100% benar = full poin + combo
   │   ├── >= 70% benar = poin proporsional, tetap di posisi
   │   └── < 70% = mundur ke preRollPosition
```

---

## Format Soal v2

Setiap game punya `data/soal.json` sendiri. Format standar:

```json
{
  "config": {
    "title": "Nama Bank Soal",
    "description": "Deskripsi"
  },
  "categories": [
    {
      "id": "aljabar_smp",
      "name": "Aljabar",
      "icon": "🔤",
      "level": "hard",
      "sub_level": "hots",
      "tags": ["aljabar", "persamaan"],
      "target": "Kelas 7-9",
      "soal": [
        {
          "q": "Jika 3x + 7 = 22, maka x = ?",
          "opts": ["3", "4", "5", "6"],
          "ans": 2,
          "exp": "3x = 15, x = 5",
          "image_url": "",
          "tags": ["linear"]
        },
        {
          "q": "Urutkan langkah menyelesaikan 2x + 4 = 10:",
          "type": "sequence",
          "steps": [
            "Kurangi 4 dari kedua ruas: 2x = 6",
            "Bagi kedua ruas dengan 2: x = 3",
            "Cek: 2(3) + 4 = 10 ✓"
          ],
          "exp": "Isolasi variabel step by step."
        }
      ]
    }
  ]
}
```

### Field Reference

| Field | Level | Wajib | Keterangan |
|-------|-------|-------|------------|
| `id` | Kategori | Ya | ID unik (huruf kecil, underscore) |
| `name` | Kategori | Ya | Nama tampilan |
| `icon` | Kategori | Ya | Emoji |
| `level` | Kategori | Ya | `"easy"` / `"medium"` / `"hard"` |
| `sub_level` | Kategori | Tidak | `"teori"` / `"praktikum"` / `"hots"` |
| `tags` | Kategori | Tidak | Array string untuk filter |
| `target` | Kategori | Tidak | Target jenjang (e.g. "Kelas 7-9") |
| `q` | Soal | Ya | Teks pertanyaan |
| `type` | Soal | Tidak | `"choice"` (default) / `"sequence"` |
| `opts` | Soal | Choice | Array 4 pilihan |
| `ans` | Soal | Choice | Index jawaban (0-3) |
| `steps` | Soal | Sequence | Array langkah urutan benar |
| `exp` | Soal | Ya | Penjelasan jawaban |
| `image_url` | Soal | Tidak | URL gambar/diagram |
| `tags` | Soal | Tidak | Tags per soal (merge dengan kategori) |

### Scoring

| Level | Poin | Combo x3 | Combo x5 |
|-------|------|----------|----------|
| Easy | +10 | +20 | +30 |
| Medium | +20 | +40 | +60 |
| Hard | +30 | +60 | +90 |

Sequence partial: `poin = basePoints × (correctSteps / totalSteps)`

---

## Shared Libraries API

### edu-soal.js

```js
const loader = new EduSoal({ storageKey: 'nama-game' });
await loader.init(embeddedData, 'data/soal.json');

// Core
loader.getQuestion()                    // Random soal dari pool
loader.getDifficulty(q)                 // 'easy' | 'medium' | 'hard'
loader.getPoints(difficulty)            // 10 | 20 | 30
loader.shuffleOptions(q)                // Acak pilihan jawaban

// Filter & Search
loader.getQuestionsByTag('aljabar')     // Filter by tag
loader.getQuestionsByTarget('Kelas 7')  // Filter by target
loader.getQuestionsByType('sequence')   // Filter by type
loader.getQuestionsBySubLevel('hots')   // Filter by sub_level
loader.getAllTags()                      // {tag: count, ...}

// Sequence
loader.scoreSequence(q, userOrder)      // {score, total, percent, correct, details}

// Upload & Manage
loader.uploadJSON(file, callback)       // Upload + validate + save
loader.hasUploaded()                    // Boolean
loader.clearUploaded()                  // Reset ke default
loader.mountUploader(element)           // Render upload UI
```

### edu-sequence.js

```js
new EduSequence(container, question, function(result) {
  // result.score    → jumlah posisi benar
  // result.total    → total langkah
  // result.percent  → persentase benar
  // result.correct  → boolean (100% benar?)
  // result.details  → [{step, userStep, correct}, ...]
  // result.userOrder → array urutan user
});
```

### edu-theme.js

```js
EduTheme.set('sd')                      // Set tema aktif
EduTheme.get()                          // 'sd' | 'smp' | 'sma'
EduTheme.init()                         // Auto-apply dari localStorage
EduTheme.detectFromTarget('Kelas 5')    // → 'sd'
EduTheme.mountPicker(element)           // Full picker (3 opsi)
EduTheme.mountCompactPicker(element)    // Compact (icon only)
```

CSS variables per tema:
```css
var(--t-bg)          /* Background */
var(--t-bg-card)     /* Card background */
var(--t-text)        /* Text color */
var(--t-text-muted)  /* Muted text */
var(--t-primary)     /* Primary accent */
var(--t-secondary)   /* Secondary accent */
var(--t-success)     /* Green */
var(--t-danger)      /* Red */
var(--t-radius)      /* Border radius */
var(--t-radius-sm)   /* Small radius */
var(--t-shadow)      /* Box shadow */
var(--t-gradient)    /* Gradient */
```

---

## Improvement Roadmap

### Done

| # | Improvement | Status |
|---|-------------|--------|
| 1 | Tagging system (tags, sub_level, target per kategori & soal) | ✅ |
| 2 | Image/asset support (image_url field) | ✅ |
| 3 | Interactive Sequencing (tipe soal urutan langkah) | ✅ |
| 4 | Partial scoring untuk sequence (>= 70% = poin proporsional) | ✅ |
| 5 | UI Adaptif per jenjang (3 tema: SD/SMP/SMA) | ✅ |
| 6 | Soal per game (masing-masing punya soal.json sendiri) | ✅ |
| 7 | Upload soal via web (localStorage) | ✅ |
| 8 | Portal fetch total soal dinamis dari tiap game | ✅ |
| 9 | Download template soal JSON | ✅ |
| 10 | Dadu 3D top-down view (Three.js) | ✅ |
| 11 | Board responsive fullscreen | ✅ |
| 12 | Soal setiap langkah (salah = mundur ke awal) | ✅ |

### Backlog (Future)

| # | Improvement | Priority | Effort |
|---|-------------|----------|--------|
| 1 | Backend (Supabase/Firebase) - cloud sync, leaderboard global | High | Large |
| 2 | Teacher Dashboard - monitor progres siswa | High | Large |
| 3 | Code Sandbox (HTML/CSS checker) untuk IT/TKJ | Medium | Medium |
| 4 | Video embed di soal (video_embed field) | Medium | Small |
| 5 | Multiplayer online (WebSocket) | Low | Large |
| 6 | PWA (offline support, install) | Medium | Medium |
| 7 | Achievement system (badges, streak) | Low | Small |
| 8 | Accessibility (screen reader, high contrast) | Medium | Medium |
| 9 | Analytics (soal mana yang paling sering salah) | Medium | Medium |
| 10 | Export progress ke PDF/Excel | Low | Small |

---

## Cara Menjalankan

### Tanpa server (file://)
Buka `index.html` langsung di browser. Semua fitur jalan kecuali:
- Portal fetch soal count (pakai angka statis)
- CORS warning di console (bisa diabaikan)

### Dengan local server (recommended)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code: install "Live Server" extension → Go Live
```
Buka `http://localhost:8000`

---

## Cara Tambah Game Baru

```bash
# 1. Buat folder
mkdir "Nama Game Baru"
mkdir "Nama Game Baru/data"

# 2. Buat soal.json (copy template atau download dari game lain)
# 3. Buat game HTML/JS
```

Include di HTML:
```html
<!-- Shared -->
<link rel="stylesheet" href="../shared/edu-soal.css">
<link rel="stylesheet" href="../shared/edu-sequence.css">
<link rel="stylesheet" href="../shared/edu-theme.css">
<script src="../shared/edu-soal.js"></script>
<script src="../shared/edu-sequence.js"></script>
<script src="../shared/edu-theme.js"></script>
```

Init di JS:
```js
// Load soal
const loader = new EduSoal({ storageKey: 'nama-game-unik' });
await loader.init(EMBEDDED_DATA, 'data/soal.json');

// Get soal
const q = loader.getQuestion();
if (q.type === 'sequence') {
  new EduSequence(container, q, handleResult);
} else {
  renderMultipleChoice(q);
}
```

Register di portal `index.html`:
```js
// Tambah di array GAME_SOAL_PATHS
{ path: 'Nama Game Baru/data/soal.json', card: 'Nama Game Baru' }
```

---

## Teknologi

| Layer | Tech | Keterangan |
|-------|------|------------|
| Frontend | HTML5, CSS3, Vanilla JS | Zero framework |
| 3D | Three.js (lokal) | Dadu 3D di Ular Tangga |
| Audio | Web Audio API | Sound effects procedural |
| Storage | LocalStorage | Save progress, custom soal, tema |
| Layout | CSS Grid, Flexbox, vmin | Responsive tanpa media query library |
| Protocol | file:// + http:// | Dual support |

**Total size: ~950 KB** (600 KB = Three.js, sisanya ~350 KB kode + data)

---

## Stats

| Metric | Value |
|--------|-------|
| Total game | 2 (live) |
| Total soal | 188 |
| Total kategori | 20 |
| Tipe soal | 2 (choice + sequence) |
| Shared libraries | 6 files |
| Tema | 3 (SD/SMP/SMA) |
| Max pemain | 4 |
| Build step | None |
| Dependencies | None (vanilla) |
