import type { HitSlop } from '../handlers/gestureHandlerCommon';
import { normalizeHitSlop } from '../handlers/hitSlop';

describe('normalizeHitSlop', () => {
  test('passes `undefined` and `null` through', () => {
    // `undefined` keeps the property out of partial config updates, `null` clears the hit slop.
    expect(normalizeHitSlop(undefined)).toBeUndefined();
    expect(normalizeHitSlop(null)).toBeNull();
  });

  test('is idempotent', () => {
    // Normalizing an already normalized value must not empty it out.
    const normalized = normalizeHitSlop({ horizontal: -10, top: -5 });

    expect(normalizeHitSlop(normalized)).toEqual([
      -10,
      -5,
      -10,
      null,
      null,
      null,
    ]);
    expect(normalizeHitSlop(normalizeHitSlop(-10))).toEqual([
      -10,
      -10,
      -10,
      -10,
      null,
      null,
    ]);
  });

  test('expands a number onto every edge', () => {
    expect(normalizeHitSlop(-10)).toEqual([-10, -10, -10, -10, null, null]);
    expect(normalizeHitSlop(0)).toEqual([0, 0, 0, 0, null, null]);
  });

  test('marks unspecified edges as `null`', () => {
    expect(normalizeHitSlop({})).toEqual([null, null, null, null, null, null]);
    expect(normalizeHitSlop({ left: -10 })).toEqual([
      -10,
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  test('treats an explicitly `undefined` edge as unspecified', () => {
    // Without this, the value would reach the platforms as `0` and shrink the view.
    expect(normalizeHitSlop({ left: undefined, top: -5 })).toEqual([
      null,
      -5,
      null,
      null,
      null,
      null,
    ]);
  });

  test('expands `horizontal` and `vertical`', () => {
    expect(normalizeHitSlop({ horizontal: -10 })).toEqual([
      -10,
      null,
      -10,
      null,
      null,
      null,
    ]);
    expect(normalizeHitSlop({ vertical: -10 })).toEqual([
      null,
      -10,
      null,
      -10,
      null,
      null,
    ]);
    expect(normalizeHitSlop({ horizontal: -10, vertical: -5 })).toEqual([
      -10,
      -5,
      -10,
      -5,
      null,
      null,
    ]);
  });

  test('lets an explicit edge win over the shorthand', () => {
    expect(normalizeHitSlop({ horizontal: -10, left: -20 })).toEqual([
      -20,
      null,
      -10,
      null,
      null,
      null,
    ]);
    expect(normalizeHitSlop({ vertical: -10, bottom: -20 })).toEqual([
      null,
      -10,
      null,
      -20,
      null,
      null,
    ]);
  });

  test('carries `width` and `height` through', () => {
    expect(normalizeHitSlop({ left: 0, width: 20 })).toEqual([
      0,
      null,
      null,
      null,
      20,
      null,
    ]);
    expect(normalizeHitSlop({ bottom: 0, height: 20 })).toEqual([
      null,
      null,
      null,
      0,
      null,
      20,
    ]);
  });

  test('rejects invalid `width` and `height` combinations', () => {
    expect(() =>
      normalizeHitSlop({ left: 0, right: 0, width: 20 } as HitSlop)
    ).toThrow("cannot have all of 'left', 'right' and 'width' defined");

    expect(() => normalizeHitSlop({ width: 20 } as HitSlop)).toThrow(
      "when 'width' is defined, either 'left' or 'right' has to be defined"
    );

    expect(() =>
      normalizeHitSlop({ top: 0, bottom: 0, height: 20 } as HitSlop)
    ).toThrow("cannot have all of 'top', 'bottom' and 'height' defined");

    expect(() => normalizeHitSlop({ height: 20 } as HitSlop)).toThrow(
      "when 'height' is defined, either 'top' or 'bottom' has to be defined"
    );
  });

  test('rejects a negative `width` or `height`', () => {
    expect(() => normalizeHitSlop({ left: 0, width: -20 } as HitSlop)).toThrow(
      "'width' cannot be negative"
    );

    expect(() => normalizeHitSlop({ top: 0, height: -20 } as HitSlop)).toThrow(
      "'height' cannot be negative"
    );
  });

  test('allows a zero `width` or `height`', () => {
    // An empty hit area is degenerate but coherent, and a hit slop animated
    // from zero upwards passes through it.
    expect(normalizeHitSlop({ left: 0, width: 0 })).toEqual([
      0,
      null,
      null,
      null,
      0,
      null,
    ]);
  });

  test('counts a shorthand as defining both of its edges', () => {
    // `horizontal` fills in both `left` and `right`, which conflicts with `width`.
    expect(() =>
      normalizeHitSlop({ horizontal: -10, width: 20 } as HitSlop)
    ).toThrow("cannot have all of 'left', 'right' and 'width' defined");
  });
});
