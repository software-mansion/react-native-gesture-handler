//
//  RNRootViewGestureRecognizer.h
//  RNGestureHandler
//
//  Created by Krzysztof Magiera on 12/10/2017.
//  Copyright © 2017 Software Mansion. All rights reserved.
//

#import "RNGestureHandler.h"

@interface RNRootViewGestureRecognizer : UIGestureRecognizer

@property (nullable, nonatomic, weak) id<RNRootViewGestureRecognizerDelegate> delegate;
@property (nonatomic) BOOL preventRecognizers;

- (void)blockOtherRecognizers;

@end
