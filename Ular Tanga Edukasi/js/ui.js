// ===== UI.JS - Render Screens =====


class UI {
  // XSS-safe HTML escaping
  static _esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // XSS-safe HTML escaping
  static _esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  constructor() {
    this.app = null;
    this.toastContainer = null;
    this._dice3dInstance = null;
  }

  _ensureApp() {
    if (!this.app) this.app = document.getElementById('app');
    if (!this.toastContainer) this.toastContainer = document.getElementById('toast-container');
  }

  render() {
    this._ensureApp();
    if (game.state.screen !== 'board') this._destroyDice();
    switch (game.state.screen) {
      case 'home': this.renderHome(); break;
      case 'setup': this.renderSetup(); break;
      case 'character': this.renderCharacter(); break;
      case 'rules': this.renderRules(); break;
      case 'duration': this.renderDuration(); break;
      case 'board': this.renderBoard(); break;
      case 'question': this.renderQuestion(); break;
      case 'feedback': this.renderFeedback(); break;
      case 'scoreboard': this.renderScoreboard(); break;
      case 'winner': this.renderWinner(); break;
    }
  }

  _destroyDice() {
    if (this._dice3dInstance) {
      this._dice3dInstance.destroy();
      this._dice3dInstance = null;
      game.dice3d = null;
    }
  }

  renderHome() {
    this._ensureApp();
    this.app.innerHTML =
      '<div class="screen"><div class="screen-inner bounce-in">' +
      '<div style="font-size:5rem;margin-bottom:16px" class="float-anim">\u{1F3B2}</div>' +
      '<h1 class="font-display" style="font-size:2.8rem;color:#fff;text-shadow:0 4px 20px rgba(102,126,234,0.5);margin-bottom:8px">Ular Tangga Edukasi</h1>' +
      '<p style="color:#c3b8e8;font-size:1rem;margin-bottom:4px">Game Edukasi Matematika</p>' +
      '<p style="color:rgba(195,184,232,0.6);font-size:0.85rem;margin-bottom:24px">Kelas 5 SD - 7 SMP</p>' +
      '<div class="tag-row"><span class="tag">\u{1F3B2} Dadu 3D</span><span class="tag">\u{1F465} 1-4 Pemain</span><span class="tag">\u{1F4DD} 110 Soal</span><span class="tag">\u{1F4C2} 10 Kategori</span></div>' +
      '<div style="margin-top:28px"><button class="btn btn-primary" style="font-size:1.15rem;padding:16px 40px" onclick="audio.init();game.state.screen=\'setup\';ui.render()">\u{1F680} Mulai Petualangan</button></div>' +
      '<div style="margin-top:16px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn-ghost" onclick="ui.showSoalManager()">\u{1F4C2} Kelola Soal</button>' +
      '<button class="btn-ghost" onclick="audio.init();audio.toggle();this.textContent=audio.enabled?\'\u{1F50A} ON\':\'\u{1F507} OFF\'">\u{1F50A} ON</button>' +
      '<a href="../index.html" class="btn-ghost">\u{1F3E0} Portal</a></div>' +
            '<div style="margin-top:16px;display:flex;gap:16px;justify-content:center;font-size:1.8rem">' +
      '<span class="float-anim">\u{1F40D}</span><span class="float-anim" style="animation-delay:0.4s">\u{1FA9C}</span>' +
      '<span class="float-anim" style="animation-delay:0.8s">\u2B50</span><span class="float-anim" style="animation-delay:1.2s">\u{1F3C6}</span>' +
      '</div></div></div>';


  }

  showSoalManager() {
    var overlay = document.createElement('div');
    overlay.id = 'soal-manager-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
    
    var inner = document.createElement('div');
    inner.style.cssText = 'width:100%;max-width:500px;position:relative';
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715';
    closeBtn.style.cssText = 'position:absolute;top:-10px;right:-10px;background:#e74c3c;color:#fff;border:none;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;z-index:10';
    closeBtn.onclick = function() { overlay.remove(); };
    
    var container = document.createElement('div');
    container.id = 'soal-uploader-container';
    
    inner.appendChild(closeBtn);
    inner.appendChild(container);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    
    // Mount uploader
    questionManager.mountUploader(container);
  }

