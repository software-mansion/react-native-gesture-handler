// @flow
import * as React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';

import { Swipeable, RectButton } from 'react-native-gesture-handler';

import { widthPercentageToDP } from 'react-native-responsive-screen';

/* How wide to make each action menu button in pts. This is used to derive the overall action menu widths etc
 *  For buttons X, then aim for X * ACTION_BTN_WIDTH to come out around about 60% screen width to enable dragging
 * to trigger the default action .
 * */
const ACTION_BTN_WIDTH = 64;

/* How much of a X drag should trigger should trigger a supplied default action. This wants to be:
 * a) Around 60% of the screen width in _portrait_
 * b) The same in landscape.
 * c) Larger than the total width of the maximum number of buttons used in any of the actual action menu's
 *
 * NB: It is the callback's responsibility to shut the menu
 * */
const DEFAULT_ACTION_THRESHOLD = ACTION_BTN_WIDTH * (3 + 0.5);

/* How much before the default action is triggered should the default is about to be triggered button movement start */
const DEFAULT_ACTION_THRESHOLD_ANIMATION_OFFSET = 0.5 * ACTION_BTN_WIDTH;

type actionButtonDef = {
  text: string,
  color: string,
};
const SWIPEABLE_LH_ACTION_BUTTONS: Array<actionButtonDef> = [
  {
    text: 'Read',
    color: '#497AFC',
  },
];

// * Add the default at first index
const SWIPEABLE_DEFAULT_ACTION_IDX = 0;
const SWIPEABLE_RH_ACTION_BUTTONS: Array<actionButtonDef> = [
  {
    text: 'Delete',
    color: '#dd2c00',
  },
  {
    text: 'Flag',
    color: '#ffab00',
  },
  {
    text: 'More',
    color: '#C8C7CD',
  },
];

type State = {
  actionMenuOpenOnSide: 'left' | 'right' | 'neither',
};

export default class SwipeableRow extends React.Component<Props, State> {
  state: State = {
    actionMenuOpenOnSide: 'neither',
  };

  _swipeableRowRef: Swipeable | null;

  actionButtonPressHandler(text: string) {
    this.close();
    alert(text);
  }

  /**
   * Pass to Swipeable as the Left menu to render a single button Apple style menu.
   *
   * The menu acts as follows:
   * 1) Dragging to the RHS past the menu open threshold causes it to spring open revealing the single button.
   * 2) Continued rightwards dragging extends the menu, but the button stay on the LHS until the drag approaches
   * the threshold for triggering the default action.
   * 3) As the drag gets close the default action threshold the button animates rapidly rightwards giving the user a
   * visual representation that the default action is about to be triggered.
   * 4) The button continues rightward until it hits the trigger point whereupon it indicates to the user that the
   * default will be triggered by ceasing to move any further right even as the rest of the menu continues to extend.
   * 5) The menu is closed by either dragging to the LHS past the menu close threshold or by dragging past the trigger
   * default action threshold.
   *
   */

