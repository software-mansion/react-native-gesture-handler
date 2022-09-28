import { Dimensions } from 'react-native';

const COLORS = [
  'salmon',
  'lightgreen',
  'goldenrod',
  'cyan',
  'lightblue',
  'white',
];

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const GestureHandlerLogo = require('./assets/gh.png');
const ReanimatedLogo = require('./assets/reanimated.png');
const SWMLogo = require('./assets/swm.svg');

export const IMAGES = [GestureHandlerLogo, ReanimatedLogo, SWMLogo];

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

export const SLIDER_WIDTH = WIDTH / 3.5;
export const SLIDER_HEIGHT = HEIGHT / 25;

export const POINTER_WIDTH = WIDTH / 55;
export const POINTER_HEIGHT = HEIGHT / 20;

export const LOGO_SIZE = WIDTH / 4.5;
export const IMG_SIZE = WIDTH / 5;
