import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  View,
  TextInput,
} from 'react-native';

import {
  RectButton,
  DrawerLayout,
  DrawerType,
} from 'react-native-gesture-handler';

const TYPES: DrawerType[] = ['front', 'back', 'back', 'slide'];
const PARALLAX = [false, false, true, false];

type PageProps = {
  fromLeft: boolean;
  type: DrawerType;
  parallaxOn: boolean;
  flipSide: () => void;
  nextType: () => void;
  openDrawer: () => void;
};

const Page = ({
  fromLeft,
  type,
  parallaxOn,
  flipSide,
  nextType,
  openDrawer,
}: PageProps) => (
  <View style={styles.page}>
    <Text style={styles.pageText}>Hi 👋</Text>
    <RectButton style={styles.rectButton} onPress={flipSide}>
      <Text style={styles.rectButtonText}>
        Drawer to the {fromLeft ? 'left' : 'right'}! {'->'} Flip
      </Text>
    </RectButton>
    <RectButton style={styles.rectButton} onPress={nextType}>
      <Text style={styles.rectButtonText}>
        Type {type} {parallaxOn && 'with parallax!'} -&gt; Next
      </Text>
    </RectButton>
    <RectButton style={styles.rectButton} onPress={openDrawer}>
      <Text style={styles.rectButtonText}>Open drawer</Text>
    </RectButton>
    <TextInput
      style={styles.pageInput}
      placeholder="Just an input field to test kb dismiss mode"
    />
  </View>
);

export default class Example extends Component<
  Record<string, unknown>,
  { fromLeft: boolean; type: number }
> {
  state = { fromLeft: true, type: 0 };

  private renderParallaxDrawer = (progressValue: Animated.Value) => {
    const parallax = progressValue.interpolate({
      inputRange: [0, 1],
      outputRange: [this.state.fromLeft ? -50 : 50, 0],
    });
    const animatedStyles = {
      transform: [{ translateX: parallax }],
    };
    return (
      <Animated.View style={[styles.drawerContainer, animatedStyles]}>
        <Text style={styles.drawerText}>I am in the drawer!</Text>
        <Text style={styles.drawerText}>
          Watch parallax animation while you pull the drawer!
        </Text>
      </Animated.View>
    );
  };

  private renderDrawer = () => {
    return (
      <View style={styles.drawerContainer}>
        <Text style={styles.drawerText}>I am in the drawer!</Text>
      </View>
    );
  };
  private drawer?: DrawerLayout | null;

  render() {
    const drawerType: DrawerType = TYPES[this.state.type];
    const parallax = PARALLAX[this.state.type];
    return (
      <View style={styles.container}>
        <DrawerLayout
          ref={(drawer) => {
            this.drawer = drawer;
          }}
          enableTrackpadTwoFingerGesture
          drawerWidth={200}
          keyboardDismissMode="on-drag"
          drawerPosition={this.state.fromLeft ? 'left' : 'right'}
          drawerType={drawerType}
          drawerBackgroundColor="#ddd"
          overlayColor={drawerType === 'front' ? 'black' : '#00000000'}
          renderNavigationView={
            parallax ? this.renderParallaxDrawer : this.renderDrawer
          }
          contentContainerStyle={
            // careful; don't elevate the child container
            // over top of the drawer when the drawer is supposed
            // to be in front - you won't be able to see/open it.
            drawerType === 'front'
              ? {}
              : Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOpacity: 0.5,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 60,
                  },
                  android: {
                    elevation: 100,
                    backgroundColor: '#000',
                  },
                })
          }>
          <Page
            type={drawerType}
            fromLeft={this.state.fromLeft}
            parallaxOn={parallax}
            flipSide={() =>
              this.setState((prevState) => ({
                fromLeft: !prevState.fromLeft,
              }))
            }
            nextType={() =>
              this.setState((prevState) => ({
                type: (prevState.type + 1) % TYPES.length,
              }))
            }
            openDrawer={() => this.drawer?.openDrawer({ speed: 14 })}
          />
        </DrawerLayout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: 'gray',
  },
  pageText: {
    fontSize: 21,
    color: 'white',
  },
  rectButton: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: 'white',
  },
  rectButtonText: {
    backgroundColor: 'transparent',
  },
  drawerContainer: {
    flex: 1,
    paddingTop: 10,
  },
  pageInput: {
    height: 60,
    padding: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#eee',
  },
  drawerText: {
    margin: 10,
    fontSize: 15,
    textAlign: 'left',
  },
});
