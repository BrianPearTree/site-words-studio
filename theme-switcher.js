/* Unified Settings Menu — Theme, Dark/Light, Voice */
(function() {
  const themes = [
    { id: 'gotham', label: 'Gotham', colors: ['#1c1c1e','#ffd60a'] },
    { id: 'ocean', label: 'Ocean', colors: ['#0b1120','#38bdf8'] },
    { id: 'jungle', label: 'Jungle', colors: ['#0a120a','#4ade80'] },
    { id: 'sunset', label: 'Sunset', colors: ['#120a08','#fb923c'] },
    { id: 'galaxy', label: 'Galaxy', colors: ['#0a0812','#c084fc'] },
  ];

  const html = document.documentElement;
  const body = document.body;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  // Restore
  const savedTheme = localStorage.getItem('sws-theme') || 'gotham';
  const savedMode = localStorage.getItem('sws-mode');
  html.setAttribute('data-theme', savedTheme);
  applyMode(savedMode);
  mq.addEventListener('change', () => { if (!localStorage.getItem('sws-mode')) applyMode(null); });

  function applyMode(mode) {
    const isDark = mode === 'dark' ? true : mode === 'light' ? false : mq.matches;
    html.classList.toggle('dark', isDark);
    html.classList.toggle('light-mode', !isDark);
    body.classList.toggle('dark', isDark);
    body.classList.toggle('light-mode', !isDark);
    // Update button if exists
    const btn = document.getElementById('modeToggle');
    if (btn) btn.textContent = mode === 'dark' ? '🌙 Dark' : mode === 'light' ? '☀️ Light' : '🖥️ Auto';
  }

  function cycleMode() {
    const cur = localStorage.getItem('sws-mode');
    const next = !cur ? 'dark' : cur === 'dark' ? 'light' : null;
    if (next) localStorage.setItem('sws-mode', next); else localStorage.removeItem('sws-mode');
    applyMode(next);
  }

  function setTheme(id) {
    html.setAttribute('data-theme', id);
    localStorage.setItem('sws-theme', id);
    updateThemeDots();
  }

  function updateThemeDots() {
    const cur = localStorage.getItem('sws-theme') || 'gotham';
    document.querySelectorAll('.sws-theme-dot').forEach(d => {
      const active = d.dataset.theme === cur;
      d.style.borderColor = active ? 'var(--text-1)' : 'transparent';
      d.style.transform = active ? 'scale(1.2)' : '';
    });
  }

  // --- Inject Styles ---
  const css = document.createElement('style');
  css.textContent = `
    #swsMenuBtn {
      position: fixed; top: 12px; right: 12px; z-index: 10001;
      width: 40px; height: 40px; border-radius: 12px;
      background: var(--surface-1); border: 1px solid var(--separator);
      display: grid; place-items: center; cursor: pointer;
      font-size: 1.2rem; padding: 0; min-height: auto;
      transition: transform 0.15s ease;
      color: var(--text-1);
    }
    #swsMenuBtn:active { transform: scale(0.92); }

    #swsMenuPanel {
      position: fixed; top: 58px; right: 12px; z-index: 10000;
      width: 240px; padding: 16px;
      border-radius: 18px;
      background: var(--surface-1); border: 1px solid var(--separator);
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      display: none; /* hidden by default */
      flex-direction: column; gap: 14px;
    }
    #swsMenuPanel.open { display: flex; }

    #swsMenuPanel .menu-label {
      font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-3); margin-bottom: 6px;
    }

    #swsMenuPanel .theme-row {
      display: flex; gap: 10px; align-items: center;
    }

    .sws-theme-dot {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2.5px solid transparent;
      cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;
      flex-shrink: 0;
    }
    .sws-theme-dot:active { transform: scale(0.9) !important; }

    #swsMenuPanel .menu-btn {
      width: 100%; min-height: 44px; padding: 10px 14px;
      border: none; border-radius: 12px;
      background: var(--surface-2); color: var(--text-1);
      font-size: 0.88rem; font-weight: 600; cursor: pointer;
      text-align: left;
      transition: background 0.12s ease;
    }
    #swsMenuPanel .menu-btn:active { background: var(--surface-3); }

    /* Backdrop */
    #swsMenuBackdrop {
      position: fixed; inset: 0; z-index: 9999;
      background: transparent; display: none;
    }
    #swsMenuBackdrop.open { display: block; }
  `;
  document.head.appendChild(css);

  // --- Build UI ---
  // Backdrop (closes menu on tap outside)
  const backdrop = document.createElement('div');
  backdrop.id = 'swsMenuBackdrop';
  document.body.appendChild(backdrop);

  // Menu button (hamburger)
  const menuBtn = document.createElement('button');
  menuBtn.id = 'swsMenuBtn';
  menuBtn.innerHTML = '☰';
  menuBtn.title = 'Settings';
  document.body.appendChild(menuBtn);

  // Menu panel
  const panel = document.createElement('div');
  panel.id = 'swsMenuPanel';

  // Theme section
  const themeLabel = document.createElement('div');
  themeLabel.className = 'menu-label';
  themeLabel.textContent = 'Theme';
  panel.appendChild(themeLabel);

  const themeRow = document.createElement('div');
  themeRow.className = 'theme-row';
  themes.forEach(t => {
    const dot = document.createElement('div');
    dot.className = 'sws-theme-dot';
    dot.dataset.theme = t.id;
    dot.title = t.label;
    dot.style.background = 'linear-gradient(135deg,' + t.colors[0] + ',' + t.colors[1] + ')';
    dot.addEventListener('click', () => setTheme(t.id));
    themeRow.appendChild(dot);
  });
  panel.appendChild(themeRow);

  // Mode toggle
  const modeLabel = document.createElement('div');
  modeLabel.className = 'menu-label';
  modeLabel.textContent = 'Appearance';
  panel.appendChild(modeLabel);

  const modeBtn = document.createElement('button');
  modeBtn.id = 'modeToggle';
  modeBtn.className = 'menu-btn';
  const curMode = localStorage.getItem('sws-mode');
  modeBtn.textContent = curMode === 'dark' ? '🌙 Dark' : curMode === 'light' ? '☀️ Light' : '🖥️ Auto';
  modeBtn.addEventListener('click', cycleMode);
  panel.appendChild(modeBtn);

  // Voice toggle (if voice-recognition.js loaded)
  const voiceLabel = document.createElement('div');
  voiceLabel.className = 'menu-label';
  voiceLabel.textContent = 'Voice Recognition';
  panel.appendChild(voiceLabel);

  const voiceBtn = document.createElement('button');
  voiceBtn.id = 'menuVoiceToggle';
  voiceBtn.className = 'menu-btn';
  voiceBtn.textContent = '🎤 Voice Off';
  voiceBtn.addEventListener('click', function() {
    // Click the floating voice toggle button if it exists
    const vt = document.getElementById('voiceToggle');
    if (vt) {
      vt.click();
      // Sync label
      setTimeout(function() {
        voiceBtn.textContent = vt.innerHTML;
      }, 50);
    }
  });
  // Keep in sync with the floating button
  setInterval(function() {
    const vt = document.getElementById('voiceToggle');
    if (vt) voiceBtn.textContent = vt.innerHTML;
  }, 500);
  panel.appendChild(voiceBtn);

  document.body.appendChild(panel);

  // Toggle logic
  let menuOpen = false;
  function toggleMenu() {
    menuOpen = !menuOpen;
    panel.classList.toggle('open', menuOpen);
    backdrop.classList.toggle('open', menuOpen);
    menuBtn.innerHTML = menuOpen ? '✕' : '☰';
    if (menuOpen) updateThemeDots();
  }

  menuBtn.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', toggleMenu);

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu();
  });

  // Initial dot highlight
  setTimeout(updateThemeDots, 50);
})();
