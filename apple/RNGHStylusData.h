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

typedef struct {
  double tiltX;
  double tiltY;
} RNGHTilt;

static RNGHTilt ghSpherical2tilt(double altitudeAngle, double azimuthAngle)
{
  RNGHTilt tilts = {.tiltX = 0.0, .tiltY = 0.0};

  const double radToDeg = 180 / M_PI;
  const double eps = 0.000000001;

  if (altitudeAngle < eps) {
    // the pen is in the X-Y plane
    if (azimuthAngle < eps || fabs(azimuthAngle - 2 * M_PI) < eps) {
      // pen is on positive X axis
      tilts.tiltX = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI_2) < eps) {
      // pen is on positive Y axis
      tilts.tiltY = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI) < eps) {
      // pen is on negative X axis
      tilts.tiltX = -M_PI_2;
    }
    if (fabs(azimuthAngle - 3 * M_PI_2) < eps) {
      // pen is on negative Y axis
      tilts.tiltY = -M_PI_2;
    }
    if (azimuthAngle > eps && fabs(azimuthAngle - M_PI_2) < eps) {
      tilts.tiltX = M_PI_2;
      tilts.tiltY = M_PI_2;
    }
    if (fabs(azimuthAngle - M_PI_2) > eps && fabs(azimuthAngle - M_PI) < eps) {
      tilts.tiltX = -M_PI_2;
      tilts.tiltY = M_PI_2;
    }
    if (azimuthAngle - M_PI > eps && fabs(azimuthAngle - 3 * M_PI_2) < eps) {
      tilts.tiltX = -M_PI_2;
      tilts.tiltY = -M_PI_2;
    }
    if (fabs(azimuthAngle - 3 * M_PI_2) > eps && fabs(azimuthAngle - 2 * M_PI) < eps) {
      tilts.tiltX = M_PI_2;
      tilts.tiltY = -M_PI_2;
    }
  } else {
    const double tanAlt = tan(altitudeAngle);

    tilts.tiltX = atan(cos(azimuthAngle) / tanAlt);
    tilts.tiltY = atan(sin(azimuthAngle) / tanAlt);
  }

  tilts.tiltX = round(tilts.tiltX * radToDeg);
  tilts.tiltY = round(tilts.tiltY * radToDeg);

  return tilts;
}

#endif /* RNGHStylusData_h */
