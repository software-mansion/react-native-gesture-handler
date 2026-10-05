import { viewportToLocal } from '../utils';

type Matrix = [number, number, number, number];

type FakeViewOptions = {
  matrix?: Matrix;
  transform?: string;
  scale?: string;
  svg?: boolean;
  // An svg root has a client box even though it has no offset size.
  svgRoot?: boolean;
  // Transforms of the ancestors, outermost first.
  ancestors?: Matrix[];
  parentDisplay?: string;
};

function multiply([a1, b1, c1, d1]: Matrix, [a2, b2, c2, d2]: Matrix): Matrix {
  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
  ];
}

function fakeAncestor(
  matrix: Matrix,
  parentElement: unknown,
  display = 'block'
) {
  return {
    parentElement,
    computedStyle: {
      display,
      scale: 'none',
      transform: `matrix(${matrix.join(', ')}, 0, 0)`,
    },
  };
}

// A 100x50 view laid out at (200, 100), transformed around its center by its
// own transform and those of its ancestors. The bounding rect is the one the
// browser reports for the transformed box.
function fakeView({
  matrix = [1, 0, 0, 1],
  transform,
  scale = 'none',
  svg = false,
  svgRoot = false,
  ancestors = [],
  parentDisplay,
}: FakeViewOptions = {}) {
  const width = 100;
  const height = 50;
  const centerX = 250;
  const centerY = 125;

  let [a, b, c, d] = matrix;

  if (scale !== 'none') {
    const [scaleX, scaleY = scaleX] = scale.split(' ').map(parseFloat);
    [a, b, c, d] = [a * scaleX, b * scaleY, c * scaleX, d * scaleY];
  }

  let parentElement: unknown = null;

  for (const ancestor of ancestors) {
    parentElement = fakeAncestor(ancestor, parentElement, parentDisplay);
  }

  if (parentDisplay !== 'contents') {
    // The innermost ancestor applies first.
    for (const ancestor of [...ancestors].reverse()) {
      [a, b, c, d] = multiply(ancestor, [a, b, c, d]);
    }
  }

  const rectWidth = Math.abs(a) * width + Math.abs(c) * height;
  const rectHeight = Math.abs(b) * width + Math.abs(d) * height;

  return {
    style: {},
    children: [],
    parentElement,
    // SVG elements have no offset size.
    ...(svg ? {} : { offsetWidth: width, offsetHeight: height }),
    ...(svgRoot ? { clientWidth: width, clientHeight: height } : {}),
    computedStyle: {
      display: 'block',
      scale,
      transform: transform ?? `matrix(${matrix.join(', ')}, 0, 0)`,
    },
    getBoundingClientRect: () => ({
      left: centerX - rectWidth / 2,
      top: centerY - rectHeight / 2,
      right: centerX + rectWidth / 2,
      bottom: centerY + rectHeight / 2,
      width: rectWidth,
      height: rectHeight,
    }),
  } as unknown as HTMLElement;
}

// The Jest environment is node, stub the DOM bits the helper touches.
beforeAll(() => {
  (globalThis as Record<string, unknown>).getComputedStyle = (
    view: ReturnType<typeof fakeView>
  ) => (view as unknown as { computedStyle: unknown }).computedStyle;
  (globalThis as Record<string, unknown>).DOMRect = function (
    left: number,
    top: number,
    width: number,
    height: number
  ) {
    return { left, top, width, height };
  };
});

afterAll(() => {
  delete (globalThis as Record<string, unknown>).getComputedStyle;
  delete (globalThis as Record<string, unknown>).DOMRect;
});

