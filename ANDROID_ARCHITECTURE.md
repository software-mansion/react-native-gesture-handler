# Android Architecture: React Native Gesture Handler

---

## 1. Native Module Setup

**Entry point**: `RNGestureHandlerPackage` extends `BaseReactPackage` and registers:
- `RNGestureHandlerModule` — the main TurboModule (annotated `@ReactModule(name = "RNGestureHandlerModule")`)
- `RNGestureHandlerRootViewManager`, `RNGestureHandlerButtonViewManager`, `RNGestureHandlerDetectorViewManager` — view managers registered on-demand

**`RNGestureHandlerModule`** is the JS-facing API. Its main responsibilities are:
- `createGestureHandler(handlerName, handlerTag, config)` — instantiate a handler class
- `attachGestureHandler(handlerTag, viewTag, actionType)` — bind handler to a native view
- `updateGestureHandler(handlerTag, config)` — reconfigure a handler
- `dropGestureHandler(handlerTag)` — destroy a handler

It implements `TurboModuleWithJSIBindings` for JSI/C++ interop (loading `gesturehandler` native library via `SoLoader`). One registry per React root is stored in `registries: MutableMap<Int, RNGestureHandlerRegistry>`.

---

## 2. Handler Storage

**`RNGestureHandlerRegistry`** holds all the data structures:
- `SparseArray<GestureHandler>` indexed by handler tag (integer, assigned from JS)
- `SparseArray<Int?>` mapping handler tag → attached view tag
- `SparseArray<ArrayList<GestureHandler>>` mapping view tag → list of handlers on that view

When `attachHandlerToView()` is called:
1. Handler is detached from any previous view
2. Registered to the target view tag's list
3. For detector-type handlers, the host detector view reference is set

---

## 3. Root View & Touch Interception

**`RNGestureHandlerRootView`** extends `ReactViewGroup`. On `dispatchTouchEvent()` and `dispatchGenericMotionEvent()`, it delegates to `RNGestureHandlerRootHelper` before calling `super`. Returns `true` (consumed) if the helper says to intercept.

**`RNGestureHandlerRootHelper`** is the real coordinator:
- Creates a `GestureHandlerOrchestrator` with the root view, registry, and config helper
- Registers a synthetic **`RootViewGestureHandler`** (with tag = `-wrappedViewTag`) to monitor the root-level gesture
- On each touch event: calls `orchestrator.onTouchEvent(event)`, then returns `shouldIntercept`
- `shouldIntercept` is set to `true` when `RootViewGestureHandler.onCancel()` is triggered, signaling that a native child grabbed the touch lock

**`RootViewGestureHandler`** (private inner class):
- Begins on `ACTION_DOWN`, ends on `ACTION_UP`
- `shouldBeCancelledBy(handler)` returns `handler.preventRecognizers` — this is the key hook for the `preventRecognizers` feature
- When cancelled, calls `rootView.onChildStartedNativeGesture()` to notify React

---

## 4. Gesture Detection Pipeline

Full event flow from a raw `MotionEvent`:

```
Android MotionEvent
  ↓
RNGestureHandlerRootView.dispatchTouchEvent()
  ↓
RNGestureHandlerRootHelper.dispatchTouchEvent()
  ↓
GestureHandlerOrchestrator.onTouchEvent()
  ├─ ACTION_DOWN / POINTER_DOWN / HOVER_MOVE
  │    └─ extractGestureHandlers(event)
  │         └─ traverseWithPointerEvents() — walks view hierarchy
  │              └─ recordViewHandlersForPointer() — registers handlers whose views
  │                   contain the touch point
  ├─ ACTION_CANCEL → cancelAll()
  └─ deliverEventToGestureHandlers(event)
       └─ For each handler (sorted by activation priority):
            ├─ transformEventToViewCoords()     — transform to handler's local space
            ├─ handler.updatePointerData()      — if needsPointerData
            ├─ handler.handle(event, source)    — core processing, calls onHandle()
            └─ handler.dispatchHandlerUpdate()  — if currently ACTIVE
```

**View hierarchy traversal** in `extractGestureHandlers()`:
- Starts at the wrapper view, iterates children in **reverse drawing order** (topmost first)
- Skips clipped children or those outside bounds or with `pointerEvents=NONE`
- Transforms coordinates into each child's local space recursively
- Stops at nested `RNGestureHandlerRootView` to prevent double-processing
- Handles `ReactCompoundView` for compound children

