import React from 'react';
import {
  FlatList,
  Gesture,
  GestureDetector,
  ScrollView,
  Switch,
  TextInput,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from './colors';

function SwitchDemo() {
  const [value, setValue] = React.useState(false);

  const pan = Gesture.Pan()
    .onBegin(() => console.log('onBegin'))
    .onUpdate(() => console.log('onUpdate')) // doesn't work on iOS
    .onFinalize(() => console.log('onFinalize'));

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH Switch</Text>
      <GestureDetector gesture={pan}>
        <Switch value={value} onValueChange={() => setValue(!value)} />
      </GestureDetector>
    </View>
  );
}

function TextInputDemo() {
  const [value, setValue] = React.useState('Hello!');

  const pan = Gesture.Pan()
    .onBegin(() => console.log('onBegin'))
    .onUpdate(() => console.log('onUpdate'))
    .onFinalize(() => console.log('onFinalize'));

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH TextInput</Text>
      <GestureDetector gesture={pan}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={setValue}
        />
      </GestureDetector>
    </View>
  );
}

function TouchableNativeFeedbackDemo() {
  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH TouchableNativeFeedback</Text>
      <TouchableNativeFeedback
        onPressIn={() => console.log('onPressIn')}
        onPressOut={() => console.log('onPressOut')}
        onLongPress={() => console.log('onLongPress')}>
        <View
          style={[styles.smallBox, { backgroundColor: COLORS.KINDA_BLUE }]}
        />
      </TouchableNativeFeedback>
    </View>
  );
}

function TouchableOpacityDemo() {
  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH TouchableOpacity</Text>
      <TouchableOpacity
        onPressIn={() => console.log('onPressIn')}
        onPressOut={() => console.log('onPressOut')}
        onLongPress={() => console.log('onLongPress')}>
        <View
          style={[styles.smallBox, { backgroundColor: COLORS.KINDA_BLUE }]}
        />
      </TouchableOpacity>
    </View>
  );
}

function ScrollViewDemo() {
  const pan = Gesture.Pan().onUpdate((e) => console.log('onUpdate', e.x, e.y));

  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH ScrollView</Text>
      <View style={styles.largeBox}>
        <ScrollView style={styles.largeBox}>
          {Object.values(COLORS).map((color) => (
            <View
              key={color}
              style={[styles.largeBox, { backgroundColor: color }]}
            />
          ))}
          <GestureDetector gesture={pan}>
            <View style={styles.panBox}>
              <Text style={styles.panText}>
                Dragging here should not scroll
              </Text>
            </View>
          </GestureDetector>
        </ScrollView>
      </View>
    </View>
  );
}

function FlatListDemo() {
  return (
    <View style={styles.demo}>
      <Text style={styles.text}>RNGH FlatList</Text>
      <View style={styles.largeBox}>
        <FlatList
          data={Object.values(COLORS)}
          renderItem={(e) => (
            <TouchableOpacity>
              <View style={[styles.largeBox, { backgroundColor: e.item }]} />
            </TouchableOpacity>
          )}
          keyExtractor={(e) => e}
        />
      </View>
    </View>
  );
}

export default function ComponentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.bold}>
        Gesture Handler also provides a set of components that support gestures.
      </Text>
      <SwitchDemo />
      <TextInputDemo />
      <TouchableNativeFeedbackDemo />
      <TouchableOpacityDemo />
      <ScrollViewDemo />
      <FlatListDemo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bold: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  textInput: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'darkgray',
    width: 135,
    padding: 10,
  },
  text: {
    marginVertical: 3,
  },
  demo: {
    marginVertical: 3,
    alignItems: 'center',
  },
  smallBox: {
    width: 50,
    height: 50,
  },
  largeBox: {
    width: 100,
    height: 100,
  },
  panBox: {
    width: 100,
    height: 75,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panText: {
    textAlign: 'center',
  },
});
