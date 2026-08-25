import type React from 'react';

import type {
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import type { Gesture } from '../types';

export const GestureDetectorType = {
  Native: 0,
  Virtual: 1,
  Intercepting: 2,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type GestureDetectorType =
  (typeof GestureDetectorType)[keyof typeof GestureDetectorType];

interface CommonGestureDetectorProps {
  children?: React.ReactNode;
  userSelect?: UserSelect | undefined;
  touchAction?: TouchAction | undefined;
  enableContextMenu?: boolean | undefined;
}

export interface NativeDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

export interface InterceptingGestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
  gesture?: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

export interface VirtualDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> extends CommonGestureDetectorProps {
  gesture: Gesture<TConfig, THandlerData, TExtendedHandlerData>;
}

export type GestureDetectorProps<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
> =
  | NativeDetectorProps<TConfig, THandlerData, TExtendedHandlerData>
  | InterceptingGestureDetectorProps<
      TConfig,
      THandlerData,
      TExtendedHandlerData
    >;