---

## 5. GestureHandler Base Class State Machine

**States** (`GestureHandler.kt`):
```
UNDETERMINED (0)
    ↓ begin()
  BEGAN (2)
    ↓ activate()
  ACTIVE (4)
    ↓ end()
   END (5)

From any of UNDETERMINED/BEGAN/ACTIVE:
    → FAILED (1)     via fail()
    → CANCELLED (3)  via cancel()
```

**Key properties**:
- `state` — current state (private setter)
- `isActive`, `isAwaiting` — orchestrator-managed flags
- `activationIndex` — order of activation; used to prioritize event delivery
- `trackedPointerIDs[]` — maps Android pointer IDs to handler-local sequential IDs
- `trackedPointersCount` — active pointer count
- `x`, `y` — current touch position in handler's local space
- `preventRecognizers` — whether this handler blocks the root view's native gesture (default `true`)

**Core methods**:
- `handle(transformedEvent, sourceEvent)` — entry point from orchestrator; routes to `onHandle()` in subclasses
- `prepare(view, orchestrator)` — called once when first recording the handler for a view
- `reset()` — clears all state after gesture lifecycle completes
- `shouldRecognizeSimultaneously(handler)`, `shouldBeCancelledBy(handler)`, `shouldRequireToWaitForFailure(handler)` — relationship queries

**Pointer tracking**: Up to 17 simultaneous pointers (`MAX_POINTERS_COUNT`). Android pointer IDs are remapped to local sequential IDs 0–16 via `startTrackingPointer()` / `stopTrackingPointer()`.

**Hit slop**: `isWithinBounds()` supports per-side padding plus `width`/`height` constraints on the touch target.

---

## 6. Concrete Handler Implementations

| Handler | Activation Trigger | Key Config |
|---|---|---|
| `TapGestureHandler` | `ACTION_UP` within time/distance limits | `numberOfTaps`, `maxDurationMs`, `maxDelayMs`, `maxDelta[XY]` |
| `PanGestureHandler` | Minimum distance or velocity threshold | `activeOffset[XY]`, `failOffset[XY]`, `minVelocity[XY]`, `minPointers`, `maxPointers` |
| `LongPressGestureHandler` | Timeout after hold (default 500ms) | `minDurationMs`, `maxDist`, `numberOfPointers` |
| `PinchGestureHandler` | Two-finger scale via `ScaleGestureDetector` | — |
| `RotationGestureHandler` | Two-finger rotation via `RotationGestureDetector` | — |
| `FlingGestureHandler` | Minimum swipe velocity | `numberOfPointers`, `direction`, `minVelocity` |
| `HoverGestureHandler` | `ACTION_HOVER_*` events only (no touch) | — |
| `ManualGestureHandler` | Never auto-activates; JS-controlled | — |
| `NativeViewGestureHandler` | Wraps native views (ScrollView, Button, etc.) | — |

Pan has stylus support (`StylusData` with pressure/tilt), optional `averageTouches` for iOS-like multi-pointer averaging, and can activate after a long-press delay.

---

## 7. Handler Interactions

**`RNGestureHandlerInteractionManager`** stores three relationship maps:

| Relationship | Data Structure | Semantics |
|---|---|---|
| Simultaneous | `SparseArray<IntArray>` | Both handlers can be ACTIVE at the same time |
| WaitFor / RequireToFail | `waitForRelations: SparseArray<IntArray>` | Handler waits for another to FAIL before activating |
| Blocking | `blockingRelations: SparseArray<IntArray>` | Handler blocks others until it resolves |

**Orchestrator enforcement** in `makeActive()`:
1. `hasOtherHandlerToWaitFor()` — if something must fail first, handler enters `isAwaiting=true` state
2. On each awaiting handler: when its blocker ends in `FAILED`/`CANCELLED` → re-try `tryActivate()`; if blocker ends in `END` → cancel the awaiting handler
3. When a handler becomes truly ACTIVE: call `shouldHandlerBeCancelledBy()` on all other handlers and cancel those that return `true`

---

## 8. Event/Callback System

**`RNGestureHandlerEventDispatcher`** routes events based on `actionType`:

