---
id: touchables
title: Touchables
sidebar_label: Touchables
---

:::warning
Touchables will be removed in the future version of Gesture Handler. Use Pressable instead.
:::

Gesture Handler library provides an implementation of RN's touchable components that are based on [native buttons](buttons.mdx) and does not rely on JS responder system utilized by RN. Our touchable implementation follows the same API and aims to be a drop-in replacement for touchables available in React Native.

React Native's touchables API can be found here:

- [Touchable Native Feedback](https://reactnative.dev/docs/touchablenativefeedback)
- [Touchable Highlight](https://reactnative.dev/docs/touchablehighlight)
- [Touchable Opacity](https://reactnative.dev/docs/touchableopacity)
- [Touchable Without Feedback](https://reactnative.dev/docs/touchablewithoutfeedback)

All major touchable properties (except from `pressRetentionOffset`) have been adopted and should behave in a similar way as with RN's touchables.

The motivation for using RNGH touchables as a replacement for these imported from React Native is to follow built-in native behavior more closely by utilizing platform native touch system instead of relying on the JS responder system.
These touchables and their feedback behavior are deeply integrated with native
gesture ecosystem and could be connected with other native components (e.g. `ScrollView`) and Gesture Handlers easily and in a more predictable way, which
follows native apps' behavior.

Our intention was to make switch for these touchables as simple as possible. In order to use RNGH's touchables the only thing you need to do is to change library from which you import touchable components.
need only to change imports of touchables.

:::info
Gesture Handler's TouchableOpacity uses native driver for animations by default. If this causes problems for you, you can set `useNativeAnimations` prop to false.
:::

### Example:

```javascript
import {
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
```

has to be replaced with:

```javascript
import {
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
```

For a comparison of both touchable implementations see our [touchables example](https://github.com/software-mansion/react-native-gesture-handler/blob/main/apps/common-app/src/release_tests/touchables/index.tsx)
