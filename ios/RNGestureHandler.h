#import "RNGestureHandlerState.h"
#import "RNGestureHandlerDirection.h"
#import "RNGestureHandlerEvents.h"

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <React/RCTConvert.h>

#define VEC_LEN_SQ(pt) (pt.x * pt.x + pt.y * pt.y)
#define TEST_MIN_IF_NOT_NAN(value, limit) \
(!isnan(limit) && ((limit < 0 && value <= limit) || (limit >= 0 && value >= limit)))

#define TEST_MAX_IF_NOT_NAN(value, max) \
(!isnan(max) && ((max < 0 && value < max) || (max >= 0 && value > max)))

#define APPLY_PROP_OR_DEFAULT(recognizer, config, type, prop, propName, default) do { \
id value = config[propName]; \
if (value != nil) { recognizer.prop = [RCTConvert type:value]; }\
else { recognizer.prop = default; }\
} while(0)

#define APPLY_FLOAT_PROP_OR_DEFAULT(prop, default) do { APPLY_PROP_OR_DEFAULT(recognizer, config, CGFloat, prop, @#prop, default); } while(0)
#define APPLY_INT_PROP_OR_DEFAULT(prop, default) do { APPLY_PROP_OR_DEFAULT(recognizer, config, NSInteger, prop, @#prop, default); } while(0)
#define APPLY_NAMED_INT_PROP_OR_DEFAULT(prop, propName, default) do { APPLY_PROP_OR_DEFAULT(recognizer, config, NSInteger, prop, propName, default); } while(0)

@protocol RNGestureHandlerEventEmitter

- (void)sendTouchEvent:(nonnull RNGestureHandlerEvent *)event;

- (void)sendStateChangeEvent:(nonnull RNGestureHandlerStateChange *)event;

@end


@protocol RNRootViewGestureRecognizerDelegate <UIGestureRecognizerDelegate>

- (void)gestureRecognizer:(nullable UIGestureRecognizer *)gestureRecognizer
    didActivateInRootView:(nullable UIView *)rootView;

@end


@interface RNGestureHandler : NSObject <UIGestureRecognizerDelegate> {

@protected UIGestureRecognizer *_recognizer;
@protected RNGestureHandlerState _lastState;

}

+ (nullable RNGestureHandler *)findGestureHandlerByRecognizer:(nonnull UIGestureRecognizer *)recognizer;

- (nonnull instancetype)initWithTag:(nonnull NSNumber *)tag;

@property (nonatomic, readonly, nonnull) NSNumber *tag;
@property (nonatomic, weak, nullable) id<RNGestureHandlerEventEmitter> emitter;
@property (nonatomic, readonly, nullable) UIGestureRecognizer *recognizer;
@property (nonatomic) BOOL enabled;
@property(nonatomic) BOOL shouldCancelWhenOutside;

- (void)bindToView:(nonnull UIView *)view;
- (void)unbindFromView;
- (void)configure:(nullable NSDictionary *)config NS_REQUIRES_SUPER;
- (void)handleGesture:(nonnull id)recognizer;
- (BOOL)containsPointInView;
- (RNGestureHandlerState)state;
- (nullable RNGestureHandlerEventExtraData *)eventExtraData:(nonnull id)recognizer;

- (void)reset;
- (void)sendEventsInState:(RNGestureHandlerState)state
           forViewWithTag:(nonnull NSNumber *)reactTag
            withExtraData:(RNGestureHandlerEventExtraData *)extraData;

@end