  renderSetup() {
    var numBtns = '';
    for (var n = 1; n <= 4; n++) {
      numBtns += '<button class="num-btn' + (game.state.numPlayers === n ? ' active' : '') + '" onclick="game.state.numPlayers=' + n + ';ui.render()">' + n + '</button>';
    }
    var boxes = '';
    for (var i = 0; i < game.state.numPlayers; i++) {
      boxes += '<div class="team-box" style="background:' + game.COLORS_LIGHT[i] + ';border-color:' + game.COLORS[i] + '50">' +
        '<div style="font-size:2rem;margin-bottom:8px">' + game.CHARS[game.state.playerChars[i]] + '</div>' +
        '<input type="text" id="player-' + i + '" placeholder="Nama Pemain ' + (i+1) + '" value="' + (game.state.players[i] || '') + '" onchange="game.state.players[' + i + ']=this.value"></div>';
    }
    this.app.innerHTML = '<div class="screen"><div class="card slide-up">' +
      '<h2 class="font-display" style="font-size:1.8rem;color:#5b21b6;text-align:center;margin-bottom:20px">\u{1F465} Setup Pemain</h2>' +
      '<p style="text-align:center;font-size:0.8rem;color:#999;font-weight:700;margin-bottom:8px">Jumlah Pemain</p>' +
      '<div class="num-btns">' + numBtns + '</div><div class="team-grid">' + boxes + '</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px">' +
      '<button class="btn-outline" onclick="game.state.screen=\'home\';ui.render()">\u2190 Kembali</button>' +
      '<button class="btn btn-primary btn-sm" onclick="game.state.screen=\'character\';ui.render()">Pilih Karakter \u2192</button>' +
      '</div></div></div>';
  }

  renderCharacter() {
    var sections = '';
    for (var i = 0; i < game.state.numPlayers; i++) {
      var btns = '';
      for (var ci = 0; ci < game.CHARS.length; ci++) {
        btns += '<button class="char-btn' + (game.state.playerChars[i] === ci ? ' active' : '') + '" onclick="game.state.playerChars[' + i + ']=' + ci + ';ui.render()">' + game.CHARS[ci] + '</button>';
      }
      sections += '<div style="border-radius:14px;padding:14px;border:2px solid ' + game.COLORS[i] + '40;background:' + game.COLORS_LIGHT[i] + ';margin-bottom:10px">' +
        '<p style="font-weight:700;color:#555;font-size:0.85rem;margin-bottom:8px">' + (game.state.players[i] || 'Pemain ' + (i+1)) + '</p>' +
        '<div class="char-grid">' + btns + '</div></div>';
    }
    this.app.innerHTML = '<div class="screen"><div class="card slide-up" style="max-height:85vh;overflow-y:auto">' +
      '<h2 class="font-display" style="font-size:1.8rem;color:#5b21b6;text-align:center;margin-bottom:16px">\u{1F981} Pilih Karakter</h2>' + sections +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px">' +
      '<button class="btn-outline" onclick="game.state.screen=\'setup\';ui.render()">\u2190 Kembali</button>' +
      '<button class="btn btn-primary btn-sm" onclick="game._savePlayers();game.state.screen=\'rules\';ui.render()">Lanjut \u2192</button>' +
      '</div></div></div>';
  }

  renderRules() {
    var rules = [
      {i:'\u{1F3B2}',t:'Lempar Dadu',d:'Klik dadu 3D atau tombol ROLL'},
      {i:'\u{1F40D}',t:'Hati-hati Ular',d:'Turun ke petak bawah, -5 poin'},
      {i:'\u{1FA9C}',t:'Naik Tangga',d:'Naik ke petak atas, +5 poin bonus'},
      {i:'\u2753',t:'Jawab Soal',d:'Muncul otomatis di petak khusus'},
      {i:'\u2705',t:'Benar = Poin',d:'+10/+20/+30. Combo = bonus!'},
      {i:'\u274C',t:'Salah/Timeout',d:'Mundur 1-2 petak, combo reset'},
      {i:'\u26A1',t:'Power-ups',d:'2x Poin, Skip, Shield, Hint'},
      {i:'\u{1F3C6}',t:'Finish = +50',d:'Skor tertinggi = MENANG!'}
    ];
    var items = '';
    rules.forEach(function(r) {
      items += '<div class="rule-item"><span class="ri-icon">' + r.i + '</span><div><div class="ri-title">' + r.t + '</div><div class="ri-desc">' + r.d + '</div></div></div>';
    });
    this.app.innerHTML = '<div class="screen"><div class="card slide-up" style="max-height:85vh;overflow-y:auto">' +
      '<h2 class="font-display" style="font-size:1.6rem;color:#5b21b6;text-align:center;margin-bottom:16px">\u{1F4DC} Cara Bermain</h2>' + items +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px">' +
      '<button class="btn-outline" onclick="game.state.screen=\'character\';ui.render()">\u2190 Kembali</button>' +
      '<button class="btn btn-primary btn-sm" onclick="game.state.screen=\'duration\';ui.render()">Pilih Durasi \u2192</button>' +
      '</div></div></div>';
  }

