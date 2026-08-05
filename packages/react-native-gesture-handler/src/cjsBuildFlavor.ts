// `false` in the source tree and in every build output except `lib/commonjs`,
// where `scripts/mark-commonjs-build.js` overwrites it with `true` after
// `bob build`. Lets `cjsGuard` tell the CommonJS artifact apart from the
// ESM/source chains, which is impossible at runtime alone — Metro wraps all
// module formats in CommonJS-style wrappers when bundling.
export const IS_COMMONJS_BUILD = false;
