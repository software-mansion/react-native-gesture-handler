import React, {Component} from 'react';
import {StyleSheet, View, Animated, PanResponder} from 'react-native';

class Square {
  constructor(value, x, y, cellsSize) {
    this.value = value;
    this.pan = new Animated.ValueXY();
    this.cellsSize = cellsSize;
    this.boardSize = 3 * this.cellsSize;
    this.minXY = this.cellsSize * 0.5;
    this.maxXY = this.cellsSize * 1.5;
    this.constrainedX = this.pan.x.interpolate({
      inputRange: [this.minXY, 100, this.maxXY],
      outputRange: [this.minXY, 100, this.maxXY],
      extrapolate: 'clamp',
    });
    this.constrainedY = this.pan.y.interpolate({
      inputRange: [this.minXY, 100, this.maxXY],
      outputRange: [this.minXY, 100, this.maxXY],
      extrapolate: 'clamp',
    });
    this.pan.setValue({x, y});
    this.panResponder = this._buildPanResponder();
  }

  get valueString() {
    return this.value;
  }

  get panRef() {
    return this.pan;
  }

  get panResponderRef() {
    return this.panResponder;
  }

  _buildPanResponder() {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (event, gestureState) => {
        this.pan.setOffset({x: this.pan.x._value, y: this.pan.y._value});
      },
      onPanResponderMove: (event, gestureState) => {
        this.pan.setValue({x: gestureState.dx, y: gestureState.dy});
      },
      onPanResponderRelease: (event, gesture) => {
        this.pan.flattenOffset();
      },
    });
  }
}

export default class TestComponent extends Component {
  constructor(props) {
    super(props);

    this.cellsSize = 100;

    this.squares = [
      [
        undefined,
        new Square(
          'red',
          this.cellsSize * 1.5,
          this.cellsSize * 0.5,
          this.cellsSize,
        ),
      ],
      [
        new Square(
          'green',
          this.cellsSize * 0.5,
          this.cellsSize * 1.5,
          this.cellsSize,
        ),
        new Square(
          'blue',
          this.cellsSize * 1.5,
          this.cellsSize * 1.5,
          this.cellsSize,
        ),
      ],
    ];
  }

  renderACoin(value, file, rank) {
    if (value) {
      let style;
      switch (value.valueString) {
        case 'red':
          style = styles.redCoin;
          break;
        case 'green':
          style = styles.greenCoin;
          break;
        case 'blue':
          style = styles.blueCoin;
          break;
      }

      const coordsStyle = {
        top: this.cellsSize * (0.5 + rank),
        left: this.cellsSize * (0.5 + file),
      };

      return (
        <Animated.View
          style={StyleSheet.flatten([
            style,
            coordsStyle,
            {
              transform: [
                {translateX: value.constrainedX},
                {translateY: value.constrainedY},
              ],
            },
          ])}
          {...value.panResponderRef.panHandlers}
        />
      );
    }
  }

  renderAllCoins() {
    return this.squares.map((currRank, rankIndex) => {
      return currRank.map((cell, fileIndex) => {
        return this.renderACoin(
          this.squares[rankIndex][fileIndex],
          fileIndex,
          rankIndex,
        );
      });
    });
  }

  render() {
    return (
      <View style={styles.topLevel}>
        <View style={StyleSheet.flatten([styles.board])} ref="boardRoot">
          <View
            style={StyleSheet.flatten([
              styles.whiteCell,
              {
                left: 50,
                top: 50,
              },
            ])}
          />
          <View
            style={StyleSheet.flatten([
              styles.blackCell,
              {
                left: 150,
                top: 50,
              },
            ])}
          />
          <View
            style={StyleSheet.flatten([
              styles.blackCell,
              {
                left: 50,
                top: 150,
              },
            ])}
          />
          <View
            style={StyleSheet.flatten([
              styles.whiteCell,
              {
                left: 150,
                top: 150,
              },
            ])}
          />

          {this.renderAllCoins()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topLevel: {
    backgroundColor: '#CCFFCC',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  board: {
    width: 300,
    height: 300,
    backgroundColor: '#FFCCFF',
  },
  whiteCell: {
    width: 100,
    height: 100,
    backgroundColor: '#FFAA22',
    position: 'absolute',
  },
  blackCell: {
    width: 100,
    height: 100,
    backgroundColor: '#221122',
    position: 'absolute',
  },
  greenCoin: {
    width: 100,
    height: 100,
    position: 'absolute',
    backgroundColor: '#23CC12',
    borderRadius: 50,
  },
  redCoin: {
    width: 100,
    height: 100,
    position: 'absolute',
    backgroundColor: '#FF0000',
    borderRadius: 50,
  },
  blueCoin: {
    width: 100,
    height: 100,
    position: 'absolute',
    backgroundColor: '#0000FF',
    borderRadius: 50,
  },
});
