import { createContext, use } from 'react';
import { VirtualChild } from '../../types';

type DetectorContextType = {
  register: (child: VirtualChild) => void;
  unregister: (child: number) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export function useDetectorContext() {
  const ctx = use(DetectorContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
