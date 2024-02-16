import { PointerType } from '../PointerType';
import { WebPointerType } from './interfaces';

export function isPointerInBounds(
  view: HTMLElement,
  { x, y }: { x: number; y: number }
): boolean {
  const rect: DOMRect = view.getBoundingClientRect();

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export const PointerTypeMapping = new Map<WebPointerType, PointerType>([
  [WebPointerType.MOUSE, PointerType.MOUSE],
  [WebPointerType.TOUCH, PointerType.FINGER],
  [WebPointerType.PEN, PointerType.STYLUS],
  [WebPointerType.NONE, PointerType.OTHER],
]);
