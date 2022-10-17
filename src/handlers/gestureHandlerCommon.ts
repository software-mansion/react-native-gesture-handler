// Previous types exported gesture handlers as classes which creates an interface and variable, both named the same as class.
// Without those types, we'd introduce breaking change, forcing users to prefix every handler type specification with typeof
// e.g. React.createRef<TapGestureHandler> -> React.createRef<typeof TapGestureHandler>.
// See https://www.typescriptlang.org/docs/handbook/classes.html#constructor-functions for reference.
import * as React from 'react';
import { Platform, findNodeHandle as findNodeHandleRN } from 'react-native';

import { State } from '../State';
import { TouchEventType } from '../TouchEventType';
import { ValueOf } from '../typeUtils';
import { handlerIDToTag } from './handlersRegistry';
import { toArray } from '../utils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';

const commonProps = [
  'id',
  'enabled',
  'shouldCancelWhenOutside',
  'hitSlop',
  'cancelsTouchesInView',
  'userSelect',
] as const;

const componentInteractionProps = ['waitFor', 'simultaneousHandlers'] as const;

export const baseGestureHandlerProps = [
  ...commonProps,
  ...componentInteractionProps,
  'onBegan',
  'onFailed',
  'onCancelled',
  'onActivated',
  'onEnded',
  'onGestureEvent',
  'onHandlerStateChange',
] as const;

export const baseGestureHandlerWithMonitorProps = [
  ...commonProps,
  'needsPointerData',
  'manualActivation',
];

export interface GestureEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: ValueOf<typeof State>;
}
export interface HandlerStateChangeEventPayload extends GestureEventPayload {
  oldState: ValueOf<typeof State>;
}

export type HitSlop =
  | number
  | Partial<
      Record<
        'left' | 'right' | 'top' | 'bottom' | 'vertical' | 'horizontal',
        number
      >
    >
  | Record<'width' | 'left', number>
  | Record<'width' | 'right', number>
  | Record<'height' | 'top', number>
  | Record<'height' | 'bottom', number>;

export type UserSelect = 'none' | 'auto' | 'text';

//TODO(TS) events in handlers

export interface GestureEvent<ExtraEventPayloadT = Record<string, unknown>> {
  nativeEvent: Readonly<GestureEventPayload & ExtraEventPayloadT>;
}
export interface HandlerStateChangeEvent<
  ExtraEventPayloadT = Record<string, unknown>
> {
  nativeEvent: Readonly<HandlerStateChangeEventPayload & ExtraEventPayloadT>;
}

export type TouchData = {
  id: number;
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
};

export type GestureTouchEvent = {
  handlerTag: number;
  numberOfTouches: number;
  state: ValueOf<typeof State>;
  eventType: TouchEventType;
  allTouches: TouchData[];
  changedTouches: TouchData[];
};

export type GestureUpdateEvent<GestureEventPayloadT = Record<string, unknown>> =
  GestureEventPayload & GestureEventPayloadT;

export type GestureStateChangeEvent<
  GestureStateChangeEventPayloadT = Record<string, unknown>
> = HandlerStateChangeEventPayload & GestureStateChangeEventPayloadT;

export type CommonGestureConfig = {
  enabled?: boolean;
  shouldCancelWhenOutside?: boolean;
  hitSlop?: HitSlop;
  userSelect?: UserSelect;
};

// Events payloads are types instead of interfaces due to TS limitation.
// See https://github.com/microsoft/TypeScript/issues/15300 for more info.
export type BaseGestureHandlerProps<
  ExtraEventPayloadT extends Record<string, unknown> = Record<string, unknown>
> = CommonGestureConfig & {
  id?: string;
  waitFor?: React.Ref<unknown> | React.Ref<unknown>[];
  simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
  testID?: string;
  cancelsTouchesInView?: boolean;
  // TODO(TS) - fix event types
  onBegan?: (event: HandlerStateChangeEvent) => void;
  onFailed?: (event: HandlerStateChangeEvent) => void;
  onCancelled?: (event: HandlerStateChangeEvent) => void;
  onActivated?: (event: HandlerStateChangeEvent) => void;
  onEnded?: (event: HandlerStateChangeEvent) => void;

  //TODO(TS) consider using NativeSyntheticEvent
  onGestureEvent?: (event: GestureEvent<ExtraEventPayloadT>) => void;
  onHandlerStateChange?: (
    event: HandlerStateChangeEvent<ExtraEventPayloadT>
  ) => void;
  // implicit `children` prop has been removed in @types/react^18.0.0
  children?: React.ReactNode;
};

function isConfigParam(param: unknown, name: string) {
  // param !== Object(param) returns false if `param` is a function
  // or an object and returns true if `param` is null
  return (
    param !== undefined &&
    (param !== Object(param) ||
      !('__isNative' in (param as Record<string, unknown>))) &&
    name !== 'onHandlerStateChange' &&
    name !== 'onGestureEvent'
  );
}

export function filterConfig(
  props: Record<string, unknown>,
  validProps: string[],
  defaults: Record<string, unknown> = {}
) {
  const filteredConfig = { ...defaults };
  for (const key of validProps) {
    let value = props[key];
    if (isConfigParam(value, key)) {
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
        value = transformIntoHandlerTags(props[key]);
      } else if (key === 'hitSlop' && typeof value !== 'object') {
        value = { top: value, left: value, bottom: value, right: value };
      }
      filteredConfig[key] = value;
    }
  }
  return filteredConfig;
}

function transformIntoHandlerTags(handlerIDs: any) {
  handlerIDs = toArray(handlerIDs);

  if (Platform.OS === 'web') {
    return handlerIDs
      .map(({ current }: { current: any }) => current)
      .filter((handle: any) => handle);
  }
  // converts handler string IDs into their numeric tags
  return handlerIDs
    .map(
      (handlerID: any) =>
        handlerIDToTag[handlerID] || handlerID.current?.handlerTag || -1
    )
    .filter((handlerTag: number) => handlerTag > 0);
}

export function findNodeHandle(
  node: null | number | React.Component<any, any> | React.ComponentClass<any>
): null | number | React.Component<any, any> | React.ComponentClass<any> {
  if (Platform.OS === 'web') {
    return node;
  }
  return findNodeHandleRN(node);
}

let scheduledFlushOperationsId: ReturnType<
  typeof requestAnimationFrame
> | null = null;

export function scheduleFlushOperations() {
  if (scheduledFlushOperationsId === null) {
    scheduledFlushOperationsId = requestAnimationFrame(() => {
      RNGestureHandlerModule.flushOperations();

      scheduledFlushOperationsId = null;
    });
  }
}
