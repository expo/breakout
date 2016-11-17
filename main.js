import Exponent from 'exponent';
import React from 'react';
import { Alert, PanResponder } from 'react-native';

import Assets from './assets';
import Game from './src/Game';

class App extends React.Component {
  state = {
    loaded: false,
  }

  componentWillMount() {
    console.disableYellowBox = true;
    this.loadAssetsAsync();
  }

  async loadAssetsAsync() {
    try {
      await Promise.all(Object.keys(Assets).map((name) => {
        return Assets[name].downloadAsync()
      }));

      this.setState({ loaded: true });
    } catch (e) {
      Alert.alert('Error when loading', e.message);
    }
  }

  render() {
    return this.state.loaded ? (
      <Game />
    ) : (
      <Exponent.Components.AppLoading />
    );
  }
}

Exponent.registerRootComponent(App);
