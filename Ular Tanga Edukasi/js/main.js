// ===== MAIN.JS - Entry Point =====

// Global state reference
const gs = () => game.state;

// Initialize game
async function init() {
  // Load data
  await Promise.all([
    game.loadBoardConfig(),
    questionManager.load()
  ]);

  // Check for saved game
  if (Storage.hasSave()) {
    ui.renderResumePopup();
  } else {
    ui.renderHome();
  }
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Touch swipe for dice
document.addEventListener('touchstart', (e) => {
  if (game.state.screen === 'board') {
    game._touchStartY = e.touches[0].clientY;
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (game.state.screen === 'board' && game._touchStartY) {
    const dy = game._touchStartY - e.changedTouches[0].clientY;
    if (dy > 50 && !game.state.isMoving) {
      ui.showDiceOverlay();
    }
    game._touchStartY = null;
  }
}, { passive: true });

// ===== PROJECTOR INTEGRATION =====
// Override startGame to show lobby + countdown in projector mode
(function() {
  var _origStartGame = Game.prototype.startGame;
  Game.prototype.startGame = function() {
    var self = this;
    if (typeof EduProjector !== 'undefined' && EduProjector.isActive()) {
      // Show lobby first
      EduProjector.showLobby({
        title: 'Ular Tangga Edukasi',
        subtitle: self.state.numPlayers + ' Pemain • ' + self.state.duration + ' Menit',
        players: self.state.players.slice(0, self.state.numPlayers),
        chars: self.state.playerChars.slice(0, self.state.numPlayers),
        charEmojis: self.CHARS,
        colors: self.COLORS
      }, function() {
        _origStartGame.call(self);
        ui.render();
        _updateProjectorScorebar();
      });
    } else {
      _origStartGame.call(self);
    }
  };

  // Hook into render to update scoreboard bar
  var _origRender = UI.prototype.render;
  UI.prototype.render = function() {
    _origRender.call(this);
    _updateProjectorScorebar();
  };

  var _origUpdatePieces = UI.prototype.updateBoardPieces;
  UI.prototype.updateBoardPieces = function() {
    _origUpdatePieces.call(this);
    _updateProjectorScorebar();
  };

  // Show celebration on correct answer
  var _origAnswerQuestion = Game.prototype.answerQuestion;
  Game.prototype.answerQuestion = function(selectedIndex, callback) {
    var q = this.state.currentQuestion;
    var correct = selectedIndex === q.ans;
    _origAnswerQuestion.call(this, selectedIndex, callback);
    if (correct && typeof EduProjector !== 'undefined' && EduProjector.isActive()) {
      var combo = this.state.combos[this.state.currentPlayer];
      if (combo >= 5) {
        EduProjector.showCelebration('🔥 COMBO x' + combo + '! 🔥', 1500);
      } else if (combo >= 3) {
        EduProjector.showCelebration('⚡ COMBO x' + combo + '!', 1200);
      }
    }
  };

  function _updateProjectorScorebar() {
    if (typeof EduProjector === 'undefined') return;
    var s = game.state;
    if (s.screen === 'board' || s.screen === 'question' || s.screen === 'feedback') {
      EduProjector.updateScoreboardBar(
        s.players.slice(0, s.numPlayers),
        s.scores.slice(0, s.numPlayers),
        s.playerChars.slice(0, s.numPlayers),
        game.COLORS,
        s.currentPlayer,
        game.CHARS
      );
    }
  }
})();
