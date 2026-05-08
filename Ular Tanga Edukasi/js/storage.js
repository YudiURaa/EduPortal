// ===== STORAGE.JS - localStorage Wrapper =====

const Storage = {
  KEY: 'ularTangaSave',

  // Save game state
  save(gameState) {
    try {
      const data = {
        gameInProgress: true,
        timestamp: Date.now(),
        players: gameState.players.map((p, i) => ({
          name: p,
          character: gameState.playerChars[i],
          score: gameState.scores[i],
          position: gameState.positions[i],
          powerups: gameState.powerups[i] || [],
          combo: gameState.combos[i],
          maxCombo: gameState.maxCombos[i],
          correct: gameState.correctAnswers[i],
          wrong: gameState.wrongAnswers[i]
        })),
        currentPlayer: gameState.currentPlayer,
        timeLeft: gameState.timeLeft,
        duration: gameState.duration,
        questionsAnswered: gameState.questionsAnswered,
        finishOrder: gameState.finishOrder,
        numPlayers: gameState.numPlayers
      };
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save game:', e);
      return false;
    }
  },

  // Load saved game
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.gameInProgress) return null;
      return data;
    } catch (e) {
      console.warn('Failed to load game:', e);
      return null;
    }
  },

  // Check if save exists
  hasSave() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.gameInProgress === true;
    } catch (e) {
      return false;
    }
  },

  // Get save info (for resume popup)
  getSaveInfo() {
    const data = this.load();
    if (!data) return null;
    const elapsed = Date.now() - data.timestamp;
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);
    let timeAgo;
    if (hours > 24) {
      timeAgo = Math.floor(hours / 24) + ' hari lalu';
    } else if (hours > 0) {
      timeAgo = hours + ' jam lalu';
    } else if (minutes > 0) {
      timeAgo = minutes + ' menit lalu';
    } else {
      timeAgo = 'baru saja';
    }
    return {
      players: data.players.map(p => p.name),
      timeAgo: timeAgo,
      scores: data.players.map(p => p.score),
      timeLeft: data.timeLeft
    };
  },

  // Clear save
  clear() {
    try {
      localStorage.removeItem(this.KEY);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Restore game state from save data
  restore(saveData) {
    if (!saveData) return null;
    return {
      players: saveData.players.map(p => p.name),
      playerChars: saveData.players.map(p => p.character),
      scores: saveData.players.map(p => p.score),
      positions: saveData.players.map(p => p.position),
      powerups: saveData.players.map(p => p.powerups || []),
      combos: saveData.players.map(p => p.combo || 0),
      maxCombos: saveData.players.map(p => p.maxCombo || 0),
      correctAnswers: saveData.players.map(p => p.correct || 0),
      wrongAnswers: saveData.players.map(p => p.wrong || 0),
      currentPlayer: saveData.currentPlayer,
      timeLeft: saveData.timeLeft,
      duration: saveData.duration,
      questionsAnswered: saveData.questionsAnswered || 0,
      finishOrder: saveData.finishOrder || [],
      numPlayers: saveData.numPlayers
    };
  }
};
