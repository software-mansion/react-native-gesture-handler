# Gesture Examples

Detailed sequences and parameters for the gesture tool family. All coordinates, distances, and radii are **normalized 0.0–1.0** (fractions of screen width/height, not pixels) — same coordinate space across all gesture tools.

## gesture-pinch — Two-finger pinch

Pinch out (zoom in):

```json
{ "udid": "<UDID>", "centerX": 0.5, "centerY": 0.5, "startDistance": 0.2, "endDistance": 0.6 }
```

Pinch in (zoom out):

```json
{ "udid": "<UDID>", "centerX": 0.5, "centerY": 0.5, "startDistance": 0.6, "endDistance": 0.2 }
```

Vertical pinch (angle = 90):

```json
{
  "udid": "<UDID>",
  "centerX": 0.5,
  "centerY": 0.5,
  "startDistance": 0.2,
  "endDistance": 0.6,
  "angle": 90
}
```

## gesture-rotate — Two-finger rotation

Clockwise 90 degrees:

```json
{
  "udid": "<UDID>",
  "centerX": 0.5,
  "centerY": 0.5,
  "radius": 0.15,
  "startAngle": 0,
  "endAngle": 90
}
```

Counter-clockwise 45 degrees:

```json
{
  "udid": "<UDID>",
  "centerX": 0.5,
  "centerY": 0.5,
  "radius": 0.15,
  "startAngle": 0,
  "endAngle": -45
}
```

## gesture-custom — Custom touch sequences

### Long Press (800ms hold)

```json
{
  "udid": "<UDID>",
  "events": [
    { "type": "Down", "x": 0.5, "y": 0.5 },
    { "type": "Up", "x": 0.5, "y": 0.5, "delayMs": 800 }
  ]
}
```

### Pinch Out (zoom in) — manual events

```json
{
  "udid": "<UDID>",
  "events": [
    { "type": "Down", "x": 0.4, "y": 0.5, "x2": 0.6, "y2": 0.5 },
    { "type": "Move", "x": 0.2, "y": 0.5, "x2": 0.8, "y2": 0.5 },
    { "type": "Up", "x": 0.2, "y": 0.5, "x2": 0.8, "y2": 0.5 }
  ]
}
```

### Pinch Out with interpolation — smooth version

```json
{
  "udid": "<UDID>",
  "events": [
    { "type": "Down", "x": 0.4, "y": 0.5, "x2": 0.6, "y2": 0.5 },
    { "type": "Up", "x": 0.2, "y": 0.5, "x2": 0.8, "y2": 0.5 }
  ],
  "interpolate": 15
}
```

### Drag and Drop

```json
{
  "udid": "<UDID>",
  "events": [
    { "type": "Down", "x": 0.3, "y": 0.4 },
    { "type": "Move", "x": 0.3, "y": 0.4, "delayMs": 500 },
    { "type": "Move", "x": 0.7, "y": 0.6 },
    { "type": "Up", "x": 0.7, "y": 0.6 }
  ]
}
```

Add a `delayMs` on the first `Move` to simulate a hold before dragging — this is required for some drag-and-drop implementations that only activate after a sustained press.
