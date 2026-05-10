/* Bottom Tab Navigation — Single Page App Feel */
(function() {
  const tabs = [
    { id: 'words', icon: 'Aa', label: 'Words' },
    { id: 'numbers', icon: '123', label: 'Numbers' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  // Map tabs to panel classes/IDs
  const tabPanels = {
    words: ['.hero', '.word-recognition-panel', '.sets-panel'],
    numbers: ['.number-recognition-panel'],
    stats: ['.coach-panel', '.dashboard-panel', '.leaderboard-panel', '.rewards-panel', '.scorecard-panel', '.learner-stats-panel'],
    settings: ['.settings-panel', '.editor-panel'],
  };

  const savedTab = localStorage.getItem('sws-tab') || 'words';
  const saved = savedTab === 'play' || savedTab === 'sets' ? 'words' : savedTab;

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
    [data-active-tab="words"] .hero { display: grid !important; }
    [data-active-tab="words"] .hero .hero-card { display: block !important; }
    [data-active-tab="words"] .word-recognition-panel { display: block !important; }
    [data-active-tab="words"] .sets-panel { display: block !important; }

    [data-active-tab="numbers"] .number-recognition-panel { display: block !important; }

    [data-active-tab="stats"] .coach-panel { display: block !important; }
    [data-active-tab="stats"] .dashboard-panel { display: block !important; }
    [data-active-tab="stats"] .leaderboard-panel { display: block !important; }
    [data-active-tab="stats"] .rewards-panel { display: block !important; }
    [data-active-tab="stats"] .scorecard-panel { display: block !important; }
    [data-active-tab="stats"] .learner-stats-panel { display: block !important; }

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

    /* Active session override — show the shared practice surface and hide tab bar */
    .game-panel.review-active ~ #swsTabBar,
    .game-panel.practice-active ~ #swsTabBar,
    body.review-active #swsTabBar,
    body.practice-active #swsTabBar,
    body.new-words-setup-active #swsTabBar {
      display: none;
    }

    body.review-active .game-panel,
    body.practice-active .game-panel,
    body.new-words-setup-active .game-panel {
      display: block !important;
    }

    /* Smooth page transition.
       Opacity-only — a residual transform here would create a stacking
       context on each panel and let it paint above the fixed tab bar. */
    .panel, .hero {
      animation: tabFadeIn 0.25s ease both;
    }

    @keyframes tabFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
    '10',
    ...Array.from({ length: 9 }, (_, index) => String(index + 11)),
    '21', '31', '41', '51', '61', '71', '81', '91',
  ];
  const NUMBER_EXTRAS = Array.from({ length: 101 }, (_, index) => String(index))
    .filter((number) => !NUMBER_FOCUS.includes(number));
  const NUMBER_SESSION_TYPES = ['number-review', 'price-review', 'range-review', 'next-number', 'count-by-review'];
  const countBySettings = {
    step: 10,
    start: 0,
    random: false,
  };

  const css = document.createElement('style');
  css.textContent = `
    .number-review-button {
      background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(251,191,36,0.22)) !important;
      color: var(--accent) !important;
    }
  `;
  document.head.appendChild(css);

  function makeButton(getType = () => 'number-review') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary number-review-button';
    button.textContent = 'Review Numbers';
    button.addEventListener('click', () => startNumberReviewSession(getType()));
    return button;
  }

  let scorecardNumberSessionType = 'number-review';
  const settingsButton = makeButton();
  settingsButton.id = 'reviewNumbersBtn';
  const stageButton = makeButton();
  stageButton.id = 'reviewNumbersStageBtn';
  const scorecardButton = makeButton(() => scorecardNumberSessionType);
  scorecardButton.id = 'reviewNumbersScorecardBtn';

  const settingsAnchor = document.getElementById('reviewNowBtn');
  if (settingsAnchor) settingsAnchor.insertAdjacentElement('afterend', settingsButton);

  const scorecardAnchor = document.getElementById('reviewCompletedSetBtn');
  if (scorecardAnchor) scorecardAnchor.insertAdjacentElement('afterend', scorecardButton);

  document.getElementById('numberTeenFocusBtn')?.addEventListener('click', () => startNumberReviewSession('number-review'));
  document.getElementById('numberPricesBtn')?.addEventListener('click', () => startNumberReviewSession('price-review'));
  document.getElementById('numberRangeBtn')?.addEventListener('click', () => startNumberReviewSession('range-review'));
  document.getElementById('numberNextBtn')?.addEventListener('click', () => startNumberReviewSession('next-number'));
  const countBySetup = document.getElementById('countBySetup');
  const countByStep = document.getElementById('countByStep');
  const countByStart = document.getElementById('countByStart');
  const countByRandom = document.getElementById('countByRandom');
  const numberCountByBtn = document.getElementById('numberCountByBtn');
  const startCountByBtn = document.getElementById('startCountByBtn');
  const closeCountBySetupBtn = document.getElementById('closeCountBySetupBtn');

  function openCountBySetup() {
    if (!countBySetup || !countByStep || !countByStart || !countByRandom) return;
    countByStep.value = String(countBySettings.step);
    countByStart.value = countBySettings.start;
    countByRandom.checked = countBySettings.random;
    countBySetup.classList.remove('hidden');
    countByStep.focus();
  }

  function closeCountBySetup() {
    if (!countBySetup) return;
    countBySetup.classList.add('hidden');
  }

  numberCountByBtn?.addEventListener('click', openCountBySetup);
  closeCountBySetupBtn?.addEventListener('click', closeCountBySetup);
  startCountByBtn?.addEventListener('click', () => {
    countBySettings.step = Number(countByStep.value) === 5 ? 5 : 10;
    countBySettings.start = Math.max(0, Math.min(999, Number(countByStart.value) || 0));
    countBySettings.random = countByRandom.checked;
    closeCountBySetup();
    startNumberReviewSession('count-by-review');
  });

  function isNumberSession(type = state.session.type) {
    return NUMBER_SESSION_TYPES.includes(type);
  }

  function buildTeenNumberQueue() {
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

  function buildPriceQueue() {
    const prices = [];
    for (let dollars = 1; dollars <= 99; dollars += 1) {
      for (let cents = 0; cents <= 99; cents += 1) {
        prices.push(`$${dollars}.${String(cents).padStart(2, '0')}`);
      }
    }
    return shuffleList(prices).slice(0, NUMBER_REVIEW_LENGTH);
  }

  function buildRangeQueue() {
    const min = Math.max(0, Math.min(999, Number(state.customNumberRange?.min) || 1));
    const max = Math.max(1, Math.min(999, Number(state.customNumberRange?.max) || 100));
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    const range = Array.from({ length: high - low + 1 }, (_, index) => String(low + index));
    const pool = range.length >= NUMBER_REVIEW_LENGTH
      ? shuffleList(range)
      : shuffleList(Array.from({ length: Math.ceil(NUMBER_REVIEW_LENGTH / range.length) }, () => range).flat());
    return pool.slice(0, NUMBER_REVIEW_LENGTH);
  }

  function buildNextNumberQueue() {
    const endingInNine = shuffleList(Array.from({ length: 9 }, (_, index) => String(index * 10 + 9)));
    const others = shuffleList(Array.from({ length: 90 }, (_, index) => String(index + 1)).filter((number) => !number.endsWith('9')));
    const queue = [];

    for (let index = 0; index < NUMBER_REVIEW_LENGTH; index += 1) {
      const useNine = index % 10 < 3;
      queue.push((useNine ? endingInNine : others).shift() || others.shift() || endingInNine.shift());
    }

    return shuffleList(queue.filter(Boolean));
  }

  function buildCountByQueue() {
    const step = countBySettings.step;
    const start = Math.floor(countBySettings.start / step) * step;
    const count = NUMBER_REVIEW_LENGTH;
    const sequence = Array.from({ length: count }, (_, index) => String(start + (index * step)));
    if (!countBySettings.random) return sequence;

    const basePool = Array.from({ length: Math.floor(100 / step) + 1 }, (_, index) => String(start + (index * step)));
    const randomPool = Array.from({ length: Math.ceil(count / basePool.length) }, () => basePool).flat();
    return shuffleList(randomPool).slice(0, count);
  }

  function buildNumberReviewQueue() {
    if (state.session.type === 'price-review') return buildPriceQueue();
    if (state.session.type === 'range-review') return buildRangeQueue();
    if (state.session.type === 'next-number') return buildNextNumberQueue();
    if (state.session.type === 'count-by-review') return buildCountByQueue();
    return buildTeenNumberQueue();
  }

  function renderNumberSequencePrompt(currentNumber) {
    const prompt = document.createElement('span');
    prompt.className = 'next-number-prompt';
    prompt.setAttribute('aria-label', `${currentNumber}, what comes next?`);

    const current = document.createElement('span');
    current.className = 'next-number-current';
    current.textContent = currentNumber;

    const path = document.createElement('span');
    path.className = 'next-number-path';
    path.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 3; index += 1) {
      path.appendChild(document.createElement('span'));
    }

    const question = document.createElement('span');
    question.className = 'next-number-question';
    question.setAttribute('aria-hidden', 'true');
    question.textContent = '?';

    prompt.append(current, path, question);
    elements.wordText.replaceChildren(prompt);
  }

  function renderNextNumberPrompt(currentNumber) {
    renderNumberSequencePrompt(currentNumber);
  }

  function renderCountByPrompt(currentNumber) {
    renderNumberSequencePrompt(currentNumber);
  }

  function renderNumberSequenceReveal(currentNumber, nextNumber, isPass) {
    const reveal = document.createElement('span');
    reveal.className = `next-number-reveal ${isPass ? 'correct' : 'incorrect'}`;
    reveal.setAttribute('aria-label', `${currentNumber} then ${nextNumber}`);

    const current = document.createElement('span');
    current.className = 'next-number-current';
    current.textContent = currentNumber;

    const path = document.createElement('span');
    path.className = 'next-number-path';
    path.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 3; index += 1) {
      path.appendChild(document.createElement('span'));
    }

    const next = document.createElement('span');
    next.className = 'next-number-next';

    const shadow = document.createElement('span');
    shadow.className = 'next-number-shadow';
    shadow.setAttribute('aria-hidden', 'true');
    shadow.textContent = nextNumber;

    const value = document.createElement('span');
    value.className = 'next-number-value';
    value.textContent = nextNumber;

    next.append(shadow, value);
    reveal.append(current, path, next);
    elements.wordText.replaceChildren(reveal);
  }

  function renderNextNumberReveal(currentNumber, nextNumber, isPass) {
    renderNumberSequenceReveal(currentNumber, nextNumber, isPass);
  }

  function renderCountByReveal(currentNumber, nextNumber, isPass) {
    renderNumberSequenceReveal(currentNumber, nextNumber, isPass);
  }

  function sessionTypeLabel(type = state.session.type) {
    if (type === 'number-review') return '10-19 Focus';
    if (type === 'price-review') return 'Prices';
    if (type === 'range-review') return 'Custom Range';
    if (type === 'next-number') return 'Next Number';
    if (type === 'count-by-review') return `Count by ${countBySettings.step}s`;
    if (type === 'set-review') return 'Whole Set Review';
    return 'Set Mastery';
  }

  function sessionSetLabel(entry) {
    return isNumberSession(entry.type) ? sessionTypeLabel(entry.type) : formatSetLabel(entry.setIndex);
  }

  const originalGetSessionQueue = getSessionQueue;
  getSessionQueue = function patchedGetSessionQueue(learner) {
    if (isNumberSession()) return buildNumberReviewQueue();
    return originalGetSessionQueue(learner);
  };

  const originalGetNextWord = getNextWord;
  getNextWord = function patchedGetNextWord() {
    if (!isNumberSession()) return originalGetNextWord();
    if (state.session.queue.length === 0) return null;
    return state.session.queue.shift() || null;
  };

  const originalStagePrompt = stagePrompt;
  stagePrompt = function patchedStagePrompt(mode, wordText) {
    if (mode === 'price-review') return 'Read this price';
    if (mode === 'range-review') return 'Read this number';
    if (mode === 'next-number') return 'What comes next?';
    if (mode === 'count-by-review') return `What comes next by ${countBySettings.step}s?`;
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

    state.session.paused = false;
    state.session.pausedRemainingMs = null;
    state.session.currentWord = wordText;
    state.lastWord = wordText;
    elements.wordLabel.textContent = stagePrompt(state.session.type, wordText);
    if (state.session.type === 'next-number') {
      renderNextNumberPrompt(wordText);
    } else if (state.session.type === 'count-by-review') {
      renderCountByPrompt(wordText);
    } else {
      elements.wordText.textContent = wordText;
    }
    elements.wordStageTag.textContent = isNumberSession()
      ? sessionTypeLabel()
      : state.session.type === 'set-review'
        ? 'Set review'
        : 'Mastery';
    elements.roundStatusTag.textContent = isNumberSession()
      ? 'Number recognition'
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
    if (!isNumberSession()) {
      originalHandleAnswer(isPass, timedOut);
      return;
    }

    if (!state.session.active || !state.session.currentWord || state.session.paused) return;

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
    if (state.session.type === 'next-number' || state.session.type === 'count-by-review') {
      const step = state.session.type === 'count-by-review' ? countBySettings.step : 1;
      const nextNumber = String(Number(wordText) + step);
      if (state.session.type === 'count-by-review') {
        renderCountByReveal(wordText, nextNumber, isPass);
      } else {
        renderNextNumberReveal(wordText, nextNumber, isPass);
      }
      elements.lastWordText.textContent = `${wordText} -> ${nextNumber}`;
    } else {
      elements.lastWordText.textContent = `${wordText} ${isPass ? 'passed' : 'needs another try'}`;
    }
    updateCurrentPlayerDisplay();
    updateCoachBoard();
    saveState();

    const finished = state.session.queue.length === 0;
    state.session.currentWord = null;

    if (finished) {
      finishSession();
      return;
    }

    setTimeout(beginRound, ['next-number', 'count-by-review'].includes(state.session.type) ? 1300 : 450);
  };

  const originalUpdateCurrentPlayerDisplay = updateCurrentPlayerDisplay;
  updateCurrentPlayerDisplay = function patchedUpdateCurrentPlayerDisplay() {
    originalUpdateCurrentPlayerDisplay();
    if (isNumberSession()) {
      elements.sessionModeText.textContent = sessionTypeLabel();
      if (state.session.active) elements.playerModeLabel.textContent = sessionTypeLabel();
    }
  };

  const originalUpdateCoachBoard = updateCoachBoard;
  updateCoachBoard = function patchedUpdateCoachBoard() {
    originalUpdateCoachBoard();
    if (isNumberSession() && state.session.active) {
      elements.encouragementText.textContent = `${sessionTypeLabel()} is active.`;
      elements.strategyText.textContent = state.session.type === 'price-review'
        ? 'Prices are practice only and are not saved to learner stats.'
        : 'Keep it quick and visual. Mixed extras appear occasionally so the pattern stays honest.';
    }
  };

  const originalUpdateInteractionModeUI = updateInteractionModeUI;
  updateInteractionModeUI = function patchedUpdateInteractionModeUI() {
    originalUpdateInteractionModeUI();
    const learner = getActiveLearner();
    const numberReviewActive = state.session.active && isNumberSession();
    settingsButton.disabled = !learner || state.session.active;
    stageButton.disabled = !learner || state.session.active;
    scorecardButton.disabled = !learner || state.session.active;
    if (numberCountByBtn) numberCountByBtn.disabled = !learner || state.session.active;
    if (startCountByBtn) startCountByBtn.disabled = !learner || state.session.active;
    if (numberReviewActive) {
      elements.failBtn.classList.remove('hidden');
      elements.failBtn.disabled = !state.session.currentWord;
      elements.failBtn.textContent = state.session.paused ? 'Resume' : 'Pause';
      elements.passBtn.classList.remove('review-primary');
      elements.reviewBannerTitle.textContent = state.session.paused
        ? `${sessionTypeLabel()} is paused.`
        : `${sessionTypeLabel()} is full screen.`;
      elements.reviewBannerCopy.textContent = state.session.paused
        ? 'The timer is stopped. Resume when you are ready, or swipe left to close review.'
        : state.session.type === 'price-review'
        ? 'Read each price. This is practice only, so it will not be saved to learner stats.'
        : 'Tap I Got It for correct answers, Pause for a break, or swipe left to close review.';
      elements.stageHintText.textContent = state.session.paused
        ? 'Paused. Tap Resume when you are ready.'
        : state.session.type === 'next-number'
        ? 'Say the number that comes next. The next number appears after the parent marks the answer.'
        : state.session.type === 'count-by-review'
        ? `Say the next number when counting by ${countBySettings.step}s. The answer appears after the parent marks it.`
        : 'Number recognition practice does not change sight-word mastery.';
    }
  };

  const originalUpdateCelebrationCard = updateCelebrationCard;
  updateCelebrationCard = function patchedUpdateCelebrationCard() {
    if (!isNumberSession()) {
      originalUpdateCelebrationCard();
      return;
    }

    elements.celebrationCard.classList.remove('hidden');
    elements.celebrationEyebrow.textContent = `${sessionTypeLabel()} complete`;
    elements.celebrationTitle.textContent = `${sessionTypeLabel()} got a focused pass.`;
    elements.celebrationCopy.textContent = state.session.type === 'price-review'
      ? 'Price practice is not saved to learner stats.'
      : 'Number recognition keeps sight-word mastery unchanged and gives tricky numbers their own lane.';
    elements.celebrationMeta.textContent = `${state.session.correct} of ${state.session.roundsPlayed} prompts were marked correct.`;
  };

  const originalBuildReflectionText = buildReflectionText;
  buildReflectionText = function patchedBuildReflectionText() {
    if (isNumberSession()) {
      return `${sessionTypeLabel()} gives number recognition a quick confidence check without changing word mastery.`;
    }
    return originalBuildReflectionText();
  };

  const originalUpdateScorecardActions = updateScorecardActions;
  updateScorecardActions = function patchedUpdateScorecardActions() {
    if (!isNumberSession()) {
      originalUpdateScorecardActions();
      return;
    }

    elements.nextStepCard.classList.remove('hidden');
    scorecardNumberSessionType = state.session.type;
    elements.nextSetBtn.classList.add('hidden');
    elements.reviewCompletedSetBtn.classList.remove('hidden');
    elements.nextStepText.textContent = `${sessionTypeLabel()} is done. Return to sight-word mastery whenever you are ready.`;
    elements.reviewCompletedSetBtn.textContent = `Review ${formatSetLabel(state.session.setIndex)}`;
    scorecardButton.textContent = `${sessionTypeLabel()} Again`;
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
        <div class="leaderboard-rank">${isNumberSession(entry.type) ? 'N' : entry.type === 'set-review' ? 'R' : 'M'}</div>
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

  function startNumberReviewSession(type = 'number-review') {
    const learner = getActiveLearner();
    if (!learner) return;
    closeCountBySetup();
    startSession(type, learner.activeSetIndex);
    if (type === 'price-review') state.session.skipHistory = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const originalAttachEvents = attachEvents;
  attachEvents = function patchedAttachEvents() {
    originalAttachEvents();
  };

  updateInteractionModeUI();
})();
