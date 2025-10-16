import { createContext, RefObject, useContext } from 'react';
import { GestureEvents, LogicChildren } from '../../types';

type DetectorContextType = {
  register: (
    child: LogicChildren,
    methods: RefObject<GestureEvents<unknown>>,
    forReanimated: boolean | undefined,
    forAnimated: boolean | undefined
  ) => void;
  unregister: (child: number) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export function useDetectorContext() {
  const ctx = useContext(DetectorContext);
  if (!ctx) {
    return null;
  }
  return ctx;
}
