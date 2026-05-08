// ===== QUESTIONS.JS - Question Manager using EduSoal =====
// Uses shared/edu-soal.js for loading, uploading, and managing questions

class QuestionManager {
  constructor() {
    this.loader = null;
    this.loaded = false;
  }

  // Load questions using EduSoal shared library
  async load() {
    // Use EduSoal if available (shared library)
    if (typeof EduSoal !== 'undefined') {
      this.loader = new EduSoal({ storageKey: 'ular-tangga-edukasi' });
      var embeddedData = (typeof SOAL_DATA !== 'undefined') ? SOAL_DATA : null;
      await this.loader.init(embeddedData, 'data/soal.json');
      this.loaded = this.loader.loaded;
      return this.loaded;
    }

    // Fallback: direct parse without EduSoal
    if (typeof SOAL_DATA !== 'undefined') {
      this._parseDirect(SOAL_DATA);
      return true;
    }

    this._useFallback();
    return false;
  }

  // Direct parse fallback (if EduSoal not loaded)
  _parseDirect(data) {
    this._questions = { easy: [], medium: [], hard: [] };
    var self = this;
    (data.categories || []).forEach(function(cat) {
      var level = cat.level || 'medium';
      var soal = (cat.soal || []).map(function(s) {
        return { q: s.q, opts: s.opts, ans: s.ans, exp: s.exp, cat: cat.name };
      });
      if (self._questions[level]) {
        self._questions[level] = self._questions[level].concat(soal);
      }
    });
    this.loaded = true;
    this._pool = this._shuffle([
      ...this._shuffle(this._questions.hard),
      ...this._shuffle(this._questions.medium),
      ...this._shuffle(this._questions.easy)
    ]);
  }

  _useFallback() {
    this._questions = {
      easy: [{ q: "1 + 1 = ?", opts: ["1","2","3","4"], ans: 1, cat: "Matematika", exp: "1+1=2" }],
      medium: [{ q: "KPK(4,6) = ?", opts: ["8","10","12","24"], ans: 2, cat: "Matematika", exp: "KPK=12" }],
      hard: [{ q: "3x+7=22, x=?", opts: ["3","4","5","6"], ans: 2, cat: "Matematika", exp: "x=5" }]
    };
    this.loaded = true;
    this._pool = this._shuffle([...this._questions.hard, ...this._questions.medium, ...this._questions.easy]);
  }

  // ===== PUBLIC API (delegates to EduSoal or fallback) =====
  getQuestion() {
    if (this.loader) return this.loader.getQuestion();
    if (!this._pool || this._pool.length === 0) {
      this._pool = this._shuffle([
        ...this._shuffle(this._questions.hard || []),
        ...this._shuffle(this._questions.medium || []),
        ...this._shuffle(this._questions.easy || [])
      ]);
    }
    return this._pool.pop();
  }

  getDifficulty(question) {
    if (this.loader) return this.loader.getDifficulty(question);
    if (this._questions.easy.includes(question)) return 'easy';
    if (this._questions.hard.includes(question)) return 'hard';
    return 'medium';
  }

  getPoints(d) {
    if (this.loader) return this.loader.getPoints(d);
    return d === 'easy' ? 10 : d === 'hard' ? 30 : 20;
  }

  getDifficultyLabel(d) {
    if (this.loader) return this.loader.getDifficultyLabel(d);
    return d === 'easy' ? 'Mudah' : d === 'hard' ? 'Sulit' : 'Sedang';
  }

  getDifficultyColor(d) {
    if (this.loader) return this.loader.getDifficultyColor(d);
    return d === 'easy' ? '#00b894' : d === 'hard' ? '#e74c3c' : '#f39c12';
  }

  getDifficultyStars(d) {
    if (this.loader) return this.loader.getDifficultyStars(d);
    return d === 'easy' ? '⭐' : d === 'hard' ? '⭐⭐⭐' : '⭐⭐';
  }

  shuffleOptions(question) {
    if (this.loader) return this.loader.shuffleOptions(question);
    var indices = [0,1,2,3];
    var shuffled = this._shuffle(indices);
    return {
      indices: shuffled,
      options: shuffled.map(function(i) { return question.opts[i]; }),
      correctIndex: shuffled.indexOf(question.ans)
    };
  }

  // Mount uploader UI
  mountUploader(container) {
    if (this.loader && this.loader.mountUploader) {
      this.loader.mountUploader(container);
    }
  }

  _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
}

// Global instance
const questionManager = new QuestionManager();
