import React from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';

import GameRenderer from './GameRenderer';
const DeviceWidth = Dimensions.get('window').width;

function newGameState() {
  return {
    paddlePosition: 0.5,
  };
}

export default class Game extends React.Component {

  constructor(props) {
    super(props);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => true,
      onPanResponderMove: this._handleMove,
      onPanResponderRelease: () => true,
      onPanResponderTerminate: () => true,
      onShouldBlockNativeResponder: () => false,
    });
  }

  state = {
    paddlePosition: new Animated.Value(0.5),
  }

  _handleMove = (_, gesture) => {
    Animated.spring(this.state.paddlePosition, {
      toValue: gesture.moveX / DeviceWidth,
      vx: gesture.vx,
      speed: 80,
      bounciness: 0,
    }).start();
  }

  componentWillMount() {
    this._startNewGame();
  }


  _startNewGame = () => {
  }

  _onTick = (dt) => {
    // ?
  }

  render() {
    return (
      <GameRenderer
        panResponder={this._panResponder}
        paddlePosition={this.state.paddlePosition}
        onTick={this._onTick}
        style={{flex: 1}}
      />
    );
  }

}
