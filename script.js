const STORAGE_KEY = 'sightWordsStudioV2';
const LEGACY_STORAGE_KEY = 'sightWordsStudioV1';
const MASTERED_THRESHOLD = 3;
const DEFAULT_SET_SIZE = 10;
const QUICK_MASTERY_WINDOW_MS = 2500;
const DEFAULT_WORDS = [
  'I', 'a', 'the', 'and', 'is', 'in', 'to', 'it', 'at', 'up',
  'but', 'get', 'big', 'no', 'do', 'of', 'not', 'if', 'on', 'am', 'as', 'off', 'can',
  'said', 'did', 'sit', 'cut', 'man', 'red', 'blue', 'yellow', 'pink', 'see',
  'cookie', 'Mom', 'Dad', 'James', 'Michael', 'Andrew', 'sick', 'go', 'like', 'we',
  'ten', 'set', 'cat', 'dog'
];
const THIS_WEEK_WORDS = ['ten', 'set'];

const PROFILE_DETAILS = {
  steady: {
    label: 'Fast',
    note: 'Fast pacing with a mix of confident repeats and fresh words.',
    strategy: 'Stay with one set until it feels easy, then unlock the next set.'
  },
  emerging: {
    label: 'Normal',
    note: 'Normal pacing with more repetition and simpler recovery after misses.',
    strategy: 'Keep the set small, celebrate quickly, and avoid harsh resets.'
  },
  speed: {
    label: 'Fastest',
    note: 'Fastest pacing for learners ready to move through familiar words faster.',
    strategy: 'Push the pace once confidence is strong, then review the whole set once.'
  }
};

const SOUND_FILES = {
  tick: './audio/tick.wav',
  success: './audio/success.wav',
  fail: './audio/fail.wav',
  levelup: './audio/levelup.wav',
};

const state = {
  timerSeconds: 10,
  sessionDurationMinutes: 2,
  customNumberRange: { min: 1, max: 100 },
  masterySetSize: DEFAULT_SET_SIZE,
  profile: 'steady',
  wordList: [...DEFAULT_WORDS],
  learners: [],
  activeLearnerId: null,
  session: createEmptySession(),
  lastWord: 'None',
  recentWords: [],
  statsPanelOpen: false,
  newWordsPaneOpen: false,
};

const elements = {
  learnerSelect: document.getElementById('learnerSelect'),
  newLearnerName: document.getElementById('newLearnerName'),
  newLearnerAvatar: document.getElementById('newLearnerAvatar'),
  newLearnerCustomAvatar: document.getElementById('newLearnerCustomAvatar'),
  learnerPrompt: document.getElementById('learnerPrompt'),
  promptLearnerName: document.getElementById('promptLearnerName'),
  promptLearnerAvatar: document.getElementById('promptLearnerAvatar'),
  promptLearnerCustomAvatar: document.getElementById('promptLearnerCustomAvatar'),
  createPromptLearnerBtn: document.getElementById('createPromptLearnerBtn'),
  addLearnerBtn: document.getElementById('addLearnerBtn'),
  renameLearnerBtn: document.getElementById('renameLearnerBtn'),
  deleteLearnerBtn: document.getElementById('deleteLearnerBtn'),
  showLearnerStatsBtn: document.getElementById('showLearnerStatsBtn'),
  closeLearnerStatsBtn: document.getElementById('closeLearnerStatsBtn'),
  exportDataBtn: document.getElementById('exportDataBtn'),
  importDataBtn: document.getElementById('importDataBtn'),
  importDataInput: document.getElementById('importDataInput'),
  weeklyWordsInput: document.getElementById('weeklyWordsInput'),
  saveWeeklyWordsBtn: document.getElementById('saveWeeklyWordsBtn'),
  weeklyWordsList: document.getElementById('weeklyWordsList'),
  timerSeconds: document.getElementById('timerSeconds'),
  sessionDuration: document.getElementById('sessionDuration'),
  customNumberMin: document.getElementById('customNumberMin'),
  customNumberMax: document.getElementById('customNumberMax'),
  masterySetSize: document.getElementById('masterySetSize'),
  profileSelect: document.getElementById('profileSelect'),
  resetProgressBtn: document.getElementById('resetProgressBtn'),
  reviewNowBtn: document.getElementById('reviewNowBtn'),
  reviewSetBtn: document.getElementById('reviewSetBtn'),
  exitReviewBtn: document.getElementById('exitReviewBtn'),
  clearCacheBtn: document.getElementById('clearCacheBtn'),
  wordSetMasteryBtn: document.getElementById('wordSetMasteryBtn'),
  reviewNewWordsBtn: document.getElementById('reviewNewWordsBtn'),
  reviewPriorWordsBtn: document.getElementById('reviewPriorWordsBtn'),
  newWordsSetupCard: document.getElementById('newWordsSetupCard'),
  newWordsSetupInput: document.getElementById('newWordsSetupInput'),
  addNewWordsBtn: document.getElementById('addNewWordsBtn'),
  startNewWordsReviewBtn: document.getElementById('startNewWordsReviewBtn'),
  closeNewWordsPaneBtn: document.getElementById('closeNewWordsPaneBtn'),
  newWordsSetupList: document.getElementById('newWordsSetupList'),
  numberTeenFocusBtn: document.getElementById('numberTeenFocusBtn'),
  numberPricesBtn: document.getElementById('numberPricesBtn'),
  numberRangeBtn: document.getElementById('numberRangeBtn'),
  numberNextBtn: document.getElementById('numberNextBtn'),
  loadDefaultWordsBtn: document.getElementById('loadDefaultWordsBtn'),
  saveWordListBtn: document.getElementById('saveWordListBtn'),
  wordEditorText: document.getElementById('wordEditorText'),
  wordCount: document.getElementById('wordCount'),
  currentPlayerAvatar: document.getElementById('currentPlayerAvatar'),
  currentPlayerName: document.getElementById('currentPlayerName'),
  playerModeLabel: document.getElementById('playerModeLabel'),
  currentPlayerScore: document.getElementById('currentPlayerScore'),
  sessionModeText: document.getElementById('sessionModeText'),
  sessionGoalStatus: document.getElementById('sessionGoalStatus'),
  wordText: document.getElementById('wordText'),
  wordLabel: document.getElementById('wordLabel'),
  wordCard: document.getElementById('wordCard'),
  masteredText: document.getElementById('masteredText'),
  bonusText: document.getElementById('bonusText'),
  wordStageTag: document.getElementById('wordStageTag'),
  roundStatusTag: document.getElementById('roundStatusTag'),
  timerProgress: document.getElementById('timerProgress'),
  timerValue: document.getElementById('timerValue'),
  timerValueVisible: document.getElementById('timerValueVisible'),
  passBtn: document.getElementById('passBtn'),
  failBtn: document.getElementById('failBtn'),
  startBtn: document.getElementById('startBtn'),
  stopSessionBtn: document.getElementById('stopSessionBtn'),
  nextReviewText: document.getElementById('nextReviewText'),
  lastWordText: document.getElementById('lastWordText'),
  appStatusText: document.getElementById('appStatusText'),
  heroMission: document.getElementById('heroMission'),
  streakValue: document.getElementById('streakValue'),
  accuracyValue: document.getElementById('accuracyValue'),
  dueWordsValue: document.getElementById('dueWordsValue'),
  sessionMasteredValue: document.getElementById('sessionMasteredValue'),
  encouragementText: document.getElementById('encouragementText'),
  strategyText: document.getElementById('strategyText'),
  profileNote: document.getElementById('profileNote'),
  recentWordsList: document.getElementById('recentWordsList'),
  coachLabel1: document.getElementById('coachLabel1'),
  coachLabel2: document.getElementById('coachLabel2'),
  coachLabel3: document.getElementById('coachLabel3'),
  coachLabel4: document.getElementById('coachLabel4'),
  playerScore1: document.getElementById('playerScore1'),
  playerScore2: document.getElementById('playerScore2'),
  playerLabel1: document.getElementById('playerLabel1'),
  playerLabel2: document.getElementById('playerLabel2'),
  roundsPlayed: document.getElementById('roundsPlayed'),
  totalWords: document.getElementById('totalWords'),
  knownCount: document.getElementById('knownCount'),
  reviewCount: document.getElementById('reviewCount'),
  newCount: document.getElementById('newCount'),
  knownWordsList: document.getElementById('knownWordsList'),
  reviewWordsList: document.getElementById('reviewWordsList'),
  resumeTitle: document.getElementById('resumeTitle'),
  resumeCopy: document.getElementById('resumeCopy'),
  resumeMeta: document.getElementById('resumeMeta'),
  resumeActionBtn: document.getElementById('resumeActionBtn'),
  setProgressGrid: document.getElementById('setProgressGrid'),
  currentSetSummary: document.getElementById('currentSetSummary'),
  currentSetMasterySummary: document.getElementById('currentSetMasterySummary'),
  unlockedSetsSummary: document.getElementById('unlockedSetsSummary'),
  setsGrid: document.getElementById('setsGrid'),
  scorecardPanel: document.getElementById('scorecardPanel'),
  scorecardRounds: document.getElementById('scorecardRounds'),
  scorecardScore: document.getElementById('scorecardScore'),
  scorecardAccuracy: document.getElementById('scorecardAccuracy'),
  scorecardStreak: document.getElementById('scorecardStreak'),
  playerStatLabel: document.getElementById('playerStatLabel'),
  masteredList: document.getElementById('masteredList'),
  correctList: document.getElementById('correctList'),
  practiceList: document.getElementById('practiceList'),
  celebrationCard: document.getElementById('celebrationCard'),
  celebrationEyebrow: document.getElementById('celebrationEyebrow'),
  celebrationTitle: document.getElementById('celebrationTitle'),
  celebrationCopy: document.getElementById('celebrationCopy'),
  celebrationMeta: document.getElementById('celebrationMeta'),
  reflectionText: document.getElementById('reflectionText'),
  nextStepCard: document.getElementById('nextStepCard'),
  nextStepText: document.getElementById('nextStepText'),
  achievementGrid: document.getElementById('achievementGrid'),
  leaderboardList: document.getElementById('leaderboardList'),
  newSessionBtn: document.getElementById('newSessionBtn'),
  nextSetBtn: document.getElementById('nextSetBtn'),
  reviewCompletedSetBtn: document.getElementById('reviewCompletedSetBtn'),
  reviewModeBanner: document.getElementById('reviewModeBanner'),
  reviewBannerTitle: document.getElementById('reviewBannerTitle'),
  reviewBannerCopy: document.getElementById('reviewBannerCopy'),
  stageHintText: document.getElementById('stageHintText'),
  gamePanel: document.getElementById('gamePanel'),
  learnerStatsPanel: document.getElementById('learnerStatsPanel'),
  statsLearnerName: document.getElementById('statsLearnerName'),
  statsSessionsValue: document.getElementById('statsSessionsValue'),
  statsAccuracyValue: document.getElementById('statsAccuracyValue'),
  statsMasteredWordsValue: document.getElementById('statsMasteredWordsValue'),
  statsCompletedSetsValue: document.getElementById('statsCompletedSetsValue'),
  statsUnlockedSetsList: document.getElementById('statsUnlockedSetsList'),
  statsHistoryList: document.getElementById('statsHistoryList'),
};

