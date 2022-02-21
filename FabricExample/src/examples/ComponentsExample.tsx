import {
  ScrollView,
  Switch,
  TouchableNativeFeedback,
  TouchableOpacity,
  TextInput,
  Gesture,
  GestureDetector,
  FlatList,
} from 'react-native-gesture-handler';
import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../colors';

import React from 'react';

export default function ComponentsExample() {
  const [value1, setValue1] = React.useState(false);
  const [value2, setValue2] = React.useState('');

  const DATA = [
    {text: 'Value 1', background: COLORS.KINDA_RED},
    {text: 'Value 2', background: COLORS.KINDA_GREEN},
    {text: 'Value 3', background: COLORS.KINDA_BLUE},
    {text: 'Value 4', background: COLORS.KINDA_RED},
    {text: 'Value 5', background: COLORS.KINDA_GREEN},
  ];

  const pan = Gesture.Pan().onUpdate(e => console.log('pan update!', e.x, e.y));

  return (
    <View style={styles.container}>
      <Text>RNGH Switch</Text>
      <Switch value={value1} onValueChange={() => setValue1(!value1)} />

      <Text>RNGH TextInput</Text>
      <TextInput
        style={styles.textInput}
        value={value2}
        onChangeText={v => setValue2(v)}
      />

      <Text>RNGH ScrollView</Text>
      <ScrollView style={styles.box}>
        {Object.values(COLORS).map(color => {
          return (
            <View key={color} style={[styles.box, {backgroundColor: color}]} />
          );
        })}

        <View
          style={[styles.box, styles.container, {backgroundColor: COLORS.NAVY}]}
        >
          <GestureDetector gesture={pan}>
            <View
              style={[styles.smallBox, {backgroundColor: COLORS.KINDA_BLUE}]}
            >
              <Text>Dragging here should not scroll</Text>
            </View>
          </GestureDetector>
        </View>
      </ScrollView>

      <Text>RNGH TouchableNativeFeedback</Text>
      <TouchableNativeFeedback>
        <View style={[styles.box, {backgroundColor: COLORS.KINDA_BLUE}]} />
      </TouchableNativeFeedback>

      <Text>RNGH TouchableOpacity</Text>
      <TouchableOpacity>
        <View style={[styles.box, {backgroundColor: COLORS.KINDA_BLUE}]} />
      </TouchableOpacity>

      <Text>RNGH FlatList</Text>
      <FlatList
        style={styles.box}
        data={DATA}
        renderItem={e => (
          <TouchableOpacity>
            <View
              style={[styles.listItem, {backgroundColor: e.item.background}]}
            >
              <Text>{e.item.text}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={e => e.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 10,
    width: 100,
  },
  box: {
    width: 100,
    height: 100,
  },
  smallBox: {
    width: 80,
    height: 80,
  },
  listItem: {
    width: 100,
    height: 50,
  },
});
