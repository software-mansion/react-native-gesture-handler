import { IS_COMMONJS_BUILD } from './cjsBuildFlavor';
import { tagMessage } from './utils';

// The `lib/commonjs` build exists only for the `require` export condition,
// which React Native's bundlers never match: Metro resolves the library with
// the `react-native` condition (the `src` chain), so worklets are workletized
// from the original sources. If an app bundle evaluates the CommonJS build
// anyway, its Metro config resolved the `require` condition — worklets from
// this library would silently misbehave, so leave an actionable warning.
function isJest(): boolean {
  // Structural access instead of the `process` global — @types/node is not
  // part of this package's type program.
  const maybeProcess = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process;

  return maybeProcess?.env?.JEST_WORKER_ID !== undefined;
}

if (
  IS_COMMONJS_BUILD &&
  typeof navigator !== 'undefined' &&
  navigator.product === 'ReactNative' &&
  !isJest()
) {
  console.warn(
    tagMessage(
      `The CommonJS build of this library was loaded inside a React Native app. ` +
        `This build is meant for Node-based tools (e.g. Jest) — bundling it into an app may break worklets. ` +
        `This usually happens when a custom "unstable_conditionNames" in metro.config.js includes "require". ` +
        `Please report this at https://github.com/software-mansion/react-native-gesture-handler/issues`
    )
  );
}
