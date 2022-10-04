import { Dimensions } from 'react-native';

const COLORS = [
  '#fd7f6f',
  '#7eb0d5',
  '#b2e061',
  '#bd7ebe',
  '#ffb55a',
  '#ffee65',
  '#beb9db',
  '#fdcce5',
  '#8bd3c7',
];

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

const GestureHandlerLogo = require('./assets/GestureHandlerLogo.png');
const ReanimatedLogo = require('./assets/ReanimatedLogo.png');
const SWMLogo = require('./assets/SWMLogo.svg');

export const IMAGES = [GestureHandlerLogo, ReanimatedLogo, SWMLogo];

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

export const SLIDER_WIDTH = WIDTH / 3.5;
export const SLIDER_HEIGHT = HEIGHT / 25;

export const POINTER_WIDTH = WIDTH / 55;
export const POINTER_HEIGHT = HEIGHT / 20;

export const LOGO_SIZE = WIDTH / 4.5;
export const IMG_SIZE = WIDTH / 5;
