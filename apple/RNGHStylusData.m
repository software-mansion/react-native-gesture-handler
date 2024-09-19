//
//  RNGHStylusData.m
//  DoubleConversion
//
//  Created by Michał Bert on 18/09/2024.
//

#import "RNGHStylusData.h"
#import <Foundation/Foundation.h>

@implementation StylusData

- (instancetype)init
{
  if (self = [super init]) {
    self.tiltX = 0;
    self.tiltY = 0;
    self.altitudeAngle = M_PI_2;
    self.azimuthAngle = 0;
    self.pressure = -1;
  }

  return self;
}

- (NSDictionary *)toDictionary
{
  NSDictionary *stylusDataObject = @{
    @"tiltX" : @(_tiltX),
    @"tiltY" : @(_tiltY),
    @"altitudeAngle" : @(_altitudeAngle),
    @"azimuthAngle" : @(_azimuthAngle),
    @"pressure" : @(_pressure),
  };

  return stylusDataObject;
}

@end
