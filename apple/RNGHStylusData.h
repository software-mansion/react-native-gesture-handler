//
//  RNGHStylusData.h
//  Pods
//
//  Created by Michał Bert on 18/09/2024.
//

#ifndef RNGHStylusData_h
#define RNGHStylusData_h

@interface RNGHStylusData : NSObject

@property (atomic, assign) double tiltX;
@property (atomic, assign) double tiltY;
@property (atomic, assign) double altitudeAngle;
@property (atomic, assign) double azimuthAngle;
@property (atomic, assign) double pressure;

- (NSDictionary *)toDictionary;

@end

static CGPoint ghSpherical2tilt(double altitudeAngle, double azimuthAngle)
{
  CGPoint tilts = {.x = 0.0, .y = 0.0};

  const double radToDeg = 180 / M_PI;
  const double eps = 0.000000001;

  if (altitudeAngle < eps) {
    // the pen is in the X-Y plane
    if (azimuthAngle < eps || fabs(azimuthAngle - 2 * M_PI) < eps) {
      // pen is on positive X axis
      tilts.x = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI_2) < eps) {
      // pen is on positive Y axis
      tilts.y = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI) < eps) {
      // pen is on negative X axis
      tilts.x = -M_PI_2;
    }
    if (fabs(azimuthAngle - 3 * M_PI_2) < eps) {
      // pen is on negative Y axis
      tilts.y = -M_PI_2;
    }
    if (azimuthAngle > eps && fabs(azimuthAngle - M_PI_2) < eps) {
      tilts.x = M_PI_2;
      tilts.y = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI_2) > eps && fabs(azimuthAngle - M_PI) < eps) {
      tilts.x = -M_PI_2;
      tilts.y = M_PI_2;
    }
    if (azimuthAngle - M_PI > eps && fabs(azimuthAngle - 3 * M_PI_2) < eps) {
      tilts.x = -M_PI_2;
      tilts.y = -M_PI_2;
    }
    if (fabs(azimuthAngle - 3 * M_PI_2) > eps && fabs(azimuthAngle - 2 * M_PI) < eps) {
      tilts.x = M_PI_2;
      tilts.y = -M_PI_2;
    }
  } else {
    const double tanAlt = tan(altitudeAngle);

    tilts.x = atan(cos(azimuthAngle) / tanAlt);
    tilts.y = atan(sin(azimuthAngle) / tanAlt);
  }

  tilts.x = round(tilts.x * radToDeg);
  tilts.y = round(tilts.y * radToDeg);

  return tilts;
}

#endif /* RNGHStylusData_h */
