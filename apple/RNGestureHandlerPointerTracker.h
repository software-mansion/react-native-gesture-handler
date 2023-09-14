#import <Foundation/Foundation.h>
#import "RNGesturePlatform.h"
#import "RNGHTouchEventType.h"

#define MAX_POINTERS_COUNT 12

@class RNGestureHandler;

@interface RNGestureHandlerPointerTracker : NSObject

@property (nonatomic) RNGHTouchEventType eventType;
@property (nonatomic) NSArray<NSDictionary *> *changedPointersData;
@property (nonatomic) NSArray<NSDictionary *> *allPointersData;
@property (nonatomic) int trackedPointersCount;

- (id)initWithGestureHandler:(RNGestureHandler *)gestureHandler;

- (void)touchesBegan:(NSSet<UIEvent *> *)touches withEvent:(UIEvent *)event;
- (void)touchesMoved:(NSSet<UIEvent *> *)touches withEvent:(UIEvent *)event;
- (void)touchesEnded:(NSSet<UIEvent *> *)touches withEvent:(UIEvent *)event;
- (void)touchesCancelled:(NSSet<UIEvent *> *)touches withEvent:(UIEvent *)event;
- (void)reset;
- (void)cancelPointers;

@end
