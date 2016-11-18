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
    countdown: null,
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
    this.setState({
      gameOver: false,
      countdown: GameState.CountdownMax,
    });
  }

  _handleMove = (_, gesture) => {
    GameState.movePaddleTo(
      gesture.moveX / Dimensions.get('window').width,
      gesture.vx,
    );
  }

  render() {
    return (
      <View style={styles.container}>
        { this.state.countdown === null && <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View> }

        <GameRenderer
          panResponder={this._panResponder}
          onTick={this._onTick}
          style={{flex: 1}}
        />

        { this.state.gameOver && <View style={styles.gameOverContainer}>
            <Text style={styles.gameOverText} onPress={this._startNewGame}>
              Game over! Tap to play again.
            </Text>
          </View> }

        <View style={styles.countdownContainer} pointerEvents="none">
          <Text style={styles.countdownText}>
            {this.state.countdown > 0 ? this.state.countdown : ''}
          </Text>
        </View>

        <StatusBar hidden={true} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  gameOverText: {
    color: '#fff',
    fontSize: 80,
    lineHeight: 85,
    fontWeight: 'bold',
  },
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  countdownText: {
    color: '#fff',
    fontSize: 120,
    fontWeight: 'bold',
  },
});
