import { filterConfig } from '../handlers/utils';
import { prepareConfigForNativeSide } from '../v3/hooks/utils/configUtils';
import { SingleGestureName } from '../v3/types';

// `hitSlop` reaches the platforms through more than one producer, and every one
// of them has to emit the same normalized array — the Android, Apple and web
// parsers only understand that shape. These tests lock the wire contract at
// each producer, so a change to one of them cannot quietly break a platform.
describe('hitSlop wiring', () => {
  describe('filterConfig (v1 and v2)', () => {
    test('normalizes hitSlop', () => {
      expect(filterConfig({ hitSlop: -10 }, ['hitSlop'])).toEqual({
        hitSlop: -10,
      });

      expect(
        filterConfig({ hitSlop: { horizontal: -10 } }, ['hitSlop'])
      ).toEqual({ hitSlop: [-10, null, -10, null, null, null] });
    });

    test('keeps the difference between an absent and an explicitly null hitSlop', () => {
      // `null` clears the hit slop, a missing key leaves the previous value alone.
      expect(filterConfig({ hitSlop: null }, ['hitSlop'])).toEqual({
        hitSlop: [null, null, null, null, null, null],
      });

      expect(filterConfig({}, ['hitSlop'])).toEqual({});
      expect(filterConfig({ hitSlop: undefined }, ['hitSlop'])).toEqual({});
    });
  });

  describe('prepareConfigForNativeSide (v3)', () => {
    const prepare = (hitSlop: unknown) =>
      prepareConfigForNativeSide(SingleGestureName.Pan, {
        hitSlop,
      } as Parameters<typeof prepareConfigForNativeSide>[1]).hitSlop;

    test('normalizes hitSlop', () => {
      expect(prepare(-10)).toBe(-10);
      expect(prepare({ horizontal: -10 })).toEqual([
        -10,
        null,
        -10,
        null,
        null,
        null,
      ]);
    });

    test('sends an explicitly null hitSlop as unset slots', () => {
      expect(prepare(null)).toEqual([null, null, null, null, null, null]);
    });
  });
});
