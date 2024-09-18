//
//  RNPanHandler.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

@interface RNPanGestureHandler : RNGestureHandler
#if !TARGET_OS_OSX && !TARGET_OS_TV
@property (atomic, assign) StylusData *stylusData;
#endif
@end
