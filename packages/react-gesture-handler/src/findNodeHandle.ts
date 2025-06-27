import type { SVGRef } from './web/interfaces';
import { isRNSVGElement } from './web/utils';

export default function findNodeHandle(
  viewRef: SVGRef | HTMLElement
): HTMLElement | SVGElement {
  if (isRNSVGElement(viewRef as SVGRef)) {
    return (viewRef as SVGRef).elementRef.current;
  }

  if ((viewRef as HTMLElement).style.display === 'contents') {
    return findNodeHandle((viewRef as HTMLElement).firstChild as HTMLElement);
  }

  return viewRef as HTMLElement;
}
