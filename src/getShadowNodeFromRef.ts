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
