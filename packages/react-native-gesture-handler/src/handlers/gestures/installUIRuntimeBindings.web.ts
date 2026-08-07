// UI runtime bindings are a native-only concept — there is no separate UI
// worklet runtime on web, and `getUIRuntimeHolder` from react-native-worklets
// throws when called there.
export function installUIRuntimeBindings(
  _getUIRuntimeHolder: (() => object) | undefined
) {
  // no-op
}
