import { createContext, use } from 'react';

import type { VirtualChild } from '../../types';

export const InterceptingDetectorMode = {
  DEFAULT: 0,
  ANIMATED: 1,
  REANIMATED: 2,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type InterceptingDetectorMode =
  (typeof InterceptingDetectorMode)[keyof typeof InterceptingDetectorMode];

export type InterceptingDetectorContextValue = {
  mode: InterceptingDetectorMode;
  setMode: (mode: InterceptingDetectorMode) => void;
  register: (child: VirtualChild) => void;
  unregister: (child: VirtualChild) => void;
};

export const InterceptingDetectorContext =
  createContext<InterceptingDetectorContextValue | null>(null);

export function useInterceptingDetectorContext() {
  return use(InterceptingDetectorContext);
}
