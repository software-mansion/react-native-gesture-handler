export default function gestureHandlerRootHOC(Component) {
  // Empty implementation that just returns component directly,
  // GestureHandlerRootView is only required to be instantiated on Android.
  // All other targets (ios, web, macos, ect...) should do nothing.
  return Component;
}
  