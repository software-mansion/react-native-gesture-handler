import { GestureType } from './handlers/gestures/gesture';

interface ReactComponentWithHandlerTag extends React.Component {
  handlerTag: number;
}

export type GestureMountListener = (
  gesture: GestureType | ReactComponentWithHandlerTag
) => void;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MountRegistry {
  private static mountListeners = new Set<GestureMountListener>();
  private static unmountListeners = new Set<GestureMountListener>();

  static addMountListener(listener: GestureMountListener): () => void {
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

  static gestureHandlerWillMount(handler: React.Component) {
    this.mountListeners.forEach((listener) =>
      listener(handler as ReactComponentWithHandlerTag)
    );
  }

  static gestureHandlerWillUnmount(handler: React.Component) {
    this.unmountListeners.forEach((listener) =>
      listener(handler as ReactComponentWithHandlerTag)
    );
  }

  static gestureWillMount(gesture: GestureType) {
    this.mountListeners.forEach((listener) => listener(gesture));
  }

  static gestureWillUnmount(gesture: GestureType) {
    this.unmountListeners.forEach((listener) => listener(gesture));
  }
}
