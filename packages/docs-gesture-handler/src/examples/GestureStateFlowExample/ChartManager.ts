import {
  TapGesture,
  PanGesture,
  PinchGesture,
  RotationGesture,
  FlingGesture,
  LongPressGesture,
  ForceTouchGesture,
  NativeGesture,
  ManualGesture,
  HoverGesture,
  GestureStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

export const WAVE_DELAY_MS = 150;
const Colors = {
  BLUE: 'var(--swm-blue-light-80)',
  GREEN: 'var(--swm-green-light-80)',
  YELLOW: 'var(--swm-yellow-light-80)',
  RED: 'var(--swm-red-light-80)',
};

export type Item = {
  id: number;
  label?: string;
  subtext?: string;
  isVisible: boolean;
  highlightColor: string;
};

const stateToName = new Map<number, string>([
  [State.UNDETERMINED, 'UNDETERMINED'],
  [State.FAILED, 'FAILED'],
  [State.BEGAN, 'BEGAN'],
  [State.CANCELLED, 'CANCELLED'],
  [State.ACTIVE, 'ACTIVE'],
  [State.END, 'END'],
]);

const labelColorMap = new Map<string, string>([
  [stateToName.get(State.BEGAN), Colors.BLUE],
  [stateToName.get(State.ACTIVE), Colors.GREEN],
  [stateToName.get(State.END), Colors.BLUE],
  [stateToName.get(State.FAILED), Colors.RED],
  [stateToName.get(State.CANCELLED), Colors.RED],
  [stateToName.get(State.UNDETERMINED), Colors.YELLOW],
]);

class ChartConnection {
  id: number;
  from: number;
  to: number;
}

type GesturesUnion =
  | TapGesture
  | PanGesture
  | PinchGesture
  | RotationGesture
  | FlingGesture
  | LongPressGesture
  | ForceTouchGesture
  | NativeGesture
  | ManualGesture
  | HoverGesture;

type IdObject = {
  began: number;
  active: number;
  end: number;
  failed: number;
  cancelled: number;
  undetermined: number;
};

export class GestureHandle {
  // within gesture, States can be used as unique IDs pointing to the item pool
  _itemIds: IdObject;

  get idObject() {
    return this._itemIds;
  }
  set idObject(newObject: IdObject) {
    this._itemIds = newObject;
  }
}

export default class ChartManager {
  private _items: Item[] = [];
  private _connections: ChartConnection[] = [];
  private _layout: number[][];
  private _listeners: Map<number, Map<number, (isActive: boolean) => void>> =
    new Map();

  public static EMPTY_SPACE_ID = 0;

  constructor() {
    this.addItem(null, null, false);
  }

  get items(): Item[] {
    return this._items;
  }

  get connections(): ChartConnection[] {
    return this._connections;
  }

  get layout(): number[][] {
    return this._layout;
  }

  set layout(layoutGrid: number[][]) {
    this._layout = layoutGrid;
  }

  public addListener(
    itemId: number,
    listener: (isActive: boolean) => void
  ): number {
    const listenerId = this._listeners.get(itemId)?.size - 1;

    // another map is used inside of _listeners to seamlessly remove listening functions from _listeners
    if (this._listeners.has(itemId)) {
      this._listeners.get(itemId).set(listenerId, listener);
    } else {
      this._listeners.set(itemId, new Map([[0, listener]]));
    }

    return listenerId;
  }

  public removeListener(itemId: number, listenerId: number): void {
    this._listeners.get(itemId).delete(listenerId);
  }

  public clearListeners(): void {
    this._listeners.clear();
  }

  public addItem(
    label: State | string = null,
    subtext: string | null = null,
    isVisible: boolean = true
  ): [(isActive: boolean) => void, number] {
    const newId = this._items.length;

    if (typeof label == 'number') {
      label = stateToName.get(label);
    }

    const highlightColor = labelColorMap.get(label) ?? Colors.YELLOW;

    const newItem = {
      id: newId,
      label: label,
      subtext: subtext,
      position: null,
      isVisible: isVisible,
      highlightColor: highlightColor,
    };

    this._items.push(newItem);

    // this callback will be used by a .onX hook to broadcast this event to all listeners
    return [
      (isActive: boolean) => {
        this._listeners.get(newId)?.forEach((listener) => listener(isActive));
      },
      newId,
    ];
  }

  public addConnection(fromId: number, toId: number) {
    this._connections.push({
      id: this._connections.length,
      from: fromId,
      to: toId,
    });
  }

  public newGesture(
    gesture: GesturesUnion
  ): [GestureHandle, GesturesUnion, () => void] {
    const [beganCallback, beganId] = this.addItem(State.BEGAN);
    const [activeCallback, activeId] = this.addItem(State.ACTIVE);
    const [endCallback, endId] = this.addItem(State.END);
    const [failedCallback, failedId] = this.addItem(State.FAILED);
    const [cancelledCallback, cancelledId] = this.addItem(State.CANCELLED);
    const [undeterminedCallback, undeterminedId] = this.addItem(
      State.UNDETERMINED
    );

    const handle = new GestureHandle();
    handle.idObject = {
      began: beganId,
      active: activeId,
      end: endId,
      failed: failedId,
      cancelled: cancelledId,
      undetermined: undeterminedId,
    } as IdObject;

    undeterminedCallback(true);

    const resetAllStates = (event: GestureStateChangeEvent<unknown>) => {
      undeterminedCallback(true);
      if (event.state === State.FAILED) {
        failedCallback(true);
      }
      if (event.state === State.CANCELLED) {
        cancelledCallback(true);
      }
      setTimeout(() => {
        beganCallback(false);
        activeCallback(false);
      }, WAVE_DELAY_MS);
      setTimeout(() => {
        endCallback(false);
        failedCallback(false);
        cancelledCallback(false);
      }, 2 * WAVE_DELAY_MS);
    };

    gesture
      .onBegin(() => {
        beganCallback(true);
        undeterminedCallback(false);
      })
      .onStart(() => {
        beganCallback(false);
        activeCallback(true);
      })
      .onEnd(() => {
        endCallback(true);
      })
      .onFinalize((event: GestureStateChangeEvent<unknown>) => {
        resetAllStates(event);
      });

    [
      [undeterminedId, beganId],
      [beganId, activeId],
      [beganId, failedId],
      [activeId, endId],
      [activeId, cancelledId],
      [beganId, cancelledId],
    ].forEach(([from, to]) => {
      this.addConnection(from, to);
    });

    const resetCb = () => {
      undeterminedCallback(true);
    };

    return [handle, gesture, resetCb];
  }
}
