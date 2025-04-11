import { BaseGesture, GestureRef } from '../handlers/gestures/gesture';

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
