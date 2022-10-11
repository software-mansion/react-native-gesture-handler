// Used by GestureDetector (unsupported on web at the moment) to check whether the
// attached view may get flattened on Fabric. This implementation causes errors
// on web due to the static resolution of `require` statements by webpack breaking
// the conditional importing. Solved by making .web file.
let findHostInstance_DEPRECATED: (ref: any) => void;

export function getShadowNodeFromRef(ref: any) {
  // load findHostInstance_DEPRECATED lazily because it may not be available before render
  if (findHostInstance_DEPRECATED === undefined) {
    try {
      findHostInstance_DEPRECATED =
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('react-native/Libraries/Renderer/shims/ReactFabric').findHostInstance_DEPRECATED;
    } catch (e) {
      findHostInstance_DEPRECATED = (_ref: any) => null;
    }
  }

  // @ts-ignore Fabric
  return findHostInstance_DEPRECATED(ref)._internalInstanceHandle.stateNode
    .node;
}
