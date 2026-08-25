import findNodeHandleGeneric from '@swmansion/gesture-handler-dom-engine/src/findNodeHandle';
import type {
  GestureHandlerRef,
  SVGRef,
} from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import { FlatList } from 'react-native';

export default function findNodeHandle(
  viewRef: GestureHandlerRef | SVGRef | HTMLElement | SVGElement | number
): HTMLElement | SVGElement | number {
  // TODO: Remove this once we remove old API.
  if (viewRef instanceof FlatList) {
    // @ts-ignore This is the only way to get the scroll ref from FlatList.
    return viewRef._listRef._scrollRef.firstChild;
  }

  return findNodeHandleGeneric(viewRef);
}
