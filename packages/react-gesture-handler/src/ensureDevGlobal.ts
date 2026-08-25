// Core (written for react-native, where Metro provides the global) reads
// `__DEV__`. On the DOM binding nothing defines it, so provide it here,
// mapped from `process.env.NODE_ENV` — which Vite/webpack/esbuild statically
// replace and node/react-native provide at runtime. Must be the first import
// of binding.ts, and is the one side-effectful module of this package (see
// `sideEffects` in package.json).
// This module also owns the TYPE side of the global: consumer programs that
// type-check this package's sources (e.g. Next.js transpilePackages) reach
// this file through the import chain, which brings the declaration into
// their program. `var` merges with the identical declaration in core's
// global.d.ts within this package's own programs; react-native's conflicting
// `const __DEV__` never meets this one (native programs don't compile this
// package). The `export {}` below additionally makes this file a module, so
// the `process` declaration is module-scoped shadowing rather than a global
// redeclaration clashing with @types/node.
declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
}

export {};

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
