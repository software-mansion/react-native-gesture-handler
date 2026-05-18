import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, element, expect } from 'detox';
import { navigateTo } from './utils';

describe('test fling gesture', () => {
  beforeAll(async () => {
    await navigateTo('Fling Gesture');
  });

  const wrongElement = element(by.id('wrong-element'));
  const flingElement = element(by.id('fling-idle'));
  const flingActivatedElement = element(by.id('fling-activated'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('shouldn`t register a fling gesture on tap', async () => {
    await expect(flingElement).toExist();
    await flingElement.tap();
    await expect(flingActivatedElement).not.toExist();
  });

  it('shouldn`t register a fling gesture on different element', async () => {
    await expect(wrongElement).toExist();
    await wrongElement.swipe('right', 'fast');
    await expect(flingActivatedElement).not.toExist();
  });

  it('should register a fling gesture in the correct direction', async () => {
    await expect(flingElement).toExist();
    await flingElement.swipe('right', 'fast');
    await expect(flingActivatedElement).toExist();
  });

  it('shouldnt register a fling gesture in the wrong direction', async () => {
    await expect(flingElement).toExist();
    await flingElement.swipe('left', 'fast');
    await expect(flingActivatedElement).not.toExist();
  });
});
