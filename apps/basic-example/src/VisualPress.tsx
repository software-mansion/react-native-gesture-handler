import React, { useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { ScrollView, Touchable } from 'react-native-gesture-handler';

type DisableOn = 'never' | 'longPress' | 'press';

export default function VisualPress() {
  const [pressed, setPressed] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [cancelOnLeave, setCancelOnLeave] = useState(true);
  const [disableOn, setDisableOn] = useState<DisableOn>('never');
  const [events, setEvents] = useState<string[]>([]);
  const [counts, setCounts] = useState({ active: 0, resting: 0, presses: 0 });
  const startedAt = useRef(Date.now());

  const record = (event: string) => {
    const elapsed = Date.now() - startedAt.current;
    setEvents((previous) => [...previous.slice(-11), `${elapsed}ms ${event}`]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Drag the card to scroll, tap it, or hold then drag outside. Feedback
        follows native acceptance. Enable re-entry by turning off cancel on
        leave. The log keeps quick-tap transitions visible.
      </Text>
      <View style={styles.option}>
        <Text>Disabled</Text>
        <Switch
          testID="visual-disabled"
          value={disabled}
          onValueChange={setDisabled}
        />
      </View>
      <View style={styles.option}>
        <Text>Cancel on leave</Text>
        <Switch value={cancelOnLeave} onValueChange={setCancelOnLeave} />
      </View>
      <View style={styles.controls}>
        {(['never', 'longPress', 'press'] as const).map((mode) => (
          <Touchable
            key={mode}
            testID={`disable-on-${mode}`}
            style={[styles.control, disableOn === mode && styles.selected]}
            onPress={() => setDisableOn(mode)}>
            <Text>
              {mode === 'never' ? 'Stay enabled' : `Disable on ${mode}`}
            </Text>
          </Touchable>
        ))}
      </View>
      <Text testID="visual-counts" style={styles.status}>
        Active {counts.active}, resting {counts.resting}, presses{' '}
        {counts.presses}
      </Text>
      <Text testID="visual-state" style={styles.status}>
        Visual pressed {pressed ? 'yes' : 'no'}
      </Text>
      <Touchable
        testID="visual-reset"
        style={styles.control}
        onPress={() => {
          setEvents([]);
          setCounts({ active: 0, resting: 0, presses: 0 });
          startedAt.current = Date.now();
          setDisabled(false);
        }}>
        <Text>Reset log and enable</Text>
      </Touchable>
      <ScrollView
        testID="visual-scroll"
        delaysChildPressedState
        contentContainerStyle={styles.scrollContent}>
        <Touchable
          testID="visual-card"
          disabled={disabled}
          cancelOnLeave={cancelOnLeave}
          activeOpacity={1}
          activeScale={1}
          activeUnderlayOpacity={0}
          onVisualPressChange={(nextPressed: boolean) => {
            setPressed(nextPressed);
            setCounts((previous) => ({
              ...previous,
              active: previous.active + (nextPressed ? 1 : 0),
              resting: previous.resting + (nextPressed ? 0 : 1),
            }));
            record(`visual ${nextPressed}`);
          }}
          onPressIn={() => record('press in')}
          onPressOut={() => record('press out')}
          onLongPress={() => {
            record('long press');
            if (disableOn === 'longPress') {
              setDisabled(true);
            }
          }}
          onPress={() => {
            record('press');
            setCounts((previous) => ({
              ...previous,
              presses: previous.presses + 1,
            }));
            if (disableOn === 'press') {
              setDisabled(true);
            }
          }}>
          <View
            style={[
              styles.card,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}>
            <Text style={styles.cardTitle}>Custom press feedback</Text>
            <Text>The callback controls this card's color and scale.</Text>
          </View>
        </Touchable>
        <Text testID="visual-log" style={styles.log}>
          {events.length === 0 ? 'No events' : events.join('\n')}
        </Text>
        <View style={styles.spacer}>
          <Text>Scroll space</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, gap: 8, backgroundColor: '#fff' },
  instructions: { color: '#333', fontSize: 13 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  control: { padding: 8, borderRadius: 6, backgroundColor: '#eee' },
  selected: { backgroundColor: '#cbb5ff' },
  status: { fontSize: 14, fontWeight: '600' },
  scrollContent: { padding: 8 },
  card: { padding: 24, borderRadius: 16, backgroundColor: '#e4d9ff', gap: 8 },
  cardTitle: { fontSize: 20, fontWeight: '600' },
  pressed: { backgroundColor: '#b692ff', transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.4 },
  log: { marginTop: 16, fontSize: 12, minHeight: 180 },
  spacer: { height: 800, paddingTop: 40 },
});
