// ===== GAME.JS - Game Logic =====

class Game {
  constructor() {
    this.state = this._defaultState();
    this.boardConfig = null;
    this.timerInterval = null;
    this.questionTimer = null;
    this.dice3d = null;

    // Constants
    this.COLORS = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7'];
    this.COLORS_LIGHT = ['#ffe0e0', '#d4f5f2', '#fff3cd', '#e8e0ff'];
    this.CHARS = ['🦁', '🐬', '🦊', '🐼', '🐯', '🦒', '🐨', '🦙', '🐰', '🧝', '🐸', '🦄'];
    this.POWERUPS = [
      { id: 'double', icon: '⚡', name: '2x Poin' },
      { id: 'skip', icon: '⏭️', name: 'Skip' },
      { id: 'shield', icon: '🛡️', name: 'Shield' },
      { id: 'hint', icon: '💡', name: 'Hint' }
    ];
  }

  _defaultState() {
    return {
      screen: 'home',
      players: [],
      playerChars: [0, 1, 2, 3],
      numPlayers: 2,
      currentPlayer: 0,
      scores: [0, 0, 0, 0],
      positions: [0, 0, 0, 0],
      preRollPosition: 0, // posisi sebelum lempar dadu (untuk penalty mundur)
      combos: [0, 0, 0, 0],
      maxCombos: [0, 0, 0, 0],
      correctAnswers: [0, 0, 0, 0],
      wrongAnswers: [0, 0, 0, 0],
      powerups: [[], [], [], []],
      finishOrder: [],
      questionsAnswered: 0,
      duration: 15,
      timeLeft: 0,
      paused: false,
      diceResult: 0,
      isMoving: false,
      currentQuestion: null,
      questionTimeLeft: 30,
      questionTimerStarted: false,
      shuffledOpts: null,
      activePowerup: null,
      feedbackData: null,
      lastDiceRoll: 0
    };
  }

  // Load board configuration from embedded data (for file:// protocol compatibility)
  async loadBoardConfig() {
    try {
      // Use embedded data if available (file:// protocol)
      if (typeof BOARD_CONFIG !== 'undefined') {
        this.boardConfig = BOARD_CONFIG;
        return true;
      }
      // Fallback to fetch for http/https
      const response = await fetch('data/board-config.json');
      if (!response.ok) throw new Error('Failed to load board config');
      this.boardConfig = await response.json();
      return true;
    } catch (e) {
      console.warn('Using default board config:', e);
      this._useDefaultBoardConfig();
      return false;
    }
  }

  _useDefaultBoardConfig() {
    this.boardConfig = {
      boardSize: 100,
      layout: "zigzag",
      snakes: [
        { from: 99, to: 41 }, { from: 89, to: 53 }, { from: 76, to: 58 },
        { from: 62, to: 19 }, { from: 47, to: 26 }, { from: 33, to: 3 }, { from: 25, to: 5 }
      ],
      ladders: [
        { from: 2, to: 23 }, { from: 8, to: 34 }, { from: 20, to: 77 },
        { from: 32, to: 68 }, { from: 41, to: 79 }, { from: 50, to: 91 }, { from: 71, to: 92 }
      ],
      questionTiles: [5, 12, 18, 24, 29, 35, 42, 48, 55, 61, 67, 74, 80, 87, 93],
      powerupTiles: [7, 15, 28, 40, 52, 65, 78, 90],
      finishTile: 100
    };
  }

  // Get cell type for a position
  getCellType(pos) {
    if (pos === 0) return 'start';
    if (pos >= 100) return 'finish';

    const snake = this.boardConfig.snakes.find(s => s.from === pos);
    if (snake) return 'snake-head';

    const ladder = this.boardConfig.ladders.find(l => l.from === pos);
    if (ladder) return 'ladder-bottom';

    if (this.boardConfig.questionTiles.includes(pos)) return 'question';
    if (this.boardConfig.powerupTiles.includes(pos)) return 'powerup';

    return 'normal';
  }

  // Check if position has snake
  getSnake(pos) {
    return this.boardConfig.snakes.find(s => s.from === pos);
  }

  // Check if position has ladder
  getLadder(pos) {
    return this.boardConfig.ladders.find(l => l.from === pos);
  }

