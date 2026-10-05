import type { StylusData } from '../handlers/gestureHandlerCommon';
import { PointerType } from '../PointerType';
import type { GestureHandlerRef, Point, SVGRef } from './interfaces';

// Duplicate of the check in `src/useIsomorphicLayoutEffect.tsx` — kept as a
// separate copy on purpose, since the web engine is its own compilation unit
// and must not import from the react-native side. Keep the two in sync.
//
// The web handlers also run under react-native-windows, where RN aliases
// `window` to `global` but there is no DOM — so checking `window` alone is
// not enough.
export function canUseDOM(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
  );
}

// Narrows to an element whose inline styles (and DOM attributes) are safe to
// touch.
export function isStylableElement(
  view: unknown
): view is HTMLElement | SVGElement {
  return (
    canUseDOM() && (view instanceof HTMLElement || view instanceof SVGElement)
  );
}

export function hasDisplayContents(view: HTMLElement): boolean {
  return (
    view.style.display === 'contents' ||
    getComputedStyle(view).display === 'contents'
  );
}

export function firstNonContentsView(view: HTMLElement): HTMLElement {
  let current = view;

  while (hasDisplayContents(current) && current.childElementCount > 0) {
    current = current.children[0] as HTMLElement;
  }

  return current;
}

// For display: contents elements (like the gesture detector wrapper), getBoundingClientRect
// returns all zeros since the element has no box. Derive the bounds from the children instead
// (recurse until we reach elements that actually have a box).
export function getEffectiveBoundingRect(view: HTMLElement): DOMRect {
  if (hasDisplayContents(view) && view.children.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < view.children.length; i++) {
      const childRect = getEffectiveBoundingRect(
        view.children[i] as HTMLElement
      );

      if (childRect.width === 0 && childRect.height === 0) {
        continue;
      }

      minX = Math.min(minX, childRect.left);
      minY = Math.min(minY, childRect.top);
      maxX = Math.max(maxX, childRect.right);
      maxY = Math.max(maxY, childRect.bottom);
    }

    return minX === Infinity
      ? view.getBoundingClientRect()
      : new DOMRect(minX, minY, maxX - minX, maxY - minY);
  }

  return view.getBoundingClientRect();
}

export function isPointerInBounds(view: HTMLElement, { x, y }: Point): boolean {
  const rect = getEffectiveBoundingRect(view);

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

type LinearTransform = [a: number, b: number, c: number, d: number];

const IDENTITY: LinearTransform = [1, 0, 0, 1];

function isIdentity([a, b, c, d]: LinearTransform): boolean {
  return a === 1 && b === 0 && c === 0 && d === 1;
}

function getElementLinearTransform(element: Element): LinearTransform {
  const styles = getComputedStyle(element);

  if (styles.display === 'contents') {
    return IDENTITY;
  }

  let [a, b, c, d] = IDENTITY;

  const matrix = /matrix(3d)?\((.+)\)/.exec(styles.transform);

  if (matrix) {
    const m = matrix[2].split(',').map(parseFloat);

    [a, b, c, d] = matrix[1]
      ? [m[0], m[1], m[4], m[5]]
      : [m[0], m[1], m[2], m[3]];
  }

  if (styles.scale !== undefined && styles.scale !== 'none') {
    const scales = styles.scale.split(' ');
    const scaleX = parseFloat(scales[0]);
    const scaleY = scales[1] ? parseFloat(scales[1]) : scaleX;

    [a, b, c, d] = [a * scaleX, b * scaleY, c * scaleX, d * scaleY];
  }

  return [a, b, c, d];
}

function multiply(
  [a1, b1, c1, d1]: LinearTransform,
  [a2, b2, c2, d2]: LinearTransform
): LinearTransform {
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
  ];
}

// View's transform composed with the transforms of its ancestors.
function getViewLinearTransform(view: HTMLElement): LinearTransform | null {
  let transform = getElementLinearTransform(view);
  let element = view.parentElement;

  while (element) {
    const ancestorTransform = getElementLinearTransform(element);

    if (!isIdentity(ancestorTransform)) {
      transform = multiply(ancestorTransform, transform);
    }

    element = element.parentElement;
  }

  return isIdentity(transform) ? null : transform;
}

// Size of the view's box before its transform is applied.
function getUntransformedSize(
  view: HTMLElement,
  rect: DOMRect,
  [a, b, c, d]: LinearTransform
) {
  if (typeof view.offsetWidth === 'number') {
    return { width: view.offsetWidth, height: view.offsetHeight };
  }

  // SVG elements have no offset size, recover it from the transformed bounds
  const det = Math.abs(a * d) - Math.abs(b * c);

  if (det === 0) {
    return { width: rect.width, height: rect.height };
  }

  return {
    width: (Math.abs(d) * rect.width - Math.abs(c) * rect.height) / det,
    height: (Math.abs(a) * rect.height - Math.abs(b) * rect.width) / det,
  };
}

