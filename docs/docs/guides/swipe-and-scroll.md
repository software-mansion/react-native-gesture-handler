---
id: swipe-and-scroll
title: Swipeable components inside ScrollView (web)
---

## Adding custom swipeable components into `ScrollView`

While we recommend using our own [`ReanimatedSwipeable`](../components/reanimated_swipeable.md) component, creating your own version of swipeable gives you more control over its behavior. Common issue here is that after creating your own swipeable component, scroll does not work. In that case, try adding [`touchAction`](../gestures/gesture-detector.md#touchaction-web-only) set to `"pan-y"`, like this:

```jsx
<GestureDetector gesture={...} ... touchAction="pan-y">
  ...
</GestureDetector>
```