  // Start game
  startGame() {
    const s = this.state;
    s.currentPlayer = 0;
    s.questionsAnswered = 0;
    s.finishOrder = [];
    s.positions = new Array(s.numPlayers).fill(0);
    s.scores = new Array(s.numPlayers).fill(0);
    s.combos = new Array(s.numPlayers).fill(0);
    s.maxCombos = new Array(s.numPlayers).fill(0);
    s.correctAnswers = new Array(s.numPlayers).fill(0);
    s.wrongAnswers = new Array(s.numPlayers).fill(0);
    s.powerups = Array.from({ length: s.numPlayers }, () => []);
    s.timeLeft = s.duration * 60;
    s.screen = 'board';
    this._startTimer();
  }

  // Resume game from save
  resumeGame(saveData) {
    const restored = Storage.restore(saveData);
    if (!restored) return false;

    Object.assign(this.state, restored);
    this.state.screen = 'board';
    this._startTimer();
    return true;
  }

  // Roll dice (called by UI overlay now - kept for compatibility)
  rollDice(callback) {
    if (this.state.isMoving) return;
    this.state.isMoving = true;

    if (this.dice3d) {
      this.dice3d.roll((result) => {
        this.state.diceResult = result;
        this.state.lastDiceRoll = result;
        if (typeof callback === 'function') callback(result);
      });
    } else {
      const result = Math.floor(Math.random() * 6) + 1;
      this.state.diceResult = result;
      this.state.lastDiceRoll = result;
      audio.play('roll');
      setTimeout(() => {
        audio.play('land');
        if (typeof callback === 'function') callback(result);
      }, 1500);
    }
  }

  // Move player step by step
  _movePlayer(steps, callback) {
    const pi = this.state.currentPlayer;
    let currentPos = this.state.positions[pi];
    // Simpan posisi sebelum jalan (untuk penalty mundur ke awal)
    this.state.preRollPosition = currentPos;
    let targetPos = currentPos + steps;

    // Can't go beyond 100
    if (targetPos > 100) {
      targetPos = 100 - (targetPos - 100); // Bounce back
    }

    // Animate step by step
    let step = 0;
    const moveInterval = setInterval(() => {
      step++;
      currentPos++;
      if (currentPos > 100) currentPos = 100 - (currentPos - 100);

      this.state.positions[pi] = currentPos;
      audio.play('move');

      if (typeof callback === 'function') callback('step');

      if (step >= steps || currentPos === targetPos) {
        clearInterval(moveInterval);
        this.state.positions[pi] = targetPos;

        // Check what's on this tile
        setTimeout(() => {
          this._checkTile(targetPos, callback);
        }, 300);
      }
    }, 200);
  }

  // Check tile after landing
  // SETIAP langkah SELALU ada soal. Jika salah/timeout/nyerah → mundur ke posisi awal.
  _checkTile(pos, callback) {
    const pi = this.state.currentPlayer;

    // Check finish
    if (pos >= 100) {
      this._handleFinish(pi, callback);
      return;
    }

    // Check snake - tetap kena ular dulu, lalu soal
    const snake = this.getSnake(pos);
    if (snake) {
      audio.play('snake');
      this.state.positions[pi] = snake.to;
      showToast(`🐍 ${this.state.players[pi]} terkena ular! Turun ke ${snake.to}`);
      // Setelah turun, tetap ada soal
      setTimeout(() => {
        this._handleQuestion(callback);
      }, 1000);
      return;
    }

    // Check ladder - tetap naik tangga dulu, lalu soal
    const ladder = this.getLadder(pos);
    if (ladder) {
      audio.play('ladder');
      this.state.positions[pi] = ladder.to;
      showToast(`🪜 ${this.state.players[pi]} naik tangga! Naik ke ${ladder.to}`);
      // Setelah naik, tetap ada soal
      setTimeout(() => {
        this._handleQuestion(callback);
      }, 1000);
      return;
    }

    // Check powerup tile - ambil powerup, lalu soal
    if (this.boardConfig.powerupTiles.includes(pos)) {
      if (this.state.powerups[pi].length < 3) {
        const pu = this.POWERUPS[Math.floor(Math.random() * this.POWERUPS.length)];
        this.state.powerups[pi].push({ ...pu });
        audio.play('powerup');
        showToast(`${pu.icon} ${this.state.players[pi]} mendapat ${pu.name}!`);
      }
      setTimeout(() => {
        this._handleQuestion(callback);
      }, 800);
      return;
    }

    // Semua tile lain (normal, question tile) → selalu soal
    this._handleQuestion(callback);
  }

  // _handleSnake dan _handleLadder sudah inline di _checkTile

