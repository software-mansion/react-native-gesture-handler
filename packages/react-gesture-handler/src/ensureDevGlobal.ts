// Core (written for react-native, where Metro provides the global) reads
// `__DEV__`. On the DOM binding nothing defines it, so provide it here,
// mapped from `process.env.NODE_ENV` — which Vite/webpack/esbuild statically
// replace and node/react-native provide at runtime. Must be the first import
// of binding.ts, and is the one side-effectful module of this package (see
// `sideEffects` in package.json).
declare const process: { env: { NODE_ENV?: string } };

const globalScope = globalThis as { __DEV__?: boolean };

if (typeof globalScope.__DEV__ === 'undefined') {
  let dev = false;
  try {
    dev = process.env.NODE_ENV !== 'production';
  } catch {
    // No bundler replacement and no `process` in this runtime — fail closed
    // to production semantics.
  }
  globalScope.__DEV__ = dev;
}
