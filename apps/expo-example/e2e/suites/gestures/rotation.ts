import { spawn } from 'node:child_process';

// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

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

export function rotationTests() {
  describe('test rotation gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Rotation);
    });

    const gestureBox = element(by.id('rotation-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should register rotation gesture on rotation', async () => {
      const udid = device.id;

      await argentRotate(udid, {
        centerX: '0.5',
        centerY: '0.55',
        startAngle: '0',
        endAngle: '90',
        radius: '0.05',
      });

      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Rotation: ${CB.B}${CB.A}${CB.U}${CB.D}${CB.F}}`
      );
    });

    test('Shouldn`t register a rotation gesture on tap', async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(`{Rotation: }`);
    });
  });
}
