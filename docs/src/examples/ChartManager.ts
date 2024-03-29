//import ElementData from './ElementData';

import { useMemo } from 'react';
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

export type ElementData = {
  id: number;
  label?: string;
  subtext?: string;
  isVisible: boolean;
  isHeader: boolean;
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
  // within gesture, States can be used as unique IDs pointing to the ElementData pool
  _elementIds: IdObject;

  get idObject() {
    return this._elementIds;
  }
  set idObject(newObject: IdObject) {
    this._elementIds = newObject;
  }
}

export default class ChartManager {
  private _elements: ElementData[] = [];
  private _connections: ChartConnection[] = [];
  private _layout: number[][];
  private _listeners: Map<number, Map<number, (isActive: boolean) => void>> =
    useMemo(() => new Map(), []);

  public static EMPTY_SPACE_ID = 0;

  constructor() {
    this.addElement(null, null, false);
  }

  get elements(): typeof this._elements {
    return this._elements;
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
    elementId: number,
    listener: (isActive: boolean) => void
  ): number {
    const listenerId = this._listeners.get(elementId)?.size - 1 ?? 0;

    // another map is used inside of _listeners to seamlessly remove listening functions from _listeners
    if (this._listeners.has(elementId)) {
      this._listeners.get(elementId).set(listenerId, listener);
    } else {
      this._listeners.set(elementId, new Map([[0, listener]]));
    }

    return listenerId;
  }

  public removeListener(elementId: number, listenerId: number): void {
    this._listeners.get(elementId).delete(listenerId);
  }

  public clearListeners(): void {
    this._listeners.clear();
  }

  public addElement(
    label: State | string = null,
    subtext: string | null = null,
    isVisible: boolean = true,
    isHeader: boolean = false
  ): [(isActive: boolean) => void, number] {
    const newId = this._elements.length;

    if (typeof label == 'number') {
      label = stateToName.get(label);
    }

    let highlightColor = labelColorMap.get(label) ?? Colors.YELLOW;

    const newElementData = {
      id: newId,
      label: label,
      subtext: subtext,
      position: null,
      isVisible: isVisible,
      isHeader: isHeader,
      highlightColor: highlightColor,
    };

    this._elements.push(newElementData);

    // this callback will be used by a .onX hook to broadcast this event to all listeners
    return [
      (isActive: boolean) => {
        this._listeners.get(newId)?.forEach((listener) => listener(isActive));
      },
      newId,
    ];
  }

  public addHeader(text: string): number {
    const [_, headerId] = this.addElement(text, null, true, true);
    return headerId;
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
  ): [GestureHandle, GesturesUnion, any] {
    const [beganCallback, beganId] = this.addElement(State.BEGAN);
    const [activeCallback, activeId] = this.addElement(State.ACTIVE);
    const [endCallback, endId] = this.addElement(State.END);
    const [failedCallback, failedId] = this.addElement(State.FAILED);
    const [cancelledCallback, cancelledId] = this.addElement(State.CANCELLED);
    const [undeterminedCallback, undeterminedId] = this.addElement(
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

    const resetAllStates = (event: GestureStateChangeEvent<any>) => {
      undeterminedCallback(true);
      if (event.state == State.FAILED) {
        failedCallback(true);
      }
      if (event.state == State.CANCELLED) {
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
      .onFinalize((event: GestureStateChangeEvent<any>) => {
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
