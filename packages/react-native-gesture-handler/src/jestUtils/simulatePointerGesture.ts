import invariant from 'invariant';
import type { RefObject } from 'react';
import type { ReactTestInstance } from 'react-test-renderer';

import { ActionType } from '../ActionType';
import { findGesture } from '../handlers/handlersRegistry';
import { PointerType } from '../PointerType';
import type { AnySingleGesture } from '../v3/hooks/gestures/singleGestureUnion';
import type { GestureHandlerEventWithHandlerData } from '../v3/types';
import { SingleGestureName } from '../v3/types';
import WebFlingGestureHandler from '../web/handlers/FlingGestureHandler';
import type GestureHandler from '../web/handlers/GestureHandler';
import type IGestureHandler from '../web/handlers/IGestureHandler';
import WebLongPressGestureHandler from '../web/handlers/LongPressGestureHandler';
import WebPanGestureHandler from '../web/handlers/PanGestureHandler';
import WebPinchGestureHandler from '../web/handlers/PinchGestureHandler';
import WebRotationGestureHandler from '../web/handlers/RotationGestureHandler';
import WebTapGestureHandler from '../web/handlers/TapGestureHandler';
import type { AdaptedEvent, Config, PropsRef } from '../web/interfaces';
import { EventTypes } from '../web/interfaces';
import EventManager from '../web/tools/EventManager';
import type {
  GestureHandlerDelegate,
  MeasureResult,
} from '../web/tools/GestureHandlerDelegate';
import InteractionManager from '../web/tools/InteractionManager';
import { getByGestureTestId } from './jestUtils';

type RecognizerTarget = string | AnySingleGesture | ReactTestInstance;

type Point = {
  x: number;
  y: number;
};

type PointerPath = {
  id?: number;
  path: Point[];
};

type ResolvedPointerPath = {
  id: number;
  path: Point[];
};

