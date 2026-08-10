import { ghQueueMicrotask } from '../../ghQueueMicrotask';
import { tagMessage } from '../../utils';
import { NativeProxy } from '../../v3/NativeProxy';

export function installUIRuntimeBindings(
  getUIRuntimeHolder: (() => object) | undefined
) {
  ghQueueMicrotask(() => {
    globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER = getUIRuntimeHolder?.();

    try {
      const decorated = NativeProxy.installUIRuntimeBindings();

      if (!decorated) {
        console.warn(
          tagMessage(
            'Failed to install UI runtime bindings. Please report this at https://github.com/software-mansion/react-native-gesture-handler/issues.'
          )
        );
      }
    } finally {
      globalThis.__RNGH_UI_WORKLET_RUNTIME_HOLDER = undefined;
    }
  });
}