  renderDuration() {
    var opts = [{d:10,l:'Cepat',e:'\u26A1'},{d:15,l:'Normal',e:'\u{1F44D}'},{d:25,l:'Panjang',e:'\u{1F4DA}'},{d:40,l:'Marathon',e:'\u{1F9E0}'}];
    var btns = '';
    opts.forEach(function(o) {
      btns += '<button class="dur-btn' + (game.state.duration === o.d ? ' active' : '') + '" onclick="game.state.duration=' + o.d + ';ui.render()"><span>' + o.e + ' ' + o.l + '</span><span style="font-size:0.85rem;opacity:0.7">' + o.d + ' menit</span></button>';
    });
    this.app.innerHTML = '<div class="screen"><div class="card bounce-in" style="max-width:400px">' +
      '<h2 class="font-display" style="font-size:1.8rem;color:#5b21b6;text-align:center;margin-bottom:20px">\u23F1\uFE0F Durasi</h2>' + btns +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:16px">' +
      '<button class="btn-outline" onclick="game.state.screen=\'rules\';ui.render()">\u2190 Kembali</button>' +
      '<button class="btn btn-primary btn-sm" onclick="game.startGame();ui.render()">\u{1F3AE} Mulai!</button>' +
      '</div></div></div>';
  }
  // ===== BOARD =====
  renderBoard() {
    var s = game.state;
    var pi = s.currentPlayer;
    var timeStr = game.getFormattedTime();
    var timeClass = s.timeLeft <= 60 ? 'timer-display danger' : 'timer-display';

    var playerTabs = '';
    for (var i = 0; i < s.numPlayers; i++) {
      var isFinished = s.finishOrder.indexOf(i) >= 0;
      playerTabs += '<div class="player-tab' + (i === pi ? ' active' : '') + '" style="background:' + game.COLORS[i] + (i === pi ? '' : '80') + '">' +
        game.CHARS[s.playerChars[i]] + ' ' + s.players[i] +
        '<span class="player-score">' + s.scores[i] + (isFinished ? ' \u2713' : '') + '</span></div>';
    }

    var puSlots = '';
    if (s.powerups[pi] && s.powerups[pi].length > 0) {
      s.powerups[pi].forEach(function(pu, idx) {
        puSlots += '<div class="pu-slot" title="' + pu.name + '" onclick="game.activatePowerup(' + pi + ',' + idx + ')">' + pu.icon + '</div>';
      });
    } else {
      puSlots = '<span class="pu-empty">kosong</span>';
    }

    var comboBadge = s.combos[pi] >= 2 ? '<span class="streak-glow" style="background:#ff9800;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:50px;margin-left:6px">\u{1F525}x' + s.combos[pi] + '</span>' : '';

    // Helper function to get cell position in grid
    function getCellGridPos(cellNum) {
      var row = Math.floor((cellNum - 1) / 10);
      var col = (cellNum - 1) % 10;
      var displayRow = 9 - row; // Flip for display (row 0 at bottom)
      var leftToRight = (row % 2 === 0);
      var displayCol = leftToRight ? col : (9 - col);
      return { row: displayRow, col: displayCol };
    }

    // Build snake and ladder visuals
    var snakesHTML = '';
    var laddersHTML = '';
    
    // Snakes
    BOARD_CONFIG.snakes.forEach(function(snake) {
      var fromPos = getCellGridPos(snake.from);
      var toPos = getCellGridPos(snake.to);
      var top = (fromPos.row * 10 + 5) + '%';
      var left = (fromPos.col * 10 + 5) + '%';
      snakesHTML += '<div class="snake-visual" style="top:' + top + ';left:' + left + '">\u{1F40D}</div>';
      snakesHTML += '<div class="snake-label" style="top:' + top + ';left:' + left + ';transform:translate(-50%, -150%)">' + snake.from + ' \u2192 ' + snake.to + '</div>';
    });
    
    // Ladders
    BOARD_CONFIG.ladders.forEach(function(ladder) {
      var fromPos = getCellGridPos(ladder.from);
      var toPos = getCellGridPos(ladder.to);
      var top = (fromPos.row * 10 + 5) + '%';
      var left = (fromPos.col * 10 + 5) + '%';
      laddersHTML += '<div class="ladder-visual" style="top:' + top + ';left:' + left + '">\u{1FA9C}</div>';
      laddersHTML += '<div class="ladder-label" style="top:' + top + ';left:' + left + ';transform:translate(-50%, -150%)">' + ladder.from + ' \u2192 ' + ladder.to + '</div>';
    });

    // Board cells - zigzag layout (row 0 = bottom, row 9 = top)
    var cells = '';
    for (var row = 9; row >= 0; row--) {
      var leftToRight = (row % 2 === 0);
      for (var col = 0; col < 10; col++) {
        var actualCol = leftToRight ? col : (9 - col);
        var cellNum = row * 10 + actualCol + 1;
        var cellType = game.getCellType(cellNum);
        var cellClass = 'board-cell cell-' + cellType;

        var playersHTML = '';
        var playersHere = [];
        for (var p = 0; p < s.numPlayers; p++) {
          if (s.positions[p] === cellNum) playersHere.push(p);
        }
        if (playersHere.length > 0) {
          playersHTML = '<div class="pieces-container">';
          playersHere.forEach(function(pp) {
            playersHTML += '<span class="player-piece" data-player="' + pp + '" style="filter:drop-shadow(0 2px 4px ' + game.COLORS[pp] + ')">' + game.CHARS[s.playerChars[pp]] + '</span>';
          });
          playersHTML += '</div>';
        }
        cells += '<div class="' + cellClass + '" data-pos="' + cellNum + '"><span class="cell-number">' + cellNum + '</span>' + playersHTML + '</div>';
      }
    }

    var turnChar = game.CHARS[s.playerChars[pi]];
    var turnName = s.players[pi];
    var lastRoll = s.lastDiceRoll || '-';

    this.app.innerHTML = '<div class="board-screen">' +
      '<div class="board-topbar">' +
        '<div style="display:flex;align-items:center;gap:6px"><span style="color:#fff;font-size:1rem">\u23F1\uFE0F</span><span class="' + timeClass + '" id="timer-display">' + timeStr + '</span></div>' +
        '<div class="top-actions">' +
          '<button onclick="audio.init();audio.toggle();this.textContent=audio.enabled?\'\u{1F50A}\':\'\u{1F507}\'" title="Suara">' + (audio.enabled ? '\u{1F50A}' : '\u{1F507}') + '</button>' +
          '<button onclick="game.togglePause();ui.renderPause()" title="Pause">\u23F8\uFE0F</button>' +
          '<button onclick="game.state.screen=\'scoreboard\';ui.render()" title="Skor">\u{1F4CA}</button>' +
        '</div></div>' +
      '<div class="player-bar">' + playerTabs + '</div>' +
      '<div class="powerup-bar"><span class="pu-label">POWER-UPS:</span>' + puSlots + comboBadge + '</div>' +
      '<div class="board-area"><div class="board-wrapper">' + snakesHTML + laddersHTML + '<div class="board-grid" id="board-grid">' + cells + '</div></div></div>' +
      '<div class="board-bottom">' +
        '<div class="turn-info"><span class="turn-char">' + turnChar + '</span><span>' + UI._esc(turnName) + '</span></div>' +
        '<button class="roll-main-btn" id="roll-btn" onclick="ui.showDiceOverlay()"' + (s.isMoving ? ' disabled' : '') + '>\u{1F3B2} LEMPAR DADU</button>' +
        '<div class="last-roll" id="last-roll">' + lastRoll + '</div>' +
      '</div></div>';
  }

