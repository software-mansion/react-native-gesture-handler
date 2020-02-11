import React, { Component, useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';

import {
  PanGestureHandler,
  ScrollView,
  State,
  DragGestureHandler,
  DropGestureHandler
} from 'react-native-gesture-handler';

import { USE_NATIVE_DRIVER } from '../config';
import { LoremIpsum } from '../common';

export class DraggableBox extends Component {
  constructor(props) {
    super(props);
    this._translateX = new Animated.Value(0);
    this._translateY = new Animated.Value(0);
    this._lastOffset = { x: 0, y: 0 };
    this._onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this._translateX,
            translationY: this._translateY,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
  }
  _onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastOffset.x += event.nativeEvent.translationX;
      this._lastOffset.y += event.nativeEvent.translationY;
      this._translateX.setOffset(this._lastOffset.x);
      this._translateX.setValue(0);
      this._translateY.setOffset(this._lastOffset.y);
      this._translateY.setValue(0);
    }
  };


  _panRef = React.createRef();
  _dragRef = React.createRef();

  render() {
    return (

      <PanGestureHandler
        onGestureEvent={this._onGestureEvent}
        onHandlerStateChange={this._onHandlerStateChange}
        ref={this._panRef}
        waitFor={this._dragRef}
        enabled={false}
      >
        <Animated.View collapsable={false}>
          <DragGestureHandler
            ref={this._dragRef}
            //simultaneousHandlers={this._panRef}
            type={[0]}
            {...this.props}
            data={{ a: 'b' }}
            onGestureEvent={e => console.log(e.nativeEvent)}
            onHandlerStateChange={e => console.log('drag', e.nativeEvent)}
          //enabled={false}
          >
            <Animated.View
              style={[
                styles.box,
                {
                  transform: [
                    { translateX: this._translateX },
                    { translateY: this._translateY },
                  ],
                },
                this.props.boxStyle,
              ]}
            />
          </DragGestureHandler>
        </Animated.View>
      </PanGestureHandler>


    );
  }
}

export default function DragExample(props) {
  const scrollRef = useRef();
  const dragRef = useRef();
  const [dropState, setDropState] = useState(0);
  const [isInside, move] = useState(false);
  const cb = useCallback(e => {
    const d = e.nativeEvent.dragState;
    console.log(e.nativeEvent)
    setDropState(d);
    if (d === 5) {
      move(true)
    } else if (d === 6) {
      move(false)
    }
  });

  console.log(isInside)
  return (
    <ScrollView
      style={styles.scrollView}
      ref={scrollRef}
      simultaneousHandlers={dragRef}
    >
      <LoremIpsum words={40} />
      <DragGestureHandler
        ref={dragRef}
        //simultaneousHandlers={scrollRef}
        type={[0]}
        data={{ a: 'b' }}
        //onGestureEvent={e => console.log('dragG', e.nativeEvent.dragState)}
        //onHandlerStateChange={e => console.log('drag', e.nativeEvent.dragState)}
        onHandlerStateChange={e => e.nativeEvent.state === State.BEGAN && move(false)}
      //enabled={false}
      >
        <Animated.View
          style={[
            styles.box,
            props.boxStyle
          ]}
        >
          <Text>Drag Me</Text>
        </Animated.View>
      </DragGestureHandler>
      <LoremIpsum words={40} />
      <DropGestureHandler
        type={0}
        onGestureEvent={cb}
        onHandlerStateChange={cb}
      >
        <Animated.View
          style={[
            styles.box,
            props.boxStyle,
            isInside && { backgroundColor: dropState === 3 ? 'blue' : 'red' },
          ]}
        >
          <Text>{isInside && dropState === 3 ? `THANKS` : `Drop Here or don't`}</Text>
        </Animated.View>
      </DropGestureHandler>
      <LoremIpsum />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    backgroundColor: 'plum',
    margin: 10,
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
