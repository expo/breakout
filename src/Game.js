import React from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';

import Renderer from './Renderer';

const DeviceWidth = Dimensions.get('window').width;

export default class Game extends React.Component {
  state = {
    paddlePosition: new Animated.Value(0.5),
  }

  componentWillMount() {
    // These functions are called on touch and release of the view respectively.
    const touch = (_, gesture) => {
    };
    const release = (_, gesture) => {
    }

    const move = (_, gesture) => {
      Animated.spring(this.state.paddlePosition, {
        toValue: gesture.moveX / DeviceWidth,
        speed: 80,
        bounciness: 0,
      }).start();
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: touch,
      onPanResponderMove: move,
      onPanResponderRelease: release,
      onPanResponderTerminate: release,
      onShouldBlockNativeResponder: () => false,
    });
  }

  _onTick = (dt) => {
    // ?
  }

  render() {
    return (
      <Renderer
        panResponder={this._panResponder}
        paddlePosition={this.state.paddlePosition}
        onTick={this._onTick}
        style={{flex: 1}}
      />
    );
  }

}