describe('viewportToLocal', () => {
  // The point 10px right of and 10px below the view's top-left corner, when
  // the view is not transformed.
  const point = { x: 210, y: 110 };

  test('an untransformed view', () => {
    expect(viewportToLocal(fakeView(), point)).toEqual({ x: 10, y: 10 });
    expect(viewportToLocal(fakeView({ transform: 'none' }), point)).toEqual({
      x: 10,
      y: 10,
    });
  });

  test('a scaled view', () => {
    // The box grows to 200x100 around its center, the point is 60px right of
    // and 35px below the scaled corner.
    expect(viewportToLocal(fakeView({ matrix: [2, 0, 0, 2] }), point)).toEqual({
      x: 30,
      y: 17.5,
    });
  });

  test('a mirrored view', () => {
    // The x axis runs from the right edge.
    expect(viewportToLocal(fakeView({ matrix: [-1, 0, 0, 1] }), point)).toEqual(
      { x: 90, y: 10 }
    );
  });

  test('a view rotated by 180 degrees', () => {
    expect(
      viewportToLocal(fakeView({ matrix: [-1, 0, 0, -1] }), point)
    ).toEqual({ x: 90, y: 40 });
  });

  test('a view rotated by 90 degrees', () => {
    // The 100x50 box turns into a 50x100 one at (225, 75), the view's top-left
    // corner lands on the top-right corner of the rotated box, its x axis runs
    // downwards and its y axis leftwards.
    const view = fakeView({ matrix: [0, 1, -1, 0] });

    expect(viewportToLocal(view, { x: 275, y: 75 })).toEqual({ x: 0, y: 0 });
    expect(viewportToLocal(view, { x: 265, y: 85 })).toEqual({ x: 10, y: 10 });
  });

  test('a mirrored and stretched view', () => {
    const view = fakeView({ matrix: [-1, 0, 0, 1], scale: '2 1' });

    // The box is 200px wide at (150, 100) and the x axis runs from the right
    // edge: the point is 60px in, that is 30 view pixels from the right.
    expect(viewportToLocal(view, point)).toEqual({ x: 70, y: 10 });
  });

  test('the scale property', () => {
    expect(viewportToLocal(fakeView({ scale: '2' }), point)).toEqual({
      x: 30,
      y: 17.5,
    });
  });

  test('a 3d transform matrix', () => {
    const view = fakeView({
      matrix: [2, 0, 0, 2],
      transform: 'matrix3d(2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)',
    });

    expect(viewportToLocal(view, point)).toEqual({ x: 30, y: 17.5 });
  });

  test('an SVG element', () => {
    expect(
      viewportToLocal(fakeView({ matrix: [2, 0, 0, 2], svg: true }), point)
    ).toEqual({ x: 30, y: 17.5 });
    expect(
      viewportToLocal(fakeView({ matrix: [0, 1, -1, 0], svg: true }), {
        x: 265,
        y: 85,
      })
    ).toEqual({ x: 10, y: 10 });
  });

  test('a view inside a scaled ancestor', () => {
    // Same bounds as a scaled view, but the view's own space is unscaled.
    const view = fakeView({ ancestors: [[2, 0, 0, 2]] });

    expect(viewportToLocal(view, point)).toEqual({ x: 30, y: 17.5 });
  });

  test('a mirrored view inside a rotated ancestor', () => {
    // Mirrored, then rotated by 90 degrees: the view's x axis runs upwards and
    // its y axis leftwards from the bottom-right corner of the 50x100 box.
    const view = fakeView({
      matrix: [-1, 0, 0, 1],
      ancestors: [[0, 1, -1, 0]],
    });

    expect(viewportToLocal(view, { x: 275, y: 175 })).toEqual({ x: 0, y: 0 });
    expect(viewportToLocal(view, { x: 265, y: 165 })).toEqual({ x: 10, y: 10 });
  });

  test('a view inside nested scaled ancestors', () => {
    // Scaled by 2, then by 0.5 horizontally: the box ends up 100x100.
    const view = fakeView({
      ancestors: [
        [2, 0, 0, 2],
        [0.5, 0, 0, 1],
      ],
    });

    expect(viewportToLocal(view, point)).toEqual({ x: 10, y: 17.5 });
  });

  test('a transformed display: contents ancestor has no effect', () => {
    const view = fakeView({
      ancestors: [[2, 0, 0, 2]],
      parentDisplay: 'contents',
    });

    expect(viewportToLocal(view, point)).toEqual({ x: 10, y: 10 });
  });

  test('a display: contents wrapper around a transformed view', () => {
    const child = fakeView({ matrix: [-1, 0, 0, 1] });
    const wrapper = {
      style: { display: 'contents' },
      children: [child],
      childElementCount: 1,
      computedStyle: { display: 'contents', scale: 'none', transform: 'none' },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    } as unknown as HTMLElement;

    expect(viewportToLocal(wrapper, point)).toEqual({ x: 90, y: 10 });
  });

  test('a display: contents wrapper around several views', () => {
    const wrapper = {
      style: { display: 'contents' },
      children: [fakeView({ matrix: [-1, 0, 0, 1] }), fakeView()],
      childElementCount: 2,
      computedStyle: { display: 'contents', scale: 'none', transform: 'none' },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    } as unknown as HTMLElement;

    // The point is mapped against the union of the children's bounds.
    expect(viewportToLocal(wrapper, point)).toEqual({ x: 10, y: 10 });
  });

  test('an svg root rotated by 45 degrees', () => {
    // The bounds alone cannot tell the sides apart at 45 degrees, the size
    // comes from the client box instead.
    const s = Math.SQRT1_2;
    const view = fakeView({ matrix: [s, s, -s, s], svg: true, svgRoot: true });
    const corner = { x: 250 - 50 * s + 25 * s, y: 125 - 50 * s - 25 * s };

    const local = viewportToLocal(view, corner);

    expect(local.x).toBeCloseTo(0);
    expect(local.y).toBeCloseTo(0);
  });

  test('a display: contents wrapper around several views in a scaled ancestor', () => {
    const ancestor = fakeAncestor([2, 0, 0, 2], null);
    const wrapper = {
      style: { display: 'contents' },
      children: [
        fakeView({ ancestors: [[2, 0, 0, 2]] }),
        fakeView({ ancestors: [[2, 0, 0, 2]] }),
      ],
      childElementCount: 2,
      parentElement: ancestor,
      // A contents element reports zeros, not its children's size.
      offsetWidth: 0,
      offsetHeight: 0,
      computedStyle: { display: 'contents', scale: 'none', transform: 'none' },
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
    } as unknown as HTMLElement;

    // The union of the children is a scaled 100x50 box.
    expect(viewportToLocal(wrapper, point)).toEqual({ x: 30, y: 17.5 });
  });

  test('a view scaled to zero', () => {
    // Nothing to invert, fall back to the bounds.
    expect(viewportToLocal(fakeView({ matrix: [0, 0, 0, 0] }), point)).toEqual({
      x: -40,
      y: -15,
    });
  });
});
