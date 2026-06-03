import { Platform } from 'react-native';

import type { BaseGesture, GestureRef } from '../handlers/gestures/gesture';

type TVProps = {
  focusable?: boolean | undefined;
  isTVSelectable?: boolean | undefined;
};

/**
 * Gesture Handler buttons render the native button component directly, bypassing RN's `<View>` —
 * the only place the `focusable` prop is translated into `isTVSelectable`, which actually drives
 * tvOS focusability.
 */
export function getTVProps(props: TVProps): TVProps | null {
  if (!Platform.isTV) {
    return null;
  }

  return {
    isTVSelectable: props.focusable ?? props.isTVSelectable ?? false,
  };
}

export type RelationPropName =
  | 'simultaneousWithExternalGesture'
  | 'requireExternalGestureToFail'
  | 'blocksExternalGesture';

export type RelationPropType =
  | Exclude<GestureRef, number>
  | Exclude<GestureRef, number>[];

export function applyRelationProp(
  gesture: BaseGesture<any>,
  relationPropName: RelationPropName,
  relationProp: RelationPropType
) {
  if (!relationProp) {
    return;
  }

  if (Array.isArray(relationProp)) {
    gesture[relationPropName](...relationProp);
  } else {
    gesture[relationPropName](relationProp);
  }
}