  updateBoardPieces() {
    var s = game.state;
    var grid = document.getElementById('board-grid');
    if (!grid) return;

    grid.querySelectorAll('.pieces-container').forEach(function(el) { el.remove(); });

    grid.querySelectorAll('.board-cell').forEach(function(cell) {
      var pos = parseInt(cell.getAttribute('data-pos'));
      var playersHere = [];
      for (var p = 0; p < s.numPlayers; p++) {
        if (s.positions[p] === pos) playersHere.push(p);
      }
      if (playersHere.length > 0) {
        var container = document.createElement('div');
        container.className = 'pieces-container';
        playersHere.forEach(function(pp) {
          var piece = document.createElement('span');
          piece.className = 'player-piece';
          piece.style.filter = 'drop-shadow(0 2px 4px ' + game.COLORS[pp] + ')';
          piece.textContent = game.CHARS[s.playerChars[pp]];
          container.appendChild(piece);
        });
        cell.appendChild(container);
      }
    });

    var lastRollEl = document.getElementById('last-roll');
    if (lastRollEl) lastRollEl.textContent = s.lastDiceRoll || '-';
  }

  // ===== DICE OVERLAY =====
  showDiceOverlay() {
    if (game.state.isMoving) return;
    var s = game.state;
    var pi = s.currentPlayer;
    var turnChar = game.CHARS[s.playerChars[pi]];
    var turnName = s.players[pi];

    var rollBtn = document.getElementById('roll-btn');
    if (rollBtn) rollBtn.disabled = true;

    var overlay = document.createElement('div');
    overlay.id = 'dice-overlay';
    overlay.className = 'dice-overlay';
    // NO BOX - dice container is fullscreen without borders
    overlay.innerHTML =
      '<div class="dice-overlay-inner">' +
      '<div class="dice-overlay-title"><span class="turn-emoji">' + turnChar + '</span> Giliran ' + UI._esc(turnName) + '</div>' +
      '<div class="dice-3d-container" id="dice-3d-container"></div>' +
      '<div class="dice-result-big" id="dice-result-big"></div>' +
      '<button class="dice-overlay-roll-btn" id="dice-overlay-roll-btn" onclick="ui.rollDiceFromOverlay()">\u{1F3B2} PUTAR DADU</button>' +
      '<p class="dice-overlay-hint">atau klik dadu di atas</p></div>';

    document.body.appendChild(overlay);

    var self = this;
    setTimeout(function() {
      var container = document.getElementById('dice-3d-container');
      if (container) {
        self._destroyDice();
        self._dice3dInstance = new Dice3D(container);
        game.dice3d = self._dice3dInstance;
        container.addEventListener('click', function() { self.rollDiceFromOverlay(); });
      }
    }, 100);
  }

