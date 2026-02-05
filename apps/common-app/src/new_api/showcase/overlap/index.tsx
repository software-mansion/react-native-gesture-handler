import { COLORS, commonStyles, Feedback } from '../../../common';
import React, { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  InterceptingGestureDetector,
  useTapGesture,
  VirtualGestureDetector,
} from 'react-native-gesture-handler';

function Box(props: {
  color: string;
  overlap?: boolean;
  children?: React.ReactNode;
  elevated: boolean;
}) {
  return (
    <View
      style={[
        commonStyles.box,
        { backgroundColor: props.color },
        props.overlap ? styles.overlap : {},
        props.elevated ? styles.elevated : {},
      ]}>
      {props.children}
    </View>
  );
}

function OverlapSiblings() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);
  const [elevated, setElevated] = React.useState('');

  const tapPurple = useTapGesture({
    onDeactivate: (_e, success) => {
      if (success) {
        setElevated('purple');
        feedbackRef.current?.showMessage('Tapped purple');
      }
    },
    disableReanimated: true,
  });

  const tapBlue = useTapGesture({
    onDeactivate: (_e, success) => {
      if (success) {
        setElevated('blue');
        feedbackRef.current?.showMessage('Tapped blue');
      }
    },
    disableReanimated: true,
  });

  return (
    <View style={commonStyles.subcontainer}>
      <View style={styles.row}>
        <Text style={commonStyles.header}>Overlap Siblings</Text>
        <InterceptingGestureDetector>
          <View style={{ width: 225 }}>
            <VirtualGestureDetector gesture={tapPurple}>
              <Box color={COLORS.PURPLE} elevated={elevated === 'purple'} />
            </VirtualGestureDetector>
            <VirtualGestureDetector gesture={tapBlue}>
              <Box color={COLORS.NAVY} overlap elevated={elevated === 'blue'} />
            </VirtualGestureDetector>
          </View>
        </InterceptingGestureDetector>
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

function OverlapParents() {
  const feedbackRef = useRef<{ showMessage: (msg: string) => void }>(null);
  const [elevated, setElevated] = React.useState('');

  const tapRed = useTapGesture({
    onDeactivate: (_e, success) => {
      if (success) {
        feedbackRef.current?.showMessage('Tapped purple');
        setElevated('purple');
      }
    },
    disableReanimated: true,
  });

  const tapGreen = useTapGesture({
    onDeactivate: (_e, success) => {
      if (success) {
        feedbackRef.current?.showMessage('Tapped blue');
        setElevated('blue');
      }
    },
    disableReanimated: true,
  });

  return (
    <View style={commonStyles.subcontainer}>
      <View style={styles.row}>
        <Text style={commonStyles.header}>Overlap Child</Text>

        <InterceptingGestureDetector>
          <View style={{ width: 225 }}>
            <VirtualGestureDetector gesture={tapRed}>
              <Box color={COLORS.PURPLE} elevated={elevated === 'purple'}>
                <VirtualGestureDetector gesture={tapGreen}>
                  <Box
                    color={COLORS.NAVY}
                    overlap
                    elevated={elevated === 'blue'}
                  />
                </VirtualGestureDetector>
              </Box>
            </VirtualGestureDetector>
          </View>
        </InterceptingGestureDetector>
      </View>
      <Feedback ref={feedbackRef} />
    </View>
  );
}

export default function Example() {
  return (
    <View style={commonStyles.centerView}>
      <OverlapSiblings />
      <OverlapParents />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 30,
    alignItems: 'center',
    height: 225,
    marginBottom: 60,
  },
  overlap: {
    position: 'absolute',
    left: 75,
    top: 75,
  },
  elevated: {
    zIndex: 10,
    elevation: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});
