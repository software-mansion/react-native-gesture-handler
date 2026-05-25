import type { Ref, RefObject } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { ActionType } from '../../ActionType';
import type {
  TouchAction,
  UserSelect,
} from '../../handlers/gestureHandlerCommon';
import RNGestureHandlerModule from '../../RNGestureHandlerModule.web';
import { tagMessage } from '../../utils';
import { type PropsRef } from '../../web/interfaces';
import NodeManager from '../../web/tools/NodeManager';
import { useNativeGestureRole } from './useNativeGestureRole';

export interface GestureHandlerDetectorProps extends PropsRef {
  handlerTags: number[];
  moduleId: number;
  children?: React.ReactNode;
  virtualChildren?: Set<VirtualChildrenWeb>;
  userSelect?: UserSelect | undefined;
  touchAction?: TouchAction | undefined;
  enableContextMenu?: boolean | undefined;
}

export interface VirtualChildrenWeb {
  viewTag: number;
  handlerTags: number[];
  viewRef: RefObject<Element | null>;
  userSelect?: UserSelect | undefined;
  touchAction?: TouchAction | undefined;
  enableContextMenu?: boolean | undefined;
}

// Bundles all per-instance state passed to the standalone helpers below. Holding everything in
// one stable object keeps the helpers pure (no closures over component-render-scoped values),
// which means the useEffects don't need them in their deps lists.
type DetectorRefs = {
  owner: object;
  viewRef: RefObject<Element | null>;
  propsRef: RefObject<GestureHandlerDetectorProps>;
  // Tags observed for the detector view (top-level).
  subscribedHandlers: Set<number>;
  // Flat set of tags currently bound to *some* element (top-level or virtual). Mirrors iOS
  // `_attachedHandlers` / Android `attachedHandlers`.
  attachedHandlers: Set<number>;
  // Tags whose handler asked to attach to the detector's child element rather than the detector
  // itself (`shouldAttachGestureToChildView`). Kept here so we can (re)bind them as subviews
  // appear.
  nativeHandlers: Set<number>;
  // For each virtual child's viewTag, the set of currently-observed handler tags.
  subscribedVirtualHandlers: Map<number, Set<number>>;
  // Latest snapshot of virtual children keyed by viewTag. The ready callback reads this so
  // re-fires after a child's per-DOM props change use the up-to-date values.
  virtualChildren: Map<number, VirtualChildrenWeb>;
  // True while a flush microtask is queued; ensures we batch attaches per React commit.
  attachFlushScheduled: boolean;
};

// Batch observer firings to a microtask so attaches happen in subscription order, not in
// the order handlers happen to be created by React's effect commit.
function scheduleAttachFlush(refs: DetectorRefs) {
  if (refs.attachFlushScheduled) {
    return;
  }

  refs.attachFlushScheduled = true;
  queueMicrotask(() => {
    refs.attachFlushScheduled = false;
    flushAttaches(refs);
  });
}

// Attach all ready, not-yet-attached tags in subscription order. Re-applies DOM props for
// already-attached tags (handler re-registration); never re-attaches.
function flushAttaches(refs: DetectorRefs) {
  const view = refs.viewRef.current;
  if (view == null) {
    return;
  }

  for (const tag of refs.subscribedHandlers) {
    if (!NodeManager.hasHandler(tag)) {
      continue;
    }

    if (refs.attachedHandlers.has(tag)) {
      RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
        userSelect: refs.propsRef.current.userSelect,
        touchAction: refs.propsRef.current.touchAction,
        enableContextMenu: refs.propsRef.current.enableContextMenu,
      });
      continue;
    }

    const handler = RNGestureHandlerModule.getGestureHandlerNode(tag);
    let target: Element = view;

    if (handler.shouldAttachGestureToChildView()) {
      refs.nativeHandlers.add(tag);
      if (view.childElementCount > 1) {
        throw new Error(
          tagMessage(
            'Cannot have more than one child view when native gesture handlers are attached to the detector'
          )
        );
      }
      if (view.firstElementChild == null) {
        throw new Error(
          tagMessage(
            'A native gesture handler requires a child view to attach to, but the detector has no children'
          )
        );
      }

      target = view.firstElementChild;
    }

    RNGestureHandlerModule.attachGestureHandler(
      tag,
      target,
      ActionType.NATIVE_DETECTOR,
      refs.propsRef
    );
    refs.attachedHandlers.add(tag);
    RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
      userSelect: refs.propsRef.current.userSelect,
      touchAction: refs.propsRef.current.touchAction,
      enableContextMenu: refs.propsRef.current.enableContextMenu,
    });
  }

  for (const [viewTag, tags] of refs.subscribedVirtualHandlers) {
    const child = refs.virtualChildren.get(viewTag);
    if (child == null || child.viewRef.current == null) {
      continue;
    }

    for (const tag of tags) {
      if (!NodeManager.hasHandler(tag)) {
        continue;
      }

      if (!refs.attachedHandlers.has(tag)) {
        RNGestureHandlerModule.attachGestureHandler(
          tag,
          child.viewRef.current,
          ActionType.VIRTUAL_DETECTOR,
          refs.propsRef
        );
        refs.attachedHandlers.add(tag);
      }

      RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
        userSelect: child.userSelect,
        touchAction: child.touchAction,
        enableContextMenu: child.enableContextMenu,
      });
    }
  }
}

// Observer callback for `NodeManager.observeHandler`. Defers to a batched flush so attach
// order is deterministic; may fire multiple times per tag on re-registration.
function attachReadyHandler(refs: DetectorRefs) {
  scheduleAttachFlush(refs);
}

