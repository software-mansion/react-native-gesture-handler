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
              underlayColor="black"
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
              underlayColor="black"
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
          <Text style={styles.sectionHeader}>Hover states</Text>
          <Text>Hover-only feedback (web).</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Opacity"
              color={COLORS.WEB_BLUE}
              hoverOpacity={0.7}
            />

            <TouchableWrapper
              name="Scale"
              color={COLORS.RED}
              hoverScale={1.05}
            />

            <TouchableWrapper
              name="Underlay"
              color={COLORS.YELLOW}
              hoverUnderlayOpacity={0.3}
              underlayColor={COLORS.DARK_GREEN}
            />
          </View>

          <Text>Hover + press combined.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Opacity"
              color={COLORS.LIGHT_BLUE}
              hoverOpacity={0.85}
              activeOpacity={0.6}
            />

            <TouchableWrapper
              name="Scale"
              color={COLORS.DARK_SALMON}
              hoverScale={1.05}
              activeScale={0.95}
            />

            <TouchableWrapper
              name="All"
              color={COLORS.NAVY}
              hoverScale={1.05}
              hoverUnderlayOpacity={0.2}
              activeScale={0.95}
              activeUnderlayOpacity={0.5}
              underlayColor={COLORS.DARK_GREEN}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Animation timing</Text>
          <Text>
            Customize press and hover animation durations via the unified
            `animationDuration` prop.
          </Text>

          <Text>Single number: applied to every phase.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Snappy"
              color={COLORS.DARK_PURPLE}
              activeOpacity={0.3}
              animationDuration={0}
            />

            <TouchableWrapper
              name="Sluggish"
              color={COLORS.WEB_BLUE}
              activeOpacity={0.3}
              animationDuration={600}
            />
          </View>

          <Text>Object with top-level in / out applies to every category.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Quick in / slow out"
              color={COLORS.RED}
              activeOpacity={0.3}
              hoverOpacity={0.6}
              animationDuration={{ in: 0, out: 600 }}
            />
          </View>

          <Text>Per-category overrides — slower hover than tap.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Slow hover"
              color={COLORS.YELLOW}
              activeOpacity={0.3}
              hoverOpacity={0.5}
              animationDuration={{
                in: 50,
                out: 100,
                hover: { in: 400, out: 400 },
              }}
            />

            <TouchableWrapper
              name="Partial hover override"
              color={COLORS.LIGHT_BLUE}
              activeOpacity={0.3}
              hoverOpacity={0.5}
              animationDuration={{
                in: 50,
                out: 100,
                hover: { in: 400 },
              }}
            />
          </View>

          <Text>All categories specified, no shared baseline.</Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Fully custom"
              color={COLORS.NAVY}
              activeOpacity={0.3}
              hoverOpacity={0.5}
              animationDuration={{
                tap: { in: 0, out: 250 },
                hover: { in: 300, out: 300 },
              }}
            />
          </View>

          <Text>
            Long-press override — release timing switches once held past
            `delayLongPress`.
          </Text>

          <View style={styles.row}>
            <TouchableWrapper
              name="Hold"
              color={COLORS.DARK_SALMON}
              activeOpacity={0.3}
              delayLongPress={400}
              animationDuration={{
                in: 50,
                out: 100,
                longPress: { out: 800 },
              }}
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
    textAlign: 'center',
  },
});
