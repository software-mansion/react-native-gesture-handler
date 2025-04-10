import { useEffect, useRef } from 'react';
import { BaseConfigObjectType } from './types';

export function usePreviousValue<
  TConfig,
  TPayload extends Record<string, unknown>,
>(config: BaseConfigObjectType<TPayload> & TConfig) {
  const ref = useRef<BaseConfigObjectType<TPayload> & TConfig>(null);

  useEffect(() => {
    ref.current = config;
  });

  return ref.current;
}
