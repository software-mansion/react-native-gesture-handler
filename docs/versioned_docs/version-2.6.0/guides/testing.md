---
id: testing
title: Testing with Jest
---

## Mocking native modules

In order to load mocks provided by RNGH add following to your jest config in `package.json`:

```json
"setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
```

Example:

```json
"jest": {
  "preset": "react-native",
  "setupFiles": ["./node_modules/react-native-gesture-handler/jestSetup.js"]
}
```

## Testing Gestures' and Gesture handlers' callbacks

RNGH provides an API for triggering selected handlers:

- [`fireGestureHandler(gestureOrHandler, eventList)`](../api/test-api#firegesturehandlergestureorhandler-eventlist)
- [`getByGestureTestId(testID)`](../api/test-api#getbygesturetestidtestid)
