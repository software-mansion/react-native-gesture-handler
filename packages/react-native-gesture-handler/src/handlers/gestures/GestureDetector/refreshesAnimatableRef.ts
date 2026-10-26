// Reanimated resolves `getAnimatableRef()` once, when its ref to the wrapped
// component attaches. Only versions that re-resolve it on update (their
// `AnimatedComponent` has `_refreshComponentRef`) can be handed a child's host
// instance that may change, as the legacy `Wrap` does. The class is not
// exported, so probe it by subpath, as the v3 detector does for
// `NativeEventsManager`.
//
// Only the native `Wrap` imports this module. The subpath resolves to a second
// copy of Reanimated under bundlers that ignore its `react-native` field
// (Vite, webpack), so it must stay out of web bundles.
let refreshesAnimatableRef = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const AnimatedComponent =
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    require('react-native-reanimated/src/createAnimatedComponent/AnimatedComponent').default;
  refreshesAnimatableRef =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof AnimatedComponent?.prototype?._refreshComponentRef === 'function';
} catch {
  // Reanimated is missing or older; keep handing Reanimated the Wrap itself.
}

export function reanimatedRefreshesAnimatableRef() {
  return refreshesAnimatableRef;
}