let timerId = null;
let beepTimeoutId = null;
let soundsPrimed = false;
const soundPlayers = {};
let touchStartX = null;
let touchStartY = null;
let appUpdateRegistration = null;
let appUpdateReloading = false;

function createEmptySession() {
  return {
    active: false,
    type: 'mastery',
    setIndex: 0,
    queue: [],
    currentWord: null,
    sessionStartedAt: null,
    roundStartedAt: null,
    roundsPlayed: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    masteredThisSession: 0,
    sessionWords: {},
    completedSet: false,
    skipHistory: false,
    paused: false,
    pausedRemainingMs: null,
  };
}

function normalizeWordKey(word) {
  return String(word).trim().toLowerCase();
}

function uniqueWords(words) {
  const seen = new Set();
  return words
    .map((word) => String(word).trim())
    .filter((word) => {
      const key = normalizeWordKey(word);
      if (!word || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getMasterySetSize() {
  return Math.max(4, Math.min(20, Number(state.masterySetSize) || DEFAULT_SET_SIZE));
}

function saveMasterySetSize() {
  state.masterySetSize = getMasterySetSize();
  elements.masterySetSize.value = state.masterySetSize;
  updateAllUI();
  saveState();
}

function buildWordProgress(text) {
  return {
    text,
    mastery: 0,
    status: 'new',
    totalPasses: 0,
    totalFails: 0,
    reviewPasses: 0,
    reviewFails: 0,
    lastReviewedAt: 0,
  };
}

function profileDetail() {
  return PROFILE_DETAILS[state.profile] || PROFILE_DETAILS.steady;
}

function createLearner(name, avatar = '🌟') {
  return {
    id: `learner-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name,
    avatar,
    activeSetIndex: 0,
    unlockedSetCount: 1,
    weeklyWords: [...THIS_WEEK_WORDS],
    wordProgress: {},
    history: [],
    achievements: [],
    totalAttempts: 0,
    totalCorrect: 0,
  };
}

function avatarValue(customInput, fallbackSelect) {
  return customInput.value.trim() || fallbackSelect.value || '🌟';
}

function chunkWords(wordList) {
  const sets = [];
  const setSize = getMasterySetSize();
  for (let index = 0; index < wordList.length; index += setSize) {
    sets.push({
      index: index / setSize,
      title: `Set ${Math.floor(index / setSize) + 1}`,
      words: wordList.slice(index, index + setSize),
    });
  }
  return sets;
}

function getSets() {
  return chunkWords(state.wordList);
}

function getActiveLearner() {
  return state.learners.find((learner) => learner.id === state.activeLearnerId) || null;
}

function ensureLearnerProgress(learner) {
  const nextProgress = {};
  state.wordList.forEach((text) => {
    const key = normalizeWordKey(text);
    const existing = learner.wordProgress?.[key];
    nextProgress[key] = existing ? { ...existing, text } : buildWordProgress(text);
  });
  learner.wordProgress = nextProgress;
  learner.weeklyWords = Array.isArray(learner.weeklyWords)
    ? uniqueWords(learner.weeklyWords).filter((word) => state.wordList.some((item) => normalizeWordKey(item) === normalizeWordKey(word)))
    : [];
  learner.history = Array.isArray(learner.history) ? learner.history : [];
  learner.achievements = Array.isArray(learner.achievements) ? learner.achievements : [];
  learner.totalAttempts = learner.totalAttempts || 0;
  learner.totalCorrect = learner.totalCorrect || 0;
  learner.activeSetIndex = Math.max(0, learner.activeSetIndex || 0);
  learner.unlockedSetCount = Math.max(1, learner.unlockedSetCount || 1);
  updateUnlockedSets(learner);
}

function ensureCurrentWordDefaults() {
  state.wordList = uniqueWords([...state.wordList, ...DEFAULT_WORDS]);
  state.learners.forEach((learner) => {
    learner.weeklyWords = uniqueWords([...(learner.weeklyWords || []), ...THIS_WEEK_WORDS])
      .filter((word) => state.wordList.some((item) => normalizeWordKey(item) === normalizeWordKey(word)));
    ensureLearnerProgress(learner);
  });
}

function learnerAccuracy(learner) {
  if (!learner || learner.totalAttempts === 0) return 0;
  return Math.round((learner.totalCorrect / learner.totalAttempts) * 100);
}

function getWordProgress(learner, wordText) {
  return learner.wordProgress[normalizeWordKey(wordText)];
}

function getSetStats(learner, setIndex) {
  const set = getSets()[setIndex];
  if (!set) {
    return { total: 0, mastered: 0, learning: 0, fresh: 0, completed: false, unlocked: false };
  }

  let mastered = 0;
  let learning = 0;
  let fresh = 0;
  set.words.forEach((wordText) => {
    const progress = getWordProgress(learner, wordText);
    if (progress.mastery >= MASTERED_THRESHOLD) {
      mastered += 1;
    } else if (progress.mastery > 0 || progress.totalFails > 0) {
      learning += 1;
    } else {
      fresh += 1;
    }
  });

  return {
    total: set.words.length,
    mastered,
    learning,
    fresh,
    completed: mastered === set.words.length && set.words.length > 0,
    unlocked: setIndex < learner.unlockedSetCount,
  };
}

function updateUnlockedSets(learner) {
  const sets = getSets();
  let sequentialCompleted = 0;
  while (sequentialCompleted < sets.length && getSetStats(learner, sequentialCompleted).completed) {
    sequentialCompleted += 1;
  }

  learner.unlockedSetCount = Math.min(
    sets.length || 1,
    Math.max(learner.unlockedSetCount || 1, sequentialCompleted + 1)
  );

  if (sequentialCompleted < sets.length) {
    learner.activeSetIndex = sequentialCompleted;
  } else if (sets.length > 0) {
    learner.activeSetIndex = sets.length - 1;
    learner.unlockedSetCount = sets.length;
  } else {
    learner.activeSetIndex = 0;
    learner.unlockedSetCount = 1;
  }
}

function migrateLegacyData(parsed) {
  const migratedWordList = Array.isArray(parsed.words) && parsed.words.length > 0
    ? parsed.words.map((word) => word.text)
    : [...DEFAULT_WORDS];
  state.wordList = migratedWordList;

  const learner = createLearner(
    parsed.players?.[0]?.name || 'Learner',
    parsed.players?.[0]?.avatar || '🌟'
  );

  migratedWordList.forEach((wordText) => {
    const legacyWord = parsed.words?.find((word) => word.text === wordText);
    const progress = buildWordProgress(wordText);
    if (legacyWord) {
      progress.mastery = legacyWord.status === 'known'
        ? MASTERED_THRESHOLD
        : Math.max(0, Math.min(MASTERED_THRESHOLD - 1, legacyWord.correctCount || 0));
      progress.status = progress.mastery >= MASTERED_THRESHOLD
        ? 'mastered'
        : progress.mastery > 0 || legacyWord.incorrectCount > 0
          ? 'learning'
          : 'new';
      progress.totalPasses = legacyWord.correctCount || 0;
      progress.totalFails = legacyWord.incorrectCount || 0;
    }
    learner.wordProgress[normalizeWordKey(wordText)] = progress;
  });

  learner.totalAttempts = parsed.totalAttempts || 0;
  learner.totalCorrect = parsed.totalCorrect || 0;
  ensureLearnerProgress(learner);
  state.learners = [learner];
  state.activeLearnerId = learner.id;
  state.timerSeconds = parsed.timerSeconds || state.timerSeconds;
  state.sessionDurationMinutes = parsed.sessionDurationMinutes || state.sessionDurationMinutes;
  state.customNumberRange = normalizeCustomNumberRange(parsed.customNumberRange);
  state.masterySetSize = Math.max(4, Math.min(20, Number(parsed.masterySetSize) || state.masterySetSize));
  state.profile = parsed.profile || state.profile;
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      state.timerSeconds = parsed.timerSeconds || state.timerSeconds;
      state.sessionDurationMinutes = parsed.sessionDurationMinutes || state.sessionDurationMinutes;
      state.customNumberRange = normalizeCustomNumberRange(parsed.customNumberRange);
      state.masterySetSize = Math.max(4, Math.min(20, Number(parsed.masterySetSize) || state.masterySetSize));
      state.profile = parsed.profile || state.profile;
      state.wordList = Array.isArray(parsed.wordList) && parsed.wordList.length > 0
        ? parsed.wordList
        : [...DEFAULT_WORDS];
      state.learners = Array.isArray(parsed.learners) ? parsed.learners : [];
      state.activeLearnerId = parsed.activeLearnerId || null;
    } catch (error) {
      console.warn('Unable to parse stored studio data, starting fresh.');
    }
  } else {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      try {
        migrateLegacyData(JSON.parse(legacy));
      } catch (error) {
        console.warn('Unable to migrate legacy studio data.');
      }
    }
  }

  if (state.wordList.length === 0) {
    state.wordList = [...DEFAULT_WORDS];
  }

  ensureCurrentWordDefaults();
  state.learners.forEach((learner) => ensureLearnerProgress(learner));

  if (!getActiveLearner()) {
    state.activeLearnerId = state.learners[0]?.id || null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    timerSeconds: state.timerSeconds,
    sessionDurationMinutes: state.sessionDurationMinutes,
    customNumberRange: state.customNumberRange,
    masterySetSize: state.masterySetSize,
    profile: state.profile,
    wordList: state.wordList,
    learners: state.learners,
    activeLearnerId: state.activeLearnerId,
  }));
}

function ensureSoundPlayers() {
  Object.entries(SOUND_FILES).forEach(([name, src]) => {
    if (soundPlayers[name]) return;
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.playsInline = true;
    soundPlayers[name] = audio;
  });
}

function primeSounds() {
  if (soundsPrimed) return;
  ensureSoundPlayers();
  soundsPrimed = true;

  Object.values(soundPlayers).forEach((audio) => {
    audio.muted = true;
    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
      playAttempt
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.currentTime = 0;
          audio.muted = false;
        });
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
  });
}

function playSound(name) {
  ensureSoundPlayers();
  const source = soundPlayers[name];
  if (!source) return;
  const audio = new Audio(source.src);
  audio.preload = 'auto';
  audio.playsInline = true;
  audio.volume = name === 'tick' ? 0.45 : 0.75;
  const playAttempt = audio.play();
  if (playAttempt && typeof playAttempt.catch === 'function') {
    playAttempt.catch(() => {});
  }
}

function playBeep() {
  playSound('tick');
}

function playFailTone() {
  playSound('fail');
}

function playSuccessTone() {
  playSound('success');
}

function playLevelUpTone() {
  playSound('levelup');
}

function parseWordEditorText() {
  const raw = elements.wordEditorText.value;
  return parseInlineWords(raw);
}

function parseInlineWords(raw) {
  return uniqueWords(String(raw).split(/[,\n]+/));
}

function normalizeCustomNumberRange(range = state.customNumberRange) {
  const min = Math.max(0, Math.min(999, Number(range?.min) || 1));
  const max = Math.max(1, Math.min(999, Number(range?.max) || 100));
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return { min: low, max: high };
}

function saveCustomNumberRange() {
  state.customNumberRange = normalizeCustomNumberRange({
    min: elements.customNumberMin.value,
    max: elements.customNumberMax.value,
  });
  elements.customNumberMin.value = state.customNumberRange.min;
  elements.customNumberMax.value = state.customNumberRange.max;
  saveState();
}

function updateWordCount() {
  elements.wordCount.textContent = parseWordEditorText().length;
}

function buildWordEditorText() {
  elements.wordEditorText.value = state.wordList.join('\n');
  updateWordCount();
}

function updateWeeklyWordsUI() {
  const learner = getActiveLearner();
  const weeklyWords = learner?.weeklyWords || [];
  elements.weeklyWordsInput.value = weeklyWords.join(', ');
  elements.weeklyWordsList.innerHTML = wordBadgeList(weeklyWords, 'No weekly words yet.');
  if (elements.newWordsSetupList) {
    elements.newWordsSetupList.innerHTML = wordBadgeList(weeklyWords, 'No new words yet.');
  }
  if (elements.startNewWordsReviewBtn) {
    elements.startNewWordsReviewBtn.disabled = !learner || weeklyWords.length === 0 || state.session.active;
  }
}

function updateLearnerPrompt() {
  const shouldPrompt = state.learners.length === 0;
  elements.learnerPrompt.classList.toggle('hidden', !shouldPrompt);
  document.body.classList.toggle('learner-prompt-active', shouldPrompt);
  if (shouldPrompt) {
    setTimeout(() => elements.promptLearnerName.focus(), 0);
  }
}

function updateAppStatus(message) {
  elements.appStatusText.textContent = message;
}

function ensureAppUpdateButton() {
  let button = document.getElementById('appUpdateBtn');
  if (button) return button;

  button = document.createElement('button');
  button.id = 'appUpdateBtn';
  button.type = 'button';
  button.className = 'secondary hidden';
  button.textContent = 'Update App';
  button.title = 'Load the latest version of the app';
  button.addEventListener('click', applyDetectedAppUpdate);
  document.body.appendChild(button);
  return button;
}

function showAppUpdateButton(registration) {
  appUpdateRegistration = registration || appUpdateRegistration;
  const button = ensureAppUpdateButton();
  button.classList.remove('hidden');
  button.disabled = false;
  updateAppStatus('Update available.');
}

function hideAppUpdateButton() {
  const button = document.getElementById('appUpdateBtn');
  if (button) button.classList.add('hidden');
}

function applyDetectedAppUpdate() {
  const button = ensureAppUpdateButton();
  button.disabled = true;
  updateAppStatus('Updating app...');

  if (appUpdateRegistration?.waiting) {
    appUpdateReloading = true;
    appUpdateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }

  clearCacheAndReload();
}

function shuffleList(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getCurrentSetWords(learner, setIndex = learner.activeSetIndex) {
  return getSets()[setIndex]?.words || [];
}

function buildMasteryQueue(learner, setIndex) {
  const setWords = getCurrentSetWords(learner, setIndex);
  const pending = setWords.filter((wordText) => getWordProgress(learner, wordText).mastery < MASTERED_THRESHOLD);
  if (pending.length === 0) return [];

  return shuffleList(
    pending.sort((left, right) => {
      const leftProgress = getWordProgress(learner, left);
      const rightProgress = getWordProgress(learner, right);
      return leftProgress.mastery - rightProgress.mastery;
    })
  );
}

function buildSetReviewQueue(learner, setIndex) {
  return shuffleList(getCurrentSetWords(learner, setIndex).filter(Boolean));
}

function buildWeeklyReviewQueue(learner) {
  const weekly = learner.weeklyWords || [];
  const weeklyKeys = new Set(weekly.map(normalizeWordKey));
  const prior = state.wordList.filter((word) => !weeklyKeys.has(normalizeWordKey(word)));
  const priorMix = shuffleList(prior).slice(0, Math.max(8, weekly.length * 4));
  return shuffleList([...weekly, ...weekly, ...weekly, ...priorMix]).filter(Boolean);
}

function buildPriorReviewQueue(learner) {
  const setSize = getMasterySetSize();
  const priorCount = Math.max(learner.activeSetIndex * setSize, learner.unlockedSetCount > 1 ? (learner.unlockedSetCount - 1) * setSize : 0);
  const priorWords = state.wordList.slice(0, priorCount);
  return shuffleList((priorWords.length > 0 ? priorWords : state.wordList).filter(Boolean));
}

function isWordReviewSession(type = state.session.type) {
  return ['set-review', 'new-words-review', 'prior-words-review'].includes(type);
}

function getSessionQueue(learner) {
  if (state.session.type === 'set-review') return buildSetReviewQueue(learner, state.session.setIndex);
  if (state.session.type === 'new-words-review') return buildWeeklyReviewQueue(learner);
  if (state.session.type === 'prior-words-review') return buildPriorReviewQueue(learner);
  return buildMasteryQueue(learner, state.session.setIndex);
}

function getNextWord() {
  const learner = getActiveLearner();
  if (!learner) return null;

  if (state.session.queue.length === 0) {
    if (isWordReviewSession()) {
      return null;
    }
    state.session.queue = getSessionQueue(learner);
  }

  return state.session.queue.shift() || null;
}

function wordBadgeList(words, emptyText) {
  if (words.length === 0) return emptyText;
  return words.map((word) => `<span class="word-item">${word}</span>`).join('');
}

function pushRecentWord(wordText) {
  state.recentWords.push(wordText);
  state.recentWords = state.recentWords.slice(-12);
}

function trackSessionWord(wordText, category) {
  const key = normalizeWordKey(wordText);
  if (!state.session.sessionWords[key]) {
    state.session.sessionWords[key] = { word: wordText, category: null };
  }
  state.session.sessionWords[key].category = category;
}

function currentSetStats() {
  const learner = getActiveLearner();
  return learner ? getSetStats(learner, learner.activeSetIndex) : { total: 0, mastered: 0 };
}

function updateHeroMission() {
  const learner = getActiveLearner();
  if (!learner) {
    elements.heroMission.textContent = 'Add a learner to begin.';
    elements.sessionGoalStatus.textContent = '0 / 0';
    return;
  }

  const stats = getSetStats(learner, learner.activeSetIndex);
  const remaining = Math.max(0, stats.total - stats.mastered);
  elements.heroMission.textContent = remaining === 0
    ? 'Set complete. The next set is unlocked.'
    : `${remaining} word${remaining === 1 ? '' : 's'} left to master in ${getSets()[learner.activeSetIndex]?.title || 'this set'}`;
  elements.sessionGoalStatus.textContent = `${stats.mastered} / ${stats.total}`;
}

function updateLearnerSelect() {
  const options = state.learners
    .map((learner) => `<option value="${learner.id}">${learner.avatar} ${learner.name}</option>`)
    .join('');
  elements.learnerSelect.innerHTML = `<option value="">Select a learner</option>${options}`;
  elements.learnerSelect.value = state.activeLearnerId || '';
}

function updateCurrentPlayerDisplay() {
  const learner = getActiveLearner();
  const sets = getSets();
  const setTitle = learner ? sets[learner.activeSetIndex]?.title || 'Set 1' : 'Set 1';

  if (!learner) {
    elements.currentPlayerAvatar.textContent = '🌟';
    elements.currentPlayerName.textContent = 'Add a learner';
    elements.playerModeLabel.textContent = 'No learner selected';
    elements.currentPlayerScore.textContent = '0';
    return;
  }

  elements.currentPlayerAvatar.textContent = learner.avatar;
  elements.currentPlayerName.textContent = learner.name;
  elements.playerModeLabel.textContent = `Working in ${setTitle}`;
  elements.currentPlayerScore.textContent = state.session.correct;
  elements.sessionModeText.textContent = sessionModeLabel();
}

function sessionModeLabel(type = state.session.type) {
  if (type === 'set-review') return 'Whole Set Review';
  if (type === 'new-words-review') return 'New Words Review';
  if (type === 'prior-words-review') return 'Prior Words Review';
  if (type === 'number-review') return '10-19 Focus';
  if (type === 'price-review') return 'Prices';
  if (type === 'range-review') return 'Custom Range';
  if (type === 'next-number') return 'Next Number';
  if (type === 'count-by-review') return 'Count By';
  return 'Set Mastery';
}

function formatSetLabel(setIndex) {
  return getSets()[setIndex]?.title || `Set ${setIndex + 1}`;
}

function updateReviewText() {
  const learner = getActiveLearner();
  if (!learner) {
    elements.nextReviewText.textContent = 'Choose a learner to begin.';
    return;
  }

  const setStats = getSetStats(learner, learner.activeSetIndex);
  elements.nextReviewText.textContent = setStats.completed
    ? `${formatSetLabel(learner.activeSetIndex)} is mastered. Review it or move to the next set.`
    : `${setStats.total - setStats.mastered} words still need mastery in ${formatSetLabel(learner.activeSetIndex)}.`;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return 'No sessions yet.';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

function progressStateLabel(progress) {
  if (progress.mastery >= MASTERED_THRESHOLD) return 'Mastered';
  if (progress.mastery > 0) return `${progress.mastery} of ${MASTERED_THRESHOLD}`;
  if (progress.totalFails > 0) return 'Needs warm-up';
  return 'New';
}

function progressNote(progress) {
  if (progress.mastery >= MASTERED_THRESHOLD) return 'Ready for calm review.';
  if (progress.mastery > 0) return `${MASTERED_THRESHOLD - progress.mastery} more strong check${MASTERED_THRESHOLD - progress.mastery === 1 ? '' : 's'} to master`;
  if (progress.totalFails > 0) return 'Missed recently, so keep it nearby.';
  return 'Fresh word in this set.';
}

function renderSetProgress(learner) {
  if (!learner) {
    elements.setProgressGrid.textContent = 'Choose a learner to see current set progress.';
    return;
  }

  const words = getCurrentSetWords(learner);
  if (words.length === 0) {
    elements.setProgressGrid.textContent = 'No words in this set yet.';
    return;
  }

  elements.setProgressGrid.innerHTML = words.map((wordText) => {
    const progress = getWordProgress(learner, wordText);
    const dots = Array.from({ length: MASTERED_THRESHOLD }, (_, index) => {
      const filled = progress.mastery > index;
      const classes = filled ? 'word-progress-dot filled' : progress.totalFails > 0 && index === 0 ? 'word-progress-dot warning' : 'word-progress-dot';
      return `<span class="${classes}"></span>`;
    }).join('');

    return `
      <div class="word-progress-card">
        <div class="word-progress-top">
          <div class="word-progress-word">${wordText}</div>
          <div class="word-progress-state">${progressStateLabel(progress)}</div>
        </div>
        <div class="word-progress-track" aria-hidden="true">${dots}</div>
        <div class="word-progress-note">${progressNote(progress)}</div>
      </div>
    `;
  }).join('');
}

function updateResumeCard(learner) {
  if (!learner) {
    elements.resumeTitle.textContent = 'Pick up where you left off.';
    elements.resumeCopy.textContent = 'Choose a learner to see the next best move.';
    elements.resumeMeta.textContent = 'No learner selected.';
    elements.resumeActionBtn.textContent = 'Resume Practice';
    elements.resumeActionBtn.disabled = true;
    return;
  }

  const stats = getSetStats(learner, learner.activeSetIndex);
  const lastSession = learner.history[learner.history.length - 1];
  const setLabel = formatSetLabel(learner.activeSetIndex);

  if (stats.completed) {
    elements.resumeTitle.textContent = `${setLabel} is already mastered.`;
    elements.resumeCopy.textContent = learner.activeSetIndex + 1 < learner.unlockedSetCount
      ? `Move into ${formatSetLabel(learner.activeSetIndex + 1)} or do one calm review of ${setLabel}.`
      : `Review ${setLabel} once, then keep exploring unlocked words.`;
    elements.resumeActionBtn.textContent = learner.activeSetIndex + 1 < learner.unlockedSetCount ? 'Start Next Set' : 'Review Current Set';
  } else {
    elements.resumeTitle.textContent = `${learner.name} is working in ${setLabel}.`;
    elements.resumeCopy.textContent = `${stats.mastered} of ${stats.total} words are mastered. The next set unlocks automatically when the set is done.`;
    elements.resumeActionBtn.textContent = 'Resume Current Set';
  }

  elements.resumeMeta.textContent = lastSession
    ? `Last session: ${formatTimestamp(lastSession.timestamp)} · ${lastSession.accuracy}% accuracy`
    : 'No finished sessions yet. A short first round is a good warm-up.';
  elements.resumeActionBtn.disabled = state.session.active;
}

function updateCelebrationCard() {
  const learner = getActiveLearner();
  if (!learner) {
    elements.celebrationCard.classList.add('hidden');
    return;
  }

  const completedSet = state.session.completedSet;
  const setLabel = formatSetLabel(state.session.setIndex);
  const nextSetIndex = getNextSetIndex();

  elements.celebrationCard.classList.remove('hidden');

  if (completedSet) {
    elements.celebrationEyebrow.textContent = 'Set unlocked';
    elements.celebrationTitle.textContent = `${learner.name} finished ${setLabel}.`;
    elements.celebrationCopy.textContent = nextSetIndex === null
      ? 'That set is complete, and there are no more sets unlocked yet to move into.'
      : `${formatSetLabel(nextSetIndex)} is now open and ready for a fresh start.`;
    elements.celebrationMeta.textContent = `This round mastered ${state.session.masteredThisSession} word${state.session.masteredThisSession === 1 ? '' : 's'} with ${sessionAccuracy()}% accuracy.`;
    return;
  }

  if (isWordReviewSession()) {
    elements.celebrationEyebrow.textContent = 'Review complete';
    elements.celebrationTitle.textContent = `${sessionModeLabel()} is complete.`;
    elements.celebrationCopy.textContent = 'Review does not change mastery. It simply shows what feels easy right now.';
    elements.celebrationMeta.textContent = `${state.session.correct} of ${state.session.roundsPlayed} review words were answered correctly.`;
    return;
  }

  elements.celebrationEyebrow.textContent = 'Practice in motion';
  elements.celebrationTitle.textContent = `${learner.name} is building ${setLabel}.`;
  elements.celebrationCopy.textContent = state.session.masteredThisSession > 0
    ? `This round moved ${state.session.masteredThisSession} word${state.session.masteredThisSession === 1 ? '' : 's'} into mastered.`
    : 'No new words crossed into mastered yet, but the repetition still counts.';
  elements.celebrationMeta.textContent = 'Keep the pace short and positive. The next set unlocks automatically after the whole set is mastered.';
}

function updateDashboard() {
  const learner = getActiveLearner();
  if (!learner) {
    updateResumeCard(null);
    renderSetProgress(null);
    return;
  }

  const setWords = getCurrentSetWords(learner);
  const masteredSetWords = setWords.filter((wordText) => getWordProgress(learner, wordText).mastery >= MASTERED_THRESHOLD);
  const learningSetWords = setWords.filter((wordText) => {
    const progress = getWordProgress(learner, wordText);
    return progress.mastery > 0 && progress.mastery < MASTERED_THRESHOLD;
  });

  const allProgress = Object.values(learner.wordProgress);
  const masteredCount = allProgress.filter((progress) => progress.mastery >= MASTERED_THRESHOLD).length;
  const learningCount = allProgress.filter((progress) => progress.mastery > 0 && progress.mastery < MASTERED_THRESHOLD).length;
  const newCount = allProgress.filter((progress) => progress.mastery === 0 && progress.totalFails === 0).length;
  const stats = getSetStats(learner, learner.activeSetIndex);

  elements.playerScore1.textContent = formatSetLabel(learner.activeSetIndex);
  elements.playerScore2.textContent = `${learner.unlockedSetCount}`;
  elements.roundsPlayed.textContent = learner.history.length;
  elements.totalWords.textContent = state.wordList.length;
  elements.knownCount.textContent = masteredCount;
  elements.reviewCount.textContent = learningCount;
  elements.newCount.textContent = newCount;
  elements.knownWordsList.innerHTML = wordBadgeList(masteredSetWords, 'No mastered words in this set yet.');
  elements.reviewWordsList.innerHTML = wordBadgeList(
    learningSetWords,
    stats.completed ? 'Set complete. Try a whole-set review.' : 'No active practice words in this set yet.'
  );
  updateResumeCard(learner);
  renderSetProgress(learner);
  elements.currentSetSummary.textContent = formatSetLabel(learner.activeSetIndex);
  elements.currentSetMasterySummary.textContent = `${stats.mastered} / ${stats.total}`;
  elements.unlockedSetsSummary.textContent = `${learner.unlockedSetCount}`;
}

function updateCoachBoard() {
  const learner = getActiveLearner();
  if (!learner) return;

  const stats = getSetStats(learner, learner.activeSetIndex);
  elements.streakValue.textContent = state.session.bestStreak;
  elements.accuracyValue.textContent = `${learnerAccuracy(learner)}%`;
  elements.dueWordsValue.textContent = stats.total - stats.mastered;
  elements.sessionMasteredValue.textContent = Math.max(0, learner.unlockedSetCount - 1);
  elements.recentWordsList.innerHTML = wordBadgeList(state.recentWords.slice(-8), 'None yet');

  if (!state.session.active) {
    elements.encouragementText.textContent = stats.completed
      ? `${formatSetLabel(learner.activeSetIndex)} is complete. Review it once or keep going in the next set.`
      : `${learner.name} is working through ${formatSetLabel(learner.activeSetIndex)}.`;
    elements.strategyText.textContent = profileDetail().strategy;
    return;
  }

  if (isWordReviewSession()) {
    elements.encouragementText.textContent = `${sessionModeLabel()} is active. Each word appears so the learner can show what they know.`;
    elements.strategyText.textContent = 'Keep the pace light. This review checks recall without changing mastery.';
    return;
  }

  if (stats.completed) {
    elements.encouragementText.textContent = 'Set mastered. Let the learner notice the win before jumping ahead.';
    elements.strategyText.textContent = 'Try one calm whole-set review, then move into the newly unlocked set.';
  } else if (state.session.bestStreak >= 4) {
    elements.encouragementText.textContent = 'Momentum looks good. The learner is staying with the set.';
    elements.strategyText.textContent = 'Stay in the same set until all words feel easy and consistent.';
  } else {
    elements.encouragementText.textContent = 'Short steady repetitions are doing the work here.';
    elements.strategyText.textContent = profileDetail().strategy;
  }
}

function updateAchievements() {
  const learner = getActiveLearner();
  if (!learner) return;

  const completedSets = Math.max(0, learner.unlockedSetCount - 1);
  const badges = [];

  if (completedSets >= 1) {
    badges.push({ title: 'First Set', meta: 'Completed the first mastery set.', icon: '🌱' });
  }
  if (completedSets >= 2) {
    badges.push({ title: 'Set Climber', meta: 'Unlocked the third set.', icon: '🧗' });
  }
  if (Object.values(learner.wordProgress).filter((progress) => progress.mastery >= MASTERED_THRESHOLD).length >= 10) {
    badges.push({ title: 'Ten Strong', meta: 'Mastered ten total words.', icon: '🏅' });
  }
  if (learnerAccuracy(learner) >= 85 && learner.totalAttempts >= 10) {
    badges.push({ title: 'Steady Focus', meta: 'Kept overall accuracy above 85%.', icon: '🎯' });
  }

  if (badges.length === 0) {
    elements.achievementGrid.innerHTML = '<div class="achievement-card locked">Finish a set to unlock your first badge.</div>';
    return;
  }

  elements.achievementGrid.innerHTML = badges
    .map((badge) => `
      <div class="achievement-card">
        <div>
          <div class="achievement-title">${badge.icon} ${badge.title}</div>
          <div class="achievement-meta">${badge.meta}</div>
        </div>
      </div>
    `)
    .join('');
}

function updateLeaderboard() {
  const learner = getActiveLearner();
  if (!learner || learner.history.length === 0) {
    elements.leaderboardList.innerHTML = '<div class="leaderboard-empty">No finished sessions yet.</div>';
    return;
  }

  elements.leaderboardList.innerHTML = learner.history
    .slice(-8)
    .reverse()
    .map((entry, index) => `
      <div class="leaderboard-row">
        <div class="leaderboard-rank">${index + 1}</div>
        <div>
          <div class="leaderboard-name">${formatSetLabel(entry.setIndex)} · ${entry.type === 'set-review' ? 'Review' : 'Mastery'}</div>
          <div class="leaderboard-meta">${entry.accuracy}% accuracy · ${entry.correct} correct · ${entry.masteredThisSession} mastered</div>
        </div>
        <div class="leaderboard-score">${entry.completedSet ? 'Set done' : `${entry.correct} pts`}</div>
      </div>
    `)
    .join('');
}

function updateProfileUI() {
  elements.profileSelect.value = state.profile;
  elements.profileNote.textContent = profileDetail().note;
}

function showScorecard() {
  const learner = getActiveLearner();
  if (!learner) return;

  elements.scorecardRounds.textContent = state.session.roundsPlayed;
  elements.scorecardScore.textContent = state.session.correct;
  elements.scorecardAccuracy.textContent = `${sessionAccuracy()}%`;
  elements.scorecardStreak.textContent = state.session.bestStreak;
  elements.playerStatLabel.textContent = `${learner.name} Score`;
  elements.masteredList.innerHTML = formatSessionWords('mastered');
  elements.correctList.innerHTML = formatSessionWords('correct');
  elements.practiceList.innerHTML = formatSessionWords('practice');
  elements.reflectionText.textContent = buildReflectionText();
  updateCelebrationCard();
  updateScorecardActions();
  elements.scorecardPanel.classList.remove('hidden');
  if (!isReviewModeActive()) {
    elements.scorecardPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function formatSessionWords(category) {
  const items = Object.values(state.session.sessionWords)
    .filter((item) => item.category === category)
    .map((item) => item.word);
  return wordBadgeList(items, 'None yet');
}

function buildReflectionText() {
  const learner = getActiveLearner();
  const completedSet = state.session.completedSet;
  if (completedSet) {
    return `${learner.name} finished ${formatSetLabel(state.session.setIndex)} and unlocked the next set.`;
  }
  if (isWordReviewSession()) {
    return 'This review gives a quick confidence check without changing mastery.';
  }
  if (state.session.masteredThisSession >= 3) {
    return 'Strong mastery session. Several words moved into the mastered column.';
  }
  return 'Steady practice is building familiarity inside the current set.';
}

function getNextSetIndex() {
  const learner = getActiveLearner();
  if (!learner) return null;
  const candidate = state.session.setIndex + 1;
  if (candidate < getSets().length && candidate < learner.unlockedSetCount) {
    return candidate;
  }
  return null;
}

function updateScorecardActions() {
  const learner = getActiveLearner();
  if (!learner) return;

  const nextSetIndex = getNextSetIndex();
  const completedSet = state.session.completedSet;
  const reviewSetIndex = completedSet ? state.session.setIndex : learner.activeSetIndex;

  elements.nextStepCard.classList.remove('hidden');
  elements.nextSetBtn.classList.toggle('hidden', !completedSet || nextSetIndex === null);
  elements.reviewCompletedSetBtn.classList.remove('hidden');

  if (completedSet && nextSetIndex !== null) {
    elements.nextStepText.textContent = `${learner.name} unlocked ${formatSetLabel(nextSetIndex)}. Jump ahead now or review ${formatSetLabel(state.session.setIndex)} once before moving on.`;
    elements.nextSetBtn.textContent = `Start ${formatSetLabel(nextSetIndex)}`;
    elements.reviewCompletedSetBtn.textContent = `Review ${formatSetLabel(state.session.setIndex)}`;
    elements.newSessionBtn.textContent = 'Practice Current Set';
    return;
  }

  if (isWordReviewSession()) {
    elements.nextStepText.textContent = `${sessionModeLabel()} is complete. Return to mastery in ${formatSetLabel(learner.activeSetIndex)} whenever you want.`;
    elements.reviewCompletedSetBtn.textContent = state.session.type === 'set-review'
      ? `Review ${formatSetLabel(state.session.setIndex)} Again`
      : 'Review Current Set';
    elements.newSessionBtn.textContent = 'Practice Current Set';
    return;
  }

  elements.nextStepText.textContent = `Keep working in ${formatSetLabel(learner.activeSetIndex)} until every word is mastered. The next set will unlock automatically.`;
  elements.reviewCompletedSetBtn.textContent = `Review ${formatSetLabel(reviewSetIndex)}`;
  elements.newSessionBtn.textContent = 'Practice Current Set';
}

function sessionAccuracy() {
  const attempts = state.session.correct + state.session.incorrect;
  if (attempts === 0) return 0;
  return Math.round((state.session.correct / attempts) * 100);
}

function clearFeedback() {
  elements.wordCard.classList.remove('success', 'fail');
}

function showMasteredText() {
  elements.masteredText.classList.remove('hidden');
  elements.masteredText.classList.add('show');
  setTimeout(() => {
    elements.masteredText.classList.remove('show');
    elements.masteredText.classList.add('hidden');
  }, 1200);
}

function showBonusText() {
  elements.bonusText.classList.remove('hidden');
  elements.bonusText.classList.add('show');
  setTimeout(() => {
    elements.bonusText.classList.remove('show');
    elements.bonusText.classList.add('hidden');
  }, 1100);
}

function resetStageToIdle() {
  state.session.currentWord = null;
  clearFeedback();
  elements.nextStepCard.classList.add('hidden');
  elements.bonusText.classList.remove('show');
  elements.bonusText.classList.add('hidden');
  elements.wordLabel.textContent = 'Ready?';
  elements.wordText.textContent = 'Pick a set to begin';
  elements.wordStageTag.textContent = 'Set mode';
  elements.roundStatusTag.textContent = 'Waiting';
  elements.lastWordText.textContent = state.lastWord || 'None';
  updateTimerBar(state.timerSeconds * 1000);
  updateInteractionModeUI();
}

function stagePrompt(mode, wordText) {
  if (mode === 'set-review') return 'Review this word once';
  if (mode === 'new-words-review') return 'Review this weekly word mix';
  if (mode === 'prior-words-review') return 'Review this prior word';
  const learner = getActiveLearner();
  const progress = learner ? getWordProgress(learner, wordText) : null;
  if (!progress) return 'Say this word';
  if (progress.mastery >= MASTERED_THRESHOLD - 1) return 'Almost mastered';
  if (progress.mastery > 0) return 'Keep building this word';
  return 'Say this word';
}

function currentTimerSeconds() {
  return state.session.type === 'price-review' ? state.timerSeconds + 5 : state.timerSeconds;
}

function updateTimerBar(remaining = currentTimerSeconds() * 1000) {
  const totalMs = currentTimerSeconds() * 1000;
  const percent = totalMs > 0 ? remaining / totalMs : 0;
  elements.timerProgress.style.transform = `scaleX(${percent})`;
  elements.timerProgress.style.background = percent < 0.25
    ? 'linear-gradient(90deg, #fb7185, #dc2626)'
    : 'linear-gradient(90deg, #0ea5e9, #0f766e)';
  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  elements.timerValue.textContent = `${seconds} seconds`;
  elements.timerValueVisible.textContent = `${seconds}s`;
}

function startBeepLoop() {
  stopBeepLoop();
  scheduleNextBeep();
}

function stopBeepLoop() {
  if (beepTimeoutId !== null) {
    clearTimeout(beepTimeoutId);
    beepTimeoutId = null;
  }
}

function scheduleNextBeep() {
  if (!state.session.active || state.session.paused) return;
  const timerMs = currentTimerSeconds() * 1000;
  const remainingMs = Math.max(0, state.session.roundStartedAt + timerMs - Date.now());
  if (remainingMs <= 0) return;
  const interval = 260 + 660 * (remainingMs / Math.max(1, timerMs));
  playBeep();
  beepTimeoutId = setTimeout(scheduleNextBeep, interval);
}

function getRoundRemainingMs() {
  if (state.session.paused && state.session.pausedRemainingMs !== null) {
    return state.session.pausedRemainingMs;
  }
  if (!state.session.roundStartedAt) return currentTimerSeconds() * 1000;
  return Math.max(0, state.session.roundStartedAt + currentTimerSeconds() * 1000 - Date.now());
}

function clearTimer(resetBar = true) {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  stopBeepLoop();
  if (resetBar) updateTimerBar(currentTimerSeconds() * 1000);
}

function startTimer(remainingMs = currentTimerSeconds() * 1000) {
  clearTimer(false);
  const timerMs = currentTimerSeconds() * 1000;
  const endAt = Date.now() + remainingMs;
  state.session.roundStartedAt = Date.now() - (timerMs - remainingMs);
  updateTimerBar(remainingMs);
  timerId = setInterval(() => {
    const remainingMs = Math.max(0, endAt - Date.now());
    updateTimerBar(remainingMs);
    if (remainingMs <= 0) {
      clearTimer();
      handleAnswer(false, true);
    }
  }, 100);
  startBeepLoop();
}

function beginRound() {
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
  elements.wordText.textContent = wordText;
  elements.wordStageTag.textContent = isWordReviewSession() ? 'Word review' : 'Mastery';
  elements.roundStatusTag.textContent = isWordReviewSession() ? 'Review only' : 'Live round';
  elements.lastWordText.textContent = wordText;
  startTimer();
  updateInteractionModeUI();
  saveState();
}

function finishSession() {
  const learner = getActiveLearner();
  if (!learner) return;

  clearTimer();
  state.session.active = false;
  state.session.paused = false;
  state.session.pausedRemainingMs = null;

  const entry = {
    timestamp: Date.now(),
    type: state.session.type,
    setIndex: state.session.setIndex,
    correct: state.session.correct,
    incorrect: state.session.incorrect,
    accuracy: sessionAccuracy(),
    masteredThisSession: state.session.masteredThisSession,
    completedSet: state.session.completedSet,
  };

  if (!state.session.skipHistory) {
    learner.history.push(entry);
    learner.history = learner.history.slice(-24);
  }

  if (state.session.completedSet && getSets()[state.session.setIndex + 1]) {
    state.lastWord = `${formatSetLabel(state.session.setIndex)} complete`;
  }

  updateUnlockedSets(learner);
  updateCurrentPlayerDisplay();
  updateDashboard();
  updateCoachBoard();
  updateHeroMission();
  updateAchievements();
  updateLeaderboard();
  updateReviewText();
  updateSetsGrid();
  updateInteractionModeUI();
  showScorecard();
  saveState();
}

function masteryPenalty() {
  return state.profile === 'emerging' ? 1 : 1;
}

function masteryGainForRound() {
  if (state.profile === 'emerging') return 1;
  if (!state.session.roundStartedAt) return 1;
  return Date.now() - state.session.roundStartedAt <= QUICK_MASTERY_WINDOW_MS ? 2 : 1;
}

function applyMasteryResult(progress, isPass, gain = 1) {
  if (isPass) {
    progress.mastery = Math.min(MASTERED_THRESHOLD, progress.mastery + gain);
  } else {
    progress.mastery = Math.max(0, progress.mastery - masteryPenalty());
  }

  progress.status = progress.mastery >= MASTERED_THRESHOLD
    ? 'mastered'
    : progress.mastery > 0 || progress.totalFails > 0
      ? 'learning'
      : 'new';
}

function maybeUnlockSet(learner, setIndex) {
  const before = learner.unlockedSetCount;
  const statsBefore = getSetStats(learner, setIndex);
  updateUnlockedSets(learner);
  return statsBefore.completed || learner.unlockedSetCount > before;
}

function pauseSession() {
  if (!state.session.active || !state.session.currentWord || state.session.paused) return;
  state.session.pausedRemainingMs = getRoundRemainingMs();
  state.session.paused = true;
  clearTimer(false);
  updateTimerBar(state.session.pausedRemainingMs);
  elements.roundStatusTag.textContent = 'Paused';
  elements.stageHintText.textContent = 'Paused. Tap Resume when you are ready.';
  updateInteractionModeUI();
  saveState();
}

function resumeSession() {
  if (!state.session.active || !state.session.currentWord || !state.session.paused) return;
  const remainingMs = state.session.pausedRemainingMs || currentTimerSeconds() * 1000;
  state.session.paused = false;
  state.session.pausedRemainingMs = null;
  elements.roundStatusTag.textContent = isReviewModeActive() ? 'Review only' : 'Live round';
  startTimer(remainingMs);
  updateInteractionModeUI();
  saveState();
}

function togglePauseSession() {
  if (state.session.paused) {
    resumeSession();
    return;
  }
  pauseSession();
}

function handleAnswer(isPass, timedOut = false) {
  if (!state.session.active || !state.session.currentWord || state.session.paused) return;

  clearTimer();
  const learner = getActiveLearner();
  const wordText = state.session.currentWord;
  const progress = getWordProgress(learner, wordText);
  if (!progress) return;

  learner.totalAttempts += 1;
  state.session.roundsPlayed += 1;
  pushRecentWord(wordText);

  if (isWordReviewSession()) {
    if (isPass) {
      learner.totalCorrect += 1;
      progress.reviewPasses += 1;
      state.session.correct += 1;
      state.session.streak += 1;
      state.session.bestStreak = Math.max(state.session.bestStreak, state.session.streak);
      trackSessionWord(wordText, 'correct');
      triggerFeedback('success');
      playSuccessTone();
      elements.roundStatusTag.textContent = 'Passed review';
    } else {
      progress.reviewFails += 1;
      state.session.incorrect += 1;
      state.session.streak = 0;
      trackSessionWord(wordText, 'practice');
      triggerFeedback('fail');
      playFailTone();
      elements.roundStatusTag.textContent = timedOut ? 'Timed out' : 'Keep this one nearby';
    }
  } else if (isPass) {
    const wasMastered = progress.mastery >= MASTERED_THRESHOLD;
    const masteryGain = masteryGainForRound();
    progress.totalPasses += 1;
    learner.totalCorrect += 1;
    state.session.correct += 1;
    state.session.streak += 1;
    state.session.bestStreak = Math.max(state.session.bestStreak, state.session.streak);
    applyMasteryResult(progress, true, masteryGain);
    triggerFeedback('success');
    playSuccessTone();
    if (masteryGain > 1) {
      showBonusText();
    }

    if (!wasMastered && progress.mastery >= MASTERED_THRESHOLD) {
      state.session.masteredThisSession += 1;
      trackSessionWord(wordText, 'mastered');
      showMasteredText();
      playLevelUpTone();
      elements.roundStatusTag.textContent = 'Mastered';
    } else {
      trackSessionWord(wordText, 'correct');
      elements.roundStatusTag.textContent = masteryGain > 1 ? 'Fast track' : 'Great job';
    }
  } else {
    progress.totalFails += 1;
    state.session.incorrect += 1;
    state.session.streak = 0;
    applyMasteryResult(progress, false);
    triggerFeedback('fail');
    playFailTone();
    trackSessionWord(wordText, 'practice');
    elements.roundStatusTag.textContent = timedOut ? 'Timed out' : 'Try again soon';
  }

  progress.lastReviewedAt = Date.now();
  state.lastWord = wordText;
  elements.lastWordText.textContent = `${wordText} ${isPass ? 'passed' : 'needs another try'}`;

  const setStats = getSetStats(learner, state.session.setIndex);
  if (state.session.type === 'mastery' && setStats.completed) {
    state.session.completedSet = maybeUnlockSet(learner, state.session.setIndex);
  }

  updateHeroMission();
  updateCurrentPlayerDisplay();
  updateDashboard();
  updateCoachBoard();
  updateReviewText();
  updateSetsGrid();
  saveState();

  const reviewFinished = isWordReviewSession() && state.session.queue.length === 0;
  const masteryFinished = state.session.type === 'mastery' && getSetStats(learner, state.session.setIndex).completed;
  const durationFinished = state.session.type === 'mastery'
    && state.session.roundsPlayed > 0
    && Date.now() - state.session.sessionStartedAt >= state.sessionDurationMinutes * 60 * 1000;

  state.session.currentWord = null;

  if (reviewFinished || masteryFinished || durationFinished) {
    finishSession();
    return;
  }

  setTimeout(beginRound, 450);
}

function triggerFeedback(kind) {
  clearFeedback();
  void elements.wordCard.offsetWidth;
  elements.wordCard.classList.add(kind);
}

function isReviewModeActive() {
  return state.session.active && [
    'set-review',
    'new-words-review',
    'prior-words-review',
    'number-review',
    'price-review',
    'range-review',
    'next-number',
    'count-by-review',
  ].includes(state.session.type);
}

function updateInteractionModeUI() {
  const learner = getActiveLearner();
  const reviewActive = isReviewModeActive();
  const practiceActive = state.session.active && !reviewActive;
  const setupActive = state.newWordsPaneOpen && !state.session.active;
  const roundLive = state.session.active && Boolean(state.session.currentWord);
  const paused = state.session.paused;
  document.body.classList.toggle('review-active', reviewActive);
  document.body.classList.toggle('practice-active', practiceActive);
  document.body.classList.toggle('new-words-setup-active', setupActive);
  elements.gamePanel.classList.toggle('review-active', reviewActive);
  elements.gamePanel.classList.toggle('practice-active', practiceActive);
  elements.gamePanel.classList.toggle('new-words-setup-active', setupActive);
  elements.newWordsSetupCard.classList.toggle('hidden', !setupActive);
  elements.reviewModeBanner.classList.toggle('hidden', !reviewActive);
  elements.reviewSetBtn.disabled = !learner || !getSetStats(learner, learner.activeSetIndex).unlocked || state.session.active;
  elements.reviewNowBtn.disabled = !learner || state.session.active;
  elements.startBtn.disabled = !learner || state.session.active;
  elements.wordSetMasteryBtn.disabled = !learner || state.session.active;
  elements.reviewNewWordsBtn.disabled = !learner || state.session.active;
  elements.reviewPriorWordsBtn.disabled = !learner || state.session.active;
  elements.numberTeenFocusBtn.disabled = !learner || state.session.active;
  elements.numberPricesBtn.disabled = !learner || state.session.active;
  elements.numberRangeBtn.disabled = !learner || state.session.active;
  elements.numberNextBtn.disabled = !learner || state.session.active;
  elements.stopSessionBtn.disabled = !state.session.active;
  elements.passBtn.disabled = !roundLive || paused;
  elements.failBtn.disabled = !roundLive;
  elements.addNewWordsBtn.disabled = !learner || state.session.active;
  elements.startNewWordsReviewBtn.disabled = !learner || state.session.active || (learner.weeklyWords || []).length === 0;
  elements.failBtn.textContent = paused ? 'Resume' : 'Pause';
  elements.passBtn.classList.toggle('review-primary', reviewActive);
  elements.failBtn.classList.toggle('hidden', false);
  elements.exitReviewBtn.classList.toggle('hidden', !reviewActive);
  elements.reviewBannerTitle.textContent = paused
    ? `${sessionModeLabel()} is paused.`
    : reviewActive
      ? `${sessionModeLabel()} is full screen.`
      : 'Review mode is simplified.';
  elements.reviewBannerCopy.textContent = reviewActive
    ? paused
      ? 'The timer is stopped. Resume when you are ready, or swipe left to close review.'
      : 'Each prompt appears once. Tap I Got It for correct answers, Pause for a break, or swipe left to close review.'
    : paused
      ? 'The timer is stopped. Resume keeps the current card in place.'
      : 'Use I Got It for correct answers. Pause keeps the current card and timer right where they are.';
  elements.stageHintText.textContent = paused
    ? 'Paused. Tap Resume when you are ready.'
    : reviewActive
      ? 'Review keeps mastery unchanged. Pause if you need a moment, then resume from the same prompt.'
      : 'Start set mastery to build words to 3 checks. Pause keeps the timer from running down.';
}

function updateSetsGrid() {
  const learner = getActiveLearner();
  if (!learner) {
    elements.setsGrid.innerHTML = '<div class="achievement-card locked">Add a learner to unlock set tracking.</div>';
    return;
  }

  elements.setsGrid.innerHTML = getSets()
    .map((set) => {
      const stats = getSetStats(learner, set.index);
      const locked = !stats.unlocked;
      const active = learner.activeSetIndex === set.index;
      const wordsPreview = set.words.join(', ');
      return `
        <article class="set-card${locked ? ' locked' : ''}${active ? ' active' : ''}">
          <div class="set-card-top">
            <div>
              <div class="set-title">${set.title}</div>
              <div class="set-meta">${stats.mastered} / ${stats.total} mastered</div>
            </div>
            <div class="set-badge">${locked ? 'Locked' : stats.completed ? 'Complete' : active ? 'Current' : 'Open'}</div>
          </div>
          <div class="set-words">${wordsPreview}</div>
          <div class="set-actions">
            <button class="secondary" data-action="choose-set" data-set-index="${set.index}" ${locked ? 'disabled' : ''}>Use This Set</button>
            <button class="primary" data-action="start-set" data-set-index="${set.index}" ${locked ? 'disabled' : ''}>Master Set</button>
            <button class="secondary" data-action="review-set" data-set-index="${set.index}" ${locked ? 'disabled' : ''}>Review Set</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function updateStatsPanel() {
  const learner = getActiveLearner();
  if (!learner) return;

  elements.statsLearnerName.textContent = `${learner.avatar} ${learner.name}`;
  elements.statsSessionsValue.textContent = learner.history.length;
  elements.statsAccuracyValue.textContent = `${learnerAccuracy(learner)}%`;
  elements.statsMasteredWordsValue.textContent = Object.values(learner.wordProgress)
    .filter((progress) => progress.mastery >= MASTERED_THRESHOLD)
    .length;
  elements.statsCompletedSetsValue.textContent = Math.max(0, learner.unlockedSetCount - 1);
  elements.statsUnlockedSetsList.innerHTML = wordBadgeList(
    getSets().slice(0, learner.unlockedSetCount).map((set) => set.title),
    'No unlocked sets yet.'
  );

  if (learner.history.length === 0) {
    elements.statsHistoryList.innerHTML = '<div class="leaderboard-empty">No sessions yet.</div>';
    return;
  }

  elements.statsHistoryList.innerHTML = learner.history
    .slice(-8)
    .reverse()
    .map((entry) => `
      <div class="leaderboard-row">
        <div class="leaderboard-rank">${entry.type === 'set-review' ? 'R' : 'M'}</div>
        <div>
          <div class="leaderboard-name">${formatSetLabel(entry.setIndex)}</div>
          <div class="leaderboard-meta">${entry.accuracy}% accuracy · ${entry.correct} correct · ${entry.masteredThisSession} mastered</div>
        </div>
        <div class="leaderboard-score">${entry.completedSet ? 'Unlocked' : 'Done'}</div>
      </div>
    `)
    .join('');
}

function openStatsPanel() {
  state.statsPanelOpen = true;
  updateStatsPanel();
  elements.learnerStatsPanel.classList.remove('hidden');
}

function closeStatsPanel() {
  state.statsPanelOpen = false;
  elements.learnerStatsPanel.classList.add('hidden');
}

function tearDownSession() {
  clearTimer();
  state.session.active = false;
  state.session.currentWord = null;
  state.session.queue = [];
}

function startSession(type, setIndex) {
  const learner = getActiveLearner();
  if (!learner) return;

  primeSounds();
  tearDownSession();
  if (type === 'mastery') {
    learner.activeSetIndex = setIndex;
  }
  state.session = createEmptySession();
  state.newWordsPaneOpen = false;
  state.session.active = true;
  state.session.type = type;
  state.session.setIndex = setIndex;
  state.session.sessionStartedAt = Date.now();
  state.session.queue = getSessionQueue(learner);
  elements.scorecardPanel.classList.add('hidden');
  elements.nextStepCard.classList.add('hidden');

  updateCurrentPlayerDisplay();
  updateDashboard();
  updateCoachBoard();
  updateHeroMission();
  updateReviewText();
  updateSetsGrid();
  updateInteractionModeUI();
  if (type !== 'mastery') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  beginRound();
}

function startCurrentSetMastery() {
  const learner = getActiveLearner();
  if (!learner) return;
  startSession('mastery', learner.activeSetIndex);
}

function startWeeklyWordsReview() {
  const learner = getActiveLearner();
  if (!learner) return;
  openNewWordsPane();
}

function startWeeklyWordsReviewSession() {
  const learner = getActiveLearner();
  if (!learner || (learner.weeklyWords || []).length === 0) {
    openNewWordsPane();
    return;
  }
  closeNewWordsPane(false);
  startSession('new-words-review', learner.activeSetIndex);
}

function startPriorWordsReview() {
  const learner = getActiveLearner();
  if (!learner) return;
  startSession('prior-words-review', learner.activeSetIndex);
}

function openNewWordsPane() {
  const learner = getActiveLearner();
  if (!learner) return;
  tearDownSession();
  state.newWordsPaneOpen = true;
  elements.scorecardPanel.classList.add('hidden');
  elements.nextStepCard.classList.add('hidden');
  elements.newWordsSetupInput.value = '';
  resetStageToIdle();
  updateAllUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeNewWordsPane(update = true) {
  state.newWordsPaneOpen = false;
  if (update) updateAllUI();
}

function addWordsToNextMasterySet(words, learner) {
  const incoming = uniqueWords(words);
  if (incoming.length === 0) return [];

  const existingKeys = new Set(state.wordList.map(normalizeWordKey));
  const newWords = incoming.filter((word) => !existingKeys.has(normalizeWordKey(word)));
  const setSize = getMasterySetSize();
  const insertAt = Math.min(state.wordList.length, (learner.activeSetIndex + 1) * setSize);

  if (newWords.length > 0) {
    state.wordList = uniqueWords([
      ...state.wordList.slice(0, insertAt),
      ...newWords,
      ...state.wordList.slice(insertAt),
    ]);
  }

  state.learners.forEach((item) => ensureLearnerProgress(item));
  learner.weeklyWords = uniqueWords([...(learner.weeklyWords || []), ...incoming])
    .filter((word) => state.wordList.some((item) => normalizeWordKey(item) === normalizeWordKey(word)));
  return incoming;
}

function addNewWordsFromPane() {
  const learner = getActiveLearner();
  if (!learner) return;

  const words = parseInlineWords(elements.newWordsSetupInput.value);
  if (words.length === 0) {
    alert('Add at least one word first.');
    return;
  }

  addWordsToNextMasterySet(words, learner);
  elements.newWordsSetupInput.value = '';
  buildWordEditorText();
  updateAllUI();
  saveState();
}

function startNextUnlockedSet() {
  const nextSetIndex = getNextSetIndex();
  if (nextSetIndex === null) return;
  startSession('mastery', nextSetIndex);
}

function startReviewSession(setIndex = null) {
  const learner = getActiveLearner();
  if (!learner) return;
  const reviewIndex = setIndex === null ? learner.activeSetIndex : setIndex;
  startSession('set-review', reviewIndex);
}

function exitReviewSession() {
  tearDownSession();
  resetStageToIdle();
  updateCurrentPlayerDisplay();
  updateCoachBoard();
  updateHeroMission();
  updateReviewText();
  updateSetsGrid();
  updateInteractionModeUI();
  saveState();
}

function stopSession() {
  if (!state.session.active) {
    resetStageToIdle();
    return;
  }
  finishSession();
}

function startNewSession() {
  startCurrentSetMastery();
}

function resumeLearnerProgress() {
  const learner = getActiveLearner();
  if (!learner || state.session.active) return;
  const stats = getSetStats(learner, learner.activeSetIndex);
  if (stats.completed) {
    const nextSetIndex = learner.activeSetIndex + 1;
    if (nextSetIndex < learner.unlockedSetCount) {
      startSession('mastery', nextSetIndex);
      return;
    }
    startReviewSession(learner.activeSetIndex);
    return;
  }
  startCurrentSetMastery();
}

function addLearner() {
  const name = elements.newLearnerName.value.trim();
  if (!name) {
    alert('Please type a learner name first.');
    return;
  }

  if (state.learners.some((learner) => learner.name.toLowerCase() === name.toLowerCase())) {
    alert('That learner name already exists. Please choose a different name.');
    return;
  }

  const learner = createLearner(name, avatarValue(elements.newLearnerCustomAvatar, elements.newLearnerAvatar));
  ensureLearnerProgress(learner);
  state.learners.push(learner);
  state.activeLearnerId = learner.id;
  elements.newLearnerName.value = '';
  elements.newLearnerCustomAvatar.value = '';
  updateLearnerSelect();
  updateAllUI();
  saveState();
}

function createPromptLearner() {
  const name = elements.promptLearnerName.value.trim();
  if (!name) {
    alert('Please type a learner name first.');
    return;
  }

  if (state.learners.some((learner) => learner.name.toLowerCase() === name.toLowerCase())) {
    alert('That learner name already exists. Please choose a different name.');
    return;
  }

  const learner = createLearner(name, avatarValue(elements.promptLearnerCustomAvatar, elements.promptLearnerAvatar));
  ensureLearnerProgress(learner);
  state.learners.push(learner);
  state.activeLearnerId = learner.id;
  elements.promptLearnerName.value = '';
  elements.promptLearnerCustomAvatar.value = '';
  updateAllUI();
  saveState();
}

function renameLearner() {
  const learner = getActiveLearner();
  if (!learner) return;

  const nextName = prompt('Rename learner', learner.name)?.trim();
  if (!nextName || nextName === learner.name) return;

  if (state.learners.some((item) => item.id !== learner.id && item.name.toLowerCase() === nextName.toLowerCase())) {
    alert('That learner name already exists. Please choose a different name.');
    return;
  }

  learner.name = nextName;
  updateAllUI();
  saveState();
}

function deleteLearner() {
  const learner = getActiveLearner();
  if (!learner) return;

  const confirmed = confirm(`Delete ${learner.name} and all of this learner's local progress?`);
  if (!confirmed) return;

  state.learners = state.learners.filter((item) => item.id !== learner.id);
  state.activeLearnerId = state.learners[0]?.id || null;
  tearDownSession();
  closeStatsPanel();
  resetStageToIdle();
  updateAllUI();
  saveState();
}

function selectLearner(learnerId) {
  if (!state.learners.some((learner) => learner.id === learnerId)) return;
  state.activeLearnerId = learnerId;
  tearDownSession();
  resetStageToIdle();
  updateAllUI();
  saveState();
}

function saveWordList() {
  const words = parseWordEditorText();
  if (words.length === 0) {
    alert('Please add at least one word before saving.');
    return;
  }

  state.wordList = words;
  state.learners.forEach((learner) => ensureLearnerProgress(learner));
  tearDownSession();
  buildWordEditorText();
  updateAllUI();
  saveState();
}

function loadDefaultWords() {
  elements.wordEditorText.value = DEFAULT_WORDS.join('\n');
  updateWordCount();
}

function saveWeeklyWords() {
  const learner = getActiveLearner();
  if (!learner) return;

  const weeklyWords = parseInlineWords(elements.weeklyWordsInput.value);
  addWordsToNextMasterySet(weeklyWords, learner);
  learner.weeklyWords = uniqueWords(weeklyWords)
    .filter((word) => state.wordList.some((item) => normalizeWordKey(item) === normalizeWordKey(word)));
  buildWordEditorText();
  updateAllUI();
  saveState();
}

function resetProgress() {
  if (!confirm('Reset all learner progress, unlocked sets, and local history?')) return;

  localStorage.removeItem(STORAGE_KEY);
  state.wordList = [...DEFAULT_WORDS];
  state.learners = [];
  state.activeLearnerId = null;
  state.recentWords = [];
  state.lastWord = 'None';
  state.session = createEmptySession();
  closeStatsPanel();
  buildWordEditorText();
  updateAllUI();
  saveState();
}

async function clearCacheAndReload() {
  const confirmed = confirm('Load the latest app files? Learner profiles and progress will stay saved on this device.');
  if (!confirmed) return;

  const savedStudioData = localStorage.getItem(STORAGE_KEY);
  elements.clearCacheBtn.disabled = true;
  updateAppStatus('Loading the latest app files while keeping learner profiles...');

  try {
    if (savedStudioData) {
      localStorage.setItem(STORAGE_KEY, savedStudioData);
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch (error) {
    console.warn('Unable to fully clear cache before reload.', error);
  } finally {
    if (savedStudioData && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, savedStudioData);
    }
  }

  window.location.reload();
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: 'sight-words-studio',
    version: 2,
    timerSeconds: state.timerSeconds,
    sessionDurationMinutes: state.sessionDurationMinutes,
    customNumberRange: state.customNumberRange,
    masterySetSize: state.masterySetSize,
    profile: state.profile,
    wordList: state.wordList,
    learners: state.learners,
    activeLearnerId: state.activeLearnerId,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sight-words-studio-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applyImportedData(parsed) {
  if (!parsed || !Array.isArray(parsed.wordList) || !Array.isArray(parsed.learners)) {
    throw new Error('Invalid import format.');
  }

  state.wordList = parsed.wordList.filter(Boolean);
  state.learners = parsed.learners;
  state.activeLearnerId = parsed.activeLearnerId || parsed.learners[0]?.id || null;
  state.timerSeconds = parsed.timerSeconds || state.timerSeconds;
  state.sessionDurationMinutes = parsed.sessionDurationMinutes || state.sessionDurationMinutes;
  state.customNumberRange = normalizeCustomNumberRange(parsed.customNumberRange);
  state.masterySetSize = Math.max(4, Math.min(20, Number(parsed.masterySetSize) || state.masterySetSize));
  state.profile = parsed.profile || state.profile;
  state.learners.forEach((learner) => ensureLearnerProgress(learner));
  if (!getActiveLearner() && state.learners[0]) {
    state.activeLearnerId = state.learners[0].id;
  }
}

async function importDataFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const confirmed = confirm('Replace the current local studio data with this imported file?');
    if (!confirmed) {
      event.target.value = '';
      return;
    }

    applyImportedData(parsed);
    tearDownSession();
    closeStatsPanel();
    buildWordEditorText();
    resetStageToIdle();
    updateAllUI();
    saveState();
  } catch (error) {
    alert('That file could not be imported. Please choose a valid studio export JSON file.');
  } finally {
    event.target.value = '';
  }
}

function handleReviewSwipeStart(event) {
  if (!isReviewModeActive()) return;
  const touch = event.touches?.[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleReviewSwipeEnd(event) {
  if (!isReviewModeActive() || touchStartX === null || touchStartY === null) return;
  const touch = event.changedTouches?.[0];
  if (!touch) return;

  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  touchStartX = null;
  touchStartY = null;

  if (deltaX <= -80 && Math.abs(deltaY) < 42) {
    exitReviewSession();
  }
}

function clearReviewSwipe() {
  touchStartX = null;
  touchStartY = null;
}

function updateAllUI() {
  updateLearnerSelect();
  updateWeeklyWordsUI();
  updateCurrentPlayerDisplay();
  updateDashboard();
  updateCoachBoard();
  updateHeroMission();
  updateReviewText();
  updateAchievements();
  updateLeaderboard();
  updateProfileUI();
  updateSetsGrid();
  updateInteractionModeUI();
  updateLearnerPrompt();
  if (state.statsPanelOpen) {
    updateStatsPanel();
  }
}

function handleSetGridClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const setIndex = Number(button.dataset.setIndex);
  const learner = getActiveLearner();
  if (!learner || Number.isNaN(setIndex)) return;
  const stats = getSetStats(learner, setIndex);
  if (!stats.unlocked) return;

  const action = button.dataset.action;
  if (action === 'choose-set') {
    learner.activeSetIndex = setIndex;
    updateAllUI();
    saveState();
    return;
  }

  if (action === 'start-set') {
    startSession('mastery', setIndex);
    return;
  }

  if (action === 'review-set') {
    startReviewSession(setIndex);
  }
}

function attachEvents() {
  const unlockAudio = () => primeSounds();
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  document.addEventListener('keydown', unlockAudio);

  elements.learnerSelect.addEventListener('change', (event) => selectLearner(event.target.value));
  elements.addLearnerBtn.addEventListener('click', addLearner);
  elements.createPromptLearnerBtn.addEventListener('click', createPromptLearner);
  elements.promptLearnerName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') createPromptLearner();
  });
  elements.renameLearnerBtn.addEventListener('click', renameLearner);
  elements.deleteLearnerBtn.addEventListener('click', deleteLearner);
  elements.showLearnerStatsBtn.addEventListener('click', openStatsPanel);
  elements.closeLearnerStatsBtn.addEventListener('click', closeStatsPanel);
  elements.exportDataBtn.addEventListener('click', exportData);
  elements.importDataBtn.addEventListener('click', () => elements.importDataInput.click());
  elements.importDataInput.addEventListener('change', importDataFromFile);
  elements.timerSeconds.addEventListener('change', () => {
    state.timerSeconds = Math.max(5, Math.min(30, Number(elements.timerSeconds.value)));
    elements.timerSeconds.value = state.timerSeconds;
    saveState();
  });
  elements.sessionDuration.addEventListener('change', () => {
    state.sessionDurationMinutes = Math.max(1, Math.min(30, Number(elements.sessionDuration.value)));
    elements.sessionDuration.value = state.sessionDurationMinutes;
    saveState();
  });
  elements.customNumberMin.addEventListener('change', saveCustomNumberRange);
  elements.customNumberMax.addEventListener('change', saveCustomNumberRange);
  elements.masterySetSize.addEventListener('change', () => {
    state.masterySetSize = Math.max(4, Math.min(20, Number(elements.masterySetSize.value) || DEFAULT_SET_SIZE));
    saveMasterySetSize();
  });
  elements.profileSelect.addEventListener('change', () => {
    state.profile = elements.profileSelect.value;
    updateProfileUI();
    updateCoachBoard();
    saveState();
  });

  elements.saveWeeklyWordsBtn.addEventListener('click', saveWeeklyWords);
  elements.weeklyWordsInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') saveWeeklyWords();
  });
  elements.addNewWordsBtn.addEventListener('click', addNewWordsFromPane);
  elements.newWordsSetupInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') addNewWordsFromPane();
  });
  elements.startNewWordsReviewBtn.addEventListener('click', startWeeklyWordsReviewSession);
  elements.closeNewWordsPaneBtn.addEventListener('click', () => closeNewWordsPane());
  elements.loadDefaultWordsBtn.addEventListener('click', loadDefaultWords);
  elements.saveWordListBtn.addEventListener('click', saveWordList);
  elements.wordEditorText.addEventListener('input', updateWordCount);
  elements.resetProgressBtn.addEventListener('click', resetProgress);
  elements.reviewNowBtn.addEventListener('click', () => startReviewSession());
  elements.reviewSetBtn.addEventListener('click', () => startReviewSession());
  elements.exitReviewBtn.addEventListener('click', exitReviewSession);
  elements.clearCacheBtn.addEventListener('click', clearCacheAndReload);
  elements.startBtn.addEventListener('click', startCurrentSetMastery);
  elements.wordSetMasteryBtn.addEventListener('click', startCurrentSetMastery);
  elements.reviewNewWordsBtn.addEventListener('click', startWeeklyWordsReview);
  elements.reviewPriorWordsBtn.addEventListener('click', startPriorWordsReview);
  elements.resumeActionBtn.addEventListener('click', resumeLearnerProgress);
  elements.nextSetBtn.addEventListener('click', startNextUnlockedSet);
  elements.reviewCompletedSetBtn.addEventListener('click', () => startReviewSession(state.session.setIndex));
  elements.passBtn.addEventListener('click', () => handleAnswer(true));
  elements.failBtn.addEventListener('click', togglePauseSession);
  elements.stopSessionBtn.addEventListener('click', stopSession);
  elements.newSessionBtn.addEventListener('click', startNewSession);
  elements.wordCard.addEventListener('touchstart', handleReviewSwipeStart, { passive: true });
  elements.wordCard.addEventListener('touchend', handleReviewSwipeEnd, { passive: true });
  elements.wordCard.addEventListener('touchcancel', clearReviewSwipe, { passive: true });
  elements.setsGrid.addEventListener('click', handleSetGridClick);

  window.addEventListener('online', () => updateAppStatus('Online and ready.'));
  window.addEventListener('offline', () => updateAppStatus('Offline mode active.'));
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    updateAppStatus('Online and ready.');
  });
  window.addEventListener('appinstalled', () => {
    updateAppStatus('App ready.');
  });

  document.addEventListener('keydown', (event) => {
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
    if (event.code === 'Space') {
      event.preventDefault();
      if (state.session.active && state.session.currentWord) {
        handleAnswer(true);
      } else {
        startCurrentSetMastery();
      }
    }
    if ((event.code === 'KeyP' || event.code === 'KeyX') && state.session.active && state.session.currentWord) {
      event.preventDefault();
      togglePauseSession();
    }
    if (event.code === 'Escape' && isReviewModeActive()) {
      event.preventDefault();
      exitReviewSession();
    }
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    updateAppStatus('Online and ready.');
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!appUpdateReloading) return;
    window.location.reload();
  });

  navigator.serviceWorker.register('./sw.js').then((registration) => {
    appUpdateRegistration = registration;
    if (registration.waiting && navigator.serviceWorker.controller) {
      showAppUpdateButton(registration);
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showAppUpdateButton(registration);
        }
      });
    });

    registration.update().catch(() => {});
    updateAppStatus(navigator.onLine ? 'Ready.' : 'Offline mode active.');
  }).catch(() => {
    updateAppStatus('Ready in browser mode.');
  });
}

function initialize() {
  loadState();
  ensureAppUpdateButton();
  hideAppUpdateButton();
  elements.timerSeconds.value = state.timerSeconds;
  elements.sessionDuration.value = state.sessionDurationMinutes;
  state.customNumberRange = normalizeCustomNumberRange();
  elements.customNumberMin.value = state.customNumberRange.min;
  elements.customNumberMax.value = state.customNumberRange.max;
  state.masterySetSize = getMasterySetSize();
  elements.masterySetSize.value = state.masterySetSize;
  elements.profileSelect.value = state.profile;
  buildWordEditorText();
  attachEvents();
  resetStageToIdle();
  updateAllUI();
  saveState();
  registerServiceWorker();
}

initialize();
