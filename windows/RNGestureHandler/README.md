# react-native-gesture-handler Windows Implementation

## Module Installation
You can either use autolinking on react-native-windows 0.63 and later or manually link the module on earlier releases.

## Automatic install with autolinking on RNW >= 0.63
RNGestureHandler supports autolinking. Just call: `npm i react-native-gesture-handler --save`

## Manual installation on RNW >= 0.62
1. `npm install react-native-gesture-handler --save`
2. Open your solution in Visual Studio 2019 (eg. `windows\yourapp.sln`)
3. Right-click Solution icon in Solution Explorer > Add > Existing Project...
4. Add `node_modules\react-native-gesture-handler\windows\RNGestureHandler\RNGestureHandler.vcxproj`
5. Right-click main application project > Add > Reference...
6. Select `RNGestureHandler` in Solution Projects
7. In app `pch.h` add `#include "winrt/RNGestureHandler.h"`
8. In `App.cpp` add `PackageProviders().Append(winrt::RNGestureHandler::ReactPackageProvider());` before `InitializeComponent();`

## Module development

If you want to contribute to this module Windows implementation, first you must install the [Windows Development Dependencies](https://aka.ms/rnw-deps).

You must temporarily install the `react-native-windows` package. Versions of `react-native-windows` and `react-native` must match, e.g. if the module uses `react-native@0.62`, install `npm i react-native-windows@^0.62 --dev`.

Now, you will be able to open corresponding `RNGestureHandler.sln` file, e.g. `RNGestureHandler62.sln` for `react-native-windows@0.62`.