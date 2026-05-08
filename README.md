# 🎮 EduPortal - Game Edukasi Interaktif

<div align="center">

![EduPortal](https://img.shields.io/badge/EduPortal-v2.0-6c5ce7?style=for-the-badge)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-00b894?style=for-the-badge)
![Games](https://img.shields.io/badge/Games-2%20Live-fd79a8?style=for-the-badge)
![Soal](https://img.shields.io/badge/Soal-188-f39c12?style=for-the-badge)

**Platform game edukasi berbasis web untuk siswa SD, SMP, dan SMA/SMK.**  
Zero dependencies. Tanpa build step. Buka file langsung di browser.  
**Projector-optimized untuk penggunaan di kelas.**

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| 🎲 **Ular Tangga Edukasi** | Board game 10x10 dengan dadu 3D, soal di setiap petak |
| 🏰 **Labirin Pengetahuan** | Maze game dengan fog of war, power-ups, dan soal Bahasa Inggris |
| 📺 **Projector Mode** | Font besar, high contrast, fullscreen — optimized untuk proyektor kelas |
| ⌨️ **Keyboard Shortcuts** | 1-4 jawab, Space roll dadu, P pause, S skor |
| 🎯 **Lobby + Countdown** | Tampilan tunggu + countdown 3-2-1-GO sebelum mulai |
| 🏆 **Team Scoreboard** | Always visible di atas layar saat projector mode |
| 🔥 **Combo System** | Streak jawaban benar = bonus poin (2x, 3x) |
| ⚡ **Power-ups** | 2x Poin, Skip, Shield, Hint |
| 📋 **Soal Sequence** | Tipe soal urutan langkah (partial scoring) |
| 🎨 **3 Tema Adaptif** | SD (colorful), SMP (modern), SMA (sleek) |
| 📂 **Upload Soal** | Custom soal via JSON upload (localStorage) |
| 🔊 **Audio Feedback** | Web Audio API, auto-boost di projector mode |

---

## 📺 Projector Mode (Classroom Setup)

Dirancang untuk setup: **Laptop → Proyektor → Siswa main bareng pakai wireless mouse/keyboard**

### Cara Aktivasi
1. Klik tombol **📺 Projector** di kanan atas, atau tekan **F11**
2. Otomatis: font membesar, warna high-contrast, fullscreen, cursor besar

### Keyboard Shortcuts

| Key | Fungsi |
|-----|--------|
| `1` `2` `3` `4` | Pilih jawaban A/B/C/D |
| `Space` | Lempar dadu / Lanjut |
| `Enter` | Konfirmasi |
| `R` | Roll dadu (alternatif) |
| `P` | Pause game |
| `S` | Lihat scoreboard |
| `Esc` | Tutup overlay |
| `F11` | Toggle projector mode |

### Classroom Features
- **Lobby Screen** — Tampilan tunggu sebelum mulai, lihat tim + rules
- **Countdown 3-2-1-GO!** — Build suspense
- **Team Scoreboard Bar** — Skor semua tim always visible di atas
- **Celebration Animation** — Efek besar saat combo x3/x5
- **Sound Boost 2x** — Volume otomatis naik untuk 1 kelas

---

## 🏗️ Arsitektur

```
EduPortal/
├── index.html                              Portal utama (game catalog)
├── README.md
│
├── shared/                                 Shared libraries
│   ├── edu-soal.js         [15 KB]        Question loader, uploader, validator
│   ├── edu-soal.css        [4 KB]         Styling uploader component
│   ├── edu-sequence.js     [5.5 KB]       Interactive sequencing
│   ├── edu-sequence.css    [4.6 KB]       Styling sequence component
│   ├── edu-theme.js        [4.4 KB]       Adaptive theme system (3 jenjang)
│   ├── edu-theme.css       [4.4 KB]       CSS variables per tema
│   ├── edu-projector.js    [12 KB]        Projector mode + keyboard shortcuts
│   └── edu-projector.css   [11 KB]        Projector/classroom styles
│
├── Ular Tanga Edukasi/                     Game 1: Ular Tangga
│   ├── index.html
│   ├── data/soal.json      [18 KB]        118 soal, 11 kategori
│   ├── js/ (8 files)                      Game logic, UI, audio, dice 3D
│   ├── css/ (4 files)                     Responsive styles
│   └── lib/three.min.js   [603 KB]        Three.js (lokal)
│
└── Labirin Bahasa Inggris/                 Game 2: Labirin
    ├── labirin bahasa inggris.html         Single-file game
    └── data/soal.json      [21 KB]        70 soal, 9 kategori
```

---

## 🚀 Cara Menjalankan

### Tanpa server (file://)
```
Buka index.html langsung di browser.
Semua fitur jalan kecuali fetch soal count di portal.
```

### Dengan local server (recommended)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code: Live Server extension → Go Live
```

---

## 📝 Format Soal

Setiap game punya `data/soal.json` sendiri:

```json
{
  "categories": [
    {
      "id": "aljabar_smp",
      "name": "Aljabar",
      "icon": "🔤",
      "level": "hard",
      "target": "Kelas 7-9",
      "soal": [
        {
          "q": "Jika 3x + 7 = 22, maka x = ?",
          "opts": ["3", "4", "5", "6"],
          "ans": 2,
          "exp": "3x = 15, x = 5"
        },
        {
          "q": "Urutkan langkah menyelesaikan 2x + 4 = 10:",
          "type": "sequence",
          "steps": ["Kurangi 4", "Bagi 2", "Cek jawaban"],
          "exp": "Isolasi variabel step by step."
        }
      ]
    }
  ]
}
```

### Scoring

| Level | Poin | Combo x3 | Combo x5 |
|-------|------|----------|----------|
| Easy | +10 | +20 | +30 |
| Medium | +20 | +40 | +60 |
| Hard | +30 | +60 | +90 |

---

## 🛠️ Teknologi

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JS |
| 3D | Three.js (dadu 3D) |
| Audio | Web Audio API (procedural) |
| Storage | LocalStorage |
| Layout | CSS Grid, Flexbox, vmin |
| Protocol | file:// + http:// dual support |

**Total size: ~950 KB** (600 KB Three.js, 350 KB kode + data)

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Total games | 2 (live) |
| Total soal | 188 |
| Total kategori | 20 |
| Tipe soal | 2 (choice + sequence) |
| Shared libraries | 8 files |
| Tema | 3 (SD/SMP/SMA) |
| Max pemain | 4 |
| Build step | None |
| Dependencies | None |

---

## 📜 License

MIT — Free to use for educational purposes.

---

<div align="center">

**Made with ❤️ for Indonesian students**

🎲 Belajar Seru, Main Asyik! 🎲

</div>
