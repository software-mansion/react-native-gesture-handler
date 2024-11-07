import type { GestureHandlerRef, SVGRef } from './web/interfaces';
import { isRNSVGElement } from './web/utils';

export default function findNodeHandle(
  viewRef: GestureHandlerRef | SVGRef | HTMLElement | SVGElement
): HTMLElement | SVGElement | number {
  // Old API assumes that child handler is HTMLElement.
  // However, if we nest handlers, we will get ref to another handler.
  // In that case, we want to recursively call findNodeHandle with new handler viewTag (which can also be ref to another handler).
  if ((viewRef as GestureHandlerRef)?.viewTag !== undefined) {
    return findNodeHandle((viewRef as GestureHandlerRef).viewTag);
  }

  if (viewRef instanceof Element) {
    if (viewRef.style.display === 'contents') {
      return findNodeHandle(viewRef.firstChild as HTMLElement);
    }

    return viewRef;
  }

  if (isRNSVGElement(viewRef)) {
    return (viewRef as SVGRef).elementRef.current;
  }

  // In new API, we receive ref object which `current` field points to  wrapper `div` with `display: contents;`.
  // We want to return the first descendant (in DFS order) that doesn't have this property.
  let element = (viewRef as GestureHandlerRef)?.current;

  while (element && element.style.display === 'contents') {
    element = element.firstChild as HTMLElement;
  }

  return element;
}
