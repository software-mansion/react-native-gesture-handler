import { createContext, use } from 'react';
import { DetectorCallbacks, VirtualChildren } from '../../types';

type DetectorContextType = {
  register: (
    child: VirtualChildren,
    methods: DetectorCallbacks<unknown>,
    forReanimated: boolean | undefined,
    forAnimated: boolean | undefined
  ) => void;
  unregister: (child: number, handlerTags: number[]) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export function useDetectorContext() {
  const ctx = use(DetectorContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
