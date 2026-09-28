import type { SingleGesture } from '../../v3/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySingleGesture = SingleGesture<unknown, any>;

type PackedSingleGesture = { handlerTag: number };

export type RegisterCustomSerializable = <
  TValue extends object,
  TPacked extends object,
>(registrationData: {
  name: string;
  determine: (value: object) => value is TValue;
  pack: (value: TValue) => TPacked;
  unpack: (value: TPacked) => TValue;
}) => void;

export function registerGestureSerializable(
  registerCustomSerializable: RegisterCustomSerializable | undefined
) {
  registerCustomSerializable?.<AnySingleGesture, PackedSingleGesture>({
    name: 'RNGH_SingleGesture',
    determine: (value: object): value is AnySingleGesture => {
      'worklet';
      return (
        typeof (value as Partial<AnySingleGesture>).handlerTag === 'number' &&
        'detectorCallbacks' in value &&
        'gestureRelations' in value
      );
    },
    pack: (value) => {
      'worklet';
      return { handlerTag: value.handlerTag };
    },
    unpack: (value) => {
      'worklet';
      return value as AnySingleGesture;
    },
  });
}
