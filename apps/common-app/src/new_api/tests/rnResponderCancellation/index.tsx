import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '../../../common';
import { MultiHandlerExample } from './MultiHandlerExample';
import { SingleHandlerExample } from './SingleHandlerExample';

type Tab = 'single' | 'multi';

export default function RNResponderCancellationExample() {
  const [tab, setTab] = useState<Tab>('single');

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.tabBar}>
        <TabButton
          label="Single handler"
          active={tab === 'single'}
          onPress={() => setTab('single')}
        />
        <TabButton
          label="Multi handler"
          active={tab === 'multi'}
          onPress={() => setTab('multi')}
        />
      </View>
      {tab === 'single' ? <SingleHandlerExample /> : <MultiHandlerExample />}
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[tabStyles.tabButton, active && tabStyles.tabButtonActive]}>
      <Text
        style={[
          tabStyles.tabButtonLabel,
          active && tabStyles.tabButtonLabelActive,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.NAVY,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: COLORS.NAVY,
  },
  tabButtonLabel: {
    color: COLORS.NAVY,
    fontWeight: '700',
    fontSize: 14,
  },
  tabButtonLabelActive: {
    color: '#ffffff',
  },
});
