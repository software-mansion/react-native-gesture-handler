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
  position?: null; // todo
};

class ChartConnection {
  id: number;
  from: number;
  to: number;
}

export default class ChartManager {
  private _elements: ChartElement[] = [];
  private _connections: ChartConnection[] = [];
  private _listeners: Map<number, ((isActive: boolean) => void)[]> = useMemo(
    () => new Map(),
    []
  );

  get elements(): ChartElement[] {
    return this._elements;
  }

  get connections(): ChartConnection[] {
    return this._connections;
  }

  public addListener(id: number, listener: (isActive: boolean) => void): void {
    if (this._listeners.has(id)) this._listeners.get(id).push(listener);
    else this._listeners.set(id, [listener]);
  }

  public addElement(
    state: State,
    label: string | null = null
  ): [(isActive: boolean) => void, number] {
    const newId = this._elements.length;
    const newChartElement = {
      id: newId,
      label: label,
      state: state,
      position: null,
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

  public addConnection(fromId: number, toId: number) {}
}
