//import ChartElement from './ChartElement';

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
} from 'react-native-gesture-handler';
import { States } from './ComposedGesture';

export enum State {
  UNDETERMINED = 'UNDETERMINED',
  FAILED = 'FAILED',
  BEGAN = 'BEGAN',
  CANCELLED = 'CANCELLED',
  ACTIVE = 'ACTIVE',
  END = 'END',
}

type ChartElement = {
  id: number;
  state: State;
  label?: string; // optional subtext
  visible: boolean;
};

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

// FROM, TO
const stateConnectionsMap = [
  [State.UNDETERMINED, State.BEGAN],
  [State.BEGAN, State.ACTIVE],
  [State.BEGAN, State.FAILED],
  [State.ACTIVE, State.END],
  [State.ACTIVE, State.CANCELLED],
];

export class GestureHandle {
  // within gesture, States can be used as unique IDs pointing to the ChartElement pool
  elementIds: Map<State, number>;
  elementCbs: Map<State, (isActive: boolean) => void>;
  constructor() {
    this.elementIds = new Map();
    this.elementCbs = new Map();
  }
}

export default class ChartManager {
  private _elements: ChartElement[] = []; // debug: best structure here is array, because this is just a pool of elements, and thier id's are derived from here anyways
  private _connections: ChartConnection[] = []; // debug: this is a separate pool, fine as well
  private _headers: ChartElement[] = [];
  private _layout: number[][];
  private _listeners: Map<number, ((isActive: boolean) => void)[]> = useMemo(
    () => new Map(),
    []
  );

  public static EMPTY_SPACE = 0;

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

  public addListener(id: number, listener: (isActive: boolean) => void): void {
    if (this._listeners.has(id)) this._listeners.get(id).push(listener);
    else this._listeners.set(id, [listener]);
  }

  public addElement(
    state: State,
    label: string | null = null,
    visible: boolean = true
  ): [(isActive: boolean) => void, number] {
    const newId = this._elements.length;
    const newChartElement = {
      id: newId,
      label: label,
      state: state,
      position: null,
      visible: visible,
    };

    this._elements.push(newChartElement);

    // this callback will be used by a .onX hook to broadcast this event to all listeners
    return [
      (isActive: boolean) => {
        this._listeners.get(newId)?.forEach((listener) => listener(isActive));
      },
      newId,
    ];
  }

  public addHeader(text: string): number {
    // todo: add elements which can display text, and fill in all of the assigned space
    return 0;
  }

  public addConnection(fromId: number, toId: number) {
    this._connections.push({
      id: this._connections.length,
      from: fromId,
      to: toId,
    });
  }

  public connectAll(handle: GestureHandle) {
    stateConnectionsMap.forEach(([fromState, toState]) => {
      console.log('adding connection');
      const fromId = handle.elementIds.get(fromState);
      const toId = handle.elementIds.get(toState);
      if (fromId && toId) {
        this.addConnection(fromId, toId);
        console.log('connected');
      }
    });
  }

  public newGesture(gesture: GesturesUnion): [GestureHandle, GesturesUnion] {
    // HANDLE IS ONLY STORED ON USERSIDE, THIS AVOIDS MEMLEAKS
    // OTHERWISE NEW HANDLE WOULD BE CREATED & STORED EVERY RENDER

    // WARNING
    // ELEMENTS STILL GET LEAKED, RERENDER ADDS ELEMENTS TO THE POOL
    // we should either cleanup old elements, but that's a bad idea,
    // rather, it's better to memoize the creation of ids and cbs,
    // but then have a getter for them every render so that we can set them manually
    const [beganCallback, beganId] = this.addElement(State.BEGAN);

    const [activeCallback, activeId] = this.addElement(State.ACTIVE);

    const [endCallback, endId] = this.addElement(State.END);

    const [failedCallback, failedId] = this.addElement(State.FAILED);

    const [cancelledCallback, cancelledId] = this.addElement(State.CANCELLED);

    const [undeterminedCallback, undeterminedId] = this.addElement(
      State.UNDETERMINED
    );

    const handle = new GestureHandle();

    handle.elementIds.set(State.BEGAN, beganId);
    handle.elementIds.set(State.ACTIVE, activeId);
    handle.elementIds.set(State.END, endId);
    handle.elementIds.set(State.FAILED, failedId);
    handle.elementIds.set(State.CANCELLED, cancelledId);
    handle.elementIds.set(State.UNDETERMINED, undeterminedId);

    // for now, all of these values have to be hardcoded somewhere either way, and here seems like the most appropriate area.
    // in future, we could theoritically only listen to 'onChange' and play around with the states.
    // this could take up a little less space, but we would still need to hardcode the flow itself, just in a different format.
    undeterminedCallback(true);

    const resetAllStates = (event: GestureStateChangeEvent<any>) => {
      beganCallback(false);
      activeCallback(false);
      undeterminedCallback(true);
      if (event.state == States.FAILED) {
        failedCallback(true);
      }
      if (event.state == States.CANCELLED) {
        cancelledCallback(true);
      }
      setTimeout(() => {
        endCallback(false);
        failedCallback(false);
        cancelledCallback(false);
      }, 200);
    };

    // highlight-start
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
      .onFinalize((event) => {
        resetAllStates(event);
      });

    this.addConnection(undeterminedId, beganId);
    this.addConnection(beganId, activeId);
    this.addConnection(beganId, failedId);
    this.addConnection(activeId, endId);
    this.addConnection(activeId, cancelledId);

    return [handle, gesture];
  }
}