// The v3 detectors attach to a `display: contents` wrapper, so the transform
// lives on its child. With several children there is no single transform to
// invert, the wrapper's bounds are used as they are.
function getTransformedView(view: HTMLElement): HTMLElement {
  let current = view;

  while (hasDisplayContents(current) && current.childElementCount === 1) {
    current = current.children[0] as HTMLElement;
  }

  return current;
}

// Maps a viewport point to the view's own coordinate space, so that `x` and `y`
// match native under scale, mirroring and rotation of the view or any of its
// ancestors. Perspective is not accounted for.
export function viewportToLocal(view: HTMLElement, point: Point): Point {
  const rect = getEffectiveBoundingRect(view);
  const transformedView = getTransformedView(view);
  const transform = getViewLinearTransform(transformedView);

  if (!transform) {
    return { x: point.x - rect.left, y: point.y - rect.top };
  }

  const [a, b, c, d] = transform;
  const det = a * d - b * c;

  if (det === 0) {
    return { x: point.x - rect.left, y: point.y - rect.top };
  }

  const { width, height } = getUntransformedSize(
    transformedView,
    rect,
    transform
  );

  // The transforms map the center of the view to the center of its bounding
  // rect (transform-origin only adds a translation, which the bounding rect
  // already reflects), so invert the linear part around the center.
  const dx = point.x - (rect.left + rect.width / 2);
  const dy = point.y - (rect.top + rect.height / 2);

  return {
    x: width / 2 + (d * dx - c * dy) / det,
    y: height / 2 + (a * dy - b * dx) / det,
  };
}

export function tryExtractStylusData(
  event: PointerEvent
): StylusData | undefined {
  const pointerType = PointerTypeMapping.get(event.pointerType);

  if (pointerType !== PointerType.STYLUS) {
    return;
  }

  // @ts-ignore This property exists (https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent#instance_properties)
  const eventAzimuthAngle: number | undefined = event.azimuthAngle;
  // @ts-ignore This property exists (https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent#instance_properties)
  const eventAltitudeAngle: number | undefined = event.altitudeAngle;

  if (event.tiltX === 0 && event.tiltY === 0) {
    // If we are in this branch, it means that either tilt properties are not supported and we have to calculate them from altitude and azimuth angles,
    // or stylus is perpendicular to the screen and we can use altitude / azimuth instead of tilt

    // If azimuth and altitude are undefined in this branch, it means that we are either perpendicular to the screen,
    // or that none of the position sets is supported. In that case, we can treat stylus as perpendicular
    if (eventAzimuthAngle === undefined || eventAltitudeAngle === undefined) {
      return {
        tiltX: 0,
        tiltY: 0,
        azimuthAngle: Math.PI / 2,
        altitudeAngle: Math.PI / 2,
        pressure: event.pressure,
      };
    }

    const { tiltX, tiltY } = spherical2tilt(
      eventAltitudeAngle,
      eventAzimuthAngle
    );

    return {
      tiltX,
      tiltY,
      azimuthAngle: eventAzimuthAngle,
      altitudeAngle: eventAltitudeAngle,
      pressure: event.pressure,
    };
  }

  const { altitudeAngle, azimuthAngle } = tilt2spherical(
    event.tiltX,
    event.tiltY
  );

  return {
    tiltX: event.tiltX,
    tiltY: event.tiltY,
    azimuthAngle,
    altitudeAngle,
    pressure: event.pressure,
  };
}

// `altitudeAngle` and `azimuthAngle` are experimental properties, which are not supported on Firefox and Safari.
// Given that, we use `tilt` properties and algorithm that converts one value to another.
//
// Source: https://w3c.github.io/pointerevents/#converting-between-tiltx-tilty-and-altitudeangle-azimuthangle
function tilt2spherical(tiltX: number, tiltY: number) {
  const tiltXrad = (tiltX * Math.PI) / 180;
  const tiltYrad = (tiltY * Math.PI) / 180;

  // calculate azimuth angle
  let azimuthAngle = 0;

  if (tiltX === 0) {
    if (tiltY > 0) {
      azimuthAngle = Math.PI / 2;
    } else if (tiltY < 0) {
      azimuthAngle = (3 * Math.PI) / 2;
    }
  } else if (tiltY === 0) {
    if (tiltX < 0) {
      azimuthAngle = Math.PI;
    }
  } else if (Math.abs(tiltX) === 90 || Math.abs(tiltY) === 90) {
    // not enough information to calculate azimuth
    azimuthAngle = 0;
  } else {
    // Non-boundary case: neither tiltX nor tiltY is equal to 0 or +-90
    const tanX = Math.tan(tiltXrad);
    const tanY = Math.tan(tiltYrad);

    azimuthAngle = Math.atan2(tanY, tanX);
    if (azimuthAngle < 0) {
      azimuthAngle += 2 * Math.PI;
    }
  }

  // calculate altitude angle
  let altitudeAngle = 0;

  if (Math.abs(tiltX) === 90 || Math.abs(tiltY) === 90) {
    altitudeAngle = 0;
  } else if (tiltX === 0) {
    altitudeAngle = Math.PI / 2 - Math.abs(tiltYrad);
  } else if (tiltY === 0) {
    altitudeAngle = Math.PI / 2 - Math.abs(tiltXrad);
  } else {
    // Non-boundary case: neither tiltX nor tiltY is equal to 0 or +-90
    altitudeAngle = Math.atan(
      1.0 /
        Math.sqrt(
          Math.pow(Math.tan(tiltXrad), 2) + Math.pow(Math.tan(tiltYrad), 2)
        )
    );
  }

  return { altitudeAngle: altitudeAngle, azimuthAngle: azimuthAngle };
}

