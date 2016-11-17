import Exponent from 'exponent';
import React from 'react';
import { Alert, Dimensions, PanResponder } from 'react-native';

const THREE = require('three');
const THREEView = Exponent.createTHREEViewClass(THREE);

const width = 4;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const height = (screenHeight / screenWidth) * width;

import Assets from '../assets';

export default class Scene extends React.Component {

  componentWillMount() {
    this._initializeScene();
    this._addLighting();
    this._addPaddle();
    this._addBall();
    this._addGrid();
  }

  shouldComponentUpdate() {
    return false;
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

    this._camera.position.z = 1000;
    try {
      console.log('rotation:');
      console.log(this._camera.rotation);
      // this._camera.rotation.x = 1.5;
    } catch(e) {
      alert('hi');
    }
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
    const geometry = new THREE.PlaneBufferGeometry(width, height, 15, 15);
    const mesh = new THREE.Object3D();

    mesh.add(new THREE.LineSegments(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5
      })
    ));

    mesh.position.set(width / 2, height / 2, 0);
    this._scene.add(mesh);
  }

  _addPaddle = () => {
    const geometry = new THREE.PlaneBufferGeometry(1, 0.2);
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
    const geometry = new THREE.SphereGeometry( 0.1, 32, 32 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const sphere = new THREE.Mesh( geometry, material );

    sphere.position.set(width / 2, height / 2 , 1);
    this._scene.add(sphere);
  }

  _updatePaddlePosition() {
    this._paddle.position.set(
      width * this.props.paddlePosition.__getValue(),
      height - 0.5, 1,
    );

    // this._camera.rotation.x = 0.009;
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
