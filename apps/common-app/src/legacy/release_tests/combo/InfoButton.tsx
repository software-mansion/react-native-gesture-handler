import React, { StyleSheet, Text, View } from 'react-native';
import { BorderlessButton } from 'react-native-gesture-handler';
import type { BorderlessButtonProps } from 'react-native-gesture-handler';

export const InfoButton = (props: BorderlessButtonProps & { name: string }) => (
  <BorderlessButton
    {...props}
    style={styles.infoButton}
    // eslint-disable-next-line no-alert
    onPress={() => window.alert(`${props.name} info button clicked`)}>
    <View style={styles.infoButtonBorders}>
      <Text style={styles.infoButtonText}>i</Text>
    </View>
  </BorderlessButton>
);

const styles = StyleSheet.create({
  infoButton: {
    width: 40,
    height: 40,
  },
  infoButtonBorders: {
    borderColor: '#467AFB',
    borderWidth: 2,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    margin: 10,
  },
  infoButtonText: {
    color: '#467AFB',
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
});