// If we are on a platform that doesn't support `tiltX` and `tiltY`, we have to calculate them from `altitude` and `azimuth` angles.
//
// Source: https://w3c.github.io/pointerevents/#converting-between-tiltx-tilty-and-altitudeangle-azimuthangle
function spherical2tilt(altitudeAngle: number, azimuthAngle: number) {
  const radToDeg = 180 / Math.PI;

  let tiltXrad = 0;
  let tiltYrad = 0;

  if (altitudeAngle === 0) {
    // the pen is in the X-Y plane
    if (azimuthAngle === 0 || azimuthAngle === 2 * Math.PI) {
      // pen is on positive X axis
      tiltXrad = Math.PI / 2;
    }
    if (azimuthAngle === Math.PI / 2) {
      // pen is on positive Y axis
      tiltYrad = Math.PI / 2;
    }
    if (azimuthAngle === Math.PI) {
      // pen is on negative X axis
      tiltXrad = -Math.PI / 2;
    }
    if (azimuthAngle === (3 * Math.PI) / 2) {
      // pen is on negative Y axis
      tiltYrad = -Math.PI / 2;
    }
    if (azimuthAngle > 0 && azimuthAngle < Math.PI / 2) {
      tiltXrad = Math.PI / 2;
      tiltYrad = Math.PI / 2;
    }
    if (azimuthAngle > Math.PI / 2 && azimuthAngle < Math.PI) {
      tiltXrad = -Math.PI / 2;
      tiltYrad = Math.PI / 2;
    }
    if (azimuthAngle > Math.PI && azimuthAngle < (3 * Math.PI) / 2) {
      tiltXrad = -Math.PI / 2;
      tiltYrad = -Math.PI / 2;
    }
    if (azimuthAngle > (3 * Math.PI) / 2 && azimuthAngle < 2 * Math.PI) {
      tiltXrad = Math.PI / 2;
      tiltYrad = -Math.PI / 2;
    }
  }

  if (altitudeAngle !== 0) {
    const tanAlt = Math.tan(altitudeAngle);

    tiltXrad = Math.atan(Math.cos(azimuthAngle) / tanAlt);
    tiltYrad = Math.atan(Math.sin(azimuthAngle) / tanAlt);
  }

  const tiltX = Math.round(tiltXrad * radToDeg);
  const tiltY = Math.round(tiltYrad * radToDeg);

  return { tiltX, tiltY };
}

export const RNSVGElements = new Set([
  'Circle',
  'ClipPath',
  'Ellipse',
  'ForeignObject',
  'G',
  'Image',
  'Line',
  'Marker',
  'Mask',
  'Path',
  'Pattern',
  'Polygon',
  'Polyline',
  'Rect',
  'Svg',
  'Symbol',
  'TSpan',
  'Text',
  'TextPath',
  'Use',
]);

// This function helps us determine whether given node is SVGElement or not. In our implementation of
// findNodeHandle, we can encounter such element in 2 forms - SVG tag or ref to SVG Element. Since Gesture Handler
// does not depend on SVG, we use our simplified SVGRef type that has `elementRef` field. This is something that is present
// in actual SVG ref object.
//
// In order to make sure that node passed into this function is in fact SVG element, first we check if its constructor name
// corresponds to one of the possible SVG elements. Then we also check if `elementRef` field exists.
// By doing both steps we decrease probability of detecting situations where, for example, user makes custom `Circle` and
// we treat it as SVG.
export function isRNSVGElement(viewRef: SVGRef | GestureHandlerRef) {
  const componentClassName = Object.getPrototypeOf(viewRef).constructor.name;

  return (
    RNSVGElements.has(componentClassName) &&
    Object.hasOwn(viewRef, 'elementRef')
  );
}

// This function checks if given node is SVGElement. Unlike the function above, this one
// operates on React Nodes, not DOM nodes.
//
// Second condition was introduced to handle case where SVG element was wrapped with
// `createAnimatedComponent` from Reanimated.
export function isRNSVGNode(node: any) {
  // If `ref` has `rngh` field, it means that component comes from Gesture Handler. This is a special case for
  // `Text` component, which is present in `RNSVGElements` set, yet we don't want to treat it as SVG.
  if (node.props.ref?.rngh) {
    return false;
  }

  return (
    Object.getPrototypeOf(node?.type)?.name === 'WebShape' ||
    RNSVGElements.has(node?.type?.displayName)
  );
}
