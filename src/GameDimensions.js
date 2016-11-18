import { Dimensions } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameDimensions = {
  SceneWidth: 4,
  SceneHeight: (screenHeight / screenWidth) * 4,
  Paddle: { Width: 1, Height: 0.2, BottomOffset: 0.5 },
  Ball: { Radius: 0.15 },
}

export default GameDimensions;
