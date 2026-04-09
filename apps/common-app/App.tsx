import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Platform, Dimensions } from 'react-native';
import {
  createStackNavigator,
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
import { NavigationContainer, ParamListBase } from '@react-navigation/native';
import {
  GestureHandlerRootView,
  RectButton,
  Switch,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from './src/common';

import { Icon } from '@swmansion/icons';

import { OLD_EXAMPLES } from './src/legacy';
import { NEW_EXAMPLES } from './src/new_api';
import { TouchableExample } from './src/legacy/release_tests/touchables';
import { ListWithHeader } from './src/ListWithHeader';
const OPEN_LAST_EXAMPLE_KEY = 'openLastExample';
const SHOW_LEGACY_EXAMPLES_KEY = 'showLegacyExamples';
const LAST_EXAMPLE_KEY = 'lastExample';

type RootStackParamList = {
  Home: undefined;
  TouchableExample: { item: string };
} & {
  [Screen: string]: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
export default function App() {
  const [showLegacyVersion, setShowLegacyVersion] = useState(false);
  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            cardStyle: {
              // It's important to set height for the screen, without it scroll doesn't work on web platform.
              height: Dimensions.get('window').height,
              backgroundColor: COLORS.offWhite,
            },
            headerStyle: {
              backgroundColor: COLORS.offWhite,
              borderBottomColor: COLORS.headerSeparator,
              borderBottomWidth: 1,
            },
          }}>
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
            component={MainScreen}
          />
          {(showLegacyVersion ? OLD_EXAMPLES : NEW_EXAMPLES)
            .flatMap(({ data }) => data)
            .flatMap(({ name, component }) => (
              <Stack.Screen
                key={name}
                name={name}
                getComponent={() => component}
                options={{ title: name }}
              />
            ))}
          <Stack.Screen name="TouchableExample" component={TouchableExample} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );

  function navigate(
    navigation: StackNavigationProp<ParamListBase>,
    dest: string
  ) {
    AsyncStorage.setItem(LAST_EXAMPLE_KEY, dest);
    navigation.navigate(dest);
  }

  function MainScreen({ navigation }: StackScreenProps<ParamListBase>) {
    const insets = useSafeAreaInsets();

    useEffect(() => {
      void AsyncStorage.multiGet([
        OPEN_LAST_EXAMPLE_KEY,
        LAST_EXAMPLE_KEY,
        SHOW_LEGACY_EXAMPLES_KEY,
      ]).then(([openLastExample, lastExample, showLegacyExamples]) => {
        const showLegacy = showLegacyExamples[1] === 'true';
        if (showLegacyExamples[1] != null) {
          setShowLegacyVersion(showLegacy);
        }
        if (
          showLegacy === showLegacyVersion &&
          openLastExample[1] === 'true' &&
          lastExample[1]
        ) {
          navigate(navigation, lastExample[1]);
        }

        return;
      });
      // we only want to run this effect once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <View style={styles.container}>
        <ListWithHeader
          style={styles.list}
          sections={showLegacyVersion ? OLD_EXAMPLES : NEW_EXAMPLES}
          keyExtractor={(example) => example.name}
          ListHeaderComponent={Settings}
          contentContainerStyle={{
            paddingBottom: insets.bottom,
            paddingTop: insets.top,
          }}
          renderItem={({ item }) => (
            <MainScreenItem
              name={item.name}
              onPressItem={(name) => navigate(navigation, name)}
              enabled={!item.unsupportedPlatforms?.has(Platform.OS)}
            />
          )}
          renderSectionHeader={({ section: { sectionTitle } }) => (
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  }

  function Settings() {
    const [openLastExample, setOpenLastExample] = useState(false);

    useEffect(() => {
      void AsyncStorage.getItem(OPEN_LAST_EXAMPLE_KEY).then((value) => {
        setOpenLastExample(value === 'true');
        return;
      });
    }, []);

    function updateKeepSetting(value: boolean) {
      AsyncStorage.setItem(OPEN_LAST_EXAMPLE_KEY, value.toString());
      setOpenLastExample(value);
    }
    function updateVersionSetting(value: boolean) {
      AsyncStorage.setItem(SHOW_LEGACY_EXAMPLES_KEY, value.toString());
      AsyncStorage.removeItem(LAST_EXAMPLE_KEY);
      setShowLegacyVersion(value);
    }
    return (
      <View style={styles.settings}>
        <RectButton
          style={styles.settingsButton}
          onPress={() => {
            updateKeepSetting(!openLastExample);
          }}>
          <View
            style={styles.settingsButtonContent}
            pointerEvents={Platform.OS === 'web' ? 'box-only' : 'auto'}>
            <Text style={[styles.text, styles.aligned]}>
              Open last example on launch
            </Text>
            <Switch
              style={styles.aligned}
              value={openLastExample}
              onValueChange={() => {
                updateKeepSetting(!openLastExample);
              }}
            />
          </View>
        </RectButton>
        <RectButton
          style={styles.settingsButton}
          onPress={() => {
            updateVersionSetting(!showLegacyVersion);
          }}>
          <View
            style={styles.settingsButtonContent}
            pointerEvents={Platform.OS === 'web' ? 'box-only' : 'auto'}>
            <Text style={[styles.text, styles.aligned]}>
              Show legacy version examples
            </Text>
            <Switch
              style={styles.aligned}
              value={showLegacyVersion}
              onValueChange={() => {
                updateVersionSetting(!showLegacyVersion);
              }}
            />
          </View>
        </RectButton>
      </View>
    );
  }

  interface MainScreenItemProps {
    name: string;
    onPressItem: (name: string) => void;
    enabled: boolean;
  }

  function MainScreenItem({ name, onPressItem, enabled }: MainScreenItemProps) {
    return (
      <RectButton
        enabled={enabled}
        style={[styles.button, !enabled && styles.unavailableExample]}
        onPress={() => onPressItem(name)}>
        <Text style={styles.text}>{name}</Text>
        {Platform.OS !== 'macos' && enabled && (
          <Icon name="chevron-small-right" size={24} color="#bbb" />
        )}
      </RectButton>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  sectionTitle: {
    ...(Platform.OS !== 'macos' ? { backgroundColor: '#f8f9ff' } : {}),
    ...Platform.select({
      ios: {
        fontSize: 17,
        fontWeight: '500',
      },
      android: {
        fontSize: 19,
        fontFamily: 'sans-serif-medium',
      },
    }),
    padding: 16,
    color: 'black',
  },
  text: {
    color: 'black',
  },
  aligned: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  list: {},
  separator: {
    height: 2,
  },
  button: {
    flex: 1,
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsButton: {
    flex: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#eef0ff',
    padding: 8,
    justifyContent: 'center',
    elevation: 8,
    ...(Platform.OS !== 'macos'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }
      : {}),
  },
  settingsButtonContent: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableExample: {
    backgroundColor: 'rgb(220, 220, 220)',
    opacity: 0.3,
  },
  settings: {
    flexDirection: 'row',
    gap: 24,
    margin: 24,
  },
});
