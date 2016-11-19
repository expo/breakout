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
    activeSounds: [],
  }

  componentDidMount() {
    GameState.addSoundListener(this.playSound);
  }

  playSound = (asset) => {
    soundKey++;
    let sound = {asset, id: soundKey};
    let { activeSounds } = this.state;
    activeSounds = [...activeSounds, sound];
    this.setState({activeSounds});
  }

  _soundFinished = (sound) => {
    let { activeSounds } = this.state;
    let idx = activeSounds.indexOf(sound);
    activeSounds = activeSounds.splice(idx, 1);
    this.setState({activeSounds});
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.activeSounds.map(sound => {
          return (
            <Components.Video
              source={sound.asset}
              repeat={false}
              paused={false}
              key={sound.id}
              onEnd={() => this._soundFinished(sound)}
            />
          );
        })}
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
