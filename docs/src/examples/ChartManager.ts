//import ChartElement from './ChartElement';

import { useMemo } from 'react';

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

export default class ChartManager {
  private _elements: ChartElement[] = []; // debug: best structure here is array, because this is just a pool of elements, and thier id's are derived from here anyways
  private _connections: ChartConnection[] = []; // debug: this is a separate pool, fine as well
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

  public addConnection(fromId: number, toId: number) {
    this._connections.push({
      id: this._connections.length,
      from: fromId,
      to: toId,
    });
  }

  public setGridLayout() {}
}
