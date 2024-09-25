type GestureHandlerRef = {
  viewTag: GestureHandlerRef;
  current: HTMLElement;
};

export default function findNodeHandle(
  viewRef: GestureHandlerRef
): HTMLElement | number | undefined {
  // Old API assumes that child handler is HTMLElement.
  // However, if we nest handlers, we will get ref to another handler.
  // In that case, we want to recursively call findNodeHandle with new handler viewTag (which can also be ref to another handler).
  if (viewRef?.viewTag !== undefined) {
    return findNodeHandle(viewRef.viewTag);
  }

  if (viewRef instanceof HTMLElement) {
    return viewRef;
  }

  // In new API, we receive ref object which `current` field points to  wrapper `div` with `display: contents;`.
  // We want to return first child that doesn't have this property.
  let element = viewRef?.current;

  while (element && element.style.display === 'contents') {
    element = element.firstChild as HTMLElement;
  }

  return element;
}
