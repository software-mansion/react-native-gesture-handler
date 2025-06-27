import * as React from 'react';

import RNGestureHandlerModule from '../RNGestureHandlerModule';
import { State } from '../State';
import { handlerIDToTag } from './handlersRegistry';
import { getNextHandlerTag } from './getNextHandlerTag';

import {
  BaseGestureHandlerProps,
  GestureEvent,
  HandlerStateChangeEvent,
} from './gestureHandlerCommon';
import { filterConfig, scheduleFlushOperations } from './utils';
import findNodeHandle from '../findNodeHandle';
import { ValueOf } from '../typeUtils';
import { deepEqual, isReact19, isTestEnv, tagMessage } from '../utils';
import { ActionType } from '../ActionType';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import { ghQueueMicrotask } from '../ghQueueMicrotask';
import { MountRegistry } from '../mountRegistry';
import { ReactElement } from 'react';

type HandlerProps<T extends Record<string, unknown>> = Readonly<
  React.PropsWithChildren<BaseGestureHandlerProps<T>>
>;
function hasUnresolvedRefs<T extends Record<string, unknown>>(
  props: HandlerProps<T>
) {
  // TODO(TS) - add type for extract arg
  const extract = (refs: any | any[]) => {
    if (!Array.isArray(refs)) {
      return refs && refs.current === null;
    }
    return refs.some((r) => r && r.current === null);
  };
  return extract(props['simultaneousHandlers']) || extract(props['waitFor']);
}

const stateToPropMappings = {
  [State.UNDETERMINED]: undefined,
  [State.BEGAN]: 'onBegan',
  [State.FAILED]: 'onFailed',
  [State.CANCELLED]: 'onCancelled',
  [State.ACTIVE]: 'onActivated',
  [State.END]: 'onEnded',
} as const;

type CreateHandlerArgs<HandlerPropsT extends Record<string, unknown>> =
  Readonly<{
    name: string;
    allowedProps: Readonly<Extract<keyof HandlerPropsT, string>[]>;
    config: Readonly<Record<string, unknown>>;
    transformProps?: (props: HandlerPropsT) => HandlerPropsT;
    customNativeProps?: Readonly<string[]>;
  }>;

// TODO(TS) fix event types
type InternalEventHandlers = {
  onGestureHandlerEvent?: (event: any) => void;
  onGestureHandlerStateChange?: (event: any) => void;
};

type AttachGestureHandlerWeb = (
  handlerTag: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newView: any,
  _actionType: ActionType,
  propsRef: React.RefObject<unknown>
) => void;

const UNRESOLVED_REFS_RETRY_LIMIT = 1;

// TODO(TS) - make sure that BaseGestureHandlerProps doesn't need other generic parameter to work with custom properties.
export default function createHandler<
  T extends BaseGestureHandlerProps<U>,
  U extends Record<string, unknown>,
