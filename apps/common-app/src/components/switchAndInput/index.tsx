import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  TextInput,
  LegacyTextInput,
  Switch,
  LegacySwitch,
} from 'react-native-gesture-handler';

export default function SwitchTextInputExample() {
  const [switchOn, setSwitchOn] = useState(false);
  const [legacySwitchOn, setLegacySwitchOn] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Components Playground</Text>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TextInput</Text>
          <TextInput
            onBegin={() => console.log('[TextInput] onBegin')}
            onActivate={() => console.log('[TextInput] onActivate')}
            onFinalize={(e) =>
              console.log('[TextInput] onFinalize', e.canceled)
            }
            style={styles.input}
            placeholder="Type here..."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>LegacyTextInput</Text>
          <LegacyTextInput
            onBegan={() => console.log('[LegacyTextInput] onBegan')}
            onActivated={() => console.log('[LegacyTextInput] onActivated')}
            onEnded={(e: any) =>
              console.log('[LegacyTextInput] onEnded', e.nativeEvent?.state)
            }
            style={styles.input}
            placeholder="Type here..."
          />
        </View>
      </View>

      <View style={[styles.row, { marginTop: 16 }]}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Switch (new)</Text>
          <View style={styles.switchRow}>
            <Switch
              onBegin={() => console.log('[Switch] onBegin')}
              onFinalize={(e) => console.log('[Switch] onFinalize', e.canceled)}
              value={switchOn}
              onValueChange={(v: boolean) => {
                console.log('[Switch] onValueChange', v);
                setSwitchOn(v);
              }}
            />
            <Text style={styles.switchLabel}>{switchOn ? 'On' : 'Off'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>LegacySwitch</Text>
          <View style={styles.switchRow}>
            <LegacySwitch
              onBegan={() => console.log('[LegacySwitch] onBegan')}
              onEnded={(e: any) =>
                console.log('[LegacySwitch] onEnded', e.nativeEvent?.state)
              }
              value={legacySwitchOn}
              onValueChange={(v: boolean) => {
                console.log('[LegacySwitch] onValueChange', v);
                setLegacySwitchOn(v);
              }}
            />
            <Text style={styles.switchLabel}>
              {legacySwitchOn ? 'On' : 'Off'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.hint}>
        Open console to see gesture callback logs.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#e1e1e1',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 14,
  },
  hint: {
    marginTop: 18,
    color: '#666',
    fontSize: 12,
  },
});
