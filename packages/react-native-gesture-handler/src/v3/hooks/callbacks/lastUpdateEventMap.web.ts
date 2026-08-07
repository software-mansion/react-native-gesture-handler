import type { SimplifiedShareableHost } from '../../../handlers/gestures/reanimatedWrapper';

export type LastUpdateEventMap = Map<number, { lastUpdateEvent: unknown }>;

export function createLastUpdateEventMap(): SimplifiedShareableHost<LastUpdateEventMap> {
  return { value: new Map() };
}
