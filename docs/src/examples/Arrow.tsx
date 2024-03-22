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

const Arrow = ({ startPoint, endPoint }: ArrowProps) => {
  // Getting info about SVG canvas
  const canvasStartPoint = {
    x: Math.min(startPoint.x, endPoint.x),
    y: Math.min(startPoint.y, endPoint.y),
  };
  const canvasWidth = Math.abs(endPoint.x - startPoint.x);
  const canvasHeight = Math.abs(endPoint.y - startPoint.y);

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{
        backgroundColor: '#eee',
        transform: `translate(${canvasStartPoint.x}px, ${canvasStartPoint.y}px)`,
      }}>
      <line
        stroke="#aaa"
        strokeWidth={1}
        x1={startPoint.x - canvasStartPoint.x}
        y1={startPoint.y - canvasStartPoint.y}
        x2={endPoint.x - canvasStartPoint.x}
        y2={endPoint.y - canvasStartPoint.y}
      />
    </svg>
  );
};

function App() {
  const featureAPosition = {
    x: 300,
    y: 0,
  };

  const featureBPosition = {
    x: 400,
    y: 200,
  };

  return <Arrow startPoint={featureAPosition} endPoint={featureBPosition} />;
}

export default App;
