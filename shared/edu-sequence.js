// ===== EDU-SEQUENCE.JS - Interactive Sequencing Component =====
// Tipe soal urutan langkah. User mengurutkan steps yang diacak.
// Mobile-friendly: tombol atas/bawah (bukan drag).
//
// Cara pakai:
//   var seq = new EduSequence(container, question, function(result) {
//     // result = { score, total, percent, correct, details, userOrder }
//   });

class EduSequence {
  constructor(container, question, onSubmit) {
    this.container = container;
    this.question = question;
    this.onSubmit = onSubmit;
    this.items = [];
    this.submitted = false;
    this._init();
  }

  _init() {
    // Shuffle steps
    var steps = this.question.steps.slice();
    this.items = this._shuffle(steps);
    this._render();
  }

  _shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    // Pastikan tidak sama persis dengan urutan benar
    var same = true;
    for (var k = 0; k < a.length; k++) {
      if (a[k] !== this.question.steps[k]) { same = false; break; }
    }
    if (same && a.length > 1) {
      var tmp = a[0]; a[0] = a[1]; a[1] = tmp;
    }
    return a;
  }

  _render() {
    var self = this;
    var html = '<div class="edu-seq">';

    // Question text
    html += '<div class="seq-question">' + this.question.q + '</div>';

    // Image if exists
    if (this.question._imageUrl) {
      html += '<div class="seq-image"><img src="' + this.question._imageUrl + '" alt=""></div>';
    }

    // Instruction
    html += '<div class="seq-instruction">Urutkan langkah-langkah berikut dengan benar:</div>';

    // Items list
    html += '<div class="seq-list" id="seq-list">';
    this.items.forEach(function(item, idx) {
      html += '<div class="seq-item" data-idx="' + idx + '">' +
        '<span class="seq-num">' + (idx + 1) + '</span>' +
        '<span class="seq-text">' + item + '</span>' +
        '<div class="seq-arrows">' +
          '<button class="seq-arrow seq-up" data-dir="up" data-idx="' + idx + '" ' + (idx === 0 ? 'disabled' : '') + '>\u25B2</button>' +
          '<button class="seq-arrow seq-down" data-dir="down" data-idx="' + idx + '" ' + (idx === self.items.length - 1 ? 'disabled' : '') + '>\u25BC</button>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';

    // Submit button
    html += '<button class="seq-submit" id="seq-submit">\u2705 Submit Urutan</button>';

    html += '</div>';
    this.container.innerHTML = html;

    // Bind events
    this.container.querySelectorAll('.seq-arrow').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        if (self.submitted) return;
        var idx = parseInt(this.getAttribute('data-idx'));
        var dir = this.getAttribute('data-dir');
        self._move(idx, dir);
      });
    });

    this.container.querySelector('#seq-submit').addEventListener('click', function() {
      if (self.submitted) return;
      self._submit();
    });
  }

  _move(idx, dir) {
    var newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= this.items.length) return;

    // Swap
    var tmp = this.items[idx];
    this.items[idx] = this.items[newIdx];
    this.items[newIdx] = tmp;

    this._render();
  }

  _submit() {
    this.submitted = true;
    var self = this;
    var correct = this.question.steps;
    var total = correct.length;
    var correctCount = 0;
    var details = [];

    for (var i = 0; i < total; i++) {
      var isCorrect = this.items[i] === correct[i];
      if (isCorrect) correctCount++;
      details.push({ step: correct[i], userStep: this.items[i], correct: isCorrect, index: i });
    }

    // Show result visually
    var listItems = this.container.querySelectorAll('.seq-item');
    listItems.forEach(function(el, i) {
      el.classList.add(details[i].correct ? 'seq-correct' : 'seq-wrong');
      // Show correct number
      var numEl = el.querySelector('.seq-num');
      if (!details[i].correct) {
        // Find correct position
        var correctIdx = correct.indexOf(self.items[i]);
        numEl.textContent = (correctIdx + 1);
        numEl.classList.add('seq-num-wrong');
      }
      // Disable arrows
      el.querySelectorAll('.seq-arrow').forEach(function(btn) { btn.disabled = true; });
    });

    // Disable submit
    var submitBtn = this.container.querySelector('#seq-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = correctCount === total ? '\u2705 Semua Benar!' : '\u{1F4CA} ' + correctCount + '/' + total + ' Benar';
    submitBtn.classList.add(correctCount === total ? 'seq-submit-correct' : 'seq-submit-wrong');

    // Show correct order
    var correctHTML = '<div class="seq-correct-order"><div class="seq-correct-title">\u{1F4CB} Urutan yang benar:</div>';
    correct.forEach(function(step, i) {
      correctHTML += '<div class="seq-correct-item"><span class="seq-correct-num">' + (i+1) + '</span>' + step + '</div>';
    });
    correctHTML += '</div>';
    this.container.querySelector('.edu-seq').insertAdjacentHTML('beforeend', correctHTML);

    // Callback
    var result = {
      score: correctCount,
      total: total,
      percent: Math.round((correctCount / total) * 100),
      correct: correctCount === total,
      details: details,
      userOrder: this.items.slice()
    };

    if (this.onSubmit) {
      setTimeout(function() { self.onSubmit(result); }, 1500);
    }
  }
}
