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

    /* Hide all panels by default, but NOT the hero-card inside .hero */
    .panel, .hero, .studio-grid {
      display: none !important;
    }

    /* Show panels for active tab */
    [data-active-tab="play"] .hero { display: grid !important; }
    [data-active-tab="play"] .hero .hero-card { display: block !important; }
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

/* Number Review extension */
(function() {
  const NUMBER_REVIEW_LENGTH = 18;
  const NUMBER_FOCUS = [
    ...Array.from({ length: 9 }, (_, index) => String(index + 11)),
    '21', '31', '41', '51', '61', '71', '81', '91',
  ];
  const NUMBER_EXTRAS = Array.from({ length: 101 }, (_, index) => String(index))
    .filter((number) => !NUMBER_FOCUS.includes(number));

  const css = document.createElement('style');
  css.textContent = `
    .number-review-button {
      background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(251,191,36,0.22)) !important;
      color: var(--accent) !important;
    }
  `;
  document.head.appendChild(css);

  function makeButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary number-review-button';
    button.textContent = 'Review Numbers';
    button.addEventListener('click', startNumberReviewSession);
    return button;
  }

  const settingsButton = makeButton();
  settingsButton.id = 'reviewNumbersBtn';
  const stageButton = makeButton();
  stageButton.id = 'reviewNumbersStageBtn';

  const settingsAnchor = document.getElementById('reviewNowBtn');
  if (settingsAnchor) settingsAnchor.insertAdjacentElement('afterend', settingsButton);

  const stageAnchor = document.getElementById('reviewSetBtn');
  if (stageAnchor) stageAnchor.insertAdjacentElement('afterend', stageButton);

  function buildNumberReviewQueue() {
    const focusPool = shuffleList([
      ...NUMBER_FOCUS,
      ...NUMBER_FOCUS,
      ...NUMBER_FOCUS,
      ...NUMBER_FOCUS.slice(0, 9),
    ]);
    const extrasPool = shuffleList(NUMBER_EXTRAS);
    const queue = [];

    for (let index = 0; index < NUMBER_REVIEW_LENGTH; index += 1) {
      const useExtra = index > 0 && (index + 1) % 5 === 0;
      const pool = useExtra ? extrasPool : focusPool;
      if (pool.length === 0) {
        pool.push(...shuffleList(useExtra ? NUMBER_EXTRAS : NUMBER_FOCUS));
      }
      queue.push(pool.shift());
    }

    return queue;
  }

  function sessionTypeLabel(type = state.session.type) {
    if (type === 'number-review') return 'Number Review';
    if (type === 'set-review') return 'Whole Set Review';
    return 'Set Mastery';
  }

  function sessionSetLabel(entry) {
    return entry.type === 'number-review' ? 'Numbers' : formatSetLabel(entry.setIndex);
  }

  const originalGetSessionQueue = getSessionQueue;
  getSessionQueue = function patchedGetSessionQueue(learner) {
    if (state.session.type === 'number-review') return buildNumberReviewQueue();
    return originalGetSessionQueue(learner);
  };

  const originalGetNextWord = getNextWord;
  getNextWord = function patchedGetNextWord() {
    if (state.session.type !== 'number-review') return originalGetNextWord();
    if (state.session.queue.length === 0) return null;
    return state.session.queue.shift() || null;
  };

  const originalStagePrompt = stagePrompt;
  stagePrompt = function patchedStagePrompt(mode, wordText) {
    if (mode === 'number-review') return 'Read this number';
    return originalStagePrompt(mode, wordText);
  };

  beginRound = function patchedBeginRound() {
    clearTimer();
    clearFeedback();

    const wordText = getNextWord();
    if (!wordText) {
      finishSession();
      return;
    }

    state.session.currentWord = wordText;
    state.lastWord = wordText;
    elements.wordLabel.textContent = stagePrompt(state.session.type, wordText);
    elements.wordText.textContent = wordText;
    elements.wordStageTag.textContent = state.session.type === 'number-review'
      ? 'Number review'
      : state.session.type === 'set-review'
        ? 'Set review'
        : 'Mastery';
    elements.roundStatusTag.textContent = state.session.type === 'number-review'
      ? 'Teen focus'
      : state.session.type === 'set-review'
        ? 'One pass only'
        : 'Live round';
    elements.lastWordText.textContent = wordText;
    startTimer();
    updateInteractionModeUI();
    saveState();
  };

  const originalHandleAnswer = handleAnswer;
  handleAnswer = function patchedHandleAnswer(isPass, timedOut = false) {
    if (state.session.type !== 'number-review') {
      originalHandleAnswer(isPass, timedOut);
      return;
    }

    if (!state.session.active || !state.session.currentWord) return;

    clearTimer();
    const wordText = state.session.currentWord;
    state.session.roundsPlayed += 1;
    pushRecentWord(wordText);

    if (isPass) {
      state.session.correct += 1;
      state.session.streak += 1;
      state.session.bestStreak = Math.max(state.session.bestStreak, state.session.streak);
      trackSessionWord(wordText, 'correct');
      triggerFeedback('success');
      playSuccessTone();
      elements.roundStatusTag.textContent = 'Number got it';
    } else {
      state.session.incorrect += 1;
      state.session.streak = 0;
      trackSessionWord(wordText, 'practice');
      triggerFeedback('fail');
      playFailTone();
      elements.roundStatusTag.textContent = timedOut ? 'Timed out' : 'Try this number again';
    }

    state.lastWord = wordText;
    elements.lastWordText.textContent = `${wordText} ${isPass ? 'passed' : 'needs another try'}`;
    updateCurrentPlayerDisplay();
    updateCoachBoard();
    saveState();

    const finished = state.session.queue.length === 0;
    state.session.currentWord = null;

    if (finished) {
      finishSession();
      return;
    }

    setTimeout(beginRound, 450);
  };

  const originalUpdateCurrentPlayerDisplay = updateCurrentPlayerDisplay;
  updateCurrentPlayerDisplay = function patchedUpdateCurrentPlayerDisplay() {
    originalUpdateCurrentPlayerDisplay();
    if (state.session.type === 'number-review') {
      elements.sessionModeText.textContent = 'Number Review';
      if (state.session.active) elements.playerModeLabel.textContent = 'Reviewing numbers';
    }
  };

  const originalUpdateCoachBoard = updateCoachBoard;
  updateCoachBoard = function patchedUpdateCoachBoard() {
    originalUpdateCoachBoard();
    if (state.session.type === 'number-review' && state.session.active) {
      elements.encouragementText.textContent = 'Number review is active. Focus on 11 through 19 and their reversed forms.';
      elements.strategyText.textContent = 'Keep it quick and visual. Mixed extras appear occasionally so the pattern stays honest.';
    }
  };

  const originalUpdateInteractionModeUI = updateInteractionModeUI;
  updateInteractionModeUI = function patchedUpdateInteractionModeUI() {
    originalUpdateInteractionModeUI();
    const learner = getActiveLearner();
    const numberReviewActive = state.session.active && state.session.type === 'number-review';
    settingsButton.disabled = !learner || state.session.active;
    stageButton.disabled = !learner || state.session.active;
    if (numberReviewActive) {
      elements.failBtn.classList.remove('hidden');
      elements.failBtn.disabled = !state.session.currentWord;
      elements.passBtn.classList.remove('review-primary');
      elements.stageHintText.textContent = 'Number review focuses on 11-19 and reversed forms like 91, 81, 71, and 61.';
    }
  };

  const originalUpdateCelebrationCard = updateCelebrationCard;
  updateCelebrationCard = function patchedUpdateCelebrationCard() {
    if (state.session.type !== 'number-review') {
      originalUpdateCelebrationCard();
      return;
    }

    elements.celebrationCard.classList.remove('hidden');
    elements.celebrationEyebrow.textContent = 'Number review complete';
    elements.celebrationTitle.textContent = 'Teen numbers got a focused pass.';
    elements.celebrationCopy.textContent = 'Number review keeps sight-word mastery unchanged and gives tricky numbers their own lane.';
    elements.celebrationMeta.textContent = `${state.session.correct} of ${state.session.roundsPlayed} numbers were marked correct.`;
  };

  const originalBuildReflectionText = buildReflectionText;
  buildReflectionText = function patchedBuildReflectionText() {
    if (state.session.type === 'number-review') {
      return 'Number review gives teen numbers and reversed forms a quick confidence check without changing word mastery.';
    }
    return originalBuildReflectionText();
  };

  const originalUpdateScorecardActions = updateScorecardActions;
  updateScorecardActions = function patchedUpdateScorecardActions() {
    if (state.session.type !== 'number-review') {
      originalUpdateScorecardActions();
      return;
    }

    elements.nextStepCard.classList.remove('hidden');
    elements.nextSetBtn.classList.add('hidden');
    elements.reviewCompletedSetBtn.classList.remove('hidden');
    elements.nextStepText.textContent = 'Number review is done. Return to sight-word mastery whenever you are ready.';
    elements.reviewCompletedSetBtn.textContent = 'Review Numbers Again';
    elements.newSessionBtn.textContent = 'Practice Current Set';
  };

  const originalUpdateLeaderboard = updateLeaderboard;
  updateLeaderboard = function patchedUpdateLeaderboard() {
    const learner = getActiveLearner();
    if (!learner || learner.history.length === 0) {
      originalUpdateLeaderboard();
      return;
    }

    elements.leaderboardList.innerHTML = learner.history
      .slice(-8)
      .reverse()
      .map((entry, index) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">${index + 1}</div>
          <div>
            <div class="leaderboard-name">${sessionSetLabel(entry)} · ${sessionTypeLabel(entry.type)}</div>
            <div class="leaderboard-meta">${entry.accuracy}% accuracy · ${entry.correct} correct · ${entry.masteredThisSession} mastered</div>
          </div>
          <div class="leaderboard-score">${entry.completedSet ? 'Set done' : `${entry.correct} pts`}</div>
        </div>
      `)
      .join('');
  };

  const originalUpdateStatsPanel = updateStatsPanel;
  updateStatsPanel = function patchedUpdateStatsPanel() {
    originalUpdateStatsPanel();
    const learner = getActiveLearner();
    if (!learner || learner.history.length === 0) return;

    elements.statsHistoryList.innerHTML = learner.history
      .slice(-8)
      .reverse()
      .map((entry) => `
        <div class="leaderboard-row">
          <div class="leaderboard-rank">${entry.type === 'number-review' ? 'N' : entry.type === 'set-review' ? 'R' : 'M'}</div>
          <div>
            <div class="leaderboard-name">${sessionSetLabel(entry)}</div>
            <div class="leaderboard-meta">${entry.accuracy}% accuracy · ${entry.correct} correct · ${entry.masteredThisSession} mastered</div>
          </div>
          <div class="leaderboard-score">${entry.completedSet ? 'Unlocked' : 'Done'}</div>
        </div>
      `)
      .join('');
  };

  const originalStartNewSession = startNewSession;
  startNewSession = function patchedStartNewSession() {
    if (state.session.type === 'number-review') {
      startCurrentSetMastery();
      return;
    }
    originalStartNewSession();
  };

  const originalStartReviewSession = startReviewSession;
  startReviewSession = function patchedStartReviewSession(setIndex = null) {
    if (state.session.type === 'number-review' && setIndex === state.session.setIndex) {
      startNumberReviewSession();
      return;
    }
    originalStartReviewSession(setIndex);
  };

  function startNumberReviewSession() {
    const learner = getActiveLearner();
    if (!learner) return;
    startSession('number-review', learner.activeSetIndex);
  }

  const originalAttachEvents = attachEvents;
  attachEvents = function patchedAttachEvents() {
    originalAttachEvents();
    elements.reviewCompletedSetBtn.addEventListener('click', () => {
      if (state.session.type === 'number-review') startNumberReviewSession();
    });
  };

  updateInteractionModeUI();
})();