  rollDiceFromOverlay() {
    if (game.state.isMoving) return;
    var rollBtn = document.getElementById('dice-overlay-roll-btn');
    if (rollBtn) rollBtn.disabled = true;
    var container = document.getElementById('dice-3d-container');
    if (container) container.classList.add('rolling');

    var self = this;
    game.state.isMoving = true;

    if (game.dice3d) {
      game.dice3d.roll(function(result) {
        game.state.diceResult = result;
        game.state.lastDiceRoll = result;
        var resultEl = document.getElementById('dice-result-big');
        if (resultEl) { resultEl.textContent = result; resultEl.classList.add('show'); }
        if (container) container.classList.remove('rolling');
        setTimeout(function() {
          self._closeDiceOverlay();
          self._startMovement(result);
        }, 1200);
      });
    } else {
      var result = Math.floor(Math.random() * 6) + 1;
      game.state.diceResult = result;
      game.state.lastDiceRoll = result;
      audio.play('roll');
      setTimeout(function() {
        audio.play('land');
        var resultEl = document.getElementById('dice-result-big');
        if (resultEl) { resultEl.textContent = result; resultEl.classList.add('show'); }
        setTimeout(function() {
          self._closeDiceOverlay();
          self._startMovement(result);
        }, 1200);
      }, 2000);
    }
  }

  _closeDiceOverlay() {
    this._destroyDice();
    var overlay = document.getElementById('dice-overlay');
    if (overlay) overlay.remove();
  }

  _startMovement(steps) {
    var self = this;
    game._movePlayer(steps, function(event) {
      if (event === 'step') { self.updateBoardPieces(); }
      else if (event === 'question' || event === 'feedback' || event === 'winner') { self.render(); }
      else if (event === 'endTurn') { self.renderBoard(); }
    });
  }
  // ===== QUESTION =====
  renderQuestion() {
    var q = game.state.currentQuestion;
    if (!q) return;

    // Route to sequence renderer if type is sequence
    if (q.type === 'sequence') {
      this._renderSequenceQuestion(q);
      return;
    }

    var difficulty = questionManager.getDifficulty(q);
    var level = questionManager.getDifficultyLabel(difficulty);
    var color = questionManager.getDifficultyColor(difficulty);
    var stars = questionManager.getDifficultyStars(difficulty);
    var pi = game.state.currentPlayer;

    if (!game.state.shuffledOpts) game.state.shuffledOpts = questionManager.shuffleOptions(q);

    var self = this;
    if (!game.state.questionTimerStarted) {
      game.startQuestionTimer(function(event) {
        if (event === 'tick') {
          var timerEl = document.getElementById('q-timer');
          if (timerEl) {
            timerEl.textContent = game.state.questionTimeLeft + 's';
            timerEl.className = game.state.questionTimeLeft <= 10 ? 'q-timer danger' : 'q-timer';
          }
        } else if (event === 'feedback') { self.render(); }
      });
    }

    var hiddenIndices = [];
    if (game.state.activePowerup && game.state.activePowerup.id === 'hint') {
      var wrong = [0,1,2,3].filter(function(idx) { return idx !== q.ans; });
      for (var x = wrong.length - 1; x > 0; x--) { var j = Math.floor(Math.random()*(x+1)); var t = wrong[x]; wrong[x] = wrong[j]; wrong[j] = t; }
      hiddenIndices = wrong.slice(0, 2);
      game.state.activePowerup = null;
    }

    var opts = '', letters = 'ABCD';
    game.state.shuffledOpts.indices.forEach(function(oi, di) {
      var isHidden = hiddenIndices.indexOf(oi) >= 0;
      opts += '<button class="opt-btn' + (isHidden ? ' disabled' : '') + '" onclick="ui.answerQuestion(' + oi + ')"' + (isHidden ? ' disabled' : '') + '><span class="opt-letter">' + letters[di] + '</span><span>' + q.opts[oi] + '</span></button>';
    });

    var actions = '';
    if (game.state.powerups[pi].some(function(p){return p.id==='skip';})) actions += '<button class="q-act-skip" onclick="ui.useSkip()">\u23ED\uFE0F Skip</button>';
    if (hiddenIndices.length===0 && game.state.powerups[pi].some(function(p){return p.id==='hint';})) actions += '<button class="q-act-hint" onclick="ui.useHint()">\u{1F4A1} Hint</button>';
    actions += '<button class="q-act-surr" onclick="ui.surrender()">\u{1F62D} Nyerah</button>';

    var comboBadge = game.state.combos[pi] >= 2 ? '<span class="qt-combo">\u{1F525}x' + game.state.combos[pi] + '</span>' : '';

    this.app.innerHTML = '<div class="screen"><div class="q-card slide-up">' +
      '<div class="q-header"><div class="q-badges"><span class="q-badge" style="background:' + color + '">' + stars + ' ' + level + '</span><span class="q-badge" style="background:#6c5ce7">' + q.cat + '</span></div>' +
      '<div class="q-timer' + (game.state.questionTimeLeft<=10?' danger':'') + '" id="q-timer">' + game.state.questionTimeLeft + 's</div></div>' +
      '<div class="q-team"><span class="qt-char">' + game.CHARS[game.state.playerChars[pi]] + '</span><span class="qt-name">' + UI._esc(game.state.players[pi]) + '</span>' + comboBadge + '</div>' +
      '<div class="q-text">' + q.q + '</div>' +
      '<div class="q-opts">' + opts + '</div>' +
      '<div class="q-actions">' + actions + '</div></div></div>';
  }

