#import "RNGestureHandlerManager.h"

#import <React/RCTLog.h>
#import <React/RCTViewManager.h>
#import <React/RCTComponent.h>
#import <React/RCTRootView.h>
#import <React/RCTTouchHandler.h>
#import <React/RCTUIManager.h>
#import <React/RCTEventDispatcher.h>
// #import <React/RCTBridge+Private.h>

#if __has_include(<React/RCTRootContentView.h>)
#import <React/RCTRootContentView.h>
#else
#import "RCTRootContentView.h"
#endif

#import "RNGestureHandlerState.h"
#import "RNGestureHandler.h"
#import "RNGestureHandlerRegistry.h"
#import "RNRootViewGestureRecognizer.h"
#import "RNGestureHandlerButtonComponentView.h"

#import "Handlers/RNPanHandler.h"
#import "Handlers/RNTapHandler.h"
#import "Handlers/RNFlingHandler.h"
#import "Handlers/RNLongPressHandler.h"
#import "Handlers/RNNativeViewHandler.h"
#import "Handlers/RNPinchHandler.h"
#import "Handlers/RNRotationHandler.h"
#import "Handlers/RNForceTouchHandler.h"
#import "Handlers/RNManualHandler.h"

// We use the method below instead of RCTLog because we log out messages after the bridge gets
// turned down in some cases. Which normally with RCTLog would cause a crash in DEBUG mode
#define RCTLifecycleLog(...) RCTDefaultLogFunction(RCTLogLevelInfo, RCTLogSourceNative, @(__FILE__), @(__LINE__), [NSString stringWithFormat:__VA_ARGS__])

@interface RNGestureHandlerManager () <RNGestureHandlerEventEmitter, RNRootViewGestureRecognizerDelegate>

@end

@implementation RNGestureHandlerManager
{
    RNGestureHandlerRegistry *_registry;
    RCTUIManager *_uiManager;
    id _reanimatedModule;
    NSHashTable<RNRootViewGestureRecognizer *> *_rootViewGestureRecognizers;
    RCTEventDispatcher *_eventDispatcher;
}

- (instancetype)initWithUIManager:(RCTUIManager *)uiManager
                  eventDispatcher:(RCTEventDispatcher *)eventDispatcher
                 reanimatedModule:(id)reanimatedModule
{
    if ((self = [super init])) {
        _uiManager = uiManager;
        _eventDispatcher = eventDispatcher;
        _reanimatedModule = reanimatedModule;
        _registry = [RNGestureHandlerRegistry new];
        _rootViewGestureRecognizers = [NSHashTable hashTableWithOptions:NSPointerFunctionsWeakMemory];
    }
    return self;
}

- (void)createGestureHandler:(NSString *)handlerName
                         tag:(NSNumber *)handlerTag
                      config:(NSDictionary *)config
{
    static NSDictionary *map;
    static dispatch_once_t mapToken;
    dispatch_once(&mapToken, ^{
        map = @{
                @"PanGestureHandler" : [RNPanGestureHandler class],
                @"TapGestureHandler" : [RNTapGestureHandler class],
                @"FlingGestureHandler" : [RNFlingGestureHandler class],
                @"LongPressGestureHandler": [RNLongPressGestureHandler class],
                @"NativeViewGestureHandler": [RNNativeViewGestureHandler class],
                @"PinchGestureHandler": [RNPinchGestureHandler class],
                @"RotationGestureHandler": [RNRotationGestureHandler class],
                @"ForceTouchGestureHandler": [RNForceTouchHandler class],
                @"ManualGestureHandler": [RNManualGestureHandler class],
                };
    });
    
    Class nodeClass = map[handlerName];
    if (!nodeClass) {
        RCTLogError(@"Gesture handler type %@ is not supported", handlerName);
        return;
    }
    
    RNGestureHandler *gestureHandler = [[nodeClass alloc] initWithTag:handlerTag];
    [gestureHandler configure:config];
    [_registry registerGestureHandler:gestureHandler];
    
    __weak id<RNGestureHandlerEventEmitter> emitter = self;
    gestureHandler.emitter = emitter;
}


- (void)attachGestureHandler:(nonnull NSNumber *)handlerTag
               toViewWithTag:(nonnull NSNumber *)viewTag
              withActionType:(nonnull NSNumber *)actionType
{
    UIView *view = [_uiManager viewForReactTag:viewTag];
    
    if (view == nil) {
        // Happens when the view with given tag has been flattened.
        // We cannot attach gesture handler to a non-existent view.
        return;
    }
    
    // I think it should be moved to RNNativeViewHandler, but that would require
    // additional logic for setting contentView.reactTag, this works for now
    if ([view isKindOfClass:[RCTViewComponentView class]]) {
        RCTViewComponentView *componentView = (RCTViewComponentView *)view;
        if (componentView.contentView != nil) {
            view = componentView.contentView;
        }
    }
    
    view.reactTag = viewTag; // necessary for RNReanimated eventHash (e.g. "42onGestureHandlerEvent"), also will be returned as event.target
    
    [_registry attachHandlerWithTag:handlerTag toView:view withActionType:actionType];

    // register view if not already there
    [self registerViewWithGestureRecognizerAttachedIfNeeded:view];
}

- (void)updateGestureHandler:(NSNumber *)handlerTag config:(NSDictionary *)config
{
    RNGestureHandler *handler = [_registry handlerWithTag:handlerTag];
    [handler configure:config];
}

