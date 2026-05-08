# Panduan Edit Soal - Ular Tangga Edukasi

## File Soal

```
data/soal.json
```

Buka file ini dengan text editor (Notepad, VS Code, dll). Semua soal ada di sini.

---

## Struktur File

```json
{
  "categories": [
    {
      "id": "nama_unik",
      "name": "Nama Kategori",
      "icon": "📐",
      "level": "easy / medium / hard",
      "soal": [
        {
          "q": "Pertanyaan?",
          "opts": ["A", "B", "C", "D"],
          "ans": 0,
          "exp": "Penjelasan"
        }
      ]
    }
  ]
}
```

## Penjelasan Field

| Field | Keterangan |
|-------|------------|
| `id` | ID unik kategori (huruf kecil, tanpa spasi) |
| `name` | Nama kategori yang ditampilkan |
| `icon` | Emoji untuk kategori |
| `level` | Tingkat: `easy` (10 poin), `medium` (20 poin), `hard` (30 poin) |
| `q` | Teks pertanyaan |
| `opts` | 4 pilihan jawaban |
| `ans` | Index jawaban benar: **0=A, 1=B, 2=C, 3=D** |
| `exp` | Penjelasan setelah menjawab |

---

## Cara Tambah Soal

1. Buka `data/soal.json`
2. Cari kategori yang sesuai
3. Tambah objek baru di array `soal`:

```json
{"q": "Soal baru?", "opts": ["A", "B", "C", "D"], "ans": 1, "exp": "Jawaban B karena..."}
```

4. Jangan lupa koma (`,`) setelah soal sebelumnya
5. Save → refresh browser

---

## Cara Tambah Kategori Baru

Tambah objek baru di array `categories`:

```json
{
  "id": "fisika_dasar",
  "name": "Fisika Dasar",
  "icon": "⚡",
  "level": "medium",
  "soal": [
    {"q": "Satuan gaya adalah?", "opts": ["Watt", "Newton", "Joule", "Pascal"], "ans": 1, "exp": "Gaya diukur dalam Newton (N)"}
  ]
}
```

---

## Cara Hapus Soal/Kategori

- Hapus soal: hapus baris `{"q": ..., "exp": "..."}` beserta koma sebelumnya
- Hapus kategori: hapus seluruh blok `{ "id": ..., "soal": [...] }` beserta koma

---

## Tips

- Tidak ada batas jumlah soal. Makin banyak makin bagus!
- Gunakan [jsonlint.com](https://jsonlint.com) untuk cek format JSON valid
- `ans` mulai dari **0** (bukan 1). A=0, B=1, C=2, D=3
- Backup file sebelum edit besar-besaran
- Setelah edit `soal.json`, jalankan ulang script build atau copy isi ke `js/data.js`

---

## Catatan Teknis

Karena game ini bisa dibuka langsung dari file (tanpa server), soal juga di-embed di `js/data.js`. 

**Jika pakai server (localhost/hosting):** cukup edit `data/soal.json`, game otomatis load dari situ.

**Jika buka langsung dari file:** setelah edit `soal.json`, jalankan:
```
node -e "const fs=require('fs'); const soal=fs.readFileSync('data/soal.json','utf8'); const bc=JSON.stringify({boardSize:100,layout:'zigzag',snakes:[{from:99,to:41,label:'Ular Besar'},{from:89,to:53,label:'Ular Medium'},{from:76,to:58,label:'Ular Kecil'},{from:62,to:19,label:'Ular Panjang'},{from:47,to:26,label:'Ular'},{from:33,to:3,label:'Ular'},{from:25,to:5,label:'Ular Pendek'}],ladders:[{from:2,to:23,label:'Tangga Emas'},{from:8,to:34,label:'Tangga Panjang'},{from:20,to:77,label:'Tangga Besar'},{from:32,to:68,label:'Tangga'},{from:41,to:79,label:'Tangga'},{from:50,to:91,label:'Tangga'},{from:71,to:92,label:'Tangga Kecil'}],questionTiles:[5,12,18,24,29,35,42,48,55,61,67,74,80,87,93],powerupTiles:[7,15,28,40,52,65,78,90],finishTile:100},null,2); fs.writeFileSync('js/data.js', '// DATA.JS - Auto-generated\nconst SOAL_DATA = '+soal+';\nconst BOARD_CONFIG = '+bc+';');"
```

Atau cukup copy-paste isi `soal.json` ke dalam `js/data.js` setelah `const SOAL_DATA = `.
