# 🎮 EduPortal — Game Edukasi untuk Kelas

**Platform game edukasi gratis untuk siswa SD, SMP, dan SMA/SMK.**  
Buka langsung di browser. Tanpa install. Tanpa internet.

---

## 🎯 Apa Ini?

EduPortal adalah kumpulan game edukasi interaktif yang bisa dipakai guru di kelas menggunakan proyektor. Siswa bermain sambil belajar — menjawab soal, mengumpulkan poin, dan bersaing secara tim.

**2 Game tersedia:**
- 🎲 **Ular Tangga Edukasi** — Board game klasik + soal di setiap petak
- 🏰 **Labirin Pengetahuan** — Game labirin + soal Bahasa Inggris

**188 soal** siap pakai, bisa ditambah sendiri.

---

## 🚀 Cara Pakai (3 Langkah)

### 1. Buka di Browser
```
Klik ganda file index.html → langsung jalan
```

### 2. Pilih Game & Tema
- Pilih jenjang: **SD** (warna-warni), **SMP** (modern), **SMA** (elegan)
- Klik game yang mau dimainkan

### 3. Main di Kelas
- Klik tombol **📺 Projector** (atau tekan **F11**) untuk mode layar besar
- Font otomatis membesar, warna high-contrast
- Siswa bisa main pakai keyboard (tekan `1` `2` `3` `4` untuk jawab)

---

## ⌨️ Tombol yang Perlu Diketahui

| Tombol | Fungsi |
|--------|--------|
| `1` `2` `3` `4` | Pilih jawaban A B C D |
| `Spasi` | Lempar dadu / Lanjut |
| `P` | Jeda game |
| `S` | Lihat skor |
| `F11` | Mode proyektor (layar besar) |

---

## 📝 Cara Tambah Soal Sendiri

Buka game → klik **📂 Upload Soal** → pilih file JSON.

Format soal:
```json
{
  "categories": [
    {
      "name": "Matematika",
      "icon": "🔢",
      "soal": [
        {
          "q": "Berapa hasil 5 + 3?",
          "opts": ["6", "7", "8", "9"],
          "ans": 2,
          "exp": "5 + 3 = 8"
        }
      ]
    }
  ]
}
```

**Keterangan:**
- `q` = pertanyaan
- `opts` = pilihan jawaban (4 pilihan)
- `ans` = nomor jawaban benar (mulai dari 0)
- `exp` = penjelasan (muncul setelah jawab)

---

## 🏆 Cara Main di Kelas

1. **Buka EduPortal** di laptop yang terhubung proyektor
2. **Aktifkan mode proyektor** (tekan F11)
3. **Pilih jenjang** sesuai kelas (SD/SMP/SMA)
4. **Pilih game** → klik **Main**
5. **Siswa maju** ke depan, tekan tombol untuk jawab
6. **Skor otomatis** terhitung, tim dengan poin terbanyak menang

---

## ❓ FAQ

**Tidak perlu internet?**  
✅ Ya, semua jalan offline. Cukup buka file.

**Bisa dipakai di HP?**  
Bisa, tapi lebih optimal di laptop + proyektor.

**Soal bisa diedit?**  
Bisa. Tinggal upload file JSON baru.

**Gratis?**  
✅ 100% gratis, open source (MIT License).

---

## 📁 Struktur File

```
EduPortal/
├── index.html          ← Buka ini untuk mulai
├── Ular Tanga Edukasi/ ← Game Ular Tangga
├── Labirin Bahasa Inggris/ ← Game Labirin
└── shared/             ← Komponen bersama
```

---

<div align="center">

**Dibuat untuk guru Indonesia** 🇮🇩

🎲 Belajar Seru, Main Asyik! 🎲

</div>
