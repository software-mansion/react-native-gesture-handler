// Used by GestureDetector (unsupported on web at the moment) to check whether the
// attached view may get flattened on Fabric. Original implementation causes errors
// on web due to the static resolution of `require` statements by webpack breaking
// the conditional importing.
export function getShadowNodeFromRef(_ref: any) {
  return null;
}
