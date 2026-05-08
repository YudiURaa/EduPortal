// ===== EDU-THEME.JS - Adaptive Theme System =====
// 3 tema berdasarkan jenjang: SD (colorful), SMP (modern), SMA/SMK (sleek/dark)
//
// Cara pakai:
//   EduTheme.set('sd');   // atau 'smp', 'sma'
//   EduTheme.get();       // → 'sd' | 'smp' | 'sma'
//   EduTheme.mountPicker(document.getElementById('container'));

var EduTheme = (function() {
  var STORAGE_KEY = 'edu-theme-jenjang';

  var THEMES = {
    sd: {
      id: 'sd',
      label: 'SD (Kelas 4-6)',
      icon: '\u{1F3A8}',
      desc: 'Colorful & playful',
      className: 'theme-sd'
    },
    smp: {
      id: 'smp',
      label: 'SMP (Kelas 7-9)',
      icon: '\u{1F4DA}',
      desc: 'Modern & clean',
      className: 'theme-smp'
    },
    sma: {
      id: 'sma',
      label: 'SMA/SMK (Kelas 10-12)',
      icon: '\u{1F680}',
      desc: 'Sleek & minimal',
      className: 'theme-sma'
    }
  };

  function get() {
    try { return localStorage.getItem(STORAGE_KEY) || 'smp'; }
    catch(e) { return 'smp'; }
  }

  function set(theme) {
    if (!THEMES[theme]) theme = 'smp';
    try { localStorage.setItem(STORAGE_KEY, theme); } catch(e) {}
    _apply(theme);
    return theme;
  }

  function _apply(theme) {
    var body = document.body;
    // Remove all theme classes
    body.classList.remove('theme-sd', 'theme-smp', 'theme-sma');
    // Add new
    body.classList.add(THEMES[theme].className);
  }

  // Auto-apply on load
  function init() {
    _apply(get());
  }

  // Detect from target string (e.g. "Kelas 5 SD" → 'sd')
  function detectFromTarget(target) {
    if (!target) return null;
    var t = target.toLowerCase();
    if (t.match(/kelas\s*(4|5|6)\b/) || t.match(/\bsd\b/)) return 'sd';
    if (t.match(/kelas\s*(7|8|9)\b/) || t.match(/\bsmp\b/)) return 'smp';
    if (t.match(/kelas\s*(10|11|12)\b/) || t.match(/\bsma\b/) || t.match(/\bsmk\b/)) return 'sma';
    return null;
  }

  // Mount theme picker UI
  function mountPicker(container, onChange) {
    if (!container) return;
    var current = get();

    var html = '<div class="edu-theme-picker">';
    html += '<div class="etp-title">\u{1F3A8} Pilih Jenjang</div>';
    html += '<div class="etp-options">';

    Object.keys(THEMES).forEach(function(key) {
      var t = THEMES[key];
      var active = key === current ? ' etp-active' : '';
      html += '<button class="etp-option' + active + '" data-theme="' + key + '">' +
        '<span class="etp-icon">' + t.icon + '</span>' +
        '<span class="etp-label">' + t.label + '</span>' +
        '<span class="etp-desc">' + t.desc + '</span>' +
      '</button>';
    });

    html += '</div></div>';
    container.innerHTML = html;

    container.querySelectorAll('.etp-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var theme = this.getAttribute('data-theme');
        set(theme);
        // Update active state
        container.querySelectorAll('.etp-option').forEach(function(b) {
          b.classList.toggle('etp-active', b.getAttribute('data-theme') === theme);
        });
        if (onChange) onChange(theme);
      });
    });
  }

  // Compact picker (inline, for nav/topbar)
  function mountCompactPicker(container, onChange) {
    if (!container) return;
    var current = get();

    var html = '<div class="etp-compact">';
    Object.keys(THEMES).forEach(function(key) {
      var t = THEMES[key];
      var active = key === current ? ' etp-c-active' : '';
      html += '<button class="etp-c-btn' + active + '" data-theme="' + key + '" title="' + t.label + '">' + t.icon + '</button>';
    });
    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.etp-c-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var theme = this.getAttribute('data-theme');
        set(theme);
        container.querySelectorAll('.etp-c-btn').forEach(function(b) {
          b.classList.toggle('etp-c-active', b.getAttribute('data-theme') === theme);
        });
        if (onChange) onChange(theme);
      });
    });
  }

  return {
    get: get,
    set: set,
    init: init,
    detectFromTarget: detectFromTarget,
    mountPicker: mountPicker,
    mountCompactPicker: mountCompactPicker,
    THEMES: THEMES
  };
})();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { EduTheme.init(); });
} else {
  EduTheme.init();
}
