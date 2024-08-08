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

export function calculateViewScale(view: HTMLElement) {
  const styles = getComputedStyle(view);

  const resultScales = {
    scaleX: 1,
    scaleY: 1,
  };

  // Get scales from scale property
  if (styles.scale !== undefined && styles.scale !== 'none') {
    const scales = styles.scale.split(' ');

    if (scales[0]) {
      resultScales.scaleX = parseFloat(scales[0]);
    }

    resultScales.scaleY = scales[1]
      ? parseFloat(scales[1])
      : parseFloat(scales[0]);
  }

  // Get scales from transform property
  const matrixElements = new RegExp(/matrix\((.+)\)/).exec(
    styles.transform
  )?.[1];

  if (matrixElements) {
    const matrixElementsArray = matrixElements.split(', ');

    resultScales.scaleX *= parseFloat(matrixElementsArray[0]);
    resultScales.scaleY *= parseFloat(matrixElementsArray[3]);
  }

  return resultScales;
}