  // ===== SEQUENCE QUESTION =====
  _renderSequenceQuestion(q) {
    this._ensureApp();
    var self = this;
    var pi = game.state.currentPlayer;
    var difficulty = questionManager.getDifficulty(q);
    var level = questionManager.getDifficultyLabel(difficulty);
    var color = questionManager.getDifficultyColor(difficulty);
    var stars = questionManager.getDifficultyStars(difficulty);
    var turnChar = game.CHARS[game.state.playerChars[pi]];
    var turnName = game.state.players[pi];

    this.app.innerHTML = '<div class="screen"><div class="q-card slide-up" style="max-width:520px">' +
      '<div class="q-header"><div class="q-badges"><span class="q-badge" style="background:' + color + '">' + stars + ' ' + level + '</span><span class="q-badge" style="background:#6c5ce7">' + (q.cat || 'Urutan') + '</span><span class="q-badge" style="background:#00cec9">\u{1F4CB} Urutan</span></div></div>' +
      '<div class="q-team"><span class="qt-char">' + turnChar + '</span><span class="qt-name">' + UI._esc(turnName) + '</span></div>' +
      '<div id="seq-container"></div>' +
      '<div style="margin-top:12px;text-align:center"><button class="q-act-surr" onclick="ui.surrenderSequence()">\u{1F62D} Nyerah</button></div>' +
      '</div></div>';

    // Mount sequence component
    var container = document.getElementById('seq-container');
    if (container && typeof EduSequence !== 'undefined') {
      new EduSequence(container, q, function(result) {
        self._handleSequenceResult(result, q);
      });
    }
  }

  _handleSequenceResult(result, q) {
    var pi = game.state.currentPlayer;
    var difficulty = questionManager.getDifficulty(q);
    var basePoints = questionManager.getPoints(difficulty);

    game._stopQuestionTimer();

    if (result.correct) {
      // 100% benar
      game.state.combos[pi]++;
      if (game.state.combos[pi] > game.state.maxCombos[pi]) game.state.maxCombos[pi] = game.state.combos[pi];
      var comboMult = game.state.combos[pi] >= 5 ? 3 : game.state.combos[pi] >= 3 ? 2 : 1;
      var totalPoints = basePoints * comboMult;
      game.state.scores[pi] += totalPoints;
      game.state.correctAnswers[pi]++;
      audio.play('correct');

      game.state.feedbackData = { correct: true, points: totalPoints, combo: game.state.combos[pi], q: q, difficulty: difficulty };
    } else {
      // Partial scoring: jika >= 70% benar, tetap di posisi tapi poin lebih kecil
      var partialPoints = Math.round(basePoints * result.percent / 100);
      if (result.percent >= 70) {
        game.state.scores[pi] += partialPoints;
        game.state.correctAnswers[pi]++;
        audio.play('correct');
        game.state.feedbackData = { correct: true, points: partialPoints, combo: 0, q: q, difficulty: difficulty, partial: true, percent: result.percent };
      } else {
        // Gagal → mundur ke posisi awal
        game.state.combos[pi] = 0;
        game.state.wrongAnswers[pi]++;
        game.state.positions[pi] = game.state.preRollPosition || 0;
        audio.play('wrong');
        game.state.feedbackData = { correct: false, points: 0, combo: 0, q: q, difficulty: difficulty, percent: result.percent };
      }
    }

    game.state.questionsAnswered++;
    game.state.shuffledOpts = null;
    game.state.screen = 'feedback';

    var self = this;
    setTimeout(function() { self.render(); }, 500);
  }

  surrenderSequence() {
    var self = this;
    game.surrenderQuestion(function(e) { if (e === 'feedback') self.render(); });
  }

  answerQuestion(index) { var self = this; game.answerQuestion(index, function(e) { if(e==='feedback') self.render(); }); }
  useSkip() { var self = this; game.useSkip(function(e) { if(e==='endTurn') self.renderBoard(); }); }
  useHint() { var self = this; game.useHint(function(e) { if(e==='hint') self.render(); }); }
  surrender() { var self = this; game.surrenderQuestion(function(e) { if(e==='feedback') self.render(); }); }

