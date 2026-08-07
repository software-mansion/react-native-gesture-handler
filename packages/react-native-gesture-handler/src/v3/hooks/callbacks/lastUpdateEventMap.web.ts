export type LastUpdateEventMap = Map<number, { lastUpdateEvent: unknown }>;

// `createShareable` from react-native-worklets throws on web, so the
// last-update-event map is never created on this platform.
export function createLastUpdateEventMap() {
  return undefined;
}