>({
  name,
  allowedProps = [],
  config = {},
  transformProps,
  customNativeProps = [],
}: CreateHandlerArgs<T>): React.ComponentType<T & React.RefAttributes<any>> {
  interface HandlerState {
    allowTouches: boolean;
  }
  class Handler extends React.Component<
    T & InternalEventHandlers,
    HandlerState
  > {
    static displayName = name;
    static contextType = GestureHandlerRootViewContext;

    private handlerTag = -1;
    private config: Record<string, unknown>;
    private propsRef: React.MutableRefObject<unknown>;
    private isMountedRef: React.MutableRefObject<boolean | null>;
    private viewNode: any;
    private viewTag?: number;

    constructor(props: T & InternalEventHandlers) {
      super(props);
      this.config = {};
      this.propsRef = React.createRef();
      this.isMountedRef = React.createRef();
      if (props.id) {
        if (handlerIDToTag[props.id] !== undefined) {
          throw new Error(`Handler with ID "${props.id}" already registered`);
        }
        handlerIDToTag[props.id] = this.handlerTag;
      }
    }

    componentDidMount() {
      const props: HandlerProps<U> = this.props;
      this.isMountedRef.current = true;

      if (hasUnresolvedRefs(props)) {
        // If there are unresolved refs (e.g. ".current" has not yet been set)
        // passed as `simultaneousHandlers` or `waitFor`, we enqueue a call to
        // _update method that will try to update native handler props using
        // queueMicrotask. This makes it so update() function gets called after all
        // react components are mounted and we expect the missing ref object to
        // be resolved by then.
        ghQueueMicrotask(() => {
          this.update(UNRESOLVED_REFS_RETRY_LIMIT);
        });
      }

      this.createGestureHandler(
        filterConfig(
          transformProps ? transformProps(this.props) : this.props,
          [...allowedProps, ...customNativeProps],
          config
        )
      );

      if (!this.viewNode) {
        throw new Error(
          `[Gesture Handler] Failed to obtain view for ${Handler.displayName}. Note that old API doesn't support functional components.`
        );
      }

      this.attachGestureHandler(findNodeHandle(this.viewNode) as number); // TODO(TS) - check if this can be null
    }

    componentDidUpdate() {
      const viewTag = findNodeHandle(this.viewNode);
      if (this.viewTag !== viewTag) {
        this.attachGestureHandler(viewTag as number); // TODO(TS) - check interaction between _viewTag & findNodeHandle
      }
      this.update(UNRESOLVED_REFS_RETRY_LIMIT);
    }

    componentWillUnmount() {
      this.isMountedRef.current = false;

      RNGestureHandlerModule.dropGestureHandler(this.handlerTag);
      scheduleFlushOperations();
      // We can't use this.props.id directly due to TS generic type narrowing bug, see https://github.com/microsoft/TypeScript/issues/13995 for more context
      const handlerID: string | undefined = this.props.id;
      if (handlerID) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete handlerIDToTag[handlerID];
      }

      MountRegistry.gestureHandlerWillUnmount(this);
    }

    private onGestureHandlerEvent = (event: GestureEvent<U>) => {
      if (event.nativeEvent.handlerTag === this.handlerTag) {
        if (typeof this.props.onGestureEvent === 'function') {
          this.props.onGestureEvent?.(event);
        }
      } else {
        this.props.onGestureHandlerEvent?.(event);
      }
    };

    // TODO(TS) - make sure this is right type for event
    private onGestureHandlerStateChange = (
      event: HandlerStateChangeEvent<U>
    ) => {
      if (event.nativeEvent.handlerTag === this.handlerTag) {
        if (typeof this.props.onHandlerStateChange === 'function') {
          this.props.onHandlerStateChange?.(event);
        }

        const state: ValueOf<typeof State> = event.nativeEvent.state;
        const stateEventName = stateToPropMappings[state];
        const eventHandler = stateEventName && this.props[stateEventName];
        if (eventHandler && typeof eventHandler === 'function') {
          eventHandler(event);
        }
      } else {
        this.props.onGestureHandlerStateChange?.(event);
      }
    };

    private refHandler = (node: any) => {
      this.viewNode = node;

      const child = React.Children.only(this.props.children);
      // @ts-ignore Since React 19 ref is accessible as standard prop
      // https://react.dev/blog/2024/04/25/react-19-upgrade-guide#deprecated-element-ref
      const ref = isReact19() ? (child as ReactElement).props?.ref : child?.ref;

      if (!ref) {
        return;
      }

      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    };

    private createGestureHandler = (
      newConfig: Readonly<Record<string, unknown>>
    ) => {
      this.handlerTag = getNextHandlerTag();
      this.config = newConfig;

      RNGestureHandlerModule.createGestureHandler(
        // @ts-ignore works
        name,
        this.handlerTag,
        newConfig
      );
    };

    private attachGestureHandler = (newViewTag: number) => {
      this.viewTag = newViewTag;

      // Typecast due to dynamic resolution, attachGestureHandler should have web version signature in this branch
      (RNGestureHandlerModule.attachGestureHandler as AttachGestureHandlerWeb)(
        this.handlerTag,
        newViewTag,
        ActionType.JS_FUNCTION_OLD_API, // ignored on web
        this.propsRef
      );

      scheduleFlushOperations();

      ghQueueMicrotask(() => {
        MountRegistry.gestureHandlerWillMount(this);
      });
    };

    private updateGestureHandler = (
      newConfig: Readonly<Record<string, unknown>>
    ) => {
      this.config = newConfig;

      // @ts-ignore works
      RNGestureHandlerModule.updateGestureHandler(this.handlerTag, newConfig);
      scheduleFlushOperations();
    };

    private update(remainingTries: number) {
      if (!this.isMountedRef.current) {
        return;
      }

      const props: HandlerProps<U> = this.props;

      // When ref is set via a function i.e. `ref={(r) => refObject.current = r}` instead of
      // `ref={refObject}` it's possible that it won't be resolved in time. Seems like trying
      // again is easy enough fix.
      if (hasUnresolvedRefs(props) && remainingTries > 0) {
        ghQueueMicrotask(() => {
          this.update(remainingTries - 1);
        });
      } else {
        const newConfig = filterConfig(
          transformProps ? transformProps(this.props) : this.props,
          [...allowedProps, ...customNativeProps],
          config
        );
        if (!deepEqual(this.config, newConfig)) {
          this.updateGestureHandler(newConfig);
        }
      }
    }

    // eslint-disable-next-line @eslint-react/no-unused-class-component-members
    setNativeProps(updates: any) {
      const mergedProps = { ...this.props, ...updates };
      const newConfig = filterConfig(
        transformProps ? transformProps(mergedProps) : mergedProps,
        [...allowedProps, ...customNativeProps],
        config
      );
      this.updateGestureHandler(newConfig);
    }

    render() {
      let gestureEventHandler = this.onGestureHandlerEvent;
      // Another instance of https://github.com/microsoft/TypeScript/issues/13995
      type OnGestureEventHandlers = {
        onGestureEvent?: BaseGestureHandlerProps<U>['onGestureEvent'];
        onGestureHandlerEvent?: InternalEventHandlers['onGestureHandlerEvent'];
      };
      const { onGestureEvent, onGestureHandlerEvent }: OnGestureEventHandlers =
        this.props;
      if (onGestureEvent && typeof onGestureEvent !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerEvent) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureEventHandler = onGestureEvent;
      } else {
        if (
          onGestureHandlerEvent &&
          typeof onGestureHandlerEvent !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }

      let gestureStateEventHandler = this.onGestureHandlerStateChange;
      // Another instance of https://github.com/microsoft/TypeScript/issues/13995
      type OnGestureStateChangeHandlers = {
        onHandlerStateChange?: BaseGestureHandlerProps<U>['onHandlerStateChange'];
        onGestureHandlerStateChange?: InternalEventHandlers['onGestureHandlerStateChange'];
      };
      const {
        onHandlerStateChange,
        onGestureHandlerStateChange,
      }: OnGestureStateChangeHandlers = this.props;
      if (onHandlerStateChange && typeof onHandlerStateChange !== 'function') {
        // If it's not a method it should be an native Animated.event
        // object. We set it directly as the handler for the view
        // In this case nested handlers are not going to be supported
        if (onGestureHandlerStateChange) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
        gestureStateEventHandler = onHandlerStateChange;
      } else {
        if (
          onGestureHandlerStateChange &&
          typeof onGestureHandlerStateChange !== 'function'
        ) {
          throw new Error(
            'Nesting touch handlers with native animated driver is not supported yet'
          );
        }
      }
      const events = {
        onGestureHandlerEvent: this.state.allowTouches
          ? gestureEventHandler
          : undefined,
        onGestureHandlerStateChange: this.state.allowTouches
          ? gestureStateEventHandler
          : undefined,
      };

      this.propsRef.current = events;

      let child: any = null;
      try {
        child = React.Children.only(this.props.children);
      } catch (e) {
        throw new Error(
          tagMessage(
            `${name} got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
          )
        );
      }

      return React.cloneElement(child, {
        ref: this.refHandler,
        collapsable: false,
        ...(isTestEnv()
          ? {
              handlerType: name,
              handlerTag: this.handlerTag,
              enabled: this.props.enabled,
            }
          : {}),
        testID: this.props.testID ?? child.props.testID,
        ...events,
      });
    }
  }
  return Handler;
}
