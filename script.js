const STORAGE_KEY = 'sightWordsMissionV1';
const DEFAULT_TIMER_SECONDS = 8;
const DEFAULT_ROUND_LENGTH = 12;
const WEEKLY_WORD_LIMIT = 2;
const LEARNED_TARGET = 3;
const NUMBER_FOCUS = [
  ...Array.from({ length: 9 }, (_, index) => String(index + 11)),
  '21', '31', '41', '51', '61', '71', '81', '91',
];
const NUMBER_EXTRAS = Array.from({ length: 101 }, (_, index) => String(index))
  .filter((number) => !NUMBER_FOCUS.includes(number));
const DEFAULT_WORDS = [
  'I', 'a', 'the', 'and', 'is', 'in', 'to', 'it', 'at', 'up',
  'big', 'but', 'get', 'no', 'do', 'of', 'not', 'if', 'on', 'am',
  'as', 'off', 'can',
  'said', 'did', 'sit', 'cut', 'man', 'red', 'blue', 'yellow', 'pink', 'see',
  'cookie', 'Mom', 'Dad', 'James', 'Michael', 'Andrew', 'sick', 'go', 'like', 'we'
];

const elements = {
  connectionStatus: document.getElementById('connectionStatus'),
  missionText: document.getElementById('missionText'),
  missionMeterFill: document.getElementById('missionMeterFill'),
  learnerSelect: document.getElementById('learnerSelect'),
  learnerNameInput: document.getElementById('learnerNameInput'),
  addLearnerBtn: document.getElementById('addLearnerBtn'),
  resetLearnerBtn: document.getElementById('resetLearnerBtn'),
  weeklyWordsInput: document.getElementById('weeklyWordsInput'),
  saveWeeklyWordsBtn: document.getElementById('saveWeeklyWordsBtn'),
  weeklyWordsList: document.getElementById('weeklyWordsList'),
  timerInput: document.getElementById('timerInput'),
  roundLengthInput: document.getElementById('roundLengthInput'),
  reviewNumbersBtn: document.getElementById('reviewNumbersBtn'),
  startRoundBtn: document.getElementById('startRoundBtn'),
  reviewAllBtn: document.getElementById('reviewAllBtn'),
  stopRoundBtn: document.getElementById('stopRoundBtn'),
  roundModeLabel: document.getElementById('roundModeLabel'),
  timerValue: document.getElementById('timerValue'),
  timerFill: document.getElementById('timerFill'),
  wordCard: document.getElementById('wordCard'),
  wordText: document.getElementById('wordText'),
  learnedBtn: document.getElementById('learnedBtn'),
  practiceBtn: document.getElementById('practiceBtn'),
  skipBtn: document.getElementById('skipBtn'),
  stageNote: document.getElementById('stageNote'),
  learnedCount: document.getElementById('learnedCount'),
  practiceCount: document.getElementById('practiceCount'),
  totalCount: document.getElementById('totalCount'),
  roundCount: document.getElementById('roundCount'),
  practiceWordsList: document.getElementById('practiceWordsList'),
  learnedWordsList: document.getElementById('learnedWordsList'),
  wordBankText: document.getElementById('wordBankText'),
  saveWordBankBtn: document.getElementById('saveWordBankBtn'),
  loadDefaultsBtn: document.getElementById('loadDefaultsBtn'),
};

let timerId = null;

const state = {
  wordList: [...DEFAULT_WORDS],
  learners: [],
  activeLearnerId: null,
  timerSeconds: DEFAULT_TIMER_SECONDS,
  roundLength: DEFAULT_ROUND_LENGTH,
  round: createEmptyRound(),
};

function createEmptyRound() {
  return {
    active: false,
    mode: 'mission',
    queue: [],
    currentWord: null,
    currentStartedAt: 0,
    completed: 0,
    target: DEFAULT_ROUND_LENGTH,
  };
}

