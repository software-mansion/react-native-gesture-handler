import { withPrevAndCurrent } from '../utils';
import { getChangeEventCalculator } from '../v3/hooks/utils/eventUtils';
import type { GestureUpdateEventWithHandlerData } from '../v3/types';

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

describe('getChangeEventCalculator', () => {
  type TestHandlerData = { translationX: number; changeX?: number };

  const diffCalculator = (
    current: TestHandlerData,
    previous: TestHandlerData | null
  ) => ({
    changeX: previous
      ? current.translationX - previous.translationX
      : current.translationX,
  });

  const calculator = getChangeEventCalculator(diffCalculator);

  const makeEvent = (handlerData?: TestHandlerData) =>
    ({
      handlerTag: 1,
      state: 4,
      handlerData,
    }) as GestureUpdateEventWithHandlerData<TestHandlerData>;

  test('computes change payload for well-formed events', () => {
    const first = calculator(makeEvent({ translationX: 10 }));
    expect(first.handlerData).toEqual({ translationX: 10, changeX: 10 });

    const second = calculator(
      makeEvent({ translationX: 25 }),
      makeEvent({ translationX: 10 })
    );
    expect(second.handlerData).toEqual({ translationX: 25, changeX: 15 });
  });

  test('returns event untouched when handlerData is missing', () => {
    // Regression: a malformed event without `handlerData` used to crash the
    // diff calculator with "Cannot read property 'translationX' of undefined".
    const malformed = makeEvent(undefined);

    expect(() => calculator(malformed)).not.toThrow();
    expect(calculator(malformed)).toBe(malformed);
    expect(malformed.handlerData).toBeUndefined();
  });
});
