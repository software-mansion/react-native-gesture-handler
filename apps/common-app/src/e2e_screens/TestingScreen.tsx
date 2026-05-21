import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface TestingScreenProps {
  text: string;
  setText: (text: string) => void;
  children: React.ReactNode;
}

export default function TestingScreen({
  text,
  setText,
  children,
}: TestingScreenProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <Text testID="state-indicator" style={styles.stateIndicator}>
          {text}
        </Text>
      </ScrollView>
      <View testID="container" style={styles.innerContainer}>
        {children}
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          testID="reset"
          style={styles.resetButton}
          onPress={() => {
            setText('');
          }}>
          <Text>Reset</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    height: 50,
    maxHeight: 50,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stateIndicator: {
    fontSize: 15,
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    height: 60,
    maxHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'royalblue',

    justifyContent: 'center',
    alignItems: 'center',
  },
});
