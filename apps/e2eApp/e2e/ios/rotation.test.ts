import { spawn } from 'node:child_process';
import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

type RotationArgs = {
  centerX: string;
  centerY: string;
  radius: string;
  startAngle: string;
  endAngle: string;
};

function argentRotate(udid: string, ra: RotationArgs): Promise<boolean> {
  console.log('Starting argent with udid=', udid);

  const child = spawn(
    'argent',
    [
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
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  return new Promise((resolve, reject) => {
    const timeoutMs = 30000;
    const timeout = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch (e) {
        console.error('Failed to kill Argent process:', e);
      }
      reject(new Error(`Argent timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout?.on('data', data => {
      console.log(`Argent stdout: ${data.toString().trim()}`);
    });
    child.stderr?.on('data', data => {
      console.error(`Argent stderr: ${data.toString().trim()}`);
    });

    child.on('exit', code => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Argent process exited with code ${code}`));
      }
    });
    child.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

describe('test rotation gesture', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-gesture-tests')).tap();
    await element(by.id('nav-rotation')).tap();
  });

  const rotationElement = element(by.id('rotation-idle'));
  const rotationActivatedElement = element(by.id('rotation-activated'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('shouldn`t register a rotation gesture on tap', async () => {
    await expect(rotationElement).toExist();
    await rotationElement.tap();
    await expect(rotationActivatedElement).not.toExist();
  });
  it('should register a rotation gesture', async () => {
    if (device.getPlatform() !== 'ios') {
      return;
    }

    const udid = device.id;

    await expect(rotationElement).toExist();

    const res = await argentRotate(udid, {
      centerX: '0.5',
      centerY: '0.5',
      startAngle: '0',
      endAngle: '90',
      radius: '0.05',
    });

    console.log('Rotation result:', res);
    await expect(rotationActivatedElement).toExist();
  });
});
