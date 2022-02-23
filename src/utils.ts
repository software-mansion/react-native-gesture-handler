export function toArray<T>(object: T | T[]): T[] {
  if (!Array.isArray(object)) {
    return [object];
  }

  return object;
}

export type withPrevAndCurrentMapFn<T, Transformed> = (
  previous: Transformed | null,
  current: T
) => Transformed;
export function withPrevAndCurrent<T, Transformed>(
  array: T[],
  mapFn: withPrevAndCurrentMapFn<T, Transformed>
): Transformed[] {
  const previousArr: (null | Transformed)[] = [null];
  const currentArr = [...array];
  const transformedArr: Transformed[] = [];
  currentArr.forEach((current, i) => {
    const previous = previousArr[i];
    const transformed = mapFn(previous, current);
    previousArr.push(transformed);
    transformedArr.push(transformed);
  });
  return transformedArr;
}

export function hasProperty(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function isJestEnv(): boolean {
  return !!process.env.JEST_WORKER_ID;
}

export function tagMessage(msg: string) {
  return `[react-native-gesture-handler] ${msg}`;
}

export function isFabric(): boolean {
  // @ts-expect-error nativeFabricUIManager is not yet included in the RN types
  return !!global?.nativeFabricUIManager;
}

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
