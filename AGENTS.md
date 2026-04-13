# react-native-gesture-handler library

## Project structure

This project has monorepo structure.

### Example apps

- Example apps are located in `/apps` directory
- Source files for examples are located in `apps/common-app`. Other apps import examples from this template. This is not true for `basic-example`, which contains example sources locally.

### Packages

- `/packages` contains documentation and main library package
- This project contains 3 versions of API. The newest is located in `packages/react-native-gesture-handler/src/v3` directory. Most of the logic is shared, but make sure that your changes do not break older APIs.
- When writing code, you can use `usesNativeOrVirtualDetector` function to either include only, or exclude new API v3. It is available on all platforms. On web and Android it accepts `actionType` parameter.

## Build checks

- To check Android build go to `apps/basic-example` and run `yarn android` command.
- To check iOS build, go to `apps/basic-example` and run `yarn ios`. If necessary, use `bundle install && bundle exec pod install` in `apps/basic-example/ios` directory to install pods.
- After any Android/iOS build or test run, on macOS/Linux stop the Metro server with `pids=$(lsof -ti :8081); if [ -n "$pids" ]; then kill $pids; fi` (this no-ops cleanly when nothing is listening on port 8081; `pkill -f "metro"` is not sufficient)

## JavaScript checks

- To run TypeScript checks use `yarn ts-check` command. You can run it directly in `packages/react-native-gesture-handler` if working on package, or from root of the repository.

- To run Jest tests, use `yarn test` command in `packages/react-native-gesture-handler`. You can also pass filename to run tests from specific file.
