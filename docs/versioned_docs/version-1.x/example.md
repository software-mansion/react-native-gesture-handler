---
id: example
title: Running Example App
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import GifGallery from '@site/components/GifGallery'

Example app code is located under [`Example/`](https://github.com/software-mansion/react-native-gesture-handler/tree/main/examples/Example) folder in the repo.
It showcases the majority of the Gesture Handler library features.
The app consist of the list of single screen examples presenting the capabilities of the library.
Each example is located under a separate folder under [`Example/`](https://github.com/software-mansion/react-native-gesture-handler/tree/main/examples/Example).

<GifGallery>
    <img src={useBaseUrl("gifs/sampleapp.gif")} width="180" height="320" />
</GifGallery>

## Running example app on Expo

You can run example app on [Expo](https://expo.io). Follow instructions under [this link](https://snack.expo.io/@adamgrzybowski/react-native-gesture-handler-demo) to do so. Note that the app published to Expo is not the most up to date version. We publish updates whenever new version of Expo SDK is released. If you wish to try the most up to date version you will have to run example app locally. For that see below 👇

## Running example app locally

Before you begin you should follow [React Native's setup steps](http://reactnative.dev/docs/getting-started.html) to make sure you have all the tools necessary to build and run React Native apps installed.
The example app is a regular React Native app, so in case of problems or to learn about available commands you may want to [check react-native cli documentation](https://github.com/react-native-community/cli/blob/master/README.md).

In order to run example app you need to clone the repo first:

```bash
git clone git@github.com:software-mansion/react-native-gesture-handler.git
```

Then go to the library folder:

```bash
cd react-native-gesture-handler/
```

Install dependencies of library with the following command:

```bash
yarn
```

Then go to the `Example` folder:

```bash
cd Example
```

Install dependencies of example with the following command:

```bash
yarn
```

Run development server:

```bash
yarn start
```

Finally run one of the commands below in order to build, install and launch the app on Android:

```bash
react-native run-android
```

or on iOS:

```bash
react-native run-ios
```

You will need to have an Android or iOS device or emulator connected and `react-native-cli` package installed globally.
