import type { JSResponderContextValue } from '@swmansion/gesture-handler-core/src/v3/jsResponderContext';
import { TextInput } from 'react-native';

// The responder context itself is platform-free and lives in core; the
// keyboard-dismissal machinery below stays here — it reads RN TextInput focus
// state and is only consumed by the product-side press components.
export * from '@swmansion/gesture-handler-core/src/v3/jsResponderContext';

let isKeyboardVisible = false;
let keyboardOpenedForRNInput = false;

export function setKeyboardVisibility(visible: boolean) {
  isKeyboardVisible = visible;

  // Snapshotted at show-time: the dismissal blurs the input at touch-down,
  // before the press events get checked
  keyboardOpenedForRNInput =
    visible && TextInput.State.currentlyFocusedInput?.() != null;
}

export function isKeyboardDismissingTap(
  jsResponderContext: JSResponderContextValue | null | undefined
): boolean {
  if (jsResponderContext == null) {
    return false;
  }

  const mode = jsResponderContext.keyboardShouldPersistTaps;
  const keyboardNeverPersistTaps = !mode || mode === 'never';

  // Drop only taps that can dismiss the keyboard, i.e. an RN TextInput is (or
  // was at show-time) focused - mirrors RN ScrollView's `_keyboardIsDismissible`.
  // A native field's keyboard (e.g. a native-stack search bar) can't be
  // blurred, so dropping there would leave presses permanently dead
  return (
    keyboardNeverPersistTaps &&
    isKeyboardVisible &&
    (keyboardOpenedForRNInput ||
      TextInput.State.currentlyFocusedInput?.() != null)
  );
}
