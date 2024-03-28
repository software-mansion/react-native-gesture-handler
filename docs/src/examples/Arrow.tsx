import React from 'react';

// source: https://gist.github.com/jvaclavik/fbf0a951864c98ca34d8f95be01b561d#file-dependency-arrows-1-tsx

type Point = {
  x: number;
  y: number;
};

type ArrowProps = {
  startPoint: Point;
  endPoint: Point;
};

export default function App({ startPoint, endPoint }: ArrowProps) {
  // Getting info about SVG canvas
  const canvasStartPoint = {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
  };

  const strokeWidth = 3;
  const spaceForArrows = 100;
  const totalPadding = strokeWidth + spaceForArrows;
  const halfPadding = totalPadding / 2;

  const canvasWidth = Math.abs(endPoint.x - startPoint.x) + totalPadding;
  const canvasHeight = Math.abs(endPoint.y - startPoint.y) + totalPadding;

  // with perfectly straight lines, canvas height/width is set to 0
  // when that is fixed, stoke gets drawn on the border, getting halved
  canvasStartPoint.x -= halfPadding;
  canvasStartPoint.y -= halfPadding;

  // adjust coordinates by canvas global offset
  startPoint.x = startPoint.x - canvasStartPoint.x;
  startPoint.y = startPoint.y - canvasStartPoint.y;
  endPoint.x = endPoint.x - canvasStartPoint.x;
  endPoint.y = endPoint.y - canvasStartPoint.y;

  const avg = (a: number, b: number) => (a + b) / 2;

  // we will be drawing two deflections from midpoint to origin
  const arrowDeflection = 45;
  const arrowLength = 10;
  const midPoint = {
    x: avg(startPoint.x, endPoint.x),
    y: avg(startPoint.y, endPoint.y),
  };

  const midToOriginVector = {
    x: midPoint.x - endPoint.x,
    y: midPoint.y - endPoint.y,
  };

  type Coords = { x: number; y: number };

  const truncate = ({ x, y }: Coords, length: number): Coords => {
    const magnitude = Math.hypot(x, y);

    let modifier = length / magnitude;
    if (!Number.isFinite(modifier)) {
      modifier = 0;
    }

    return {
      x: x * modifier,
      y: y * modifier,
    };
  };

  const rotate = (
    { x, y }: { x: number; y: number },
    rotation: number
  ): Coords => {
    const rotationRadians = (Math.PI * rotation) / 180;
    const cosResult = Math.cos(rotationRadians);
    const sinResult = Math.sin(rotationRadians);
    return {
      x: x * cosResult - y * sinResult,
      y: x * sinResult + y * cosResult,
    };
  };

  const deflectionVectorLeft = rotate(
    truncate(midToOriginVector, arrowLength),
    arrowDeflection
  );
  const deflectionVectorRight = rotate(
    truncate(midToOriginVector, arrowLength),
    -arrowDeflection
  );

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: -1,
        backgroundColor: 'transparent',
        transform: `translate(${canvasStartPoint.x}px, ${canvasStartPoint.y}px)`,
      }}>
      <line
        stroke="#aaa"
        strokeWidth={strokeWidth}
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
      />
      <line
        stroke="#aaa"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x1={midPoint.x}
        y1={midPoint.y}
        x2={midPoint.x + deflectionVectorRight.x}
        y2={midPoint.y + deflectionVectorRight.y}
      />
      <line
        stroke="#aaa"
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        x1={midPoint.x}
        y1={midPoint.y}
        x2={midPoint.x + deflectionVectorLeft.x}
        y2={midPoint.y + deflectionVectorLeft.y}
      />
    </svg>
  );
}
