import Exponent, { Accelerometer, Gyroscope } from 'exponent';
import React from 'react';
import { Alert, Dimensions, PanResponder } from 'react-native';

const THREE = require('three');
const THREEView = Exponent.createTHREEViewClass(THREE);

const width = 4;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const height = (screenHeight / screenWidth) * width;

import Assets from '../assets';

function lowPass(input, output) {
  const ALPHA = 0.1;

  if (!output) {
    return { ...input };
  }
  output.x = output.x + ALPHA * (input.x - output.x);
  return output;
}

export default class Renderer extends React.Component {
  _rotateX = 0;

  componentWillMount() {
    this._initializeScene();
    this._addGyroscopeListener();
    this._addLighting();
    this._addPaddle();
    this._addBall();
    this._addGrid();
  }

  shouldComponentUpdate() {
    return false;
  }

  _addGyroscopeListener() {
    // let lastSample = new Date();

    // Accelerometer.setUpdateInterval(16.6);
    // Accelerometer.addListener(e => {
    //   let dt = 0.16;

    //   this._currentAccelerometerVal = lowPass(e, this._currentAccelerometerVal);

    //   const alpha = dt / (.3 + dt);
    //   const smoothedVx = (alpha * this._currentAccelerometerVal.x * 5000) + (1.0 - alpha);

    //   this._rotateX = smoothedVx * dt;
    // });
  }

  componentWillUnmount() {
    Accelerometer.removeAllListeners();
  }

  _initializeScene = () => {
    this._camera = new THREE.OrthographicCamera(
      0,      // Left
      width,  // Right
      0,      // Top
      height, // Bottom
      1,      // Near
      10000,  // Far
    );

    // this._camera.position.x = 1;
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
    const geometry = new THREE.BoxGeometry(width, height, width, 5, 5, 5);
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

    mesh.position.set(width / 2, height / 2, 0);
    this._scene.add(mesh);
  }

  _addPaddle = () => {
    const geometry = new THREE.BoxGeometry(1, 0.2, 1);
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

  _addBall = () => {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      shading: THREE.FlatShading
    })
    const sphere = new THREE.Mesh( geometry, material );

    sphere.position.set(width / 2, height / 2 , 5);
    this._scene.add(sphere);
  }

  _updatePaddlePosition() {
    this._paddle.position.set(
      // width * 0.5,
      width * this.props.paddlePosition.__getValue(),
      height - 0.5,
      5,
    );

    // let rotation = (this.props.paddlePosition.__getValue() - 0.5) * 0.1;

    // this._camera.position.x = rotation;
    // this._camera.position.y = -rotation;
    // this._scene.rotation.z = rotation;
    // this._scene.rotation.x = -rotation;
    this._scene.rotation.y = this._rotateX / 100.0;
  }

  _tick = (dt) => {
    // Do our own stuff if we want to
    this._updatePaddlePosition();

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
