import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Text,
  GestureHandlerRootView,
  TouchableOpacity,
} from 'react-native-gesture-handler';

export default function NestedText() {
  const [counter, setCounter] = useState(0);

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={{ fontSize: 30 }}>{`Counter: ${counter}`}</Text>

      <TouchableOpacity
        onPress={() => {
          console.log('Touchable');
          setCounter((prev) => prev + 1);
        }}>
        <Text
          style={[styles.textCommon, styles.outerText]}
          onPress={() => {
            console.log('Outer text');
            setCounter((prev) => prev + 1);
          }}>
          {'Outer Text '}
          <Text
            style={[styles.textCommon, styles.innerText]}
            onPress={() => {
              console.log('Nested text');
              setCounter((prev) => prev + 1);
            }}>
            {'Nested Text'}
          </Text>
        </Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',

    gap: 20,
  },

  textCommon: {
    padding: 10,
    color: 'white',
  },

  outerText: {
    fontSize: 30,
    borderWidth: 2,
    backgroundColor: '#131313',
  },

  innerText: {
    fontSize: 25,
    backgroundColor: '#F06312',
  },
});
