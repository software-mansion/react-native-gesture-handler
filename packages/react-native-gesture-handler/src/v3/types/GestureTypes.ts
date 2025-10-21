import { DetectorCallbacks } from './DetectorTypes';
import {
  CommonGestureConfig,
  ComposedGestureConfig,
  GestureCallbacks,
  GestureRelations,
  InternalConfigProps,
  StateManager,
} from './ConfigTypes';
import { FilterNeverProperties } from './UtilityTypes';

// Unfortunately, this type cannot be moved into ConfigTypes.ts because of circular dependency
type ExternalRelations = {
  simultaneousWithExternalGesture?: Gesture | Gesture[];
  requireExternalGestureToFail?: Gesture | Gesture[];
  blocksExternalGesture?: Gesture | Gesture[];
};

// Similarly, this type cannot be moved into ConfigTypes.ts because it depends on `ExternalRelations`
export type BaseGestureConfig<THandlerData, TConfig> = ExternalRelations &
  GestureCallbacks<THandlerData> &
  FilterNeverProperties<TConfig> &
  InternalConfigProps<THandlerData> &
  CommonGestureConfig;

export type SingleGesture<THandlerData, TConfig> = {
  /** @internal oeuhfowehfewf */
  tag: number;
  type: SingleGestureName;
  config: BaseGestureConfig<THandlerData, TConfig>;
  detectorCallbacks: DetectorCallbacks<THandlerData>;
  gestureRelations: GestureRelations;
} & StateManager;

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
