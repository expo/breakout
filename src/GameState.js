import { Animated } from 'react-native';
import GameDimensions from './GameDimensions';
const { SceneWidth, SceneHeight } = GameDimensions;

let entityId = 0;

function newBricksForLevel(level) {
  return [
    newBrick(0.7, 1),
    newBrick(1.2, 1),
    newBrick(1.7, 1),
    newBrick(2.2, 1),
    newBrick(2.7, 1),
    newBrick(3.2, 1),

    newBrick(1.2, 1.3),
    newBrick(1.7, 1.3),
    newBrick(2.2, 1.3),
    newBrick(2.7, 1.3),

    newBrick(1.2, 1.6),
    newBrick(1.7, 1.6),
    newBrick(2.2, 1.6),
    newBrick(2.7, 1.6),

    newBrick(0.7, 1.9),
    newBrick(1.2, 1.9),
    newBrick(1.7, 1.9),
    newBrick(2.2, 1.9),
    newBrick(2.7, 1.9),
    newBrick(3.2, 1.9),
  ];
}

function newBrick(x, y) {
  entityId++;

  return {
    id: entityId,
    brickX: x,
    brickY: y,
  };
}

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
    timeElapsed: 0.0,
    paddleX: new Animated.Value(0.5),
    balls: [newBall()],
    gameOver: false,
    level: 0,
    bricks: newBricksForLevel(0),
  };
}

class GameState {
  CountdownMax = 3.0;

  state = newGameState();

  isGameOver() {
    return this.state.gameOver;
  }

  setState(nextState) {
    this.state = Object.assign(this.state, nextState);
  }

  restart() {
    this.state = newGameState();
  }

  tick(dt) {
    if (dt > 0.5) {
      return;
    }

    this.state.timeElapsed += dt;

    if (this.state.timeElapsed < this.CountdownMax) {
      return;
    }

    this._checkForCollisions(dt);
    this._updateBallPositions(dt);

    if (this.state.balls.length === 0) {
      this.state.gameOver = true;
    }
  }

  movePaddleTo(toValue, vx) {
    Animated.spring(this.state.paddleX, {
      toValue,
      vx,
      speed: 80,
      bounciness: 0,
    }).start();
  }

  addAnotherBall = () => {
    this.state.balls.push(newBall());
  }

  _updateBallPositions = (dt) => {
    this.state.balls.forEach(ball => {
      /* When particularly laggy this can cause problems if we
       * don't just assume dt is 0.016 -- it can jump into the middle
       * of an object for example. */
      ball.ballY = ball.ballY + ball.ballVy * 0.016;
      ball.ballX = ball.ballX + ball.ballVx * 0.016;
    });
  }

  _checkForCollisions = () => {
    const { Radius } = GameDimensions.Ball;

    let paddleX = this.getPaddleXValue() * SceneWidth;
    let paddleY = GameDimensions.Paddle.Y;

    let paddleRight = paddleX + GameDimensions.Paddle.Width / 2;
    let paddleLeft = paddleX - GameDimensions.Paddle.Width / 2;
    let paddleBottom = paddleY + GameDimensions.Paddle.Height / 2;
    let paddleTop = paddleY - GameDimensions.Paddle.Height / 2;
    let paddleMiddle = paddleX;

    updatedBalls = this.state.balls.map(ball => {
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

    this.state.balls = updatedBalls.filter(ball => ball !== null);
  }

  getPaddleXValue() {
    return this.state.paddleX.__getValue();
  }
}

export default new GameState;
