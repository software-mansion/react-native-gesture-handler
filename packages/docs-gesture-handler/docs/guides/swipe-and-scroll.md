---
id: swipe-and-scroll
title: Custom swipeable components inside ScrollView (web)
sidebar_position: 5
---

While we recommend using our own [`ReanimatedSwipeable`](/docs/components/reanimated_swipeable) component, creating your own version of swipeable gives you more control over its behavior. Common issue here is that after creating your own swipeable component, scroll does not work. In that case, try adding [`touchAction`](/docs/gestures/gesture-detector#touchaction-web-only) set to `"pan-y"`, like this:

```jsx
<GestureDetector gesture={...} ... touchAction="pan-y">
  ...
</GestureDetector>
```
