import { PointerType } from '../PointerType';
import { Point } from './interfaces';

export function isPointerInBounds(view: HTMLElement, { x, y }: Point): boolean {
  const rect: DOMRect = view.getBoundingClientRect();

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export const PointerTypeMapping = new Map<string, PointerType>([
  ['mouse', PointerType.MOUSE],
  ['touch', PointerType.TOUCH],
  ['pen', PointerType.STYLUS],
  ['none', PointerType.OTHER],
]);

export const degToRad = (degrees: number) => (degrees * Math.PI) / 180;

export const coneToDeviation = (degrees: number) =>
  Math.cos(degToRad(degrees / 2));
