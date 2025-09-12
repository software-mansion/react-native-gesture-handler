import { createContext, RefObject, useContext } from 'react';
import { LogicChildrenProps, LogicMethods } from './types';

type DetectorContextType = {
  register: (
    child: LogicChildrenProps,
    methods: RefObject<LogicMethods>
  ) => void;
  unregister: (child: number) => void;
};

export const DetectorContext = createContext<DetectorContextType | null>(null);

export default function useDetectorContext() {
  const ctx = useContext(DetectorContext);
  if (!ctx) {
    throw new Error('Logic detector must be under a Native Detector');
  }
  return ctx;
}
