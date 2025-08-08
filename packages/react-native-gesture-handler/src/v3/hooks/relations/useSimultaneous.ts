import { NativeGesture } from '../../types';
import { useComposedGesture } from './useComposedGesture';

export function useSimultaneous(...gestures: NativeGesture[]) {
  const composedGesture = useComposedGesture(...gestures);

  const tags = gestures.flatMap((gesture) => gesture.tag);

  for (const gesture of gestures) {
    const simultaneousHandlersTags = [
      ...tags.filter((tag) => !gesture.tag.includes(tag)),
    ];

    gesture.config.simultaneousHandlers = simultaneousHandlersTags;
  }

  composedGesture.name = 'SimultaneousGesture';

  return composedGesture;
}