  _handleQuestion(callback) {
    const question = questionManager.getQuestion();
    if (!question) {
      this._endTurn(callback);
      return;
    }

    this.state.currentQuestion = question;
    this.state.questionTimerStarted = false;
    this.state.shuffledOpts = null;
    this.state.activePowerup = null;
    this.state.screen = 'question';

    if (typeof callback === 'function') callback('question');
  }

  // _handlePowerup sudah inline di _checkTile

  _handleFinish(pi, callback) {
    if (!this.state.finishOrder.includes(pi)) {
      this.state.finishOrder.push(pi);
      this.state.scores[pi] += 50;
      this.state.positions[pi] = 100;
      audio.play('win');
      showToast(`🏆 ${this.state.players[pi]} FINISH! +50 poin!`);
      spawnConfetti(30);
    }

    // Check if all players finished
    if (this.state.finishOrder.length >= this.state.numPlayers) {
      setTimeout(() => {
        this._endGame(callback);
      }, 2000);
    } else {
      setTimeout(() => {
        this._endTurn(callback);
      }, 1500);
    }
  }

  // Answer question
  answerQuestion(selectedIndex, callback) {
    const q = this.state.currentQuestion;
    const pi = this.state.currentPlayer;
    const correct = selectedIndex === q.ans;
    const difficulty = questionManager.getDifficulty(q);
    let basePoints = questionManager.getPoints(difficulty);

    this._stopQuestionTimer();

    if (correct) {
      // Correct answer
      this.state.combos[pi]++;
      if (this.state.combos[pi] > this.state.maxCombos[pi]) {
        this.state.maxCombos[pi] = this.state.combos[pi];
      }

      // Combo multiplier
      const comboMult = this.state.combos[pi] >= 5 ? 3 : this.state.combos[pi] >= 3 ? 2 : 1;

      // Double powerup
      if (this.state.activePowerup && this.state.activePowerup.id === 'double') {
        basePoints *= 2;
        this.state.activePowerup = null;
      }

      const totalPoints = basePoints * comboMult;
      this.state.scores[pi] += totalPoints;
      this.state.correctAnswers[pi]++;

      audio.play('correct');
      if (this.state.combos[pi] >= 3) audio.play('combo');

      this.state.feedbackData = {
        correct: true,
        points: totalPoints,
        combo: this.state.combos[pi],
        q: q,
        difficulty: difficulty
      };
    } else {
      // Wrong answer → mundur ke posisi sebelum lempar dadu
      this.state.combos[pi] = 0;
      this.state.wrongAnswers[pi]++;

      // Shield check
      const hasShield = this.state.activePowerup && this.state.activePowerup.id === 'shield';
      if (hasShield) {
        this.state.activePowerup = null;
        showToast('🛡️ Shield aktif! Tidak mundur.');
      } else {
        // Mundur ke posisi awal sebelum lempar dadu
        this.state.positions[pi] = this.state.preRollPosition || 0;
      }

      audio.play('wrong');

      this.state.feedbackData = {
        correct: false,
        points: 0,
        combo: 0,
        q: q,
        difficulty: difficulty,
        shielded: hasShield
      };
    }

    this.state.activePowerup = null;
    this.state.questionsAnswered++;
    this.state.shuffledOpts = null;
    this.state.screen = 'feedback';

    if (typeof callback === 'function') callback('feedback');
  }

  // Question timeout → mundur ke posisi awal sebelum lempar dadu
  questionTimeout(callback) {
    const pi = this.state.currentPlayer;
    const q = this.state.currentQuestion;

    this._stopQuestionTimer();
    this.state.combos[pi] = 0;
    this.state.wrongAnswers[pi]++;

    // Mundur ke posisi awal sebelum lempar dadu
    this.state.positions[pi] = this.state.preRollPosition || 0;

    audio.play('wrong');

    this.state.feedbackData = {
      correct: false,
      points: 0,
      combo: 0,
      q: q,
      difficulty: questionManager.getDifficulty(q),
      timeout: true
    };

    this.state.questionsAnswered++;
    this.state.shuffledOpts = null;
    this.state.screen = 'feedback';

    if (typeof callback === 'function') callback('feedback');
  }

