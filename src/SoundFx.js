import React from 'react';
import { Components } from 'exponent';
import {
  StyleSheet,
  View,
} from 'react-native';
import GameState from './GameState';

let soundKey = 0;

export default class SoundFx extends React.Component {
  state = {
    sounds: [],
  }

  componentDidMount() {
    GameState.addSoundListener(this.playSound);
  }

  playSound = (name) => {
    if (name === 'paddle') {
      this._start(this._paddle);
    } else if (name === 'death') {
      this._start(this._death);
    } else if (name === 'countdown') {
      this._start(this._countdown);
    } else {
      alert(`${name} not a recognized sound`);
    }
  }

  _start = (soundRef) => {
    soundRef.setNativeProps({paused: false});
    soundRef.seek(0);
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <View style={styles.container}>
        <Components.Video
          source={require('../assets/sounds/blip.wav')}
          key="paddle"
          ref={view => { this._paddle = view; }}
          repeat={false}
          paused={true}
        />

        <Components.Video
          source={require('../assets/sounds/brickDeath.mp3')}
          key="death"
          ref={view => { this._death = view; }}
          repeat={false}
          paused={true}
        />

        <Components.Video
          source={require('../assets/sounds/countdownBlip.mp3')}
          key="countdown"
          ref={view => { this._countdown = view; }}
          repeat={false}
          paused={true}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: 0,
    width: 0,
  },
});
