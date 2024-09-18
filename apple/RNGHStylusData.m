//
//  RNGHStylusData.m
//  DoubleConversion
//
//  Created by michal on 18/09/2024.
//

#import "RNGHStylusData.h"
#import <Foundation/Foundation.h>

@implementation StylusData

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
