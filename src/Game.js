import React from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  View,
  StyleSheet,
  Text,
} from 'react-native';

import GameRenderer from './GameRenderer';
import GameDimensions from './GameDimensions';
const DeviceWidth = Dimensions.get('window').width;

function newGameState() {
  return {
    countdown: 3,
    paddleX: new Animated.Value(0.5),
    ballVy: 5,
    ballVx: 0.1,
    ballX: GameDimensions.SceneWidth / 2,
    ballY: GameDimensions.SceneHeight / 2,
  };
}

let timeElapsed = 0;

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

  state = newGameState();

  _onTick = (dt) => {
    if (dt > 1 && this.state.countdown > 0) {
      return;
    }

    if (timeElapsed < 3) {
      timeElapsed += dt;

      if (3 - Math.floor(timeElapsed) !== this.state.countdown) {
        this.setState({countdown: 3 - Math.floor(timeElapsed)});
      }
      return;
    }

    let { ballX, ballY } = this._updateBallPosition(dt);
    let { ballVy, ballVx } = this._checkForCollisions(ballX, ballY);

    this.setState({ballX, ballY, ballVy, ballVx});
  }

  componentWillMount() {
    this._startNewGame();
  }

  _startNewGame = () => {
  }

  _updateBallPosition = (dt) => {
    let { ballX, ballY, ballVy, ballVx } = this.state;
    ballY = ballY + ballVy * dt;
    ballX = ballX + ballVx * dt;

    return { ballX, ballY };
  }

  _checkForCollisions = (ballX, ballY) => {
    const { Radius } = GameDimensions.Ball;
    let { ballVy, ballVx } = this.state;

    let paddleX = this.state.paddleX.__getValue() * GameDimensions.SceneWidth;
    let paddleY = GameDimensions.Paddle.Y;

    let ballBottom = ballY + Radius;
    let ballTop = ballY - Radius;
    let ballLeft = ballX - Radius;
    let ballRight = ballX + Radius;

    let paddleRight = paddleX + GameDimensions.Paddle.Width / 2;
    let paddleLeft = paddleX - GameDimensions.Paddle.Width / 2;
    let paddleBottom = paddleY + GameDimensions.Paddle.Height / 2;
    let paddleTop = paddleY - GameDimensions.Paddle.Height / 2;

    // Paddle
    if (ballBottom >= paddleTop && ballBottom < paddleBottom &&
        ((ballRight >= paddleLeft && ballRight <= paddleRight))) {
      ballVy = -ballVy;
      ballVx = -ballVx;
    }

    if (ballTop <= 0 || ballLeft <= 0 || ballRight >= GameDimensions.SceneWidth || ballBottom >= GameDimensions.SceneHeight) {
      ballVy = -ballVy;
      ballVx = -ballVx;
    }

    return { ballVy, ballVx };
  }

  _handleMove = (_, gesture) => {
    Animated.spring(this.state.paddleX, {
      toValue: gesture.moveX / DeviceWidth,
      vx: gesture.vx,
      speed: 80,
      bounciness: 0,
    }).start();
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <GameRenderer
          ballX={this.state.ballX}
          ballY={this.state.ballY}
          paddleX={this.state.paddleX}
          panResponder={this._panResponder}
          onTick={this._onTick}
          style={{flex: 1}}
        />

        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}]} pointerEvents="none">
          <Text style={{color: '#fff', fontSize: 120, fontWeight: 'bold', backgroundColor: 'transparent'}}>
            {this.state.countdown > 0 ? this.state.countdown : ''}
          </Text>
        </View>
      </View>
    );
  }
}
