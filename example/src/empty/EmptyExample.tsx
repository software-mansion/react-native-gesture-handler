import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NativeButton from '../../../src/components/GestureHandlerButton';

export default function EmptyExample() {
  return (
    <View style={styles.container}>
      <View
        style={{
          width: 200,
          height: 200,
          backgroundColor: 'tomato',
          borderTopLeftRadius: 20,
          borderBottomRightRadius: 50,
          cursor: 'auto',
        }}>
        <Text>Diverse corners</Text>
      </View>
      <NativeButton
        style={{
          width: 200,
          height: 200,
          backgroundColor: 'tomato',
          borderTopLeftRadius: 20,
          borderBottomRightRadius: 50,
          cursor: 'auto',
        }}>
        <Text>Diverse corners</Text>
      </NativeButton>

      {/* <NativeButton style={{ cursor: 'auto' }}>
        <Text>Hello World!</Text>
      </NativeButton> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    gap: 10,
  },
});
