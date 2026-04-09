#import <Foundation/Foundation.h>
#import "RNGHTouchEventType.h"
#import "RNGHUIKit.h"

#define MAX_POINTERS_COUNT 17

@class RNGestureHandler;

@interface RNGestureHandlerPointerTracker : NSObject

@property (nonatomic) RNGHTouchEventType eventType;
@property (nonatomic) NSArray<NSDictionary *> *changedPointersData;
@property (nonatomic) NSArray<NSDictionary *> *allPointersData;
@property (nonatomic) int trackedPointersCount;

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

- (void)touchesBegan:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesMoved:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesEnded:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event;
- (void)touchesCancelled:(NSSet<RNGHUITouch *> *)touches withEvent:(UIEvent *)event;
- (void)reset;
- (void)cancelPointers;

@end
