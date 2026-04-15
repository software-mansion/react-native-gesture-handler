import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TouchableProps } from 'react-native-gesture-handler';
import {
  GestureHandlerRootView,
  Touchable,
} from 'react-native-gesture-handler';

import { COLORS } from '../../../common';

type ButtonWrapperProps = TouchableProps & {
  name: string;
  color: string;
};

function TouchableWrapper({ name, color, ...rest }: ButtonWrapperProps) {
  return (
    <Touchable
      style={[styles.button, { backgroundColor: color }]}
      onPressIn={() => console.log(`[${name}] onPressIn`)}
      onPress={() => console.log(`[${name}] onPress`)}
      onLongPress={() => console.log(`[${name}] onLongPress`)}
      onPressOut={() => console.log(`[${name}] onPressOut`)}
      {...rest}>
      <Text style={styles.buttonText}>{name}</Text>
    </Touchable>
  );
}

export default function TouchableExample() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Buttons replacements</Text>
          <Text>New component that replaces all buttons and pressables.</Text>

          <View style={styles.row}>
            <TouchableWrapper name="Base" color={COLORS.DARK_PURPLE} />

            <TouchableWrapper
              name="Rect"
              color={COLORS.WEB_BLUE}
              activeUnderlayOpacity={0.105}
            />

            <TouchableWrapper
              name="Borderless"
              activeOpacity={0.3}
              color={COLORS.RED}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Custom animations</Text>
          <Text>Animated underlay.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Click me!"
              color={COLORS.YELLOW}
              activeUnderlayOpacity={0.3}
            />

            <TouchableWrapper
              name="Click me!"
              color={COLORS.NAVY}
              defaultUnderlayOpacity={0.7}
              activeUnderlayOpacity={0.5}
              underlayColor={COLORS.DARK_GREEN}
            />
          </View>

          <Text>Animated component.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Click me!"
              color={COLORS.LIGHT_BLUE}
              defaultOpacity={0.3}
              activeOpacity={0.7}
            />

            <TouchableWrapper
              name="Click me!"
              color={COLORS.DARK_SALMON}
              defaultOpacity={0.7}
              activeOpacity={0.5}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Android ripple</Text>
          <Text>Configurable ripple effect on Touchable component.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Default"
              color={COLORS.ANDROID}
              androidRipple={{}}
            />

            <TouchableWrapper
              name="Borderless"
              color={COLORS.ANDROID}
              androidRipple={{
                color: COLORS.KINDA_BLUE,
                borderless: true,
                radius: 55,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  button: {
    width: 110,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
