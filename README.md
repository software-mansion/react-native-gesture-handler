<img src="https://user-images.githubusercontent.com/16062886/117444014-2d1ffd80-af39-11eb-9bbb-33c320599d93.png" width="100%" alt="React Native Gesture Handler by Software Mansion">

### Declarative API exposing platform native touch and gesture system to React Native.

React Native Gesture Handler provides native-driven gesture management APIs for building best possible touch-based experiences in React Native.

With this library gestures are no longer controlled by the JS responder system, but instead are recognized and tracked in the UI thread.
It makes touch interactions and gesture tracking not only smooth, but also dependable and deterministic.

## Installation

Check [getting started](https://docs.swmansion.com/react-native-gesture-handler/docs/#installation) section of our docs for the detailed installation instructions.

## Documentation

Check out our dedicated documentation page for info about this library, API reference and more: [https://docs.swmansion.com/react-native-gesture-handler/docs/](https://docs.swmansion.com/react-native-gesture-handler/docs/)

## Examples

If you want to play with the API but don't feel like trying it on a real app, you can run the example project. Clone the repo, go to the `example` folder and run:

```bash
  yarn install
```

If you are running on ios, run `pod install` in the ios folder

Run `yarn start` to start the metro bundler

Run `yarn android` or `yarn ios` (depending on which platform you want to run the example app on).

You will need to have an Android or iOS device or emulator connected as well as `react-native-cli` package installed globally.

## React native Support

| version | react-native version |
| ------- | -------------------- |
| 1.4.0+  | 0.60.0+              |
| 1.1.0+  | 0.57.2+              |
| <1.1.0  | 0.50.0+              |

It may be possible to use newer versions of react-native-gesture-handler on React Native with version <= 0.59 by reverse Jetifying.
Read more on that here https://github.com/mikehardy/jetifier#to-reverse-jetify--convert-node_modules-dependencies-to-support-libraries
## License

Gesture handler library is licensed under [The MIT License](LICENSE).

## Credits

This project has been build and is maintained thanks to the support from [Shopify](https://shopify.com), [Expo.io](https://expo.io) and [Software Mansion](https://swmansion.com)

[![shopify](https://avatars1.githubusercontent.com/u/8085?v=3&s=100 'Shopify.com')](https://shopify.com)
[![expo](https://avatars2.githubusercontent.com/u/12504344?v=3&s=100 'Expo.io')](https://expo.io)
[![swm](https://logo.swmansion.com/logo?color=white&variant=desktop&width=150&tag=react-native-reanimated-github 'Software Mansion')](https://swmansion.com)
