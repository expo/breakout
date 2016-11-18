import { Dimensions } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SceneWidth = 4;
const SceneHeight = (screenHeight / screenWidth) * 4;

const GameDimensions = {
  SceneWidth,
  SceneHeight,
  Paddle: { Width: 1, Height: 0.2, BottomOffset: 0.5, Y: SceneHeight - 0.5 },
  Ball: { Radius: 0.15 },
}

export default GameDimensions;
