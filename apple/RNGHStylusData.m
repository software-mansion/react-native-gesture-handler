//
//  RNGHStylusData.m
//  DoubleConversion
//
//  Created by Michał Bert on 18/09/2024.
//

#import "RNGHStylusData.h"
#import <Foundation/Foundation.h>

@implementation RNGHStylusData

- (instancetype)init
{
  if (self = [super init]) {
    self.tiltX = 0;
    self.tiltY = 0;
    self.altitudeAngle = M_PI_2;
    self.azimuthAngle = 0;
    self.pressure = 0;
  }

  return self;
}

- (NSDictionary *)toDictionary
{
  return @{
    @"tiltX" : @(_tiltX),
    @"tiltY" : @(_tiltY),
    @"altitudeAngle" : @(_altitudeAngle),
    @"azimuthAngle" : @(_azimuthAngle),
    @"pressure" : @(_pressure),
  };
}

@end