  leftAppleStyleActionMenuRender = (
    progress: Animated.Value,
    dragX: Animated.Value
  ) => {
    const screenWidth = widthPercentageToDP(100);
    const dragXMenuClosed = 0;

    /* The single button inside the menu container  starts, and stays flush against the lhs of the menu until just before
     * the default threshold is triggered. When it hits that "just before point", it then moves to the right
     * to indicate to the user that the default is about to trigger. Once past the trigger point it stops
     * moving any further to the right to indicate that releasing will trigger the default */
    const xForSingleActionButtonInsideMenu = dragX.interpolate({
      inputRange: [
        dragXMenuClosed,
        DEFAULT_ACTION_THRESHOLD - DEFAULT_ACTION_THRESHOLD_ANIMATION_OFFSET,
        DEFAULT_ACTION_THRESHOLD,
        screenWidth,
      ],
      outputRange: [
        0,
        0,
        DEFAULT_ACTION_THRESHOLD - ACTION_BTN_WIDTH,
        screenWidth - ACTION_BTN_WIDTH,
      ],
    });

    const colorButton = SWIPEABLE_LH_ACTION_BUTTONS[0].color;
    // noinspection UnnecessaryLocalVariableJS
    const colorMenu = colorButton; // Want background menu color the same as the only button color
    return (
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          backgroundColor: colorMenu,
        }}>
        <Animated.View
          style={{
            width: ACTION_BTN_WIDTH,
            transform: [{ translateX: xForSingleActionButtonInsideMenu }],
          }}>
          <RectButton
            style={{
              flex: 1,
              backgroundColor: colorButton,
              justifyContent: 'center',
            }}
            // onPress={this.actionButtonPressHandler.bind(this, "FART")}
            onPress={() =>
              this.actionButtonPressHandler(
                `Pressed action button ${SWIPEABLE_LH_ACTION_BUTTONS[0].text}`
              )
            }>
            <Text style={styles.actionText}>
              {SWIPEABLE_LH_ACTION_BUTTONS[0].text}
            </Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  rightAppleStylelActionMenuRender = (
    progress: Animated.Value,
    dragX: Animated.Value
  ) => {
    // Render a single action button in the RHS action menu
    const renderActionButton = (buttonConfigIdx: number) => {
      const buttonConfig = SWIPEABLE_RH_ACTION_BUTTONS[buttonConfigIdx];
      const zIndex = SWIPEABLE_RH_ACTION_BUTTONS.length - buttonConfigIdx;
      const screenWidth = widthPercentageToDP(100);
      const hiddenButtonWidth = screenWidth;

      console.debug('buttonConfig ', buttonConfig);
      const dragXMenuClosed = 0;
      const dragXMenuOpen =
        -SWIPEABLE_RH_ACTION_BUTTONS.length * ACTION_BTN_WIDTH;

      const xButtonFromEndMenuOpen =
        -buttonConfigIdx * ACTION_BTN_WIDTH + hiddenButtonWidth;
      const xButtonFromEndMenuClosed = ACTION_BTN_WIDTH + hiddenButtonWidth;
      console.debug('offset = ', xButtonFromEndMenuOpen);

      const xAbsoluteForButton =
        buttonConfigIdx === SWIPEABLE_DEFAULT_ACTION_IDX
          ? dragX.interpolate({
              inputRange: [
                -screenWidth,
                -DEFAULT_ACTION_THRESHOLD,
                dragXMenuOpen,
                dragXMenuClosed,
              ],
              outputRange: [
                ACTION_BTN_WIDTH,
                -DEFAULT_ACTION_THRESHOLD +
                  ACTION_BTN_WIDTH +
                  hiddenButtonWidth,
                xButtonFromEndMenuOpen,
                xButtonFromEndMenuClosed,
              ],
              extrapolate: 'clamp',
            })
          : dragX.interpolate({
              inputRange: [dragXMenuOpen, dragXMenuClosed],
              outputRange: [xButtonFromEndMenuOpen, xButtonFromEndMenuClosed],
            });

      return (
        <Animated.View
          style={{
            width: ACTION_BTN_WIDTH + hiddenButtonWidth,
            height: '100%',
            zIndex: zIndex,
            position: 'absolute', // Keep things sane when it comes to over laying the buttons
            transform: [
              {
                translateX: xAbsoluteForButton,
              },
            ],
          }}>
          <RectButton
            style={{
              flex: 1,
              backgroundColor: buttonConfig.color,
              justifyContent: 'center',
            }}
            // onPress={this.actionButtonPressHandler.bind(this, "FART")}
            onPress={() =>
              this.actionButtonPressHandler(
                `Pressed action button ${buttonConfig.text}`
              )
            }>
            <Text style={styles.actionText}>{buttonConfig.text}</Text>
          </RectButton>
        </Animated.View>
      );
    }; // End of renderActionButton()

    /* Three buttons that dragging out from the RHS*/
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row-reverse',
        }}>
        {renderActionButton(0)}
        {renderActionButton(1)}
        {renderActionButton(2)}
      </View>
    );
  };

  updateRef = (ref: Swipeable | null) => {
    this._swipeableRowRef = ref;
  };

  close = () => {
    this._swipeableRowRef && this._swipeableRowRef.close();
  };

  render() {
    return (
      <Swipeable
        ref={this.updateRef}
        friction={1}
        // containerStyle={his.props.rowContent}
        // childrenContainerStyle={this.props.rowSwipedContent}
        renderLeftActions={this.leftAppleStyleActionMenuRender}
        leftDefaultActionConfig={{
          onTrigger: () => {
            alert('Default Left action triggered');
            this.close();
          },
          threshold: DEFAULT_ACTION_THRESHOLD,
          menuWidth: SWIPEABLE_LH_ACTION_BUTTONS.length * ACTION_BTN_WIDTH,
        }}
        renderRightActions={this.rightAppleStylelActionMenuRender}
        rightDefaultActionConfig={{
          onTrigger: () => {
            alert('Default Right action triggered');
            this.close();
          },
          threshold: DEFAULT_ACTION_THRESHOLD,
          menuWidth: SWIPEABLE_RH_ACTION_BUTTONS.length * ACTION_BTN_WIDTH,
        }}
        useNativeAnimations={true}>
        {this.props.children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  leftAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'transparent',
    padding: 10,
  },
});

type Props = { children?: React.Node };
