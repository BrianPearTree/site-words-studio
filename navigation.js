/* Bottom Tab Navigation — Single Page App Feel */
(function() {
  const tabs = [
    { id: 'play', icon: '▶', label: 'Play' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'sets', icon: '📚', label: 'Sets' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  // Map tabs to panel classes/IDs
  const tabPanels = {
    play: ['.hero', '.game-panel'],
    stats: ['.coach-panel', '.dashboard-panel', '.leaderboard-panel', '.rewards-panel', '.scorecard-panel', '.learner-stats-panel'],
    sets: ['.sets-panel'],
    settings: ['.settings-panel', '.editor-panel'],
  };

  const saved = localStorage.getItem('sws-tab') || 'play';

  // --- Inject CSS ---
  const css = document.createElement('style');
  css.textContent = `
    /* Tab bar */
    #swsTabBar {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9000;
      display: flex;
      justify-content: space-around;
      align-items: stretch;
      height: calc(56px + env(safe-area-inset-bottom, 0px));
      padding-bottom: env(safe-area-inset-bottom, 0px);
      background: var(--surface-1);
      border-top: 1px solid var(--separator);
      -webkit-backdrop-filter: blur(20px);
      backdrop-filter: blur(20px);
    }

    .sws-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      border: none;
      background: none;
      color: var(--text-3);
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      cursor: pointer;
      padding: 6px 0;
      min-height: auto;
      border-radius: 0;
      transition: color 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }

    .sws-tab:active { transform: none; opacity: 0.7; }

    .sws-tab .tab-icon {
      font-size: 1.3rem;
      line-height: 1;
    }

    .sws-tab.active {
      color: var(--accent);
    }

    /* Hide all panels by default */
    .panel, .hero, .studio-grid {
      display: none !important;
    }

    /* Show panels for active tab */
    [data-active-tab="play"] .hero { display: grid !important; }
    [data-active-tab="play"] .game-panel { display: block !important; }

    [data-active-tab="stats"] .coach-panel { display: block !important; }
    [data-active-tab="stats"] .dashboard-panel { display: block !important; }
    [data-active-tab="stats"] .leaderboard-panel { display: block !important; }
    [data-active-tab="stats"] .rewards-panel { display: block !important; }
    [data-active-tab="stats"] .scorecard-panel { display: block !important; }
    [data-active-tab="stats"] .learner-stats-panel { display: block !important; }

    [data-active-tab="sets"] .sets-panel { display: block !important; }

    [data-active-tab="settings"] .settings-panel { display: block !important; }
    [data-active-tab="settings"] .editor-panel { display: block !important; }

    /* studio-grid wraps settings + coach — break it out */
    [data-active-tab="stats"] .studio-grid,
    [data-active-tab="settings"] .studio-grid {
      display: grid !important;
    }

    /* But only show relevant child */
    [data-active-tab="stats"] .studio-grid .settings-panel { display: none !important; }
    [data-active-tab="settings"] .studio-grid .coach-panel { display: none !important; }

    /* Bottom padding for tab bar */
    .app-shell {
      padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)) !important;
    }

    /* Review mode override — show everything in game panel, hide tab bar */
    .game-panel.review-active ~ #swsTabBar,
    body.review-active #swsTabBar {
      display: none;
    }

    /* Smooth page transition */
    .panel, .hero {
      animation: tabFadeIn 0.25s ease both;
    }

    @keyframes tabFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(css);

  // --- Build Tab Bar ---
  const bar = document.createElement('nav');
  bar.id = 'swsTabBar';

  tabs.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'sws-tab' + (t.id === saved ? ' active' : '');
    btn.dataset.tab = t.id;
    btn.innerHTML = '<span class="tab-icon">' + t.icon + '</span>' + t.label;
    btn.addEventListener('click', () => switchTab(t.id));
    bar.appendChild(btn);
  });

  document.body.appendChild(bar);

  // --- Tab Switching ---
  function switchTab(id) {
    // Set active tab on app-shell
    const shell = document.querySelector('.app-shell');
    if (shell) shell.setAttribute('data-active-tab', id);

    // Update tab buttons
    bar.querySelectorAll('.sws-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === id);
    });

    // Persist
    localStorage.setItem('sws-tab', id);

    // Scroll to top
    window.scrollTo(0, 0);
  }

  // Initialize
  switchTab(saved);
})();
