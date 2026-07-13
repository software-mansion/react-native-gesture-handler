import type { GestureHandlerRef, SVGRef } from './interfaces';
import { isRNSVGElement } from './utils';

export default function findNodeHandle(
  viewRef: GestureHandlerRef | SVGRef | HTMLElement | SVGElement | number
): HTMLElement | SVGElement | number {
  // TODO: Remove this once we remove old API.
  // Duck-typed FlatList detection (structural, keeps the engine free of
  // react-native value imports): FlatList instances expose getNativeScrollRef.
  if (
    viewRef !== null &&
    typeof viewRef === 'object' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (viewRef as any).getNativeScrollRef === 'function'
  ) {
    // @ts-ignore This is the only way to get the scroll ref from FlatList.
    return viewRef._listRef._scrollRef.firstChild;
  }
  // Old API assumes that child handler is HTMLElement.
  // However, if we nest handlers, we will get ref to another handler.
  // In that case, we want to recursively call findNodeHandle with new handler viewTag (which can also be ref to another handler).
  if ((viewRef as GestureHandlerRef)?.viewTag !== undefined) {
    return findNodeHandle((viewRef as GestureHandlerRef).viewTag);
  }

  if (viewRef instanceof Element) {
    if (
      viewRef.style.display === 'contents' &&
      viewRef.childElementCount === 1
    ) {
      return findNodeHandle(viewRef.firstChild as HTMLElement);
    }

    return viewRef;
  }

  if (isRNSVGElement(viewRef as SVGRef | GestureHandlerRef)) {
    return (viewRef as SVGRef).elementRef.current;
  }

  // In new API, we receive ref object which `current` field points to  wrapper `div` with `display: contents;`.
  // We want to return the first descendant (in DFS order) that doesn't have this property.
  // When a `display: contents` wrapper has multiple children (e.g. multi-child detector),
  // we stop traversal and return the wrapper itself since there is no single child to resolve to.
  let element = (viewRef as GestureHandlerRef)?.current;

  while (
    element &&
    element.style.display === 'contents' &&
    element.childElementCount === 1
  ) {
    element = element.firstChild as HTMLElement;
  }

  return element;
}
