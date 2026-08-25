export {};

declare global {
  // Compile-time define provided by every consumer bundler; declared here for
  // the engine's own RN-free program (core modules in the import graph read it).
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
}
