import { ActionType } from '@swmansion/gesture-handler-core';
import type {
  TouchAction,
  UserSelect,
} from '@swmansion/gesture-handler-core/src/handlers/gestureHandlerCommon';
import { tagMessage } from '@swmansion/gesture-handler-core/src/utils';
import { type PropsRef } from '@swmansion/gesture-handler-dom-engine/src/interfaces';
import NodeManager from '@swmansion/gesture-handler-dom-engine/src/tools/NodeManager';
import type { Ref, RefObject } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';

import { useNativeGestureRole } from './useNativeGestureRole';
import { WebModule } from './WebModule';

// DOM host detector (adapted from react-native-gesture-handler's
// v3/detectors/HostGestureDetector.web.tsx: RN View replaced with a div,
// module facade replaced with this package's WebModule).

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
  viewRef: RefObject<Element | null>;
  propsRef: RefObject<GestureHandlerDetectorProps>;
  // Tags observed for the detector view (top-level).
  subscribedHandlers: Set<number>;
  // Flat set of tags currently bound to *some* element (top-level or virtual).
  attachedHandlers: Set<number>;
  // Tags whose handler asked to attach to the detector's child element rather than the detector
  // itself (`shouldAttachGestureToChildView`).
  nativeHandlers: Set<number>;
  // For each virtual child's viewTag, the set of currently-observed handler tags.
  subscribedVirtualHandlers: Map<number, Set<number>>;
  // Latest snapshot of virtual children keyed by viewTag.
  virtualChildren: Map<number, VirtualChildrenWeb>;
};

function attachReadyHandler(
  refs: DetectorRefs,
  tag: number,
  actionType: ActionType,
  virtualViewTag?: number
) {
  const handler = WebModule.getGestureHandlerNode(tag);

  if (
    actionType === ActionType.NATIVE_DETECTOR &&
    handler.shouldAttachGestureToChildView()
  ) {
    refs.nativeHandlers.add(tag);
    if (
      refs.viewRef.current != null &&
      refs.viewRef.current.childElementCount > 0
    ) {
      tryAttachNativeHandlersToChildView(refs);
    }
    return;
  }

  if (actionType === ActionType.VIRTUAL_DETECTOR) {
    const child =
      virtualViewTag != null
        ? refs.virtualChildren.get(virtualViewTag)
        : undefined;
    if (child == null || child.viewRef.current == null) {
      return;
    }

    if (!refs.attachedHandlers.has(tag)) {
      WebModule.attachGestureHandler(
        tag,
        child.viewRef.current,
        actionType,
        refs.propsRef,
        refs.viewRef
      );
      refs.attachedHandlers.add(tag);
    }

    WebModule.updateGestureHandlerConfig(tag, {
      userSelect: child.userSelect,
      touchAction: child.touchAction,
      enableContextMenu: child.enableContextMenu,
    });
    return;
  }

  if (refs.viewRef.current == null) {
    return;
  }

  if (!refs.attachedHandlers.has(tag)) {
    WebModule.attachGestureHandler(
      tag,
      refs.viewRef.current,
      actionType,
      refs.propsRef,
      refs.viewRef
    );
    refs.attachedHandlers.add(tag);
  }

  WebModule.updateGestureHandlerConfig(tag, {
    userSelect: refs.propsRef.current.userSelect,
    touchAction: refs.propsRef.current.touchAction,
    enableContextMenu: refs.propsRef.current.enableContextMenu,
  });
}

function tryAttachNativeHandlersToChildView(refs: DetectorRefs) {
  if (refs.nativeHandlers.size === 0) {
    return;
  }

  const view = refs.viewRef.current;
  if (view == null) {
    return;
  }

  if (view.childElementCount > 1) {
    throw new Error(
      tagMessage(
        'Cannot have more than one child view when native gesture handlers are attached to the detector'
      )
    );
  }

  const target = view.firstElementChild;
  if (target == null) {
    return;
  }

  for (const tag of refs.nativeHandlers) {
    if (!NodeManager.hasHandler(tag)) {
      continue;
    }
    if (refs.attachedHandlers.has(tag)) {
      continue;
    }
    WebModule.attachGestureHandler(
      tag,
      target,
      ActionType.NATIVE_DETECTOR,
      refs.propsRef,
      refs.viewRef
    );
    refs.attachedHandlers.add(tag);
    WebModule.updateGestureHandlerConfig(tag, {
      userSelect: refs.propsRef.current.userSelect,
      touchAction: refs.propsRef.current.touchAction,
      enableContextMenu: refs.propsRef.current.enableContextMenu,
    });
  }
}

