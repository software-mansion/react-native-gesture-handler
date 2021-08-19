import React from 'react';
import { GestureConfigReference } from './useGesture';
import { default as RNRenderer } from 'react-native/Libraries/Renderer/shims/ReactNative';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { startListening } from './eventReceiver';
import Reanimated from 'react-native-reanimated';

startListening();

type GestureMonitorProps = {
  gesture: React.RefObject<GestureConfigReference>;
};

export class GestureMonitor extends React.Component<GestureMonitorProps> {
  private viewTag: number;
  constructor(props: GestureMonitorProps) {
    super(props);

    this.viewTag = -1;
  }

  componentDidMount() {
    setImmediate(() => {
      if (this.props.gesture.current) {
        this.props.gesture.current.callback = () => {
          this.attachGestureHandlers(
            RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag
          );
        };
      }
    });
  }

  componentDidUpdate() {
    const viewTag = RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag;

    if (this.viewTag !== viewTag) {
      this.attachGestureHandlers(viewTag as number);
    }
  }

  private refHandler = (node: any) => {
    const child = React.Children.only(this.props.children);
    // TODO(TS) fix ref type
    const { ref }: any = child;
    if (ref !== null) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };

  attachGestureHandlers(newViewTag: number) {
    this.viewTag = newViewTag;
    if (this.props.gesture.current) {
      for (const gesture of this.props.gesture.current.config) {
        if (this.props.gesture.current?.animatedEventHandler) {
          RNGestureHandlerModule.attachGestureHandler(
            gesture.handlerTag,
            newViewTag,
            false
          );
        } else {
          RNGestureHandlerModule.attachGestureHandler(
            gesture.handlerTag,
            RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag,
            true
          );
        }
      }
    }
  }

  render() {
    if (this.props.gesture.current?.animatedEventHandler) {
      return (
        <AnimatedWrap
          ref={this.refHandler}
          onGestureHandlerEvent={
            this.props.gesture.current?.animatedEventHandler
          }>
          {this.props.children}
        </AnimatedWrap>
      );
    } else {
      return React.Children.only(this.props.children);
    }
  }
}

class Wrap extends React.Component<{ onGestureHandlerEvent: any }> {
  render() {
    return this.props.children;
  }
}

const AnimatedWrap = Reanimated.createAnimatedComponent(Wrap);
