Rencana: Ular Tanga Edukasi
Ringkasan
Game edukasi interaktif berbasis ular tanga dengan dadu 3D realistis, soal editable via JSON, dan save progress menggunakan localStorage.

Struktur Direktori
E:\web\EduPortal\
├── index.html                            (update - tambah card game baru)
└── Ular Tanga Edukasi/
   ├── index.html                        (entry point)
   ├── css/
   │  ├── main.css                      (tema, layout, animations)
   │  ├── board.css                     (papan 10x10, petak, bidak)
   │  ├── dice-3d.css                   (styles canvas 3D dadu)
   │  └── components.css                (buttons, modals, cards)
   ├── js/
   │  ├── main.js                       (init, router, localStorage)
   │  ├── game.js                       (logic: gerak, ular/tanga, finish)
   │  ├── dice-3d.js                    (Three.js - dadu 3D realistis)
   │  ├── questions.js                  (load JSON, timer, jawaban)
   │  ├── ui.js                         (render screens, modals)
   │  ├── audio.js                      (Web Audio API synth)
   │  └── storage.js                    (localStorage wrapper)
   ├── lib/
   │  └── three.min.js                  (Three.js library - lokal)
   ├── data/
   │  ├── questions.json                (75 soal editable)
   │  ├── board-config.json             (posisi ular, tanga, petak soal)
   │  └── tutorial.md                   (panduan edit lengkap)
   └── assets/
       └── icons/                        (emoji fallback jika perlu)
Spesifikasi 3D Dice (Three.js)
Fitur Visual
Style: Realistic dengan rounded corners, glossy material
Material: MeshPhysicalMaterial dengan clearcoat untuk efek glossy
Lighting:
AmbientLight (soft fill)
DirectionalLight (main shadow)
PointLight (rim light untuk depth)
Shadow: Soft shadow map di bawah dadu
Animasi:
Random rotation di 3 axis (x, y, z)
Easing: Cubic-bezier untuk natural feel
Duration: 1.5 detik roll + 0.3 detik settle
Bounce effect sat land
Interaksi
Click dadu atau tombol "ROLL" → trigger animasi
Sound: White noise (rolling) + Thud (land)
Hasil: Muncul setelah animasi complete
Spesifikasi LocalStorage
Data Structure
{
 "ularTangaSave": {
   "gameInProgress": boolean,
   "timestamp": number,
   "players": [
     {
       "name": string,
       "character": number,
       "score": number,
       "position": number,
       "powerups": array
     }
   ],
   "currentPlayer": number,
   "positions": array,
   "scores": array,
   "timeLeft": number,
   "duration": number,
   "questionsAnswered": number,
   "finishOrder": array
 }
Auto-save Trigger
Setiap turn selesai (setelah jawab soal atau gerak)
Fitur Resume
Popup "Lanjutkan Game?" sat load jika ada save
Tombol: "Lanjutkan" / "Game Baru"
File: data/questions.json
{
 "metadata": {
   "title": "Ular Tanga Edukasi",
   "description": "Game edukasi interaktif",
   "totalQuestions": 75,
   "categories": ["Matematika", "IPA", "Bahasa Indonesia", "Pengetahuan Umum"]
 },
 "questions": {
   "easy": [
     {
       "q": "Berapa hasil dari 5 + 3?",
       "opts": ["7", "8", "9", "10"],
       "ans": 1,
       "cat": "Matematika",
       "exp": "5 + 3 = 8"
     }
   ],
   "medium": [...],
   "hard": [...]
 }
File: data/board-config.json
{
 "boardSize": 100,
 "layout": "zigzag",
 "snakes": [
   {"from": 99, "to": 41, "label": "Ular Besar"},
   {"from": 89, "to": 53, "label": "Ular Medium"},
   {"from": 76, "to": 58, "label": "Ular Kecil"},
   {"from": 62, "to": 19, "label": "Ular Panjang"},
   {"from": 47, "to": 26, "label": "Ular"},
   {"from": 33, "to": 3, "label": "Ular"},
   {"from": 25, "to": 5, "label": "Ular"}
 ],
 "ladders": [
   {"from": 2, "to": 23, "label": "Tanga Emas"},
   {"from": 8, "to": 34, "label": "Tanga Panjang"},
   {"from": 20, "to": 77, "label": "Tanga Besar"},
   {"from": 32, "to": 68, "label": "Tanga"},
   {"from": 41, "to": 79, "label": "Tanga"},
   {"from": 50, "to": 91, "label": "Tanga"},
   {"from": 71, "to": 92, "label": "Tanga Kecil"}
 ],
 "questionTiles": [5, 12, 18, 24, 29, 35, 42, 48, 55, 61, 67, 74, 80, 87, 93],
 "powerupTiles": [7, 15, 28, 40, 52, 65, 78, 90],
 "finishTile": 100
}
File: data/tutorial.md (Isi Utama)
1. Cara Edit Soal
Buka data/questions.json
Temukan kategori: easy, medium, atau hard
Tambah/edit objek dalam array:
q: Pertanyan (string)
opts: Array 4 pilihan jawaban
ans: Index jawaban benar (0-3)
cat: Kategori mata pelajaran
exp: Penjelasan jawaban
Save file dan refresh browser
2. Cara Ganti Kategori Mata Pelajaran
Edit metadata.categories di questions.json
Ubah field cat di setiap soal sesuai kategori baru
3. Cara Edit Papan (Ular & Tanga)
Buka data/board-config.json
Edit snakes: Array objek dengan from (atas) dan to (bawah)
Edit ladders: Array objek dengan from (bawah) dan to (atas)
4. Cara Edit Tema Warna
Buka css/main.css
Cari :root CSS variables
Ubah nilai warna sesuai preferensi
Game Flow
[Home] → [Setup] → [Board] → [Roll 3D Dice] → [Gerak] → [Check Tile]
   → [Soal?] → [Modal] → [Jawab] → [Feedback] → [Save] → [Next Turn]
   → [Finish?] → [Winner]
Tech Stack
| Komponen | Teknologi | |-----------| | 3D Engine | Three.js (lokal download) | | Audio | Web Audio API | | Storage | localStorage API | | Styling | CSS3 (Grid, Flexbox, Custom Properties) | | Data | JSON |

Setuju dengan rencana ini? Jika ya, saya akan mulai implementasi.