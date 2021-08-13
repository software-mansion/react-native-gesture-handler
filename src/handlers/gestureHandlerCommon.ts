// Previous types exported gesture handlers as classes which creates an interface and variable, both named the same as class.
// Without those types, we'd introduce breaking change, forcing users to prefix every handler type specification with typeof
// e.g. React.createRef<TapGestureHandler> -> React.createRef<typeof TapGestureHandler>.
// See https://www.typescriptlang.org/docs/handbook/classes.html#constructor-functions for reference.
import * as React from 'react';

import { State } from '../State';
import { ValueOf } from '../typeUtils';

const commonProps = [
  'id',
  'enabled',
  'minPointers',
  'shouldCancelWhenOutside',
  'hitSlop',
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

export interface GestureEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: ValueOf<typeof State>;
}

export interface HandlerStateChangeEventPayload {
  handlerTag: number;
  numberOfPointers: number;
  state: ValueOf<typeof State>;
  oldState: ValueOf<typeof State>;
}

//TODO(TS) events in handlers

export interface GestureEvent<ExtraEventPayloadT = Record<string, unknown>> {
  nativeEvent: Readonly<GestureEventPayload & ExtraEventPayloadT>;
}
export interface HandlerStateChangeEvent<
  ExtraEventPayloadT = Record<string, unknown>
> {
  nativeEvent: Readonly<HandlerStateChangeEventPayload & ExtraEventPayloadT>;
}

// Events payloads are types instead of interfaces due to TS limitation.
// See https://github.com/microsoft/TypeScript/issues/15300 for more info.
export type BaseGestureHandlerProps<
  ExtraEventPayloadT extends Record<string, unknown> = Record<string, unknown>
> = {
  id?: string;
  enabled?: boolean;
  minPointers?: number;
  waitFor?: React.Ref<unknown> | React.Ref<unknown>[];
  simultaneousHandlers?: React.Ref<unknown> | React.Ref<unknown>[];
  shouldCancelWhenOutside?: boolean;
  hitSlop?:
    | number
    // TODO(TS) take into consideration types from GestureHandler#setHitSlop
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
};
