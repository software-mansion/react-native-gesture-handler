import { createContext, use } from 'react';
import { VirtualChild } from '../../types';

export type InterceptingDetectorContextValue = {
  register: (child: VirtualChild) => void;
  unregister: (child: number) => void;
};

export const InterceptingDetectorContext =
  createContext<InterceptingDetectorContextValue | null>(null);

export function useInterceptingDetectorContext() {
  const ctx = use(InterceptingDetectorContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
