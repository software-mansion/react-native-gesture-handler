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
  const halfStrokeWidth = 1.5;

  const canvasWidth = Math.abs(endPoint.x - startPoint.x + strokeWidth);
  const canvasHeight = Math.abs(endPoint.y - startPoint.y + strokeWidth);

  // with perfectly straight lines, canvas height/width is set to 0
  // when that is fixed, stoke gets drawn on the border, getting halved
  canvasStartPoint.x -= halfStrokeWidth;
  canvasStartPoint.y -= halfStrokeWidth;

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
        x1={startPoint.x - canvasStartPoint.x}
        y1={startPoint.y - canvasStartPoint.y}
        x2={endPoint.x - canvasStartPoint.x}
        y2={endPoint.y - canvasStartPoint.y}
      />
    </svg>
  );
}
