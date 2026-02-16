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
export type BaseGestureConfig<TBaseHandlerData, THandlerData, TConfig> =
  ExternalRelations &
    GestureCallbacks<TBaseHandlerData, THandlerData> &
    FilterNeverProperties<TConfig> &
    InternalConfigProps<THandlerData> &
    CommonGestureConfig;

export type BaseDiscreteGestureConfig<TBaseHandlerData, THandlerData, TConfig> =
  Omit<BaseGestureConfig<TBaseHandlerData, THandlerData, TConfig>, 'onUpdate'>;

export type SingleGesture<TBaseHandlerData, THandlerData, TConfig> = {
  handlerTag: number;
  type: SingleGestureName;
  config: BaseGestureConfig<TBaseHandlerData, THandlerData, TConfig>;
  detectorCallbacks: DetectorCallbacks<THandlerData>;
  gestureRelations: GestureRelations;
};

export type DiscreteSingleGesture<TBaseHandlerData, THandlerData, TConfig> = {
  [K in keyof SingleGesture<
    TBaseHandlerData,
    THandlerData,
    TConfig
  >]: K extends 'config'
    ? Omit<
        SingleGesture<TBaseHandlerData, THandlerData, TConfig>[K],
        'onUpdate'
      >
    : SingleGesture<TBaseHandlerData, THandlerData, TConfig>[K];
};

export type ComposedGesture = {
  handlerTags: number[];
  type: ComposedGestureName;
  config: ComposedGestureConfig;
  detectorCallbacks: DetectorCallbacks<unknown>;
  externalSimultaneousHandlers: number[];
  gestures: Gesture[];
};

export type Gesture<
  TBaseHandlerData = unknown,
  THandlerData = unknown,
  TConfig = unknown,
> = SingleGesture<TBaseHandlerData, THandlerData, TConfig> | ComposedGesture;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGesture = Gesture<any, any, unknown>;

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
