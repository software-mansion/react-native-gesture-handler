import { createContext, RefObject, use } from 'react';
import { DetectorCallbacks, LogicChildren } from '../types';

type DetectorContextType = {
  register: (
    child: LogicChildren,
    methods: RefObject<DetectorCallbacks<unknown>>
  ) => void;
  unregister: (child: number, handlerTags: number[]) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export function useDetectorContext() {
  const ctx = use(DetectorContext);
  if (!ctx) {
    throw new Error('Logic detector must be a descendant of a Native Detector');
  }
  return ctx;
}
