// ===== EDU-PROJECTOR.JS - Projector & Classroom Mode =====
// Fullscreen, keyboard shortcuts, countdown, lobby, celebration

var EduProjector = (function() {
  var _active = false;
  var _hintsEl = null;
  var _toggleEl = null;
  var _scorebarEl = null;
  var _keyHandler = null;

  function init() {
    // Check localStorage for saved state
    _active = localStorage.getItem('edu-projector') === 'true';
    if (_active) document.body.classList.add('projector-mode');

    _createToggleButton();
    _createShortcutHints();
    _createScoreboardBar();
    _bindKeyboard();
  }

  function toggle() {
    _active = !_active;
    document.body.classList.toggle('projector-mode', _active);
    localStorage.setItem('edu-projector', _active);
    if (_toggleEl) {
      _toggleEl.innerHTML = _active ? '📺 Projector ON' : '📺 Projector';
    }
    if (_active) {
      // Try fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function(){});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(function(){});
      }
    }
  }

  function isActive() { return _active; }

  function _createToggleButton() {
    _toggleEl = document.createElement('button');
    _toggleEl.className = 'projector-toggle';
    _toggleEl.setAttribute('data-projector-toggle', 'true');
    _toggleEl.innerHTML = _active ? '📺 Projector ON' : '📺 Projector';
    _toggleEl.onclick = toggle;
    _toggleEl.title = 'Toggle Projector Mode (F11)';
    // Hide on mobile — projector is for classroom/big screens
    if (_isMobile()) {
      _toggleEl.style.display = 'none';
      return;
    }
    document.body.appendChild(_toggleEl);
  }

  function _isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function _createShortcutHints() {
    _hintsEl = document.createElement('div');
    _hintsEl.className = 'shortcut-hints';
    _hintsEl.innerHTML =
      '<div><kbd>1-4</kbd> Pilih jawaban A-D</div>' +
      '<div><kbd>Space</kbd> Lempar dadu / Lanjut</div>' +
      '<div><kbd>Enter</kbd> Konfirmasi</div>' +
      '<div><kbd>P</kbd> Pause</div>' +
      '<div><kbd>S</kbd> Scoreboard</div>' +
      '<div><kbd>F11</kbd> Fullscreen</div>' +
      '<div><kbd>Esc</kbd> Keluar overlay</div>';
    document.body.appendChild(_hintsEl);
  }

  function _createScoreboardBar() {
    _scorebarEl = document.createElement('div');
    _scorebarEl.className = 'team-scoreboard-bar';
    _scorebarEl.id = 'team-scoreboard-bar';
    document.body.appendChild(_scorebarEl);
  }

  function updateScoreboardBar(players, scores, chars, colors, currentPlayer, charEmojis) {
    if (!_scorebarEl) return;
    var html = '';
    for (var i = 0; i < players.length; i++) {
      html += '<div class="tsb-team' + (i === currentPlayer ? ' active' : '') + '" style="border-left:4px solid ' + colors[i] + '">' +
        '<span class="tsb-emoji">' + charEmojis[chars[i]] + '</span>' +
        '<span class="tsb-name">' + players[i] + '</span>' +
        '<span class="tsb-score">' + scores[i] + '</span></div>';
    }
    _scorebarEl.innerHTML = html;
  }

  function _bindKeyboard() {
    _keyHandler = function(e) {
      // F11 → toggle projector
      if (e.key === 'F11') {
        e.preventDefault();
        toggle();
        return;
      }

      // Only handle shortcuts when projector mode is active OR always for convenience
      var key = e.key;

      // Number keys 1-4 → answer options
      if (['1','2','3','4'].indexOf(key) >= 0 && typeof game !== 'undefined' && game.state.screen === 'question') {
        e.preventDefault();
        var optBtns = document.querySelectorAll('.opt-btn:not(.disabled)');
        var idx = parseInt(key) - 1;
        if (optBtns[idx]) optBtns[idx].click();
        return;
      }

      // Space → roll dice or continue
      if (key === ' ' || key === 'Spacebar') {
        e.preventDefault();
        if (typeof game !== 'undefined') {
          if (game.state.screen === 'board') {
            var rollBtn = document.getElementById('roll-btn');
            if (rollBtn && !rollBtn.disabled) rollBtn.click();
          } else if (game.state.screen === 'feedback') {
            var contBtn = document.querySelector('.btn-primary.btn-block');
            if (contBtn) contBtn.click();
          }
        }
        // Also handle dice overlay
        var diceRollBtn = document.getElementById('dice-overlay-roll-btn');
        if (diceRollBtn && !diceRollBtn.disabled) diceRollBtn.click();
        return;
      }

      // Enter → confirm / continue
      if (key === 'Enter') {
        var primaryBtn = document.querySelector('.btn-primary:not([disabled])');
        if (primaryBtn) { e.preventDefault(); primaryBtn.click(); }
        return;
      }

      // P → pause
      if (key === 'p' || key === 'P') {
        if (typeof game !== 'undefined' && game.state.screen === 'board') {
          e.preventDefault();
          game.togglePause();
          if (typeof ui !== 'undefined') ui.renderPause();
        }
        return;
      }

      // S → scoreboard
      if (key === 's' || key === 'S') {
        if (typeof game !== 'undefined' && game.state.screen === 'board') {
          e.preventDefault();
          game.state.screen = 'scoreboard';
          if (typeof ui !== 'undefined') ui.render();
        }
        return;
      }

      // Escape → close overlays
      if (key === 'Escape') {
        var overlay = document.getElementById('dice-overlay') ||
                      document.getElementById('pause-overlay') ||
                      document.getElementById('soal-manager-overlay') ||
                      document.querySelector('.lobby-screen') ||
                      document.querySelector('.round-leaderboard');
        if (overlay) {
          e.preventDefault();
          overlay.remove();
          // If it was pause overlay, unpause
          if (typeof game !== 'undefined' && game.state.paused) game.togglePause();
        }
        return;
      }

      // Arrow keys for sequence questions
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        var seqBtns = document.querySelectorAll('.seq-arrow');
        // Let default behavior handle it
      }

      // R → roll dice (alternative)
      if (key === 'r' || key === 'R') {
        if (typeof game !== 'undefined' && game.state.screen === 'board') {
          var rollBtn2 = document.getElementById('roll-btn');
          if (rollBtn2 && !rollBtn2.disabled) { e.preventDefault(); rollBtn2.click(); }
        }
        return;
      }
    };

    document.addEventListener('keydown', _keyHandler);
  }

  // ===== COUNTDOWN =====
  function showCountdown(callback, text) {
    var count = 3;
    var overlay = document.createElement('div');
    overlay.className = 'countdown-overlay';
    overlay.innerHTML = '<div class="countdown-number">' + count + '</div>' +
      '<div class="countdown-text">' + (text || 'Bersiap...') + '</div>';
    document.body.appendChild(overlay);

    var interval = setInterval(function() {
      count--;
      if (count > 0) {
        overlay.querySelector('.countdown-number').textContent = count;
        overlay.querySelector('.countdown-number').style.animation = 'none';
        void overlay.querySelector('.countdown-number').offsetHeight; // reflow
        overlay.querySelector('.countdown-number').style.animation = 'countdown-pulse 1s ease-in-out';
      } else if (count === 0) {
        overlay.querySelector('.countdown-number').textContent = 'GO!';
        overlay.querySelector('.countdown-number').style.color = '#00ff88';
        overlay.querySelector('.countdown-number').style.animation = 'none';
        void overlay.querySelector('.countdown-number').offsetHeight;
        overlay.querySelector('.countdown-number').style.animation = 'countdown-pulse 1s ease-in-out';
      } else {
        clearInterval(interval);
        overlay.remove();
        if (typeof callback === 'function') callback();
      }
    }, 1000);
  }

  // ===== LOBBY =====
  function showLobby(config, onStart) {
    var overlay = document.createElement('div');
    overlay.className = 'lobby-screen';

    var teamsHTML = '';
    for (var i = 0; i < config.players.length; i++) {
      teamsHTML += '<div class="lobby-team-card" style="border-color:' + config.colors[i] + '">' +
        '<span class="team-emoji">' + config.charEmojis[config.chars[i]] + '</span>' +
        '<span class="team-name" style="color:' + config.colors[i] + '">' + config.players[i] + '</span></div>';
    }

    overlay.innerHTML =
      '<div class="lobby-title">🎮 ' + (config.title || 'Game Edukasi') + '</div>' +
      '<div class="lobby-subtitle">' + (config.subtitle || 'Siap bermain?') + '</div>' +
      '<div class="lobby-teams">' + teamsHTML + '</div>' +
      '<div class="lobby-rules"><h3>📋 Aturan</h3><ul>' +
        '<li>Jawab soal di setiap petak</li>' +
        '<li>Benar = poin, Salah = mundur</li>' +
        '<li>Combo 3x = bonus 2x poin!</li>' +
        '<li>Pertama sampai finish = +50 poin</li>' +
      '</ul></div>' +
      '<button class="lobby-start-btn" id="lobby-start-btn">🚀 MULAI!</button>';

    document.body.appendChild(overlay);

    document.getElementById('lobby-start-btn').onclick = function() {
      overlay.remove();
      showCountdown(onStart);
    };

    // Also start with Space/Enter
    var lobbyKeyHandler = function(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        document.removeEventListener('keydown', lobbyKeyHandler);
        overlay.remove();
        showCountdown(onStart);
      }
    };
    document.addEventListener('keydown', lobbyKeyHandler);
  }

  // ===== CELEBRATION =====
  function showCelebration(text, duration) {
    var overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = '<div class="celebration-text">' + text + '</div>';
    document.body.appendChild(overlay);
    setTimeout(function() { overlay.remove(); }, duration || 2000);
  }

  // ===== BUZZER FLASH =====
  function showBuzzer(emoji) {
    var el = document.createElement('div');
    el.className = 'buzzer-indicator';
    el.textContent = emoji || '🔔';
    document.body.appendChild(el);
    setTimeout(function() { el.remove(); }, 600);
  }

  // ===== BETWEEN-ROUNDS LEADERBOARD =====
  function showRoundLeaderboard(rankings, charEmojis, chars, colors, duration, onDone) {
    var medals = ['🥇','🥈','🥉','4️⃣'];
    var overlay = document.createElement('div');
    overlay.className = 'round-leaderboard';

    var rowsHTML = '';
    rankings.forEach(function(p, r) {
      rowsHTML += '<div class="round-lb-row" style="border-left:4px solid ' + colors[p.idx] + '">' +
        '<span class="round-lb-rank">' + medals[r] + '</span>' +
        '<span style="font-size:2.5rem">' + charEmojis[chars[p.idx]] + '</span>' +
        '<div class="round-lb-info"><div class="round-lb-name">' + p.name + '</div>' +
        '<div class="round-lb-stats">✅' + p.correct + ' | 🔥max x' + p.combo + '</div></div>' +
        '<span class="round-lb-score">' + p.score + '</span></div>';
    });

    overlay.innerHTML = '<h2>📊 Papan Skor</h2>' + rowsHTML +
      '<div style="color:rgba(255,255,255,0.4);font-size:1rem;margin-top:12px">Otomatis lanjut dalam ' + (duration/1000) + ' detik...</div>';

    document.body.appendChild(overlay);

    // Auto-close or press any key
    var timer = setTimeout(function() {
      overlay.remove();
      document.removeEventListener('keydown', closeHandler);
      if (typeof onDone === 'function') onDone();
    }, duration || 5000);

    var closeHandler = function(e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        clearTimeout(timer);
        overlay.remove();
        document.removeEventListener('keydown', closeHandler);
        if (typeof onDone === 'function') onDone();
      }
    };
    document.addEventListener('keydown', closeHandler);
  }

  return {
    init: init,
    toggle: toggle,
    isActive: isActive,
    showCountdown: showCountdown,
    showLobby: showLobby,
    showCelebration: showCelebration,
    showBuzzer: showBuzzer,
    showRoundLeaderboard: showRoundLeaderboard,
    updateScoreboardBar: updateScoreboardBar
  };
})();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { EduProjector.init(); });
} else {
  EduProjector.init();
}
