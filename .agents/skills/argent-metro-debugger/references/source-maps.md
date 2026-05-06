# Source Resolution for `inspect-element`

`debugger-inspect-element` tries to resolve each component in the hierarchy to its source file and line. It uses a fallback chain:

1. **`_debugStack`** (React fiber property) — a stack trace string from the bundled code. When available, the tool symbolicates it via Metro's `/symbolicate` endpoint to resolve to the original source file, then reads a code fragment from disk. Set `resolveSourceMaps: false` to skip symbolication and return raw bundled locations instead.
2. **`_debugSource`** (React fiber property) — contains `{ fileName, lineNumber, columnNumber }` pointing directly to the original source file. No symbolication needed. The tool reads the code fragment from disk automatically.
3. **Neither available** — the tool returns the component hierarchy with `source: null` and `code: null` for all items. The hierarchy (component names) is still useful.

## When Source Info Is Missing

If `debugger-inspect-element` returns all items with `source: null`, the React Native project's Babel configuration does not inject source information into JSX elements. This is common with the **automatic JSX transform** (used by Expo SDK 50+ and React Native 0.73+).

**To enable source resolution**, inform the user that they can add `@babel/plugin-transform-react-jsx-source` to their project's Babel config. For example, in `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"], // or 'module:@react-native/babel-preset'
    plugins: [
      "@babel/plugin-transform-react-jsx-source", // enables _debugSource on fibers
    ],
  };
};
```

After adding the plugin, restart Metro (`npx react-native start --reset-cache` or `npx expo start --clear`) and reload the app. The tool will then automatically pick up `_debugSource` and resolve components to their source files. No extra `npm install` needed — the plugin ships with `babel-preset-expo` and `@babel/preset-env`.
