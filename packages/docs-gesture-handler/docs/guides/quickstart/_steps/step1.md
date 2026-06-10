```jsx
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

export default function Ball() {
  return (
    <GestureHandlerRootView>
      <Animated.View style={styles.ball} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  ball: {
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'blue',
    alignSelf: 'center',
  },
});
```
