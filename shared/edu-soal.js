// ===== EDU-SOAL.JS v2 - Shared Question Loader & Uploader =====
// Reusable library untuk semua game EduPortal
//
// Format soal v2:
// {
//   categories: [{
//     id, name, icon, level, sub_level?, tags?, target?,
//     soal: [{
//       q, opts?, ans?, exp, type?, steps?, image_url?, tags?
//     }]
//   }]
// }
//
// type: "choice" (default, pilihan ganda) | "sequence" (urutan langkah)

class EduSoal {
  constructor(options) {
    options = options || {};
    this.storageKey = options.storageKey || 'edu-soal';
    this.categories = [];
    this.questions = { easy: [], medium: [], hard: [] };
    this.allQuestions = []; // flat list semua soal (untuk filter)
    this.pool = [];
    this.loaded = false;
    this._onLoad = options.onLoad || null;
  }

  // ===== INIT =====
  async init(embeddedData, fetchUrl) {
    // 1. localStorage (uploaded)
    var uploaded = this._loadFromStorage();
    if (uploaded) {
      this._parse(uploaded);
      
      return true;
    }
    // 2. Embedded data
    if (embeddedData && embeddedData.categories) {
      this._parse(embeddedData);
      console.log('[EduSoal] Loaded from embedded data (' + this._total() + ' soal)');
      return true;
    }
    // 3. Fetch
    if (fetchUrl) {
      try {
        var res = await fetch(fetchUrl);
        if (res.ok) {
          this._parse(await res.json());
          console.log('[EduSoal] Loaded from fetch (' + this._total() + ' soal)');
          return true;
        }
      } catch (e) { /* ignore */ }
    }
    
    return false;
  }

  // ===== PARSE =====
  _parse(data) {
    this.categories = data.categories || [];
    this.questions = { easy: [], medium: [], hard: [] };
    this.allQuestions = [];

    var self = this;
    this.categories.forEach(function(cat) {
      var level = cat.level || 'medium';
      (cat.soal || []).forEach(function(s) {
        var q = {
          q: s.q,
          type: s.type || 'choice',
          exp: s.exp || '',
          cat: cat.name,
          _catId: cat.id,
          _level: level,
          _subLevel: cat.sub_level || s.sub_level || '',
          _target: cat.target || '',
          _tags: (cat.tags || []).concat(s.tags || []),
          _imageUrl: s.image_url || ''
        };
        // Choice type
        if (q.type === 'choice') {
          q.opts = s.opts;
          q.ans = s.ans;
        }
        // Sequence type
        if (q.type === 'sequence') {
          q.steps = s.steps || [];
        }

        self.allQuestions.push(q);
        if (self.questions[level]) {
          self.questions[level].push(q);
        } else {
          self.questions.medium.push(q);
        }
      });
    });

    this.loaded = true;
    this._initPool();
    if (this._onLoad) this._onLoad(this);
  }

  _total() {
    return this.allQuestions.length;
  }

  // ===== POOL =====
  _initPool() {
    this.pool = this._shuffle(this.allQuestions.slice());
  }

  getQuestion() {
    if (this.pool.length === 0) this._initPool();
    return this.pool.pop();
  }

  // ===== FILTER =====
  getQuestionsByTag(tag) {
    return this.allQuestions.filter(function(q) {
      return q._tags.indexOf(tag) >= 0;
    });
  }

  getQuestionsByTarget(target) {
    return this.allQuestions.filter(function(q) {
      return q._target.toLowerCase().indexOf(target.toLowerCase()) >= 0;
    });
  }

  getQuestionsByType(type) {
    return this.allQuestions.filter(function(q) { return q.type === type; });
  }

  getQuestionsBySubLevel(sub) {
    return this.allQuestions.filter(function(q) { return q._subLevel === sub; });
  }

  getAllTags() {
    var tags = {};
    this.allQuestions.forEach(function(q) {
      q._tags.forEach(function(t) { tags[t] = (tags[t] || 0) + 1; });
    });
    return tags;
  }

  // ===== DIFFICULTY =====
  getDifficulty(question) {
    if (question && question._level) return question._level;
    if (this.questions.easy.includes(question)) return 'easy';
    if (this.questions.hard.includes(question)) return 'hard';
    return 'medium';
  }

  getPoints(d) { return d === 'easy' ? 10 : d === 'hard' ? 30 : 20; }
  getDifficultyLabel(d) { return d === 'easy' ? 'Mudah' : d === 'hard' ? 'Sulit' : 'Sedang'; }
  getDifficultyColor(d) { return d === 'easy' ? '#00b894' : d === 'hard' ? '#e74c3c' : '#f39c12'; }
  getDifficultyStars(d) { return d === 'easy' ? '\u2B50' : d === 'hard' ? '\u2B50\u2B50\u2B50' : '\u2B50\u2B50'; }

  // ===== SHUFFLE =====
  _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  shuffleOptions(question) {
    if (question.type === 'sequence') return null; // sequence has no opts
    var indices = [0, 1, 2, 3];
    var shuffled = this._shuffle(indices);
    return {
      indices: shuffled,
      options: shuffled.map(function(i) { return question.opts[i]; }),
      correctIndex: shuffled.indexOf(question.ans)
    };
  }

