import type { PropsWithChildren } from 'react';
import React from 'react';

import type { WrapRef } from '../../../hostInstance';
import {
  assignRef,
  detachRef,
  preferHostInstance,
} from '../../../hostInstance';
import { tagMessage } from '../../../utils';

export type { WrapRef };

export type WrapProps = PropsWithChildren<{
  hostRef?: WrapRef;
}>;

// A class on purpose: the detector walks the fiber from its instance to tell
// a child that swallowed the ref from one that has no host view yet.
export class Wrap extends React.Component<WrapProps> {
  private childRef?: WrapRef;
  private hostRef?: WrapRef;

  private attachRef: ((instance: unknown) => (() => void) | undefined) | null =
    null;

  private createAttachRef(childRef: WrapRef, hostRef: WrapRef) {
    return (instance: unknown) => {
      const childCleanup = assignRef(childRef, instance);
      const hostCleanup = assignRef(hostRef, preferHostInstance(instance));

      const hasCleanup =
        typeof childCleanup === 'function' || typeof hostCleanup === 'function';

      if (!hasCleanup) {
        return undefined;
      }

      return () => {
        detachRef(childRef, childCleanup);
        detachRef(hostRef, hostCleanup);
      };
    };
  }

  override render() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let child: any;

    try {
      child = React.Children.only(this.props.children);
    } catch (e) {
      throw new Error(
        tagMessage(
          `VirtualGestureDetector expects exactly one React element as its child. To use a gesture with multiple views, wrap them in a single parent view and attach the gesture to that.`
        )
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const childRef = child.props.ref as WrapRef;
    const { hostRef } = this.props;

    // A new callback whenever either ref changes, so React re-attaches it.
    if (
      this.attachRef === null ||
      childRef !== this.childRef ||
      hostRef !== this.hostRef
    ) {
      this.childRef = childRef;
      this.hostRef = hostRef;
      this.attachRef = this.createAttachRef(childRef, hostRef);
    }

    return React.cloneElement(
      child,
      { collapsable: false, ref: this.attachRef },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      child.props.children
    );
  }
}
