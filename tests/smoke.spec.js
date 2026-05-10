// @ts-check
const { test, expect } = require('@playwright/test');

const STORAGE_KEY = 'sightWordsStudioV2';

const seededLearner = {
  timerSeconds: 10,
  sessionDurationMinutes: 2,
  masterySetSize: 10,
  profile: 'emerging',
  wordList: ['the', 'and', 'a', 'to', 'is', 'you', 'it', 'in', 'was', 'said'],
  learners: [
    {
      id: 'learner-test-1',
      name: 'Test Learner',
      avatar: '🌟',
      score: 0,
      progress: {},
      currentSetIndex: 0,
      unlockedSets: 1,
      sessionHistory: [],
    },
  ],
  activeLearnerId: 'learner-test-1',
};

async function seedLearner(page) {
  await page.addInitScript(
    ([key, payload]) => {
      window.localStorage.setItem(key, JSON.stringify(payload));
    },
    [STORAGE_KEY, seededLearner],
  );
}

test.describe('first-time experience', () => {
  test('loads with first-learner prompt visible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sight Words Studio/i);
    await expect(page.locator('#learnerPrompt')).toBeVisible();
    await expect(page.getByRole('heading', { name: /choose a learner/i })).toBeVisible();
  });

  test('creates a learner from the prompt', async ({ page }) => {
    await page.goto('/');
    await page.locator('#promptLearnerName').fill('Robin');
    await page.locator('#createPromptLearnerBtn').click();
    await expect(page.locator('#learnerPrompt')).toBeHidden();
    await expect(page.locator('#currentPlayerName')).toHaveText(/Robin/i);
  });
});

test.describe('seeded learner', () => {
  test.beforeEach(async ({ page }) => {
    await seedLearner(page);
    await page.goto('/');
  });

  test('shows the seeded learner in the player card', async ({ page }) => {
    await expect(page.locator('#learnerPrompt')).toBeHidden();
    await expect(page.locator('#currentPlayerName')).toHaveText(/Test Learner/i);
  });

  test('renders the words tab by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Sight Words/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Word Sets/i })).toBeVisible();
  });

  test('switches between tabs via the tab bar', async ({ page }) => {
    await page.locator('.sws-tab[data-tab="numbers"]').click();
    await expect(page.getByRole('heading', { name: /Number Recognition/i })).toBeVisible();

    await page.locator('.sws-tab[data-tab="settings"]').click();
    await expect(page.getByRole('heading', { name: /Studio Setup/i })).toBeVisible();

    await page.locator('.sws-tab[data-tab="stats"]').click();
    await expect(page.getByRole('heading', { name: /Coach Board/i })).toBeVisible();
  });

  test('starts a Set Mastery session and accepts an answer', async ({ page }) => {
    await page.locator('#wordSetMasteryBtn').click();

    const wordText = page.locator('#wordText');
    await expect(wordText).not.toHaveText(/Tap start to begin/i);
    const firstWord = (await wordText.textContent())?.trim();
    expect(firstWord && firstWord.length).toBeGreaterThan(0);

    await expect(page.locator('#passBtn')).toBeEnabled();
    await page.locator('#passBtn').click();
    await expect(page.locator('#lastWordText')).toHaveText(new RegExp(firstWord, 'i'));
  });

  test('exposes number recognition modes', async ({ page }) => {
    await page.locator('.sws-tab[data-tab="numbers"]').click();
    await expect(page.locator('#numberTeenFocusBtn')).toBeVisible();
    await expect(page.locator('#numberPricesBtn')).toBeVisible();
    await expect(page.locator('#numberRangeBtn')).toBeVisible();
    await expect(page.locator('#numberCountByBtn')).toBeVisible();
  });
});

test.describe('PWA shell', () => {
  test('manifest is reachable and well-formed', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();
    const manifest = await response.json();
    expect(manifest.name || manifest.short_name).toBeTruthy();
    expect(Array.isArray(manifest.icons) && manifest.icons.length).toBeGreaterThan(0);
  });

  test('service worker script is reachable', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.ok()).toBeTruthy();
  });
});