  // ===== FEEDBACK =====
  renderFeedback() {
    var d = game.state.feedbackData, q = d.q;
    var icon, title, subtitle, color;
    var backTo = (game.state.preRollPosition || 0);

    if (d.correct && d.partial) {
      icon = '\u{1F44D}'; title = 'Hampir Benar!'; subtitle = '+' + d.points + ' poin (' + d.percent + '% benar)'; color = '#f39c12';
    } else if (d.correct) {
      icon = '\u{1F389}'; title = 'Benar!'; subtitle = '+' + d.points + ' poin' + (d.combo >= 3 ? ' (Combo x' + d.combo + '!)' : ''); color = '#2e7d32';
    } else if (d.timeout) {
      icon = '\u23F0'; title = 'Waktu Habis!'; subtitle = 'Mundur ke petak ' + backTo; color = '#e65100';
    } else if (d.surrender) {
      icon = '\u{1F62D}'; title = 'Nyerah!'; subtitle = 'Mundur ke petak ' + backTo; color = '#c62828';
    } else if (d.shielded) {
      icon = '\u{1F6E1}\uFE0F'; title = 'Salah, tapi Shield!'; subtitle = 'Tidak mundur'; color = '#1565c0';
    } else if (d.percent !== undefined) {
      icon = '\u{1F605}'; title = 'Kurang Tepat! (' + d.percent + '%)'; subtitle = 'Mundur ke petak ' + backTo; color = '#c62828';
    } else {
      icon = '\u{1F605}'; title = 'Salah!'; subtitle = 'Mundur ke petak ' + backTo; color = '#c62828';
    }

    // Answer section - different for sequence vs choice
    var answerHTML = '';
    if (q.type === 'sequence' && q.steps) {
      answerHTML = '<div class="fb-answer"><p class="fba-q"><strong>Soal:</strong> ' + q.q + '</p>' +
        '<p class="fba-a">\u{1F4CB} Urutan benar:</p><ol style="text-align:left;font-size:0.85rem;color:#555;margin:8px 0;padding-left:20px">';
      q.steps.forEach(function(step) { answerHTML += '<li>' + step + '</li>'; });
      answerHTML += '</ol></div>';
    } else if (q.opts) {
      answerHTML = '<div class="fb-answer"><p class="fba-q"><strong>Soal:</strong> ' + q.q + '</p><p class="fba-a">\u2705 Jawaban: ' + q.opts[q.ans] + '</p></div>';
    }

    this.app.innerHTML = '<div class="screen"><div class="card bounce-in" style="max-width:480px;text-align:center">' +
      '<div class="fb-icon">' + icon + '</div>' +
      '<h2 class="font-display fb-title" style="color:' + color + '">' + title + '</h2>' +
      '<p class="fb-sub">' + subtitle + '</p>' +
      '<div class="fb-explain"><p class="fb-el">\u{1F4DA} Penjelasan:</p><p class="fb-et">' + q.exp + '</p></div>' +
      answerHTML +
      '<button class="btn btn-primary btn-block" onclick="game.continueFeedback(function(){ui.render()})">Lanjut \u2192</button>' +
      '</div></div>';
  }

  // ===== SCOREBOARD =====
  renderScoreboard() {
    var sorted = game.getRankings();
    var rows = '';
    sorted.forEach(function(p, rank) {
      rows += '<div class="sb-row" style="background:' + game.COLORS_LIGHT[p.idx] + ';border-left:4px solid ' + game.COLORS[p.idx] + '">' +
        '<div class="sb-left"><span class="sb-rank">#' + (rank+1) + '</span><span style="font-size:1.5rem">' + game.CHARS[game.state.playerChars[p.idx]] + '</span>' +
        '<div><div class="sb-name">' + p.name + '</div><div class="sb-stats">\u2705' + p.correct + ' | \u{1F525}max ' + p.combo + '</div></div></div>' +
        '<span class="sb-score" style="color:' + game.COLORS[p.idx] + '">' + p.score + '</span></div>';
    });
    this.app.innerHTML = '<div class="screen"><div class="card slide-up" style="max-width:480px">' +
      '<h2 class="font-display" style="font-size:1.8rem;color:#5b21b6;text-align:center;margin-bottom:20px">\u{1F4CA} Papan Skor</h2>' + rows +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px">' +
      '<button class="btn-outline" onclick="game.state.screen=\'board\';ui.render()">\u2190 Kembali</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="game._stopTimer();game.state.screen=\'winner\';ui.render()">\u{1F3C6} Akhiri</button>' +
      '</div></div></div>';
  }

