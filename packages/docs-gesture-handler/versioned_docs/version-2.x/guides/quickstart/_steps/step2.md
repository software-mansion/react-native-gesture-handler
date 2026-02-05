```jsx
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

function Ball() {
  return (
    <GestureDetector>
      <Animated.View style={[styles.ball]} />
    </GestureDetector>
  );
}
```
