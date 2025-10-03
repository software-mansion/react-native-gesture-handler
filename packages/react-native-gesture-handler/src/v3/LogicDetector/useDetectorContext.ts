import { createContext, RefObject, useContext } from 'react';
import { GestureEvents, LogicChildren } from '../types';

type DetectorContextType = {
  register: (
    child: LogicChildren,
    methods: RefObject<GestureEvents<unknown>>
  ) => void;
  unregister: (child: number) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export function useDetectorContext() {
  const ctx = useContext(DetectorContext);
  if (!ctx) {
    throw new Error(
      'Logic detector must be a descendant of a delegate detector'
    );
  }
  return ctx;
}
