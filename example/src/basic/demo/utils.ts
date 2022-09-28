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
  // const RGB = [0, 0, 0];
  // for (let i = 0; i < RGB.length; ++i) {
  //   RGB[i] = getRandomNumber(128, 255);
  // }
  // const a = Math.random();
  // console.log(RGB);

  // return `rgba(${RGB[0]}, ${RGB[1]}, ${RGB[2]}, ${a})`;
}

const GestureHandlerLogo = require('./assets/gh.png');
const ReanimatedLogo = require('./assets/reanimated.png');
const SWMLogo = require('./assets/swm.svg');

export const IMAGES = [GestureHandlerLogo, ReanimatedLogo, SWMLogo];
