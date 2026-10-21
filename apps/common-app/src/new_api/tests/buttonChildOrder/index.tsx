import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BaseButton,
  RectButton,
  Touchable,
} from 'react-native-gesture-handler';

import { COLORS } from '../../../common';

// Children mounted into a button after its first render must keep their React
// order. The background-only `frame` View is flattened, so its children are
// hoisted into the button right after it; if they are inserted below it they
// disappear. Every column should look like the `View` control after "Toggle".

type CellProps = { children: React.ReactNode };

const COLUMNS: { name: string; Wrapper: React.FC<CellProps> }[] = [
  {
    name: 'BaseButton',
    Wrapper: ({ children }) => <BaseButton>{children}</BaseButton>,
  },
  {
    name: 'RectButton',
    Wrapper: ({ children }) => <RectButton>{children}</RectButton>,
  },
  {
    name: 'Touchable',
    Wrapper: ({ children }) => <Touchable>{children}</Touchable>,
  },
  {
    name: 'View',
    Wrapper: ({ children }) => <View>{children}</View>,
  },
];

export default function ButtonChildOrderExample() {
  const [toggled, setToggled] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        testID="button-child-order-toggle"
        style={styles.toggle}
        onPress={() => setToggled((value) => !value)}>
        <Text>Toggle ({toggled ? 'on' : 'off'})</Text>
      </Pressable>

      <Text style={styles.title}>Swap label and ActivityIndicator</Text>
      <View testID="button-child-order-swap-row" style={styles.row}>
        {COLUMNS.map(({ name, Wrapper }) => (
          <View key={name} style={styles.cell}>
            <Wrapper>
              <View style={styles.frame}>
                {toggled ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.label}>Label</Text>
                )}
              </View>
            </Wrapper>
            <Text style={styles.caption}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.title}>Toggle a child's opacity (1 and 0.5)</Text>
      <View testID="button-child-order-opacity-row" style={styles.row}>
        {COLUMNS.map(({ name, Wrapper }) => (
          <View key={name} style={styles.cell}>
            <Wrapper>
              <View style={styles.frame}>
                <View style={{ opacity: toggled ? 0.5 : 1 }}>
                  <Text style={styles.label}>Label</Text>
                </View>
              </View>
            </Wrapper>
            <Text style={styles.caption}>{name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  toggle: {
    marginHorizontal: 16,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.GRAY,
  },
  title: { marginHorizontal: 16, marginTop: 24, fontWeight: '600' },
  row: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 8 },
  cell: { flex: 1, paddingHorizontal: 4 },
  frame: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.DARK_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: 'white', fontWeight: '600' },
  caption: { fontSize: 11, marginTop: 4, textAlign: 'center' },
});
