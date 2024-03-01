// Used by GestureDetector (unsupported on web at the moment) to check whether the
// attached view may get flattened on Fabric. This implementation causes errors
// on web due to the static resolution of `require` statements by webpack breaking
// the conditional importing. Solved by making .web file.
let findHostInstance_DEPRECATED: (ref: unknown) => void;
let getInternalInstanceHandleFromPublicInstance: (ref: unknown) => {
  stateNode: { node: unknown };
};

export function getShadowNodeFromRef(ref: unknown) {
  // load findHostInstance_DEPRECATED lazily because it may not be available before render
  if (findHostInstance_DEPRECATED === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      findHostInstance_DEPRECATED =
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
        require('react-native/Libraries/Renderer/shims/ReactFabric').findHostInstance_DEPRECATED;
    } catch (e) {
      findHostInstance_DEPRECATED = (_ref: unknown) => null;
    }
  }

  // load findHostInstance_DEPRECATED lazily because it may not be available before render
  if (getInternalInstanceHandleFromPublicInstance === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      getInternalInstanceHandleFromPublicInstance =
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
        require('react-native/Libraries/ReactNative/ReactFabricPublicInstance/ReactFabricPublicInstance')
          .getInternalInstanceHandleFromPublicInstance ??
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        ((ref: any) => ref._internalInstanceHandle);
    } catch (e) {
      getInternalInstanceHandleFromPublicInstance = (ref: any) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        ref._internalInstanceHandle;
    }
  }

  // @ts-ignore Fabric
  return getInternalInstanceHandleFromPublicInstance(
    findHostInstance_DEPRECATED(ref)
  ).stateNode.node;
}
