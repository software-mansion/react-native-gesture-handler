import { Ref } from 'react';

export default function findNodeHandle(viewRef: Ref<any>) {
  if (viewRef.viewTag) {
    return findNodeHandle(viewRef.viewTag);
  }

  let element = viewRef;

  while (element && element.style.display === 'contents') {
    element = element.firstChild as HTMLElement;
  }

  return element;
}
