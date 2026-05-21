import { spawn } from 'node:child_process';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

type RotationArgs = {
  centerX: string;
  centerY: string;
  radius: string;
  startAngle: string;
  endAngle: string;
};

function argentRotate(udid: string, ra: RotationArgs): Promise<boolean> {
  const child = spawn('argent', [
    'run',
    'gesture-rotate',
    '--udid',
    udid,
    '--centerX',
    ra.centerX,
    '--centerY',
    ra.centerY,
    '--startAngle',
    ra.startAngle,
    '--endAngle',
    ra.endAngle,
    '--radius',
    ra.radius,
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

describe('test rotation gesture', () => {
  beforeAll(async () => {
    await navigateTo(TestScreens.Rotation);
  });

  const gestureBox = element(by.id('rotation-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Should register rotation gesture on rotation', async () => {
    const udid = device.id;

    await argentRotate(udid, {
      centerX: '0.5',
      centerY: '0.55',
      startAngle: '0',
      endAngle: '90',
      radius: '0.05',
    });

    await expect(stateIndicator).toHaveText('12345');
  });

  test('Shouldn`t register a rotation gesture on tap', async () => {
    await gestureBox.tap();
    await expect(stateIndicator).toHaveText('');
  });
});