| Action Type | Routing |
|---|---|
| `ACTION_TYPE_REANIMATED_WORKLET` | Reanimated worklet via `sendEventForReanimated()` |
| `ACTION_TYPE_NATIVE_ANIMATED_EVENT` | Native animated driver |
| `ACTION_TYPE_JS_FUNCTION_OLD_API` | Device event via `RNGestureHandlerEvent` (old bridge) |
| `ACTION_TYPE_JS_FUNCTION_NEW_API` | Device event via `RNGestureHandlerEvent` (new API) |
| `ACTION_TYPE_NATIVE_DETECTOR` | Directly on the detector view |

**Events dispatched**:
- **Handler update events** — fired while state == `ACTIVE`, contains current position, velocity, scale, etc.
- **State change events** — fired on every state transition: `onBegin`, `onStart` (ACTIVE), `onEnd`, `onFinalize`

**Touch pointer events** (when `needsPointerData=true`): `RNGestureHandlerTouchEvent` carries `changedTouches` and `allTouches` arrays with per-pointer `{id, x, y, absoluteX, absoluteY}`.

**Full callback chain**:
```
Handler state change
  → orchestrator.onHandlerStateChange()
    → dispatchStateChange()
      → onTouchEventListener.onStateChange()
        → RNGestureHandlerEventDispatcher.dispatchStateChangeEvent()
          → [route by actionType] → JS / Reanimated / NativeAnimated
```

---

## 9. GestureHandlerOrchestrator

The orchestrator is the central coordinator. Key data structures:
- `gestureHandlers[]` — all handlers currently receiving events
- `awaitingHandlers[]` — handlers blocked waiting for another to fail
- `preparedHandlers[]` — snapshot copy used during event delivery to avoid concurrent modification

**Event delivery priority** (`handlersComparator`):
1. Active handlers first (by `activationIndex`, earliest first)
2. Awaiting handlers next
3. Inactive handlers last

**Coordinate transformation**: `transformEventToViewCoords()` recursively walks the parent chain from the handler's view up to the wrapper view, accounting for scroll offsets, view positions, and matrix transforms.

**Handler lifecycle**:
1. First touch in view's bounds → `recordHandlerIfNotPresent()` → `handler.prepare(view, this)`
2. Events delivered each frame
3. Handler reaches terminal state (END/FAILED/CANCELLED) → removed from active list, `reset()` called

---

## 10. Old vs. New Architecture

The library is **hybrid**: it supports both architectures simultaneously.

- **TurboModule / JSI**: `RNGestureHandlerModule` implements `TurboModuleWithJSIBindings`, exposes C++ bindings via JNI for direct synchronous calls (no bridge round-trip)
- **Old bridge**: Falls back to `ACTION_TYPE_JS_FUNCTION_OLD_API` event dispatch via the React Native bridge
- **Fabric**: `RNGestureHandlerDetectorViewManager` has Fabric-aware view creation paths
- **Reanimated 2**: Detected at runtime via `setReanimatedAvailable()`; worklet routing bypasses the bridge entirely
- **NativeAnimated**: Gesture values can drive animations on the native thread via `ACTION_TYPE_NATIVE_ANIMATED_EVENT`

---

## 11. `preventRecognizers` Feature

**`GestureHandler.preventRecognizers: Boolean`** (default `true`) controls whether, when a handler activates, it cancels the root view's synthetic gesture handler.

**Mechanism**:
1. Handler becomes ACTIVE → orchestrator calls `makeActive()` → calls `shouldHandlerBeCancelledBy(handler)` on all registered handlers
2. `RootViewGestureHandler.shouldBeCancelledBy(handler)` returns `handler.preventRecognizers`
3. If `true`: root handler is cancelled → `onChildStartedNativeGesture()` called → React treats the touch as consumed by RN
4. If `false`: root handler stays alive → native views can still process the touch in parallel

**Config key**: `KEY_PREVENT_RECOGNIZERS` in `updateConfig()`. Recent commits extended this to be configurable **per gesture detector** (`b939be17f`) and **per root view** (`1f123b1ff`).

---

## Key Architectural Patterns

| Pattern | Where Used |
|---|---|
| **State Machine** | Every `GestureHandler` subclass |
| **Registry** | `RNGestureHandlerRegistry` (tag → handler, view → handlers) |
| **Visitor** | Orchestrator traversing the view hierarchy |
| **Observer** | Handlers notify orchestrator of state changes |
| **Strategy** | `RNGestureHandlerInteractionManager` for interaction policies |
| **Adapter** | Event builders adapt handler data to different event types |
| **Lazy init** | Handlers only prepared when first receiving events |
