import React, { useRef } from 'react';
import { StyleSheet, Text, View, I18nManager } from 'react-native';

import { FlatList, Pressable, RectButton } from 'react-native-gesture-handler';

import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import AppleStyleSwipeableRow from './AppleStyleSwipeableRow';
import GmailStyleSwipeableRow from './GmailStyleSwipeableRow';

import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

//  To toggle LTR/RTL change to `true`
I18nManager.allowRTL(false);

type DataRow = {
  from: string;
  when: string;
  message: string;
};

const Row = ({ item }: { item: DataRow }) => (
  // eslint-disable-next-line no-alert
  <RectButton style={styles.rectButton} onPress={() => window.alert(item.from)}>
    <Text style={styles.fromText}>{item.from}</Text>
    <Text numberOfLines={2} style={styles.messageText}>
      {item.message}
    </Text>
    <Text style={styles.dateText}>{item.when} ❭</Text>
  </RectButton>
);

const SwipeableRow = ({ item, index }: { item: DataRow; index: number }) => {
  if (index % 2 === 0) {
    return (
      <AppleStyleSwipeableRow>
        <Row item={item} />
      </AppleStyleSwipeableRow>
    );
  } else {
    return (
      <GmailStyleSwipeableRow>
        <Row item={item} />
      </GmailStyleSwipeableRow>
    );
  }
};

function LeftAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('[R] showLeftProgress:', prog.value);
    console.log('[R] appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value - 60 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.leftAction}>Text</Text>
    </Reanimated.View>
  );
}

function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
  const styleAnimation = useAnimatedStyle(() => {
    console.log('[R] showRightProgress:', prog.value);
    console.log('[R] appliedTranslation:', drag.value);

    return {
      transform: [{ translateX: drag.value + 60 }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      <Text style={styles.rightAction}>Text</Text>
    </Reanimated.View>
  );
}

const Separator = () => <View style={styles.separator} />;

export default function App() {
  const reanimatedRef = useRef<SwipeableMethods>(null);
  return (
    <View>
      <Separator />

      <View style={styles.controlPanelWrapper}>
        <Text style={styles.fromText}>Programatical controls</Text>
        <View style={styles.controlPanel}>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.openLeft();
            }}>
            <Text>open left</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.close();
            }}>
            <Text>close</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.reset();
            }}>
            <Text>reset</Text>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              reanimatedRef.current!.openRight();
            }}>
            <Text>open right</Text>
          </Pressable>
        </View>
      </View>

      <Separator />

      <ReanimatedSwipeable
        ref={reanimatedRef}
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={80}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderLeftActions={LeftAction}
        renderRightActions={RightAction}>
        <Text>Use the programatic control panel</Text>
      </ReanimatedSwipeable>

      <Separator />
      <FlatList
        data={DATA}
        ItemSeparatorComponent={Separator}
        renderItem={({ item, index }) => (
          <SwipeableRow item={item} index={index} />
        )}
        keyExtractor={(_item, index) => `message ${index}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  separator: {
    backgroundColor: 'rgb(200, 199, 204)',
    height: StyleSheet.hairlineWidth,
  },
  fromText: {
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  messageText: {
    color: '#999',
    backgroundColor: 'transparent',
  },
  dateText: {
    backgroundColor: 'transparent',
    position: 'absolute',
    right: 20,
    top: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  leftAction: { width: 60, height: 60, backgroundColor: '#ff5ca3' },
  rightAction: { width: 60, height: 60, backgroundColor: '#b658b6' },
  swipeable: {
    height: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlPanelWrapper: {
    backgroundColor: 'white',
    alignItems: 'center',
  },
  controlPanel: {
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'row',
  },
  control: {
    flex: 1,
    height: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgb(200, 199, 204)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const DATA: DataRow[] = [
  {
    from: "D'Artagnan",
    when: '3:11 PM',
    message:
      'Unus pro omnibus, omnes pro uno. Nunc scelerisque, massa non lacinia porta, quam odio dapibus enim, nec tincidunt dolor leo non neque',
  },
  {
    from: 'Aramis',
    when: '11:46 AM',
    message:
      'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus hendrerit ligula dignissim maximus aliquet. Integer tincidunt, tortor at finibus molestie, ex tellus laoreet libero, lobortis consectetur nisl diam viverra justo.',
  },
  {
    from: 'Athos',
    when: '6:06 AM',
    message:
      'Sed non arcu ullamcorper, eleifend velit eu, tristique metus. Duis id sapien eu orci varius malesuada et ac ipsum. Ut a magna vel urna tristique sagittis et dapibus augue. Vivamus non mauris a turpis auctor sagittis vitae vel ex. Curabitur accumsan quis mauris quis venenatis.',
  },
  {
    from: 'Porthos',
    when: 'Yesterday',
    message:
      'Vivamus id condimentum lorem. Duis semper euismod luctus. Morbi maximus urna ut mi tempus fermentum. Nam eget dui sed ligula rutrum venenatis.',
  },
  {
    from: 'Domestos',
    when: '2 days ago',
    message:
      'Aliquam imperdiet dolor eget aliquet feugiat. Fusce tincidunt mi diam. Pellentesque cursus semper sem. Aliquam ut ullamcorper massa, sed tincidunt eros.',
  },
  {
    from: 'Cardinal Richelieu',
    when: '2 days ago',
    message:
      'Pellentesque id quam ac tortor pellentesque tempor tristique ut nunc. Pellentesque posuere ut massa eget imperdiet. Ut at nisi magna. Ut volutpat tellus ut est viverra, eu egestas ex tincidunt. Cras tellus tellus, fringilla eget massa in, ultricies maximus eros.',
  },
  {
    from: "D'Artagnan",
    when: 'Week ago',
    message:
      'Aliquam non aliquet mi. Proin feugiat nisl maximus arcu imperdiet euismod nec at purus. Vestibulum sed dui eget mauris consequat dignissim.',
  },
  {
    from: 'Cardinal Richelieu',
    when: '2 weeks ago',
    message:
      'Vestibulum ac nisi non augue viverra ullamcorper quis vitae mi. Donec vitae risus aliquam, posuere urna fermentum, fermentum risus. ',
  },
];
