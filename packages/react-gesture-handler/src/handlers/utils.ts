import * as React from 'react';
import { toArray } from '../utils';
import RNGestureHandlerModule from '../RNGestureHandlerModule';
import { ghQueueMicrotask } from '../ghQueueMicrotask';

function isConfigParam(param: unknown, name: string) {
  // param !== Object(param) returns false if `param` is a function
  // or an object and returns true if `param` is null
  return (
    param !== undefined &&
    (param !== Object(param) ||
      !('__isNative' in (param as Record<string, unknown>))) &&
    name !== 'onHandlerStateChange' &&
    name !== 'onGestureEvent'
  );
}

export function filterConfig(
  props: Record<string, unknown>,
  validProps: string[],
  defaults: Record<string, unknown> = {}
) {
  const filteredConfig = { ...defaults };
  for (const key of validProps) {
    let value = props[key];
    if (isConfigParam(value, key)) {
      if (key === 'simultaneousHandlers' || key === 'waitFor') {
        value = transformIntoHandlerTags(props[key]);
      } else if (key === 'hitSlop' && typeof value !== 'object') {
        value = { top: value, left: value, bottom: value, right: value };
      }
      filteredConfig[key] = value;
    }
  }
  return filteredConfig;
}

export function transformIntoHandlerTags(handlerIDs: any) {
  handlerIDs = toArray(handlerIDs);

  return handlerIDs
    .map(({ current }: { current: any }) => current)
    .filter((handle: any) => handle);
}

export function findNodeHandle(
  node: null | number | React.Component<any, any> | React.ComponentClass<any>
): null | number | React.Component<any, any> | React.ComponentClass<any> {
  return node;
}
let flushOperationsScheduled = false;

export function scheduleFlushOperations() {
  if (!flushOperationsScheduled) {
    flushOperationsScheduled = true;
    ghQueueMicrotask(() => {
      RNGestureHandlerModule.flushOperations();

      flushOperationsScheduled = false;
    });
  }
}
