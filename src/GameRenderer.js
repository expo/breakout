import Exponent from 'exponent';
import React from 'react';
import { Alert, Dimensions, PanResponder } from 'react-native';

const THREE = require('three');
const THREEView = Exponent.createTHREEViewClass(THREE);

import Assets from '../assets';
import GameDimensions from './GameDimensions';

const ForegroundZ = 5;

export default class GameRenderer extends React.Component {
  _balls = {};

  componentWillMount() {
    this._initializeScene();
    this._addLighting();
    this._addPaddle();
    this._addGrid();
  }

  componentWillUnmount() {
    Accelerometer.removeAllListeners();
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
        opacity: 0.5
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
    const { SceneWidth, SceneHeight } = GameDimensions;
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
      SceneWidth * this.props.paddleX.__getValue(),
      SceneHeight - BottomOffset,
      ForegroundZ,
    );

    let rotation = (this.props.paddleX.__getValue() - 0.5) * 0.1;
    this._scene.rotation.y = -rotation;
  }

  _updateBallPositions(dt) {
    const { balls } = this.props.balls;

    if (this.props.balls.length < Object.keys(this._balls).length) {
      let ids = this.props.balls.map(ball => ball.id);

      Object.keys(this._balls).forEach((key) => {
        if (ids.indexOf(key) === -1) {
          this._scene.remove(this._balls[key]);
          delete this._balls[key];
        }
      });
    }

    this.props.balls.forEach(ball => {
      let { id, ballX, ballY } = ball;
      let ballMesh = this._balls[id];

      if (!ballMesh) {
        ballMesh = this._addBall(ball);
        this._balls[id] = ballMesh;
      }

      ballMesh.position.set(
        ballX,
        ballY,
        ForegroundZ,
      );
    });
  }

  _spinBalls = (dt) => {
    Object.values(this._balls).forEach(ball => {
      ball.rotation.x += dt * 2;
    });
  }

  _tick = (dt) => {
    // Do our own stuff if we want to
    this._updatePaddlePosition(dt);
    this._updateBallPositions(dt);
    this._spinBalls(dt);

    // Then call on props
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