- (void)dropGestureHandler:(NSNumber *)handlerTag
{
    [_registry dropHandlerWithTag:handlerTag];
}

- (void)handleSetJSResponder:(NSNumber *)viewTag blockNativeResponder:(NSNumber *)blockNativeResponder
{
    if ([blockNativeResponder boolValue]) {
        for (RNRootViewGestureRecognizer *recognizer in _rootViewGestureRecognizers) {
            [recognizer blockOtherRecognizers];
        }
    }
}

- (void)handleClearJSResponder
{
    // ignore...
}

- (id)handlerWithTag:(NSNumber *)handlerTag
{
  return [_registry handlerWithTag:handlerTag];
}


#pragma mark Root Views Management

- (void)registerViewWithGestureRecognizerAttachedIfNeeded:(UIView *)childView
{
    UIView *parent = childView;
    while (parent != nil && ![parent respondsToSelector:@selector(touchHandler)]) parent = parent.superview;

    // Many views can return the same touchHandler so we check if the one we want to register
    // is not already present in the set.
    UIView *touchHandlerView = [[parent performSelector:@selector(touchHandler)] view];
  
    if (touchHandlerView == nil) {
      return;
    }
  
    for (UIGestureRecognizer *recognizer in touchHandlerView.gestureRecognizers) {
      if ([recognizer isKindOfClass:[RNRootViewGestureRecognizer class]]) {
        return;
      }
    }
  
    RCTLifecycleLog(@"[GESTURE HANDLER] Initialize gesture handler for view %@", touchHandlerView);
    RNRootViewGestureRecognizer *recognizer = [RNRootViewGestureRecognizer new];
    recognizer.delegate = self;
    touchHandlerView.userInteractionEnabled = YES;
    [touchHandlerView addGestureRecognizer:recognizer];
    [_rootViewGestureRecognizers addObject:recognizer];
}

- (void)gestureRecognizer:(UIGestureRecognizer *)gestureRecognizer
    didActivateInViewWithTouchHandler:(UIView *)viewWithTouchHandler
{
    // Cancel touches in RN's root view in order to cancel all in-js recognizers

    // As scroll events are special-cased in RN responder implementation and sending them would
    // trigger JS responder change, we don't cancel touches if the handler that got activated is
    // a scroll recognizer. This way root view will keep sending touchMove and touchEnd events
    // and therefore allow JS responder to properly release the responder at the end of the touch
    // stream.
    // NOTE: this is not a proper fix and solving this problem requires upstream fixes to RN. In
    // particular if we have one PanHandler and ScrollView that can work simultaniously then when
    // the Pan handler activates it would still tigger cancel events.
    // Once the upstream fix lands the line below along with this comment can be removed
    if ([gestureRecognizer.view isKindOfClass:[UIScrollView class]]) return;

    RCTTouchHandler *touchHandler = [viewWithTouchHandler performSelector:@selector(touchHandler)];
    [touchHandler cancel];
}

#pragma mark Events

- (void)sendStateChangeEvent:(RNGestureHandlerStateChange *)event withActionType:(nonnull NSNumber *)actionType
{
    if ([actionType integerValue] == 1) {
        
        // Reanimated worklet
        [self sendStateChangeEventForReanimated:event];
        
    } else if ([actionType integerValue] == 2) {
        
        // Animated.event with useNativeDriver: true
        if ([event.eventName isEqualToString:@"onGestureHandlerEvent"]) {
            [self sendStateChangeEventForNativeAnimatedEvent:event];
        } else if ([actionType integerValue] == 2 || [actionType integerValue] == 3) {
            // in case when onGestureEvent prop is an Animated.event with useNativeDriver: true,
            // onHandlerStateChange prop is still a regular JS function
            [self sendStateChangeEventForDeviceEvent:event];
        }
        
    } else if ([actionType integerValue] == 3) {
        
        // JS function or Animated.event with useNativeDriver: false
        [self sendStateChangeEventForDeviceEvent:event];
        
    }
}

- (void)sendStateChangeEventForReanimated:(RNGestureHandlerStateChange *)event
{
    // delivers the event to Reanimated
    // to be used when:
    // - gesture callback from new API is a Reanimated worklet
    // - onGestureEvent prop from old API is an useAnimatedGestureHandler object
    [_reanimatedModule eventDispatcherWillDispatchEvent:event];
}

- (void)sendStateChangeEventForNativeAnimatedEvent:(RNGestureHandlerStateChange *)event
{
    // delivers the event to NativeAnimatedModule
    // to be used when onGestureEvent prop from old API is an Animated.event with useNativeDriver: true (only for onGestureHandlerEvent)
    [_eventDispatcher sendEvent:event];
    // TODO: call [self->_nodesManager handleAnimatedEvent:event] directly without RCTExecuteOnMainQueue?
}

- (void)sendStateChangeEventForDeviceEvent:(RNGestureHandlerStateChange *)event
{
    // delivers the event to JS as a device event
    // to be used when gesture callback from new API or onGestureEvent/onHandlerStateChange from old API
    // is a regular JS function (which is also true for Animated.event with useNativeDriver: false)
    NSMutableDictionary *body = [[event arguments] objectAtIndex:2];
    [_eventDispatcher sendDeviceEventWithName:@"onGestureHandlerStateChange" body:body];
}

@end
