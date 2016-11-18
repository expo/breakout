import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import GameRenderer from './GameRenderer';
import GameState from './GameState';

export default class Game extends React.Component {
  state = {
    gameOver: false,
  }

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

  _onTick = (dt) => {
    if (GameState.isGameOver()) {
      this.setState({gameOver: true});
    }

    let { timeElapsed } = GameState.state;

    if (this.state.countdown !== 0) {
      let countdown = Math.max(0, Math.ceil(GameState.CountdownMax - timeElapsed));

      if (countdown !== this.state.countdown) {
        this.setState({countdown});
      }
    }
  }

  _startNewGame = () => {
    GameState.restart();
    this.setState({gameOver: false, countdown: 3});
  }

  _handleMove = (_, gesture) => {
    GameState.movePaddleTo(
      gesture.moveX / Dimensions.get('window').width,
      gesture.vx,
    );
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000'}}>

        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator />
        </View>

        <GameRenderer
          panResponder={this._panResponder}
          onTick={this._onTick}
          style={{flex: 1}}
        />

        { this.state.gameOver && <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}]}>
            <Text style={{color: '#fff', fontSize: 90, fontWeight: 'bold'}} onPress={this._startNewGame}>
              GAME OVER. Try again?
            </Text>
          </View> }

        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}]} pointerEvents="none">
          <Text style={{color: '#fff', fontSize: 120, fontWeight: 'bold'}}>
            {this.state.countdown > 0 ? this.state.countdown : ''}
          </Text>
        </View>

        <StatusBar hidden={true} />
      </View>
    );
  }
}