type TestViewGeometry = {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

export type SimulatePointerGestureOptions = {
  on: RecognizerTarget;
  x?: number;
  y?: number;
  steps?: number;
  path?: Point[];
  pointers?: PointerPath[];
  holdForMs?: number;
  timeStepMs?: number;
  layout?: Partial<TestViewGeometry>;
};

const DEFAULT_LAYOUT: TestViewGeometry = {
  pageX: 0,
  pageY: 0,
  width: 100,
  height: 100,
};

function noop(): void {
  return;
}

class JestPointerEventManager extends EventManager<unknown> {
  public registerListeners(): void {
    // No-op: tests call the manager directly.
  }

  public unregisterListeners(): void {
    // No-op: tests call the manager directly.
  }

  protected mapEvent(_event: Event, _eventType: EventTypes): AdaptedEvent {
    throw new Error('JestPointerEventManager does not map DOM events.');
  }

  public pointerDown(event: AdaptedEvent): void {
    this.onPointerDown(event);
  }

  public pointerAdd(event: AdaptedEvent): void {
    this.onPointerAdd(event);
  }

  public pointerMove(event: AdaptedEvent): void {
    this.onPointerMove(event);
  }

  public pointerRemove(event: AdaptedEvent): void {
    this.onPointerRemove(event);
  }

  public pointerUp(event: AdaptedEvent): void {
    this.onPointerUp(event);
  }
}

type RuntimeHandler = {
  handler: GestureHandler;
  manager: JestPointerEventManager;
};

type DetectorHostInstance = ReactTestInstance & {
  props: {
    handlerTags: number[];
  };
};

class JestGestureHandlerDelegate
  implements GestureHandlerDelegate<unknown, IGestureHandler>
{
  public view: unknown = null;

  // eslint-disable-next-line no-useless-constructor
  public constructor(private readonly layout: TestViewGeometry) {}

  public init(viewRef: number, _handler: IGestureHandler): void {
    this.view = viewRef;
  }

  public detach(): void {
    this.view = null;
  }

  public updateDOM(): void {
    // No-op: Jest runtime has no DOM to update.
  }

  public isPointerInBounds({ x, y }: Point): boolean {
    return (
      x >= this.layout.pageX &&
      x <= this.layout.pageX + this.layout.width &&
      y >= this.layout.pageY &&
      y <= this.layout.pageY + this.layout.height
    );
  }

  public measureView(): MeasureResult {
    return this.layout;
  }

  public absoluteToLocal(absoluteX: number, absoluteY: number): Point {
    return {
      x: absoluteX - this.layout.pageX,
      y: absoluteY - this.layout.pageY,
    };
  }

  public reset = noop;
  public onBegin = noop;
  public onActivate = noop;
  public onEnd = noop;
  public onCancel = noop;
  public onFail = noop;
  public onEnabledChange = noop;
  public destroy(): void {
    this.detach();
  }
}

function isV3Gesture(value: unknown): value is AnySingleGesture {
  return (
    typeof value === 'object' &&
    value !== null &&
    'detectorCallbacks' in value &&
    'gestureRelations' in value &&
    'handlerTag' in value &&
    'type' in value
  );
}

function isReactTestInstance(
  value: RecognizerTarget
): value is ReactTestInstance {
  return (
    typeof value === 'object' &&
    value !== null &&
    'props' in value &&
    typeof value.props === 'object'
  );
}

function isDetectorHost(
  value: ReactTestInstance
): value is DetectorHostInstance {
  const props = value.props as { handlerTags?: unknown };

  return Array.isArray(props.handlerTags);
}

function findNearestDetectorHost(
  target: ReactTestInstance
): DetectorHostInstance | null {
  let current: ReactTestInstance | null = target;

  while (current) {
    if (isDetectorHost(current)) {
      return current;
    }

    current = current.parent;
  }

  return null;
}

function resolveGestureTarget(target: RecognizerTarget): AnySingleGesture[] {
  if (isReactTestInstance(target)) {
    const detectorHost = findNearestDetectorHost(target);

    invariant(
      detectorHost,
      'simulatePointerGesture() could not find an API v3 detector host for the rendered target.'
    );

    return detectorHost.props.handlerTags.map((handlerTag: number) => {
      const gesture = findGesture(handlerTag);

      invariant(
        gesture,
        `simulatePointerGesture() could not find a registered hook gesture for handler tag ${handlerTag}.`
      );

      return gesture;
    });
  }

  const resolvedTarget =
    typeof target === 'string' ? getByGestureTestId(target) : target;

  invariant(
    isV3Gesture(resolvedTarget),
    'simulatePointerGesture() supports only API v3 hook gestures, gesture test IDs, or rendered detector targets.'
  );

  return [resolvedTarget];
}

function createPropsRef(gesture: AnySingleGesture): RefObject<PropsRef> {
  const emit = (event: Parameters<PropsRef['onGestureHandlerEvent']>[0]) => {
    const jsEventHandler = gesture.detectorCallbacks.jsEventHandler as
      | ((event: GestureHandlerEventWithHandlerData<unknown>) => void)
      | undefined;

    jsEventHandler?.(
      event as unknown as GestureHandlerEventWithHandlerData<unknown>
    );
  };

  return {
    current: {
      onGestureHandlerEvent: emit,
      onGestureHandlerStateChange: emit,
      onGestureHandlerTouchEvent: emit,
      onGestureHandlerReanimatedEvent: emit,
      onGestureHandlerReanimatedStateChange: emit,
      onGestureHandlerReanimatedTouchEvent: emit,
      onGestureHandlerAnimatedEvent: emit,
    },
  };
}

function createWebGestureHandler(
  gesture: AnySingleGesture,
  layout: TestViewGeometry
): GestureHandler {
  const delegate = new JestGestureHandlerDelegate(layout);

  switch (gesture.type) {
    case SingleGestureName.Pan:
      return new WebPanGestureHandler(delegate);
    case SingleGestureName.Tap:
      return new WebTapGestureHandler(delegate);
    case SingleGestureName.LongPress:
      return new WebLongPressGestureHandler(delegate);
    case SingleGestureName.Fling:
      return new WebFlingGestureHandler(delegate);
    case SingleGestureName.Pinch:
      return new WebPinchGestureHandler(delegate);
    case SingleGestureName.Rotation:
      return new WebRotationGestureHandler(delegate);
    default:
      throw new Error(
        `simulatePointerGesture() does not support ${gesture.type} yet.`
      );
  }
}

function createLocalPath({
  x,
  y,
  steps = 1,
  path,
}: Pick<SimulatePointerGestureOptions, 'x' | 'y' | 'steps' | 'path'>): Point[] {
  if (path) {
    invariant(
      path.length > 0,
      'simulatePointerGesture() expected path to contain at least one point.'
    );
    return path;
  }

  const hasMovement = x !== undefined || y !== undefined;
  if (!hasMovement) {
    return [{ x: 0, y: 0 }];
  }

  invariant(
    Number.isInteger(steps) && steps > 0,
    `simulatePointerGesture() expected steps to be a positive integer, received ${steps}.`
  );

  return [
    { x: 0, y: 0 },
    ...Array.from({ length: steps }, (_, index) => {
      const progress = (index + 1) / steps;

      return {
        x: (x ?? 0) * progress,
        y: (y ?? 0) * progress,
      };
    }),
  ];
}

function createPointerPaths({
  pointers,
  ...pathOptions
}: Pick<
  SimulatePointerGestureOptions,
  'x' | 'y' | 'steps' | 'path' | 'pointers'
>): ResolvedPointerPath[] {
  if (!pointers) {
    return [
      {
        id: 1,
        path: createLocalPath(pathOptions),
      },
    ];
  }

  invariant(
    pointers.length > 0,
    'simulatePointerGesture() expected pointers to contain at least one pointer path.'
  );

  return pointers.map((pointer, index) => {
    invariant(
      pointer.path.length > 0,
      'simulatePointerGesture() expected each pointer path to contain at least one point.'
    );

    return {
      id: pointer.id ?? index + 1,
      path: pointer.path,
    };
  });
}

function createAdaptedEvent(
  point: Point,
  layout: TestViewGeometry,
  eventType: EventTypes,
  time: number,
  pointerId: number
): AdaptedEvent {
  return {
    x: layout.pageX + point.x,
    y: layout.pageY + point.y,
    offsetX: point.x,
    offsetY: point.y,
    pointerId,
    eventType,
    pointerType: PointerType.TOUCH,
    time,
  };
}

function getPathPoint(path: Point[], index: number): Point {
  return path[Math.min(index, path.length - 1)];
}

function advanceTimersByTime(ms: number): void {
  if (ms === 0) {
    return;
  }

  invariant(
    typeof jest !== 'undefined' &&
      typeof jest.advanceTimersByTime === 'function',
    'simulatePointerGesture() with holdForMs requires Jest fake timers.'
  );

  jest.advanceTimersByTime(ms);
}

export function simulatePointerGesture({
  on,
  layout: partialLayout,
  holdForMs = 0,
  timeStepMs = 16,
  ...pathOptions
}: SimulatePointerGestureOptions): void {
  const gestures = resolveGestureTarget(on);
  const layout = { ...DEFAULT_LAYOUT, ...partialLayout };
  const pointerPaths = createPointerPaths(pathOptions);
  const maxPathLength = Math.max(
    ...pointerPaths.map((pointer) => pointer.path.length)
  );
  let currentTime = 0;
  const handlers = gestures.map((gesture): RuntimeHandler => {
    const handler = createWebGestureHandler(gesture, layout);
    const manager = new JestPointerEventManager({});
    const propsRef = createPropsRef(gesture);

    handler.handlerTag = gesture.handlerTag;
    handler.setGestureConfig(gesture.config as unknown as Config);
    InteractionManager.instance.configureInteractions(
      handler,
      gesture.gestureRelations
    );
    handler.init(1, propsRef, ActionType.NATIVE_DETECTOR);
    handler.attachEventManager(manager);

    return {
      handler,
      manager,
    };
  });

  try {
    invariant(
      timeStepMs > 0,
      `simulatePointerGesture() expected timeStepMs to be greater than 0, received ${timeStepMs}.`
    );

    const [firstPointer, ...additionalPointers] = pointerPaths;

    handlers.forEach(({ manager }) => {
      manager.pointerDown(
        createAdaptedEvent(
          firstPointer.path[0],
          layout,
          EventTypes.DOWN,
          currentTime,
          firstPointer.id
        )
      );
    });

    additionalPointers.forEach((pointer) =>
      handlers.forEach(({ manager }) => {
        manager.pointerAdd(
          createAdaptedEvent(
            pointer.path[0],
            layout,
            EventTypes.ADDITIONAL_POINTER_DOWN,
            currentTime,
            pointer.id
          )
        );
      })
    );

    for (let i = 1; i < maxPathLength; i++) {
      currentTime += timeStepMs;
      const eventTime = currentTime;

      pointerPaths.forEach((pointer) => {
        handlers.forEach(({ manager }) => {
          manager.pointerMove(
            createAdaptedEvent(
              getPathPoint(pointer.path, i),
              layout,
              EventTypes.MOVE,
              eventTime,
              pointer.id
            )
          );
        });
      });
    }

    invariant(
      holdForMs >= 0,
      `simulatePointerGesture() expected holdForMs to be greater than or equal to 0, received ${holdForMs}.`
    );

    if (holdForMs > 0) {
      advanceTimersByTime(holdForMs);
      currentTime += holdForMs;
    }

    [...additionalPointers].reverse().forEach((pointer) =>
      handlers.forEach(({ manager }) => {
        manager.pointerRemove(
          createAdaptedEvent(
            getPathPoint(pointer.path, maxPathLength - 1),
            layout,
            EventTypes.ADDITIONAL_POINTER_UP,
            currentTime,
            pointer.id
          )
        );
      })
    );

    handlers.forEach(({ manager }) =>
      manager.pointerUp(
        createAdaptedEvent(
          getPathPoint(firstPointer.path, maxPathLength - 1),
          layout,
          EventTypes.UP,
          currentTime,
          firstPointer.id
        )
      )
    );
  } finally {
    handlers.forEach(({ handler }) => {
      InteractionManager.instance.dropRelationsForHandlerWithTag(
        handler.handlerTag
      );
      handler.onDestroy();
    });
  }
}
