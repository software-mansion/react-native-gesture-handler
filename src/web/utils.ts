import { PointerType } from '../PointerType';
import type { Point, StylusData } from './interfaces';

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
