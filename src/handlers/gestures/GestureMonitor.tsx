import React from 'react';
import { GestureConfigReference } from './useGesture';
//@ts-ignore Ignore TypeScript message about missing file
import { default as RNRenderer } from 'react-native/Libraries/Renderer/shims/ReactNative';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { startListening } from './eventReceiver';
import { Reanimated } from './reanimatedWrapper';

startListening();

type GestureMonitorProps = {
  gesture: GestureConfigReference;
};

export class GestureMonitor extends React.Component<GestureMonitorProps> {
  private viewTag: number;
  constructor(props: GestureMonitorProps) {
    super(props);

    this.viewTag = -1;
  }

  componentDidMount() {
    if (this.props.gesture) {
      this.props.gesture.callback = () => {
        this.attachGestureHandlers(
          RNRenderer.findHostInstance_DEPRECATED(this)._nativeTag
        );
      };
    }
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
    if (this.props.gesture) {
      for (const gesture of this.props.gesture.config) {
        if (this.props.gesture?.animatedEventHandler) {
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
    if (this.props.gesture?.animatedEventHandler) {
      return (
        <AnimatedWrap
          ref={this.refHandler}
          onGestureHandlerEvent={this.props.gesture?.animatedEventHandler}>
          {this.props.children}
        </AnimatedWrap>
      );
    } else {
      return React.Children.only(this.props.children);
    }
  }
}

class Wrap extends React.Component<{ onGestureHandlerEvent: unknown }> {
  render() {
    return this.props.children;
  }
}

const AnimatedWrap = Reanimated?.default?.createAnimatedComponent(Wrap) ?? Wrap;
