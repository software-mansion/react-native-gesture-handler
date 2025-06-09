import { withPrevAndCurrent } from '../utils';

describe('withPrevAndCurrent', () => {
  test('returns transformed elements', () => {
    const concat = (prev: string | null, current: number) =>
      `${prev ?? '0'}${current}`;
    expect(withPrevAndCurrent([1, 2, 3, 4], concat)).toEqual([
      '01',
      '012',
      '0123',
      '01234',
    ]);
    expect(withPrevAndCurrent([1], concat)).toEqual(['01']);
    expect(withPrevAndCurrent([], concat)).toEqual([]);
  });
});