  // ===== SEQUENCE SCORING =====
  // Compare user order vs correct order. Returns {score, total, correct, details}
  scoreSequence(question, userOrder) {
    if (question.type !== 'sequence' || !question.steps) return { score: 0, total: 0, correct: false, details: [] };
    var total = question.steps.length;
    var correctCount = 0;
    var details = [];
    for (var i = 0; i < total; i++) {
      var isCorrect = userOrder[i] === question.steps[i];
      if (isCorrect) correctCount++;
      details.push({ step: question.steps[i], userStep: userOrder[i], correct: isCorrect });
    }
    return {
      score: correctCount,
      total: total,
      percent: Math.round((correctCount / total) * 100),
      correct: correctCount === total,
      details: details
    };
  }

  // ===== LOCALSTORAGE =====
  _loadFromStorage() {
    try {
      var raw = localStorage.getItem(this.storageKey + '-soal');
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data.categories && data.categories.length > 0) return data;
    } catch (e) { /* ignore */ }
    return null;
  }

  _saveToStorage(data) {
    try {
      localStorage.setItem(this.storageKey + '-soal', JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  }

  clearUploaded() { localStorage.removeItem(this.storageKey + '-soal'); }
  hasUploaded() { return !!localStorage.getItem(this.storageKey + '-soal'); }

  // ===== UPLOAD =====
  uploadJSON(file, callback) {
    var self = this;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.categories || !Array.isArray(data.categories)) {
          callback({ success: false, error: 'Format salah! File harus punya array "categories".' });
          return;
        }
        var totalSoal = 0, errors = [];
        data.categories.forEach(function(cat, ci) {
          if (!cat.soal || !Array.isArray(cat.soal)) {
            errors.push('Kategori #' + (ci+1) + ' tidak punya array "soal"');
            return;
          }
          cat.soal.forEach(function(s, si) {
            var label = 'Soal #' + (si+1) + ' di "' + (cat.name||cat.id||('kategori '+(ci+1))) + '"';
            if (!s.q) errors.push(label + ': tidak punya pertanyaan (q)');
            var type = s.type || 'choice';
            if (type === 'choice') {
              if (!s.opts || s.opts.length !== 4) errors.push(label + ': harus punya 4 pilihan (opts)');
              if (typeof s.ans !== 'number' || s.ans < 0 || s.ans > 3) errors.push(label + ': ans harus 0-3');
            } else if (type === 'sequence') {
              if (!s.steps || !Array.isArray(s.steps) || s.steps.length < 2) errors.push(label + ': sequence harus punya minimal 2 steps');
            }
            totalSoal++;
          });
        });
        if (errors.length > 0) {
          callback({ success: false, error: errors.slice(0, 5).join('\n') });
          return;
        }
        self._saveToStorage(data);
        self._parse(data);
        callback({
          success: true, totalSoal: totalSoal,
          totalKategori: data.categories.length,
          message: 'Berhasil upload ' + totalSoal + ' soal dari ' + data.categories.length + ' kategori!'
        });
      } catch (err) {
        callback({ success: false, error: 'File JSON tidak valid: ' + err.message });
      }
    };
    reader.readAsText(file);
  }

  // ===== UPLOADER UI =====
  mountUploader(container) {
    if (!container) return;
    var self = this;
    var hasCustom = this.hasUploaded();
    var choiceCount = this.getQuestionsByType('choice').length;
    var seqCount = this.getQuestionsByType('sequence').length;
    var tags = this.getAllTags();
    var tagKeys = Object.keys(tags);

    var statsHTML = '<span class="esu-stat">\u{1F4DD} ' + this._total() + ' soal</span>' +
      '<span class="esu-stat">\u{1F4C1} ' + this.categories.length + ' kategori</span>';
    if (seqCount > 0) statsHTML += '<span class="esu-stat">\u{1F4CB} ' + seqCount + ' urutan</span>';
    if (hasCustom) statsHTML += '<span class="esu-stat esu-custom">\u{1F4E4} Custom</span>';
    else statsHTML += '<span class="esu-stat">\u{1F4E6} Default</span>';

    var tagsHTML = '';
    if (tagKeys.length > 0) {
      tagsHTML = '<div class="esu-tags">';
      tagKeys.slice(0, 12).forEach(function(t) {
        tagsHTML += '<span class="esu-tag">' + t + ' <small>(' + tags[t] + ')</small></span>';
      });
      if (tagKeys.length > 12) tagsHTML += '<span class="esu-tag">+' + (tagKeys.length - 12) + ' lainnya</span>';
      tagsHTML += '</div>';
    }

    container.innerHTML = '<div class="edu-soal-uploader">' +
      '<div class="esu-header"><span class="esu-icon">\u{1F4C2}</span><span class="esu-title">Kelola Soal</span></div>' +
      '<div class="esu-stats" id="esu-stats">' + statsHTML + '</div>' +
      tagsHTML +
      '<div class="esu-actions">' +
        '<label class="esu-btn esu-btn-upload" for="esu-file-input">\u{1F4E4} Upload soal.json</label>' +
        '<input type="file" id="esu-file-input" accept=".json" style="display:none">' +
        (hasCustom ? '<button class="esu-btn esu-btn-reset" id="esu-reset-btn">\u{1F504} Reset ke Default</button>' : '') +
        '<button class="esu-btn esu-btn-download" id="esu-download-btn">\u{1F4E5} Download Template</button>' +
      '</div>' +
      '<div class="esu-message" id="esu-message"></div>' +
      '<div class="esu-categories" id="esu-categories"></div>' +
    '</div>';

    this._renderCategories(container.querySelector('#esu-categories'));

    // File input
    var fileInput = container.querySelector('#esu-file-input');
    fileInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      self.uploadJSON(file, function(result) {
        var msgEl = container.querySelector('#esu-message');
        if (result.success) {
          msgEl.innerHTML = '<div class="esu-success">\u2705 ' + result.message + '</div>';
          setTimeout(function() { self.mountUploader(container); }, 1500);
        } else {
          msgEl.innerHTML = '<div class="esu-error">\u274C ' + result.error + '</div>';
        }
      });
      fileInput.value = '';
    });

    // Reset
    var resetBtn = container.querySelector('#esu-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', function() {
      if (confirm('Reset soal ke default? Soal custom akan dihapus.')) {
        self.clearUploaded();
        location.reload();
      }
    });

    // Download template
    var dlBtn = container.querySelector('#esu-download-btn');
    if (dlBtn) dlBtn.addEventListener('click', function() { self._downloadTemplate(); });
  }

  _renderCategories(el) {
    if (!el) return;
    var html = '';
    this.categories.forEach(function(cat) {
      var count = (cat.soal || []).length;
      var levelLabel = cat.level === 'easy' ? 'Mudah' : cat.level === 'hard' ? 'Sulit' : 'Sedang';
      var levelColor = cat.level === 'easy' ? '#00b894' : cat.level === 'hard' ? '#e74c3c' : '#f39c12';
      var subLabel = cat.sub_level ? ' <small style="opacity:0.7">(' + cat.sub_level + ')</small>' : '';
      var targetLabel = cat.target ? '<span class="esu-cat-target">' + cat.target + '</span>' : '';
      var hasSeq = (cat.soal || []).some(function(s) { return s.type === 'sequence'; });
      var typeIcon = hasSeq ? ' \u{1F4CB}' : '';

      html += '<div class="esu-cat">' +
        '<span class="esu-cat-icon">' + (cat.icon || '\u{1F4DD}') + '</span>' +
        '<span class="esu-cat-name">' + cat.name + subLabel + typeIcon + '</span>' +
        targetLabel +
        '<span class="esu-cat-count">' + count + '</span>' +
        '<span class="esu-cat-level" style="background:' + levelColor + '">' + levelLabel + '</span>' +
      '</div>';
    });
    el.innerHTML = html || '<div style="color:#888;text-align:center;padding:12px">Belum ada soal</div>';
  }

  _downloadTemplate() {
    var template = {
      config: {
        title: "Template Soal EduPortal v2",
        description: "Edit file ini, lalu upload di game.",
        format_choice: { q: "Pertanyaan", opts: ["A","B","C","D"], ans: 0, exp: "Penjelasan", type: "choice (default, bisa dihilangkan)" },
        format_sequence: { q: "Urutkan langkah:", type: "sequence", steps: ["Langkah 1","Langkah 2","Langkah 3"], exp: "Penjelasan" }
      },
      categories: [
        {
          id: "contoh_pilgan", name: "Contoh Pilihan Ganda", icon: "\u{1F4DD}", level: "easy",
          tags: ["contoh"], target: "Kelas 5",
          soal: [
            { q: "1 + 1 = ?", opts: ["1","2","3","4"], ans: 1, exp: "1 + 1 = 2" }
          ]
        },
        {
          id: "contoh_urutan", name: "Contoh Urutan Langkah", icon: "\u{1F4CB}", level: "medium",
          tags: ["contoh", "prakarya"], target: "Kelas 7", sub_level: "praktikum",
          soal: [
            {
              q: "Urutkan langkah membuat teh:",
              type: "sequence",
              steps: ["Didihkan air", "Masukkan teh ke gelas", "Tuang air panas", "Aduk dan tunggu 3 menit", "Tambahkan gula"],
              exp: "Air harus mendidih dulu sebelum diseduh agar teh larut sempurna."
            }
          ]
        },
        {
          id: "contoh_gambar", name: "Contoh dengan Gambar", icon: "\u{1F5BC}", level: "hard",
          tags: ["contoh"], target: "Kelas 9", sub_level: "hots",
          soal: [
            { q: "Perhatikan diagram berikut. Berapakah nilai x?", opts: ["3","4","5","6"], ans: 2, exp: "x = 5", image_url: "" }
          ]
        }
      ]
    };
    var blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = 'template-soal-v2.json'; a.click();
    URL.revokeObjectURL(url);
  }
}
