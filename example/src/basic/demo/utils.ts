const COLORS = [
  'crimson',
  'lightgreen',
  'goldenrod',
  'cyan',
  'lightblue',
  'white',
];

function getRandomNumber(max: number): number {
  return Math.floor(Math.random() * (max + 1));
}

export function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
  //   const r = getRandomNumber(255);
  //   const g = getRandomNumber(255);
  //   const b = getRandomNumber(255);
  //   const a = Math.random();

  //   return `rgba(${r}, ${g}, ${b}, ${a})`;
}