  // Surrender question → mundur ke posisi awal sebelum lempar dadu
  surrenderQuestion(callback) {
    const pi = this.state.currentPlayer;
    const q = this.state.currentQuestion;

    this._stopQuestionTimer();
    this.state.combos[pi] = 0;
    this.state.wrongAnswers[pi]++;

    // Mundur ke posisi awal sebelum lempar dadu
    this.state.positions[pi] = this.state.preRollPosition || 0;

    audio.play('wrong');

    this.state.feedbackData = {
      correct: false,
      points: 0,
      combo: 0,
      q: q,
      difficulty: questionManager.getDifficulty(q),
      surrender: true
    };

    this.state.questionsAnswered++;
    this.state.shuffledOpts = null;
    this.state.screen = 'feedback';

    if (typeof callback === 'function') callback('feedback');
  }

  // Use skip powerup
  useSkip(callback) {
    const pi = this.state.currentPlayer;
    const idx = this.state.powerups[pi].findIndex(p => p.id === 'skip');
    if (idx >= 0) {
      this.state.powerups[pi].splice(idx, 1);
      this._stopQuestionTimer();
      showToast('⏭️ Skip!');
      this.state.screen = 'board';
      this._endTurn(callback);
    }
  }

  // Use hint powerup
  useHint(callback) {
    const pi = this.state.currentPlayer;
    const idx = this.state.powerups[pi].findIndex(p => p.id === 'hint');
    if (idx >= 0) {
      this.state.activePowerup = this.state.powerups[pi][idx];
      this.state.powerups[pi].splice(idx, 1);
      this.state.shuffledOpts = null;
      if (typeof callback === 'function') callback('hint');
    }
  }

  // Activate powerup before answering
  activatePowerup(pi, idx) {
    const pu = this.state.powerups[pi][idx];
    if (!pu) return;
    if (pu.id === 'double' || pu.id === 'shield') {
      this.state.activePowerup = pu;
      this.state.powerups[pi].splice(idx, 1);
      showToast(`${pu.icon} ${pu.name} aktif!`);
      audio.play('powerup');
    }
  }

  // End turn
  _endTurn(callback) {
    this.state.isMoving = false;

    // Save progress
    Storage.save(this.state);

    // Next player (skip finished players)
    let next = (this.state.currentPlayer + 1) % this.state.numPlayers;
    let attempts = 0;
    while (this.state.finishOrder.includes(next) && attempts < this.state.numPlayers) {
      next = (next + 1) % this.state.numPlayers;
      attempts++;
    }
    this.state.currentPlayer = next;
    this.state.screen = 'board';

    if (typeof callback === 'function') callback('endTurn');
  }

  // Continue from feedback to board
  continueFeedback(callback) {
    this._endTurn(callback);
  }

  // End game
  _endGame(callback) {
    this._stopTimer();
    this._stopQuestionTimer();
    Storage.clear();
    this.state.screen = 'winner';
    if (typeof callback === 'function') callback('winner');
  }

  // Timer management
  _startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state.paused) return;
      this.state.timeLeft--;
      if (this.state.timeLeft <= 0) {
        this._stopTimer();
        this.state.screen = 'winner';
        ui.render();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Question timer
  startQuestionTimer(callback) {
    if (this.state.questionTimerStarted) return;
    this.state.questionTimerStarted = true;
    this.state.questionTimeLeft = 30;

    if (this.questionTimer) clearInterval(this.questionTimer);
    this.questionTimer = setInterval(() => {
      this.state.questionTimeLeft--;
      if (this.state.questionTimeLeft <= 10) audio.play('tick');
      if (typeof callback === 'function') callback('tick');
      if (this.state.questionTimeLeft <= 0) {
        this._stopQuestionTimer();
        this.questionTimeout(callback);
      }
    }, 1000);
  }

  _stopQuestionTimer() {
    this.state.questionTimerStarted = false;
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  // Pause/Resume
  togglePause() {
    this.state.paused = !this.state.paused;
    return this.state.paused;
  }

  // Reset game
  reset() {
    this._stopTimer();
    this._stopQuestionTimer();
    Storage.clear();
    if (this.dice3d) {
      this.dice3d.destroy();
      this.dice3d = null;
    }
    this.state = this._defaultState();
  }

  // Get sorted rankings
  getRankings() {
    return this.state.players.map((name, i) => ({
      name,
      score: this.state.scores[i],
      idx: i,
      correct: this.state.correctAnswers[i],
      wrong: this.state.wrongAnswers[i],
      combo: this.state.maxCombos[i],
      position: this.state.positions[i]
    })).sort((a, b) => b.score - a.score);
  }

  // Get formatted time
  getFormattedTime() {
    const m = Math.floor(this.state.timeLeft / 60);
    const s = this.state.timeLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}

// Global instance
const game = new Game();
