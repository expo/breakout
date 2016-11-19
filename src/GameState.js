import { Animated } from 'react-native';
import GameDimensions from './GameDimensions';
const { SceneWidth, SceneHeight } = GameDimensions;

const ScorePerBrick = 100;
let entityId = 0;

function random(x, y) {
  return Math.floor(Math.random() * ((y-x) + 1) + x);
}

const RowStyles = [
  [ 0.7, 1.2, 1.7, 2.2, 2.7, 3.2, ],
  [ 1.2, 1.7, 2.2, 2.7, ],
  [ 0.7, 1.7, 2.2, 3.2, ],
  [ 0.95, 2.95, ],
  [ 0.7, 1.2, 2.7, 3.2, ],
  [ 1.95, ],
];

function createBrickRow(style, rowNumber) {
  let y = 0.85 + (rowNumber - 1) * 0.3;
  return style.map(x => newBrick(x, y));
}

function newBrickLayout() {
  let numRows = random(5, 6);
  let layout = [];

  for (var i = 0; i < numRows; i++) {
    let idx = random(0, RowStyles.length - 1);
    let row = createBrickRow(RowStyles[idx], i + 1);
    layout = [...layout, ...row];
  }

  return layout;
}

function randomColor() {
  return eval(`0x${Math.floor(Math.random()*16777215).toString(16)}`);
}

function newBrick(x, y) {
  entityId++;

  return {
    id: entityId,
    color: randomColor(),
    brickX: x,
    brickY: y,
    brickLeft: x - (GameDimensions.Brick.Width / 2),
    brickRight: x + (GameDimensions.Brick.Width / 2),
    brickTop: y - (GameDimensions.Brick.Height / 2),
    brickBottom: y + (GameDimensions.Brick.Height / 2),
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
    level: 1,
    bricks: newBrickLayout(),
    score: 0,
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

    if (this.state.bricks.length === 0) {
      this._proceedToNextLevel();
    }

    if (this.state.balls.length === 0) {
      this.state.gameOver = true;
    }
  }

  _proceedToNextLevel() {
    this.state.level += 1;
    this.state.balls = [newBall()];
    this.state.timeElapsed = 0;
    this.state.bricks = newBrickLayout();
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

    let updatedScore = this.state.score;
    let updatedBricks = this.state.bricks;
    let updatedBalls = this.state.balls.map(ball => {
      let { ballY, ballX, ballVy, ballVx } = ball;
      let ballBottom = ballY + Radius;
      let ballTop = ballY - Radius;
      let ballLeft = ballX - Radius;
      let ballRight = ballX + Radius;
      let ballMiddle = ballX;

      if (ballBottom >= SceneHeight) {
        return null;
      }

      if (ballTop <= 0 && ballVy < 0) {
        ball.ballVy = -ballVy;
        return ball;
      } else if ((ballLeft <= 0 && ballVx < 0) || (ballRight >= SceneWidth && ballVx > 0)) {
        ball.ballVx = -ballVx;
        return ball;
      }

      const paddleCollidesWithBall = paddleCollides.bind(this, ballTop, ballRight, ballBottom, ballLeft);
      if (paddleCollidesWithBall(paddleTop, paddleRight, paddleBottom, paddleLeft)) {
        ball.ballVy = -ballVy;

        let placementFactor;
        if (ballMiddle < paddleMiddle) {
          placementFactor = -((paddleMiddle - ballMiddle) / (GameDimensions.Paddle.Width / 2));
        } else if (ballMiddle > paddleMiddle) {
          placementFactor = ((ballMiddle - paddleMiddle) / (GameDimensions.Paddle.Width / 2));
        } else {
          placementFactor = 0;
        }

        ball.ballVx = placementFactor * 5;

        return ball;
      }

      const brickCollidesWithBall = brickCollides.bind(this, ballTop, ballRight, ballBottom, ballLeft);
      let hasHitBrick = false;
      updatedBricks = updatedBricks.map(brick => {
        if (hasHitBrick) {
          return brick;
        }

        if (brickCollidesWithBall(brick.brickTop, brick.brickRight, brick.brickBottom, brick.brickLeft)) {
          hasHitBrick = true;
          let brickMiddle = brick.brickX;
          let placementFactor;

          if (ballMiddle < brickMiddle) {
            placementFactor = -((brickMiddle - ballMiddle) / (GameDimensions.Brick.Width / 2));
          } else if (ballMiddle > brickMiddle) {
            placementFactor = ((ballMiddle - brickMiddle) / (GameDimensions.Brick.Width / 2));
          } else {
            placementFactor = 0;
          }

          ball.ballVy = -ballVy;
          ball.ballVx = placementFactor * (3 + this.state.level / 2);
          updatedScore += ScorePerBrick;
          return null;
        }

        return brick;
      }).filter(brick => brick !== null);

      return ball;
    }).filter(ball => ball !== null);

    this.state.score = updatedScore;
    this.state.bricks = updatedBricks;
    this.state.balls = updatedBalls;
  }

  getPaddleXValue() {
    return this.state.paddleX.__getValue();
  }

  getScore() {
    return this.state.score;
  }

  getLevel() {
    return this.state.level;
  }
}

function paddleCollides(ballTop, ballRight, ballBottom, ballLeft, paddleTop, paddleRight, paddleBottom, paddleLeft) {
  return (ballTop <= paddleTop &&
          ballBottom >= paddleTop &&
          ballRight >= paddleLeft &&
          ballLeft <= paddleRight);
}

function brickCollides(ballTop, ballRight, ballBottom, ballLeft, brickTop, brickRight, brickBottom, brickLeft) {
  if (ballTop   <= brickBottom &&
      ballTop   >= brickTop &&
      ballRight >= brickLeft &&
      ballLeft  <= brickRight) {
    return true;
  } else if (ballBottom >= brickTop &&
             ballBottom <= brickBottom &&
             ballRight >= brickLeft &&
             ballLeft  <= brickRight) {
    return true;
  } else {
    return false;
  }
}
export default new GameState;
