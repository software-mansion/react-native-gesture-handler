import { createContext, use } from 'react';
import { VirtualChild } from '../../types';

export type DetectorContextValue = {
  register: (child: VirtualChild) => void;
  unregister: (child: number) => void;
};

export const DetectorContext = createContext<DetectorContextValue | null>(null);

export function useDetectorContext() {
  const ctx = use(DetectorContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
