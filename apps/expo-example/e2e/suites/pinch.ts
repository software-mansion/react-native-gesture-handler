import { spawn } from 'node:child_process';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

type PinchArgs = {
  centerX: string;
  centerY: string;
  startDistance: string;
  endDistance: string;
};

function argentPinch(udid: string, pa: PinchArgs): Promise<boolean> {
  const child = spawn('argent', [
    'run',
    'gesture-pinch',
    '--udid',
    udid,
    '--centerX',
    pa.centerX,
    '--centerY',
    pa.centerY,
    '--startDistance',
    pa.startDistance,
    '--endDistance',
    pa.endDistance,
  ]);
  return new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Argent process exited with code ${code}`));
      }
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
}

export function pinchTests() {
  describe('test pinch gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Pinch);
    });

    const gestureBox = element(by.id('pinch-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const resetButton = element(by.id('reset'));

    beforeEach(async () => {
      await resetButton.tap();
    });

    test('Should register pinch gesture on pinch', async () => {
      const udid = device.id;

      await argentPinch(udid, {
        centerX: '0.5',
        centerY: '0.55',
        startDistance: '0.2',
        endDistance: '0.6',
      });

      await expect(stateIndicator).toHaveText('12345');
    });

    test('Shouldn`t register a pinch gesture on tap', async () => {
      await gestureBox.tap();
      await expect(stateIndicator).toHaveText('');
    });
  });
}
