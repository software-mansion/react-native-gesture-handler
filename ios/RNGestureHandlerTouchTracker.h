#import <Foundation/Foundation.h>

#import "RNTouchEventType.h"

#define MAX_TOUCHES_COUNT 12

@class RNGestureHandler;

@interface RNGestureHandlerTouchTracker : NSObject

@property (nonatomic) RNTouchEventType eventType;
@property (nonatomic) NSArray<NSDictionary *> *touchesData;
@property (nonatomic) int trackedTouchesCount;

- (id)initWithGestureHandler:(RNGestureHandler*)gestureHandler;

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesCancelled:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event;
- (void)reset;
- (void)cancelTouches;

@end
