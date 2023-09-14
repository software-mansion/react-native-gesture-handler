//
//  RNGestureHandlerButton.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

#if TARGET_OS_OSX
@interface RNGestureHandlerButton : NSControl
#else
@interface RNGestureHandlerButton : UIControl
#endif
/**
 *  Insets used when hit testing inside this view.
 */
@property (nonatomic, assign) UIEdgeInsets hitTestEdgeInsets;
@property (nonatomic) BOOL userEnabled;

@end
