import Exponent from 'exponent';
import React from 'react';
import { Alert, Dimensions, PanResponder } from 'react-native';

const THREE = require('three');
const THREEView = Exponent.createTHREEViewClass(THREE);

import Assets from '../assets';
import GameDimensions from './GameDimensions';
import GameState from './GameState';

const { ForegroundZ } = GameDimensions;

export default class GameRenderer extends React.Component {
  _ballMeshes = {};
  _brickMeshes = {};

  componentWillMount() {
    this._initializeScene();
    this._addLighting();
    this._addPaddle();
    this._addGrid();
  }

  shouldComponentUpdate() {
    return false;
  }

  _initializeScene = () => {
    const { SceneWidth, SceneHeight } = GameDimensions;
    this._camera = new THREE.OrthographicCamera(
      0,           // Left
      SceneWidth,  // Right
      0,           // Top
      SceneHeight, // Bottom
      1,           // Near
      10000,       // Far
    );

    this._camera.position.z = 50;
    this._scene = new THREE.Scene();
  }

  _addLighting = () => {
    let lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 0, 0);
    lights[1].position.set(4, 4, 50);
    lights[2].position.set(4, 0, -50);

    this._scene.add(lights[0]);
    this._scene.add(lights[1]);
    this._scene.add(lights[2]);
  }

  _addGrid = () => {
    const { SceneWidth, SceneHeight } = GameDimensions;
    const geometry = new THREE.BoxGeometry(SceneWidth, SceneHeight, SceneWidth, 5, 5, 5);
    const mesh = new THREE.Object3D();

    mesh.add(new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.3
      })
    ));

    mesh.add(new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0x000000
      })
    ));

    mesh.position.set(SceneWidth / 2, SceneHeight / 2, 0);
    this._scene.add(mesh);
  }

  _addPaddle = () => {
    const { Width, Height } = GameDimensions.Paddle;
    const geometry = new THREE.BoxGeometry(Width, Height, 1);
    const mesh = new THREE.Object3D();

    mesh.add(new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading
      })
    ));

    this._paddle = mesh;
    this._updatePaddlePosition();
    this._scene.add(mesh);
  }

  _addBall = (ball) => {
    const { Radius } = GameDimensions.Ball;
    const geometry = new THREE.SphereGeometry(Radius, 5, 5);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff7d00,
      emissive: 0x905407,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    })
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(ball.ballX, ball.ballY, ForegroundZ);
    this._scene.add(mesh);
    return mesh;
  }

  _updatePaddlePosition() {
    const { SceneWidth, SceneHeight } = GameDimensions;
    const { BottomOffset } = GameDimensions.Paddle;

    this._paddle.position.set(
      SceneWidth * GameState.getPaddleXValue(),
      SceneHeight - BottomOffset,
      ForegroundZ,
    );

    let rotation = (GameState.getPaddleXValue() - 0.5) * 0.1;
    this._scene.rotation.y = -rotation;
  }

  _addBrick = (brick) => {
    const { Width, Height } = GameDimensions.Brick;
    const geometry = new THREE.BoxGeometry(Width, Height, 1);
    const mesh = new THREE.Object3D();

    mesh.add(new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        shading: THREE.FlatShading
      })
    ));

    this._scene.add(mesh);
    mesh.position.set(brick.brickX, brick.brickY, ForegroundZ);

    return mesh;
  }

  _updateBricks(dt) {
    const { bricks } = GameState.state;

    if (bricks.length < Object.keys(this._brickMeshes).length) {
      let ids = bricks.map(brick => brick.id);

      Object.keys(this._brickMeshes).forEach((key) => {
        if (ids.indexOf(key) === -1) {
          this._scene.remove(this._brickMeshes[key]);
          delete this._brickMeshes[key];
        }
      });
    }

    bricks.forEach(brick => {
      let brickMesh = this._brickMeshes[brick.id];

      if (!brickMesh) {
        brickMesh = this._addBrick(brick);
        this._brickMeshes[brick.id] = brickMesh;
      }
    });
  }

  _updateBallPositions(dt) {
    const { balls } = GameState.state;

    if (balls.length < Object.keys(this._ballMeshes).length) {
      let ids = balls.map(ball => ball.id);

      Object.keys(this._ballMeshes).forEach((key) => {
        if (ids.indexOf(key) === -1) {
          this._scene.remove(this._ballMeshes[key]);
          delete this._ballMeshes[key];
        }
      });
    }

    balls.forEach(ball => {
      let { id, ballX, ballY } = ball;
      let ballMesh = this._ballMeshes[id];

      if (!ballMesh) {
        ballMesh = this._addBall(ball);
        this._ballMeshes[id] = ballMesh;
      }

      ballMesh.position.set(
        ballX,
        ballY,
        ForegroundZ,
      );
    });
  }

  _spinBalls = (dt) => {
    Object.values(this._ballMeshes).forEach(ball => {
      ball.rotation.x += dt * 2;
    });
  }

  _tick = (dt) => {
    GameState.tick(dt);

    this._updateBricks(dt);
    this._updatePaddlePosition(dt);
    this._updateBallPositions(dt);
    this._spinBalls(dt);
    this.props.onTick(dt);
  }

  render() {
    return (
      <THREEView
        {...this.props.panResponder.panHandlers}
        style={this.props.style}
        scene={this._scene}
        camera={this._camera}
        tick={this._tick}
      />
    );
  }
};

function lowPass(input, output) {
  const ALPHA = 0.1;

  if (!output) {
    return { ...input };
  }
  output.x = output.x + ALPHA * (input.x - output.x);
  return output;
}
