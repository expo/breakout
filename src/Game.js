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
import GameDimensions from './GameDimensions';
const { SceneWidth, SceneHeight } = GameDimensions;

let entityId = 0;
function newBall(x = SceneWidth / 2, y = SceneHeight / 2, vx = 0.1, vy = 5) {
  entityId++;

  return {
    id: entityId,
    ballVy: vy,
    ballVx: vx,
    ballX: x,
    ballY: y,
  }
}

function newGameState() {
  return {
    countdown: 4,
    paddleX: new Animated.Value(0.5),
    balls: [newBall()],
    gameOver: false,
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

    if (timeElapsed < 4) {
      timeElapsed += dt;

      if (3 - Math.floor(timeElapsed) !== this.state.countdown) {
        this.setState({countdown: 4 - Math.floor(timeElapsed)});
      }
      return;
    }

    let balls = this._checkForCollisions(this._updateBallPositions(dt));
    if (balls.length === 0) {
      this.setState({gameOver: true});
    } else {
      this.setState({balls});
    }
  }

  _startNewGame = () => {
    timeElapsed = 0;
    this.setState(newGameState());
  }

  _updateBallPositions = (dt) => {
    let balls = this.state.balls.map(ball => {
      let { ballX, ballY, ballVy, ballVx } = ball;

      /* When particularly laggy this can cause problems if we
       * don't just assume dt is 0.016 -- it can jump into the middle
       * of an object for example. */
      ball.ballY = ballY + ballVy * 0.016;
      ball.ballX = ballX + ballVx * 0.016;
      return ball;
    });

    return balls;
  }

  _checkForCollisions = (balls) => {
    const { Radius } = GameDimensions.Ball;

    let paddleX = this.state.paddleX.__getValue() * SceneWidth;
    let paddleY = GameDimensions.Paddle.Y;

    let paddleRight = paddleX + GameDimensions.Paddle.Width / 2;
    let paddleLeft = paddleX - GameDimensions.Paddle.Width / 2;
    let paddleBottom = paddleY + GameDimensions.Paddle.Height / 2;
    let paddleTop = paddleY - GameDimensions.Paddle.Height / 2;
    let paddleMiddle = paddleX;

    updatedBalls = balls.map(ball => {
      let { ballY, ballX, ballVy, ballVx } = ball;
      let ballBottom = ballY + Radius;
      let ballTop = ballY - Radius;
      let ballLeft = ballX - Radius;
      let ballRight = ballX + Radius;
      let ballMiddle = ballX;

      if (ballBottom >= SceneHeight) {
        return null;
      }

      // Paddle
      if (ballTop <= paddleTop && ballBottom >= paddleTop && ballRight >= paddleLeft && ballLeft <= paddleRight) {
        ballVy = -ballVy;

        let placementFactor;
        if (ballMiddle < paddleMiddle) {
          placementFactor = -((paddleMiddle - ballMiddle) / (GameDimensions.Paddle.Width / 2));
        } else if (ballMiddle > paddleMiddle) {
          placementFactor = ((ballMiddle - paddleMiddle) / (GameDimensions.Paddle.Width / 2));
        } else {
          placementFactor = 0;
        }

        ballVx = placementFactor * 5;
      } else {
        if (ballTop <= 0 && ballVy < 0) {
          ballVy = -ballVy;
        } else if ((ballLeft <= 0 && ballVx < 0) || (ballRight >= SceneWidth && ballVx > 0)) {
          ballVx = -ballVx;
        }
      }

      return { ...ball, ballVy, ballVx };
    });

    return updatedBalls.filter(ball => ball !== null);
  }

  _handleMove = (_, gesture) => {
    Animated.spring(this.state.paddleX, {
      toValue: gesture.moveX / Dimensions.get('window').width,
      vx: gesture.vx,
      speed: 80,
      bounciness: 0,
    }).start();
  }

  _addAnotherBall = () => {
    let balls = [...this.state.balls, newBall()];
    this.setState({balls});
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#000'}}>

        <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
          <ActivityIndicator />
        </View>

        <GameRenderer
          balls={this.state.balls}
          paddleX={this.state.paddleX}
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
            {this.state.countdown > 0 && this.state.countdown < 4 ? this.state.countdown : ''}
          </Text>
        </View>

        <StatusBar hidden={true} />
      </View>
    );
  }
}
