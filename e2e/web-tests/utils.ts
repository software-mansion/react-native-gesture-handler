import { Locator } from '@playwright/test';

type NativeEventArgs = number | boolean | undefined;
interface NativeEvent extends Record<string, NativeEventArgs> {
  numberOfPointers: number;
  state: number;
  pointerInside: boolean | undefined;
  handlerTag: number;
  target: number;
  oldState?: number;
}

interface GHEvent {
  nativeEvent: NativeEvent;
  timeStamp: number;
}

export const DEFAULT_PORT = 19007;

export const DOUBLE_TAP_FAIL_TIMEOUT = 500;
export const LONG_PRESS_ACTIVATION_TIME = 500;

/**
 *
 * @param eventBox
 * @returns Last event received by gesture handler
 */
export const getEvent = async (eventBox: Locator) => {
  const event = await eventBox.innerText();
  return new Promise<GHEvent>((resolve, _reject) => {
    resolve(JSON.parse(event));
  });
};

export const stringify = (event: any): string => {
  return JSON.stringify(
    event,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (key, value) => (key === 'target' ? undefined : value),
    2
  );
};

export const sleep = (time: number) => {
  return new Promise<void>((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