// Reconcile `subscribedSet` against `currentTags`: observe new tags, cancel observation and
// detach for tags no longer present. The ready callback set up here is responsible for actually
// binding the handler once it exists.
function syncSubscriptions(
  refs: DetectorRefs,
  currentTags: Iterable<number>,
  subscribedSet: Set<number>
) {
  const toUnsubscribe = new Set(subscribedSet);
  for (const tag of currentTags) {
    toUnsubscribe.delete(tag);
    if (subscribedSet.has(tag)) {
      continue;
    }
    NodeManager.observeHandler(tag, refs.owner, () => {
      attachReadyHandler(refs);
    });
    subscribedSet.add(tag);
  }

  for (const tag of toUnsubscribe) {
    NodeManager.cancelObservation(tag, refs.owner);
    if (refs.attachedHandlers.has(tag)) {
      RNGestureHandlerModule.detachGestureHandler(tag);
      refs.attachedHandlers.delete(tag);
    }
    subscribedSet.delete(tag);
    refs.nativeHandlers.delete(tag);
  }
}

function teardown(refs: DetectorRefs) {
  NodeManager.cancelAllObservationsForOwner(refs.owner);
  for (const tag of refs.attachedHandlers) {
    RNGestureHandlerModule.detachGestureHandler(tag);
  }
  refs.attachedHandlers.clear();
  refs.subscribedHandlers.clear();
  refs.nativeHandlers.clear();
  refs.subscribedVirtualHandlers.clear();
  refs.virtualChildren.clear();
}

const HostGestureDetector = (props: GestureHandlerDetectorProps) => {
  const { handlerTags, children } = props;

  const handlerTagsSet = useMemo(() => new Set(handlerTags), [...handlerTags]);

  const viewRef = useRef<Element>(null);
  const propsRef = useRef<GestureHandlerDetectorProps>(props);

  // Stable per-instance state
  const refsRef = useRef<DetectorRefs | null>(null);
  if (refsRef.current === null) {
    refsRef.current = {
      owner: {},
      viewRef,
      propsRef,
      subscribedHandlers: new Set<number>(),
      attachedHandlers: new Set<number>(),
      nativeHandlers: new Set<number>(),
      subscribedVirtualHandlers: new Map<number, Set<number>>(),
      virtualChildren: new Map<number, VirtualChildrenWeb>(),
      attachFlushScheduled: false,
    };
  }
  const refs = refsRef.current;

  useNativeGestureRole(viewRef, children);

  // Keep propsRef in sync and re-apply detector-level DOM props to top-level attached handlers
  // when they change. Virtual children get their own (potentially different) DOM props applied
  // in the virtualChildren effect below, so we only touch top-level subscribers here.
  useEffect(() => {
    const shouldUpdateDOMProps =
      propsRef.current.userSelect !== props.userSelect ||
      propsRef.current.touchAction !== props.touchAction ||
      propsRef.current.enableContextMenu !== props.enableContextMenu;

    propsRef.current = props;

    if (shouldUpdateDOMProps) {
      // attachedHandlers ⊆ subscribedHandlers ⋃ subscribedVirtualHandlers, we want to ignore the
      // handlers attached by the virtual detectors not to overwrite their DOM props.
      const claimedByVirtual = Array.from(
        refs.subscribedVirtualHandlers.values()
      ).reduce((acc, current) => acc.union(current), new Set<number>());

      const handlersToUpdate = refs.subscribedHandlers
        .intersection(refs.attachedHandlers)
        .difference(claimedByVirtual);

      for (const tag of handlersToUpdate) {
        RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
          userSelect: props.userSelect,
          touchAction: props.touchAction,
          enableContextMenu: props.enableContextMenu,
        });
      }
    }
  }, [props, refs]);

  useEffect(() => {
    syncSubscriptions(refs, handlerTagsSet, refs.subscribedHandlers);
  }, [handlerTagsSet, refs]);

  useEffect(() => {
    // Refresh the snapshot used by the ready callback so re-fires read current child props.
    refs.virtualChildren.clear();
    props.virtualChildren?.forEach((child) => {
      refs.virtualChildren.set(child.viewTag, child);
    });

    const virtualChildrenToDetach = new Set(
      refs.subscribedVirtualHandlers.keys()
    );
    props.virtualChildren?.forEach((child) => {
      virtualChildrenToDetach.delete(child.viewTag);
    });

    for (const viewTag of virtualChildrenToDetach) {
      const tags = refs.subscribedVirtualHandlers.get(viewTag);
      if (tags != null) {
        syncSubscriptions(refs, [], tags);
      }
      refs.subscribedVirtualHandlers.delete(viewTag);
    }

    props.virtualChildren?.forEach((child) => {
      if (child.viewRef.current == null) {
        // We must check whether viewRef is  not null as otherwise we get an error when intercepting gesture detector
        // switches its component based on whether animated/reanimated events should run.
        return;
      }

      let subs = refs.subscribedVirtualHandlers.get(child.viewTag);
      if (subs == null) {
        subs = new Set();
        refs.subscribedVirtualHandlers.set(child.viewTag, subs);
      }
      syncSubscriptions(refs, child.handlerTags, subs);
      // Re-apply per-child DOM props on every run. Already-attached tags need this when only
      // the child's props change.
      for (const tag of subs) {
        if (refs.attachedHandlers.has(tag)) {
          RNGestureHandlerModule.updateGestureHandlerConfig(tag, {
            userSelect: child.userSelect,
            touchAction: child.touchAction,
            enableContextMenu: child.enableContextMenu,
          });
        }
      }
    });
  }, [props.virtualChildren, refs]);

  useEffect(() => {
    return () => teardown(refs);
  }, [refs]);

  return (
    <View style={{ display: 'contents' }} ref={viewRef as Ref<View>}>
      {children}
    </View>
  );
};

export default HostGestureDetector;
