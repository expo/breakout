import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import GameState from './GameState';

export default class ScoreBoard extends React.Component {

  state = {
    score: 0,
    level: 1,
  }

  onTick = () => {
    if (GameState.getScore() !== this.state.score) {
      this.setState({score: GameState.getScore()});
    }

    if (GameState.getLevel() !== this.state.level) {
      this.setState({level: GameState.getLevel()});
    }
  }

  render() {
    return (
      <View style={{position: 'absolute', top: 0, left: 0, backgroundColor: 'transparent'}}>
        <View style={{padding: 10}}>
          <Text style={styles.label}>Score: {this.state.score}</Text>
          <Text style={[styles.label, {marginTop: -5}]}>Level: {this.state.level}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  label: {
    color: '#fff',
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
  },
});
