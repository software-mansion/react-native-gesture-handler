import { createContext, use } from 'react';
import { VirtualChild } from '../../types';

export enum InterceptingDetectorMode {
  DEFAULT,
  ANIMATED,
  REANIMATED,
}

export type InterceptingDetectorContextValue = {
  mode: InterceptingDetectorMode;
  setMode: (mode: InterceptingDetectorMode) => void;
  register: (child: VirtualChild) => void;
  unregister: (child: number) => void;
};

export const InterceptingDetectorContext =
  createContext<InterceptingDetectorContextValue | null>(null);

export function useInterceptingDetectorContext() {
  return use(InterceptingDetectorContext);
}