function syncSubscriptions(
  refs: DetectorRefs,
  currentTags: Iterable<number>,
  subscribedSet: Set<number>,
  actionType: ActionType,
  virtualViewTag?: number
) {
  const toUnsubscribe = new Set(subscribedSet);
  for (const tag of currentTags) {
    toUnsubscribe.delete(tag);
    if (subscribedSet.has(tag)) {
      continue;
    }
    NodeManager.observeHandler(tag, refs.viewRef, () => {
      attachReadyHandler(refs, tag, actionType, virtualViewTag);
    });
    subscribedSet.add(tag);
  }

  for (const tag of toUnsubscribe) {
    NodeManager.cancelObservation(tag, refs.viewRef);
    if (refs.attachedHandlers.has(tag)) {
      WebModule.detachGestureHandler(tag, refs.viewRef);
      refs.attachedHandlers.delete(tag);
    }
    subscribedSet.delete(tag);
    refs.nativeHandlers.delete(tag);
  }
}

function teardown(refs: DetectorRefs) {
  NodeManager.cancelAllObservationsForOwner(refs.viewRef);
  for (const tag of refs.attachedHandlers) {
    WebModule.detachGestureHandler(tag, refs.viewRef);
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
      viewRef,
      propsRef,
      subscribedHandlers: new Set<number>(),
      attachedHandlers: new Set<number>(),
      nativeHandlers: new Set<number>(),
      subscribedVirtualHandlers: new Map<number, Set<number>>(),
      virtualChildren: new Map<number, VirtualChildrenWeb>(),
    };
  }
  const refs = refsRef.current;

  useNativeGestureRole(viewRef, children);

  // Keep propsRef in sync and re-apply detector-level DOM props to top-level attached handlers
  // when they change.
  useEffect(() => {
    const shouldUpdateDOMProps =
      propsRef.current.userSelect !== props.userSelect ||
      propsRef.current.touchAction !== props.touchAction ||
      propsRef.current.enableContextMenu !== props.enableContextMenu;

    propsRef.current = props;

    if (shouldUpdateDOMProps) {
      const claimedByVirtual = Array.from(
        refs.subscribedVirtualHandlers.values()
      ).reduce((acc, current) => acc.union(current), new Set<number>());

      const handlersToUpdate = refs.subscribedHandlers
        .intersection(refs.attachedHandlers)
        .difference(claimedByVirtual);

      for (const tag of handlersToUpdate) {
        WebModule.updateGestureHandlerConfig(tag, {
          userSelect: props.userSelect,
          touchAction: props.touchAction,
          enableContextMenu: props.enableContextMenu,
        });
      }
    }
  }, [props, refs]);

  useEffect(() => {
    syncSubscriptions(
      refs,
      handlerTagsSet,
      refs.subscribedHandlers,
      ActionType.NATIVE_DETECTOR
    );
  }, [handlerTagsSet, refs]);

  useEffect(() => {
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
        syncSubscriptions(refs, [], tags, ActionType.VIRTUAL_DETECTOR, viewTag);
      }
      refs.subscribedVirtualHandlers.delete(viewTag);
    }

    props.virtualChildren?.forEach((child) => {
      if (child.viewRef.current == null) {
        return;
      }

      let subs = refs.subscribedVirtualHandlers.get(child.viewTag);
      if (subs == null) {
        subs = new Set();
        refs.subscribedVirtualHandlers.set(child.viewTag, subs);
      }
      syncSubscriptions(
        refs,
        child.handlerTags,
        subs,
        ActionType.VIRTUAL_DETECTOR,
        child.viewTag
      );
      for (const tag of subs) {
        if (refs.attachedHandlers.has(tag)) {
          WebModule.updateGestureHandlerConfig(tag, {
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
    <div style={{ display: 'contents' }} ref={viewRef as Ref<HTMLDivElement>}>
      {children}
    </div>
  );
};

export default HostGestureDetector;