  // ===== WINNER =====
  renderWinner() {
    game._stopTimer(); game._stopQuestionTimer(); Storage.clear();
    var sorted = game.getRankings();
    var w = sorted[0];
    spawnConfetti(50); audio.play('win');
    var medals = ['\u{1F947}','\u{1F948}','\u{1F949}','4\uFE0F\u20E3'];
    var rankRows = '';
    sorted.forEach(function(p, r) {
      rankRows += '<div class="win-rank-row"><div class="win-rank-left"><span>' + medals[r] + '</span><span style="font-size:1.3rem">' + game.CHARS[game.state.playerChars[p.idx]] + '</span>' +
        '<span style="font-weight:700;color:#333;font-size:0.85rem">' + p.name + '</span></div>' +
        '<div style="text-align:right"><div class="win-rank-score" style="color:' + game.COLORS[p.idx] + '">' + p.score + '</div>' +
        '<div class="win-rank-sub">\u2705' + p.correct + ' \u{1F525}x' + p.combo + '</div></div></div>';
    });
    this.app.innerHTML = '<div class="screen"><div class="card bounce-in" style="max-width:480px;text-align:center;max-height:90vh;overflow-y:auto">' +
      '<div style="font-size:4.5rem;margin-bottom:8px">\u{1F3C6}</div>' +
      '<h2 class="font-display" style="font-size:2.2rem;color:#f59e0b;margin-bottom:8px">SELAMAT!</h2>' +
      '<div style="font-size:3.5rem;margin:8px 0">' + game.CHARS[game.state.playerChars[w.idx]] + '</div>' +
      '<h3 class="font-display" style="font-size:1.8rem;color:' + game.COLORS[w.idx] + ';margin-bottom:4px">' + w.name + '</h3>' +
      '<p style="font-size:1.5rem;font-weight:700;color:#555;margin-bottom:8px">' + w.score + ' Poin</p>' +
      '<div style="display:flex;justify-content:center;gap:12px;font-size:0.8rem;color:#888;margin-bottom:16px">' +
      '<span>\u2705 ' + w.correct + '</span><span>\u274C ' + w.wrong + '</span><span>\u{1F525} max x' + w.combo + '</span></div>' +
      '<div class="win-ranks"><p style="text-align:center;font-size:0.8rem;font-weight:700;color:#999;margin-bottom:8px">Peringkat</p>' + rankRows + '</div>' +
      '<button class="btn btn-primary" onclick="game.reset();ui.render()">\u{1F504} Main Lagi</button></div></div>';
  }

  // ===== PAUSE =====
  renderPause() {
    var overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = '<div class="modal-box"><h2>\u23F8\uFE0F Pause</h2><p>Game dijeda</p><div class="modal-btns">' +
      '<button class="btn btn-primary" onclick="game.togglePause();document.getElementById(\'pause-overlay\').remove()">\u25B6\uFE0F Lanjut</button>' +
      '<button class="btn btn-secondary btn-sm" onclick="game.togglePause();document.getElementById(\'pause-overlay\').remove();game.state.screen=\'scoreboard\';ui.render()">\u{1F4CA} Skor</button>' +
      '<button class="btn-outline" onclick="game.togglePause();document.getElementById(\'pause-overlay\').remove();game.reset();ui.render()">\u{1F3E0} Keluar</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
  }

  // ===== RESUME =====
  renderResumePopup() {
    this._ensureApp();
    var info = Storage.getSaveInfo();
    if (!info || !this.app) return;
    var overlay = document.createElement('div');
    overlay.className = 'resume-popup';
    overlay.innerHTML = '<div class="resume-box"><h2>\u{1F3AE} Lanjutkan Game?</h2>' +
      '<p style="color:#666;margin-bottom:8px">Game sebelumnya (' + info.timeAgo + ')</p>' +
      '<p style="font-size:0.9rem;color:#888">Pemain: ' + info.players.join(', ') + '</p>' +
      '<p style="font-size:0.9rem;color:#888">Sisa waktu: ' + Math.floor(info.timeLeft/60) + ':' + (info.timeLeft%60).toString().padStart(2,'0') + '</p>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:20px">' +
      '<button class="btn btn-primary" onclick="this.closest(\'.resume-popup\').remove();game.resumeGame(Storage.load());ui.render()">\u25B6\uFE0F Lanjutkan</button>' +
      '<button class="btn-outline" onclick="Storage.clear();this.closest(\'.resume-popup\').remove();ui.renderHome()">\u{1F504} Game Baru</button></div></div>';
    this.app.appendChild(overlay);
  }
}

// Global instance
var ui = new UI();

// ===== UTILITY FUNCTIONS =====
function showToast(msg) {
  var c = document.getElementById('toast-container');
  if (!c) return;
  var t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}

function spawnConfetti(count) {
  var cols = ['#ff6b6b','#ffd93d','#4ecdc4','#6c5ce7','#fd79a8','#00b894'];
  for (var i = 0; i < count; i++) {
    var e = document.createElement('div');
    e.className = 'confetti-piece';
    e.style.left = Math.random()*100 + '%';
    e.style.background = cols[i % cols.length];
    e.style.width = (6+Math.random()*10) + 'px';
    e.style.height = (6+Math.random()*10) + 'px';
    e.style.animationDelay = Math.random()*2 + 's';
    e.style.animationDuration = (2+Math.random()*2) + 's';
    e.style.borderRadius = Math.random()>0.5 ? '50%' : '2px';
    document.body.appendChild(e);
    setTimeout(function() { e.remove(); }, 5000);
  }
}

// Helper for game.js
Game.prototype._savePlayers = function() {
  for (var i = 0; i < this.state.numPlayers; i++) {
    var inp = document.getElementById('player-' + i);
    if (inp && inp.value) this.state.players[i] = inp.value;
    if (!this.state.players[i]) this.state.players[i] = 'Pemain ' + (i + 1);
  }
  this.state.players = this.state.players.slice(0, this.state.numPlayers);
};