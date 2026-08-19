import { ghQueueMicrotask } from './ghQueueMicrotask';
import type { GestureType } from './handlers/gestures/gesture';

interface ReactComponentWithHandlerTag extends React.Component {
  handlerTag: number;
}

export type GestureMountListener = (
  gesture: GestureType | ReactComponentWithHandlerTag
) => void;

/**
 * Mount notifications are batched: listeners receive the set of handler tags that
 * mounted within a single tick, instead of one call per mounting gesture.
 *
 * Notifying synchronously per gesture makes a commit that mounts N detectors cost
 * N x N listener invocations, and every invocation re-resolves relations into handler
 * tags. Batching lets each listener resolve its relations once per tick.
 */
export type GestureMountBatchListener = (
  mountedHandlerTags: ReadonlySet<number>
) => void;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MountRegistry {
  private static mountListeners = new Set<GestureMountBatchListener>();
  private static unmountListeners = new Set<GestureMountListener>();
  private static pendingMountedTags = new Set<number>();
  private static flushScheduled = false;

  static addMountListener(listener: GestureMountBatchListener): () => void {
    this.mountListeners.add(listener);

    return () => {
      this.mountListeners.delete(listener);
    };
  }

  static addUnmountListener(listener: GestureMountListener): () => void {
    this.unmountListeners.add(listener);

    return () => {
      this.unmountListeners.delete(listener);
    };
  }

  private static scheduleMountFlush() {
    if (this.flushScheduled) {
      return;
    }

    this.flushScheduled = true;

    ghQueueMicrotask(() => {
      this.flushScheduled = false;

      const mountedHandlerTags = this.pendingMountedTags;
      this.pendingMountedTags = new Set<number>();

      if (mountedHandlerTags.size === 0) {
        return;
      }

      this.mountListeners.forEach((listener) => listener(mountedHandlerTags));
    });
  }

  static gestureHandlerWillMount(handler: React.Component) {
    this.pendingMountedTags.add(
      (handler as ReactComponentWithHandlerTag).handlerTag
    );
    this.scheduleMountFlush();
  }

  static gestureHandlerWillUnmount(handler: React.Component) {
    this.unmountListeners.forEach((listener) =>
      listener(handler as ReactComponentWithHandlerTag)
    );
  }

  static gestureWillMount(gesture: GestureType) {
    this.pendingMountedTags.add(gesture.handlerTag);
    this.scheduleMountFlush();
  }

  static gestureWillUnmount(gesture: GestureType) {
    this.unmountListeners.forEach((listener) => listener(gesture));
  }
}
