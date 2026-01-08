import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';

import { ScrollBox } from './ScrollBox';
import { BottomSheet } from './BottomSheet';

export default function ScrollExample() {
  const [totalScrollSpring, setTotalScrollSpring] = useState(true);
  const [deltaScrollSpring, setDeltaScrollSpring] = useState(true);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scroll Gesture</Text>
        <Text style={styles.unsupported}>
          This gesture is only available on Android.
        </Text>
        <Text style={styles.description}>
          The Scroll gesture responds to mouse wheel and trackpad scroll events
          (ACTION_SCROLL from Android).
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <Text style={styles.title}>Scroll Gesture</Text>
        <Text style={styles.description}>
          Use your mouse wheel or trackpad to scroll over the elements below.
        </Text>

        <Text style={styles.sectionTitle}>Box Demo</Text>
        <Text style={styles.sectionDescription}>
          Compare total scroll (scrollX/scrollY) vs delta values (deltaX/deltaY)
        </Text>

        <View style={styles.boxesRow}>
          <ScrollBox
            color="#6C63FF"
            title="Total Scroll"
            useDeltas={false}
            useSpring={totalScrollSpring}
            onSpringChange={setTotalScrollSpring}
          />
          <ScrollBox
            color="#FF6B6B"
            title="Delta Scroll"
            useDeltas={true}
            useSpring={deltaScrollSpring}
            onSpringChange={setDeltaScrollSpring}
          />
        </View>

        <Text style={styles.hint}>
          💡 Scroll or drag on the bottom sheet to expand/collapse it
        </Text>
      </ScrollView>
      <BottomSheet />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  unsupported: {
    fontSize: 16,
    color: '#FF6B6B',
    marginBottom: 10,
    fontWeight: '600',
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});
