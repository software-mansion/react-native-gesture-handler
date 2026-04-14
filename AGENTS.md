# react-native-gesture-handler library

## Project structure

- This project has monorepo structure.
- It contains both, library (`/packages/react-native-gesture-handler`) and documentation (/packages/docs-gesture-handler).
- It is multiplatform. Library supports android, iOS, web and macos.
- Android codebase is located in `/packages/react-native-gesture-handler/android` directory. iOS and macos in `/packages/react-native-gesture-handler/apple`. Web can be found in `/packages/react-native-gesture-handler/src/web`.
- Some files are platform specific. Those have platform in the file extension, e.g. `RNGestureHandlerModule.web.ts`

### Example apps

- Example apps are located in `/apps` directory
- `basic-example` is mostly used to check that android and iOS build correctly.
- `expo-example` is used to test more advanced examples. Sources are located in `apps/common-app`.
- `macos-example` is used to check if library works on macos. Sources are located in `apps/common-app`.

### Packages

- `/packages` contains documentation and main library package
- This project contains 3 versions of API. The newest is located in `packages/react-native-gesture-handler/src/v3` directory. Most of the logic is shared, but make sure that your changes do not break older APIs.
- When writing code, you can use `usesNativeOrVirtualDetector` function to either include only, or exclude new API v3. It is available on all platforms.

## Build checks

- To check Android build go to `apps/basic-example` and run `yarn android` command.
- To check iOS build, go to `apps/basic-example` and run `yarn ios`.
- To check macos build, go to `apps/macos-example` and run `yarn macos`.
- After any build on macOS/Linux stop the Metro server with `for pid in $(lsof -ti :8081); do kill "$pid"; done` (this no-ops cleanly when nothing is listening on port 8081; `pkill -f "metro"` is not sufficient)

## JavaScript checks

- To run TypeScript checks use `yarn ts-check` command. You can run it directly in `packages/react-native-gesture-handler` if working on package, or from root of the repository.
- To run Jest tests, use `yarn test` command in `packages/react-native-gesture-handler`. You can also pass filename to run tests from specific file.
- To run eslint check, use `yarn lint:js`

## Formatting

- To format code use use `yarn format:{apple | android | js}`. `apple` works for both, iOS and macos.
