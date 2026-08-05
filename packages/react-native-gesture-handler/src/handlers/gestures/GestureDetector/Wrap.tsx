import React from 'react';

import type { WrapRef } from '../../../hostInstance';
import {
  assignRef,
  isHostInstance,
  preferHostInstance,
} from '../../../hostInstance';
import { tagMessage } from '../../../utils';
import { Reanimated } from '../reanimatedWrapper';

export class Wrap extends React.Component<{
  onGestureHandlerEvent?: unknown;
  // Implicit `children` prop has been removed in @types/react^18.0.0
  children?: React.ReactNode;
}> {
  private childInstance: unknown = null;
  private hostInstance: unknown = null;
  private childRef: WrapRef = undefined;
  private attachedChildRef: WrapRef = undefined;
  private childRefCleanup: (() => void) | undefined = undefined;

  // eslint-disable-next-line @eslint-react/no-unused-class-component-members
  public getHostInstance() {
    return this.hostInstance;
  }

  private detachChildRef() {
    if (this.childRefCleanup !== undefined) {
      this.childRefCleanup();
    } else if (this.attachedChildRef) {
      assignRef(this.attachedChildRef, null);
    }

    this.childRefCleanup = undefined;
    this.attachedChildRef = undefined;
  }

  private attachChildRef(instance: unknown) {
    this.attachedChildRef = this.childRef;

    this.childRefCleanup = assignRef(this.attachedChildRef, instance);
  }

  private handleChildRef = (instance: unknown) => {
    this.childInstance = instance;

    const resolved = preferHostInstance(instance);
    this.hostInstance = isHostInstance(resolved) ? resolved : null;

    this.detachChildRef();

    if (instance !== null && instance !== undefined) {
      this.attachChildRef(instance);
    }
  };

  override componentDidUpdate() {
    if (
      this.childRef === this.attachedChildRef ||
      this.childInstance === null
    ) {
      return;
    }

    this.detachChildRef();
    this.attachChildRef(this.childInstance);
  }

  override render() {
    // I don't think that fighting with types over such a simple function is worth it
    // The only thing it does is add 'collapsable: false' to the child component
    // to make sure it is in the native view hierarchy so the detector can find
    // correct viewTag to attach to.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let child: any;

    try {
      child = React.Children.only(this.props.children);
    } catch (e) {
      throw new Error(
        tagMessage(
          `GestureDetector got more than one view as a child. If you want the gesture to work on multiple views, wrap them with a common parent and attach the gesture to that view.`
        )
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    this.childRef = child.props.ref as WrapRef;

    return React.cloneElement(
      child,
      { collapsable: false, ref: this.handleChildRef },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      child.props.children
    );
  }
}

export const AnimatedWrap =
  Reanimated?.default?.createAnimatedComponent(Wrap) ?? Wrap;
