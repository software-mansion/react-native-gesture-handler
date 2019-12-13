/* global page */
import { setDefaultOptions } from 'expect-puppeteer';

import config from '../jest-puppeteer.config';

// This is how long we allocate for the actual tests to be run after the test screen has mounted.
const MIN_TIME = 50000;
const RENDER_MOUNTING_TIMEOUT = 2000;

setDefaultOptions({
  timeout: MIN_TIME * 1.5,
});

describe('Example', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetPage();
    /// Pause the timeout
    await page.goto(config.url);
  });

  async function navigateToGesturePageAsync() {
    const [el] = await page.$x("//div[contains(text(), 'Multitap')]");
    await el.click({ delay: 1 });
    await el.click({ delay: 1 });

    await matchID('rectangle', {
      visible: true,
      timeout: RENDER_MOUNTING_TIMEOUT,
    });

    // Focus
    await page.click(`div[data-testid="rectangle"]`, { delay: 900 });
  }

  it(
    'can double tap',
    async () => {
      await navigateToGesturePageAsync();

      // Double tap
      await page.tap(`div[data-testid="rectangle"]`);
      await page.tap(`div[data-testid="rectangle"]`);

      await matchID('double_tap', {
        visible: true,
        timeout: RENDER_MOUNTING_TIMEOUT,
      });
    },
    MIN_TIME
  );
  it(
    'can single tap',
    async () => {
      await navigateToGesturePageAsync();

      // single tap
      await page.tap(`div[data-testid="rectangle"]`);

      await matchID('single_tap', {
        visible: true,
        timeout: RENDER_MOUNTING_TIMEOUT,
      });
    },
    MIN_TIME
  );
  it(
    'can long press',
    async () => {
      await navigateToGesturePageAsync();

      // long tap
      await page.click(`div[data-testid="rectangle"]`, { delay: 900 });

      await matchID('long_press', {
        visible: true,
        timeout: RENDER_MOUNTING_TIMEOUT,
      });
    },
    MIN_TIME
  );
});

function matchID(id, ...props) {
  return expect(page).toMatchElement(`div[data-testid="${id}"]`, ...props);
}
