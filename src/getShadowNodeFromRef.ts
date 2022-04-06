// Used by GestureDetector (unsupported on web at the moment) to check whether the
// attached view may get flattened on Fabric. This implementation causes errors
// on web due to the static resolution of `require` statements by webpack breaking
// the conditional importing. Solved by making .web file.
let findHostInstance_DEPRECATED = (_ref: any) => null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  findHostInstance_DEPRECATED = require('react-native/Libraries/Renderer/shims/ReactFabric')
    .findHostInstance_DEPRECATED;
} catch (e) {
  // do nothing
}

export function getShadowNodeFromRef(ref: any) {
  // @ts-ignore Fabric
  return findHostInstance_DEPRECATED(ref)._internalInstanceHandle.stateNode
    .node;
}