function createLearner(name) {
  return {
    id: `learner-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    weeklyWords: [],
    progress: {},
    history: [],
  };
}

function normalizeWord(word) {
  return word.trim().toLowerCase();
}

function uniqueWords(words) {
  const seen = new Set();
  return words.filter((word) => {
    const trimmed = word.trim();
    const key = normalizeWord(trimmed);
    if (!trimmed || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((word) => word.trim());
}

function parseWords(text) {
  return uniqueWords(text.split(/[,\n]+/));
}

function wordKey(word) {
  return normalizeWord(word);
}

function makeProgress(word) {
  return {
    word,
    learned: false,
    learnedChecks: 0,
    practiceChecks: 0,
    shown: 0,
    lastSeenAt: 0,
  };
}

function getActiveLearner() {
  return state.learners.find((learner) => learner.id === state.activeLearnerId) || null;
}

function ensureLearner(learner) {
  learner.weeklyWords = uniqueWords(Array.isArray(learner.weeklyWords) ? learner.weeklyWords : [])
    .filter((word) => state.wordList.some((item) => wordKey(item) === wordKey(word)))
    .slice(0, WEEKLY_WORD_LIMIT);
  learner.progress = learner.progress || {};
  state.wordList.forEach((word) => {
    const key = wordKey(word);
    learner.progress[key] = learner.progress[key] || makeProgress(word);
    learner.progress[key].word = word;
  });
  Object.keys(learner.progress).forEach((key) => {
    if (!state.wordList.some((word) => wordKey(word) === key)) {
      delete learner.progress[key];
    }
  });
  learner.history = Array.isArray(learner.history) ? learner.history : [];
}

function learnedWords(learner) {
  return state.wordList.filter((word) => learner.progress[wordKey(word)]?.learned);
}

function practiceWords(learner) {
  return state.wordList.filter((word) => !learner.progress[wordKey(word)]?.learned);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    wordList: state.wordList,
    learners: state.learners,
    activeLearnerId: state.activeLearnerId,
    timerSeconds: state.timerSeconds,
    roundLength: state.roundLength,
  }));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.wordList = uniqueWords(Array.isArray(parsed.wordList) ? parsed.wordList : DEFAULT_WORDS);
      state.learners = Array.isArray(parsed.learners) ? parsed.learners : [];
      state.activeLearnerId = parsed.activeLearnerId || null;
      state.timerSeconds = Number(parsed.timerSeconds) || DEFAULT_TIMER_SECONDS;
      state.roundLength = Number(parsed.roundLength) || DEFAULT_ROUND_LENGTH;
    } catch (error) {
      console.warn('Could not load saved mission data.');
    }
  }

  if (state.learners.length === 0) {
    const learner = createLearner('Reader');
    state.learners.push(learner);
    state.activeLearnerId = learner.id;
  }

  state.learners.forEach(ensureLearner);
  if (!getActiveLearner()) state.activeLearnerId = state.learners[0].id;
}

function pillList(words, type = '') {
  if (words.length === 0) return 'None yet.';
  return words.map((word) => `<span class="pill ${type}">${word}</span>`).join('');
}

function updateLearnerSelect() {
  elements.learnerSelect.innerHTML = state.learners
    .map((learner) => `<option value="${learner.id}">${learner.name}</option>`)
    .join('');
  elements.learnerSelect.value = state.activeLearnerId;
}

function updateMission() {
  const learner = getActiveLearner();
  if (!learner) return;

  const learned = learnedWords(learner).length;
  const total = state.wordList.length;
  const weekly = learner.weeklyWords.length > 0 ? learner.weeklyWords.join(' and ') : 'two new words';
  elements.missionText.textContent = learned >= total
    ? `${learner.name} has learned every word. Keep reviewing.`
    : `Practice ${weekly}; keep all ${total} words warm.`;
  elements.missionMeterFill.style.width = `${total === 0 ? 0 : Math.round((learned / total) * 100)}%`;
}

function updateProgress() {
  const learner = getActiveLearner();
  if (!learner) return;

  const learned = learnedWords(learner);
  const practice = practiceWords(learner);
  elements.learnedCount.textContent = learned.length;
  elements.practiceCount.textContent = practice.length;
  elements.totalCount.textContent = state.wordList.length;
  elements.roundCount.textContent = `${state.round.completed} / ${state.round.target}`;
  elements.weeklyWordsList.innerHTML = pillList(learner.weeklyWords, 'weekly');
  elements.practiceWordsList.innerHTML = pillList(practice.slice(0, 30), 'practice');
  elements.learnedWordsList.innerHTML = pillList(learned.slice(0, 30), 'learned');
}

function updateControls() {
  const roundLive = state.round.active && Boolean(state.round.currentWord);
  elements.learnedBtn.disabled = !roundLive;
  elements.practiceBtn.disabled = !roundLive;
  elements.skipBtn.disabled = !roundLive;
  elements.startRoundBtn.disabled = state.round.active;
  elements.reviewAllBtn.disabled = state.round.active;
  elements.reviewNumbersBtn.disabled = state.round.active;
  elements.stopRoundBtn.disabled = !state.round.active;
}

function updateInputs() {
  const learner = getActiveLearner();
  elements.timerInput.value = state.timerSeconds;
  elements.roundLengthInput.value = state.roundLength;
  elements.weeklyWordsInput.value = learner?.weeklyWords.join(', ') || '';
  elements.wordBankText.value = state.wordList.join('\n');
}

function updateUI() {
  updateLearnerSelect();
  updateMission();
  updateProgress();
  updateControls();
}

function weightedMissionQueue(learner) {
  const weekly = learner.weeklyWords.filter((word) => !learner.progress[wordKey(word)]?.learned);
  const needsPractice = practiceWords(learner).filter((word) => !weekly.some((item) => wordKey(item) === wordKey(word)));
  const learned = learnedWords(learner);
  const queue = [
    ...weekly,
    ...weekly,
    ...weekly,
    ...weekly,
    ...needsPractice,
    ...needsPractice.slice(0, Math.ceil(needsPractice.length / 2)),
    ...learned,
  ];
  return shuffle(queue.length > 0 ? queue : state.wordList);
}

function reviewQueue() {
  return shuffle(state.wordList);
}

function weightedNumberQueue(target) {
  const focusPool = shuffle([
    ...NUMBER_FOCUS,
    ...NUMBER_FOCUS,
    ...NUMBER_FOCUS,
    ...NUMBER_FOCUS.slice(0, 9),
  ]);
  const extrasPool = shuffle(NUMBER_EXTRAS);
  const queue = [];

  for (let index = 0; index < target; index += 1) {
    const useExtra = index > 0 && (index + 1) % 5 === 0;
    const pool = useExtra ? extrasPool : focusPool;
    if (pool.length === 0) {
      pool.push(...shuffle(useExtra ? NUMBER_EXTRAS : NUMBER_FOCUS));
    }
    queue.push(pool.shift());
  }

  return queue;
}

function shuffle(words) {
  const copy = [...words];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function startRound(mode) {
  const learner = getActiveLearner();
  if (!learner) return;

  clearTimer();
  state.round = createEmptyRound();
  state.round.active = true;
  state.round.mode = mode;
  state.round.target = mode === 'review' ? state.wordList.length : state.roundLength;
  if (mode === 'numbers') {
    state.round.queue = weightedNumberQueue(state.round.target);
    elements.roundModeLabel.textContent = 'Number Review';
    elements.stageNote.textContent = 'Focus on teen numbers and their reversed forms, with an occasional other number.';
  } else {
    state.round.queue = mode === 'review' ? reviewQueue() : weightedMissionQueue(learner);
    elements.roundModeLabel.textContent = mode === 'review' ? 'Review All' : 'Mission Round';
    elements.stageNote.textContent = mode === 'review'
      ? 'Every word appears once. Parent decides what still needs practice.'
      : 'Weekly words appear often. Parent decides when each word is learned.';
  }
  nextWord();
}

function nextWord() {
  if (!state.round.active) return;
  if (state.round.completed >= state.round.target || state.round.queue.length === 0) {
    finishRound();
    return;
  }

  state.round.currentWord = state.round.queue.shift();
  state.round.currentStartedAt = Date.now();
  elements.wordText.textContent = state.round.currentWord;
  startTimer();
  updateProgress();
  updateControls();
  saveState();
}

function startTimer() {
  clearTimer();
  elements.timerValue.textContent = state.timerSeconds;
  elements.timerFill.style.width = '100%';
  const startedAt = Date.now();
  timerId = setInterval(() => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, state.timerSeconds * 1000 - elapsed);
    elements.timerValue.textContent = Math.ceil(remaining / 1000);
    elements.timerFill.style.width = `${Math.round((remaining / (state.timerSeconds * 1000)) * 100)}%`;
    if (remaining <= 0) {
      markWord('practice');
    }
  }, 100);
}

function clearTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function markWord(result) {
  const learner = getActiveLearner();
  const word = state.round.currentWord;
  if (!learner || !state.round.active || !word) return;

  clearTimer();
  if (state.round.mode === 'numbers') {
    if (result === 'practice') {
      state.round.queue.push(word);
    }
    state.round.completed += 1;
    state.round.currentWord = null;
    setTimeout(nextWord, 220);
    return;
  }

  const progress = learner.progress[wordKey(word)] || makeProgress(word);
  progress.word = word;
  progress.shown += 1;
  progress.lastSeenAt = Date.now();

  if (result === 'learned') {
    progress.learned = true;
    progress.learnedChecks += 1;
  }

  if (result === 'practice') {
    progress.learned = false;
    progress.practiceChecks += 1;
    if (state.round.mode === 'mission') {
      state.round.queue.push(word);
    }
  }

  learner.progress[wordKey(word)] = progress;
  state.round.completed += 1;
  state.round.currentWord = null;
  setTimeout(nextWord, 220);
}

function finishRound() {
  const learner = getActiveLearner();
  clearTimer();
  if (learner) {
    learner.history.push({
      completedAt: Date.now(),
      mode: state.round.mode,
      completed: state.round.completed,
    });
    learner.history = learner.history.slice(-20);
  }
  state.round.active = false;
  state.round.currentWord = null;
  elements.wordText.textContent = 'Mission complete';
  elements.roundModeLabel.textContent = 'Complete';
  elements.timerValue.textContent = state.timerSeconds;
  elements.timerFill.style.width = '0%';
  elements.stageNote.textContent = 'Start another mission, number review, or review all words when you are ready.';
  updateUI();
  saveState();
}

function stopRound() {
  clearTimer();
  state.round = createEmptyRound();
  elements.wordText.textContent = 'Mission stopped';
  elements.roundModeLabel.textContent = 'Ready';
  elements.timerValue.textContent = state.timerSeconds;
  elements.timerFill.style.width = '0%';
  elements.stageNote.textContent = 'The parent decides whether the child knows the word.';
  updateUI();
  saveState();
}

function addLearner() {
  const name = elements.learnerNameInput.value.trim();
  if (!name) return;
  const learner = createLearner(name);
  ensureLearner(learner);
  state.learners.push(learner);
  state.activeLearnerId = learner.id;
  elements.learnerNameInput.value = '';
  stopRound();
}

function resetLearner() {
  const learner = getActiveLearner();
  if (!learner) return;
  if (!confirm(`Reset all progress for ${learner.name}?`)) return;
  learner.weeklyWords = [];
  learner.progress = {};
  learner.history = [];
  ensureLearner(learner);
  stopRound();
}

function saveWeeklyWords() {
  const learner = getActiveLearner();
  if (!learner) return;

  const parsed = parseWords(elements.weeklyWordsInput.value);
  const weeklyWords = parsed.slice(0, WEEKLY_WORD_LIMIT);
  const existingKeys = new Set(state.wordList.map(wordKey));
  const newWords = weeklyWords.filter((word) => !existingKeys.has(wordKey(word)));
  state.wordList = uniqueWords([...state.wordList, ...newWords]);
  state.learners.forEach(ensureLearner);
  learner.weeklyWords = weeklyWords;
  updateInputs();
  updateUI();
  saveState();
}

function saveWordBank() {
  const words = parseWords(elements.wordBankText.value);
  if (words.length === 0) return;
  state.wordList = words;
  state.learners.forEach(ensureLearner);
  updateInputs();
  stopRound();
}

function loadDefaults() {
  state.wordList = [...DEFAULT_WORDS];
  state.learners.forEach(ensureLearner);
  updateInputs();
  stopRound();
}

function isLocalhost() {
  return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname);
}

function updateConnectionStatus() {
  if (!elements.connectionStatus) return;

  const serviceWorkerAvailable = 'serviceWorker' in navigator;
  const controlledByServiceWorker = Boolean(navigator.serviceWorker?.controller);
  const insecureNetworkAddress = window.location.protocol === 'http:' && !isLocalhost();
  const showSecureOriginWarning = insecureNetworkAddress;
  const showOfflineReady = serviceWorkerAvailable && controlledByServiceWorker && navigator.onLine;

  elements.connectionStatus.classList.toggle('ready', showOfflineReady && !showSecureOriginWarning);

  if (!navigator.onLine) {
    elements.connectionStatus.textContent = controlledByServiceWorker
      ? 'Offline mode is active. Progress still saves on this device.'
      : 'This install cannot reach the server. Open it once from an HTTPS address to enable offline launch.';
    elements.connectionStatus.classList.remove('hidden');
    return;
  }

  if (showSecureOriginWarning) {
    elements.connectionStatus.textContent = 'Home-screen installs from this address need the server running. Use HTTPS for offline launch.';
    elements.connectionStatus.classList.remove('hidden');
    return;
  }

  if (showOfflineReady) {
    elements.connectionStatus.textContent = 'Ready for offline launch on this device.';
    elements.connectionStatus.classList.remove('hidden');
    return;
  }

  elements.connectionStatus.classList.add('hidden');
}

function attachEvents() {
  elements.learnerSelect.addEventListener('change', (event) => {
    state.activeLearnerId = event.target.value;
    stopRound();
    updateInputs();
  });
  elements.addLearnerBtn.addEventListener('click', addLearner);
  elements.learnerNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addLearner();
  });
  elements.resetLearnerBtn.addEventListener('click', resetLearner);
  elements.saveWeeklyWordsBtn.addEventListener('click', saveWeeklyWords);
  elements.weeklyWordsInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveWeeklyWords();
  });
  elements.timerInput.addEventListener('change', () => {
    state.timerSeconds = Math.max(3, Math.min(30, Number(elements.timerInput.value) || DEFAULT_TIMER_SECONDS));
    elements.timerValue.textContent = state.timerSeconds;
    saveState();
  });
  elements.roundLengthInput.addEventListener('change', () => {
    state.roundLength = Math.max(5, Math.min(60, Number(elements.roundLengthInput.value) || DEFAULT_ROUND_LENGTH));
    saveState();
  });
  elements.startRoundBtn.addEventListener('click', () => startRound('mission'));
  elements.reviewAllBtn.addEventListener('click', () => startRound('review'));
  elements.reviewNumbersBtn.addEventListener('click', () => startRound('numbers'));
  elements.stopRoundBtn.addEventListener('click', stopRound);
  elements.learnedBtn.addEventListener('click', () => markWord('learned'));
  elements.practiceBtn.addEventListener('click', () => markWord('practice'));
  elements.skipBtn.addEventListener('click', () => markWord('skip'));
  elements.wordCard.addEventListener('click', () => {
    if (state.round.active && state.round.currentWord) {
      startTimer();
    }
  });
  elements.saveWordBankBtn.addEventListener('click', saveWordBank);
  elements.loadDefaultsBtn.addEventListener('click', loadDefaults);
}

loadState();
attachEvents();
updateInputs();
updateUI();
updateConnectionStatus();
elements.timerValue.textContent = state.timerSeconds;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => updateConnectionStatus())
      .catch((error) => {
        console.warn('Service worker registration failed:', error);
        updateConnectionStatus();
      });
  });
  navigator.serviceWorker.addEventListener('controllerchange', updateConnectionStatus);
}

window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);
