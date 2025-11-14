import { DetectorCallbacks } from './DetectorTypes';
import {
  CommonGestureConfig,
  ComposedGestureConfig,
  GestureCallbacks,
  GestureRelations,
  InternalConfigProps,
} from './ConfigTypes';
import { FilterNeverProperties } from './UtilityTypes';

// Unfortunately, this type cannot be moved into ConfigTypes.ts because of circular dependency
export type ExternalRelations = {
  simultaneousWith?: AnyGesture | AnyGesture[];
  requireToFail?: AnyGesture | AnyGesture[];
  block?: AnyGesture | AnyGesture[];
};

// Similarly, this type cannot be moved into ConfigTypes.ts because it depends on `ExternalRelations`
export type BaseGestureConfig<THandlerData, TConfig> = ExternalRelations &
  GestureCallbacks<THandlerData> &
  FilterNeverProperties<TConfig> &
  InternalConfigProps<THandlerData> &
  CommonGestureConfig;

export type BaseDiscreteGestureConfig<THandlerData, TConfig> = Omit<
  BaseGestureConfig<THandlerData, TConfig>,
  'onUpdate'
>;

export type SingleGesture<THandlerData, TConfig> = {
  tag: number;
  type: SingleGestureName;
  config: BaseGestureConfig<THandlerData, TConfig>;
  detectorCallbacks: DetectorCallbacks<THandlerData>;
  gestureRelations: GestureRelations;
};

export type DiscreteSingleGesture<THandlerData, TConfig> = {
  [K in keyof SingleGesture<THandlerData, TConfig>]: K extends 'config'
    ? Omit<SingleGesture<THandlerData, TConfig>[K], 'onUpdate'>
    : SingleGesture<THandlerData, TConfig>[K];
};

export type ComposedGesture = {
  tags: number[];
  type: ComposedGestureName;
  config: ComposedGestureConfig;
  detectorCallbacks: DetectorCallbacks<unknown>;
  externalSimultaneousHandlers: number[];
  gestures: Gesture[];
};

export type Gesture<THandlerData = unknown, TConfig = unknown> =
  | SingleGesture<THandlerData, TConfig>
  | ComposedGesture;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGesture = Gesture<any, unknown>;

export enum SingleGestureName {
  Tap = 'TapGestureHandler',
  LongPress = 'LongPressGestureHandler',
  Pan = 'PanGestureHandler',
  Pinch = 'PinchGestureHandler',
  Rotation = 'RotationGestureHandler',
  Fling = 'FlingGestureHandler',
  Manual = 'ManualGestureHandler',
  Native = 'NativeViewGestureHandler',
  Hover = 'HoverGestureHandler',
}

export enum ComposedGestureName {
  Simultaneous = 'SimultaneousGesture',
  Exclusive = 'ExclusiveGesture',
  Race = 'RaceGesture',
}
