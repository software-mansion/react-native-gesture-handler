import {
  Reanimated,
  Worklets,
} from '../../../handlers/gestures/reanimatedWrapper';

export type LastUpdateEventMap = Map<number, { lastUpdateEvent: unknown }>;

export function createLastUpdateEventMap() {
  if (
    Worklets?.createShareable === undefined ||
    Worklets.UIRuntimeId === undefined ||
    Reanimated === undefined
  ) {
    return undefined;
  }

  return Worklets.createShareable<LastUpdateEventMap>(
    Worklets.UIRuntimeId,
    new Map()
  );
}
