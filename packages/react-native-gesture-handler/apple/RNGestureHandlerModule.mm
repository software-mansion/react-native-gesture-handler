#import "RNGestureHandlerModule.h"

#import <React/RCTComponent.h>
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerObserverCoordinator.h>
#import <React/RCTUIManagerUtils.h>
#import <React/RCTViewManager.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>
#endif // RCT_NEW_ARCH_ENABLED

#import "RNGHRuntimeDecorator.h"

#import "RNGestureHandler.h"
#import "RNGestureHandlerDirection.h"
#import "RNGestureHandlerManager.h"
#import "RNGestureHandlerState.h"

#import "RNGestureHandlerButton.h"

#import <React/RCTJSThread.h>
#import <jsi/jsi.h>

using namespace gesturehandler;
using namespace facebook;
#ifdef RCT_NEW_ARCH_ENABLED
using namespace react;
#endif // RCT_NEW_ARCH_ENABLED

#ifdef RCT_NEW_ARCH_ENABLED
@interface RNGestureHandlerModule () <RCTTurboModule, RCTTurboModuleWithJSIBindings>

@end
#else
@interface RNGestureHandlerModule () <RCTUIManagerObserver>

@end
#endif // RCT_NEW_ARCH_ENABLED

typedef void (^GestureHandlerOperation)(RNGestureHandlerManager *manager);

@implementation RNGestureHandlerModule {
  RNGestureHandlerManager *_manager;

  // Oparations called after views have been updated.
  NSMutableArray<GestureHandlerOperation> *_operations;

  jsi::Runtime *_rnRuntime;

  bool _checkedReanimated;
  bool _reanimatedAvailable;
  bool _uiRuntimeDecorated;
}

#ifdef RCT_NEW_ARCH_ENABLED
@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;
#endif // RCT_NEW_ARCH_ENABLED

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)invalidate
{
  RNGestureHandlerManager *handlerManager = _manager;
  dispatch_async(dispatch_get_main_queue(), ^{
    [handlerManager dropAllGestureHandlers];
  });

  _manager = nil;

#ifndef RCT_NEW_ARCH_ENABLED
  [self.bridge.uiManager.observerCoordinator removeObserver:self];
#endif // RCT_NEW_ARCH_ENABLED
}

- (dispatch_queue_t)methodQueue
{
  // This module needs to be on the same queue as the UIManager to avoid
  // having to lock `_operations` and `_preOperations` since `uiManagerWillFlushUIBlocks`
  // will be called from that queue.

  // This is required as this module rely on having all the view nodes created before
  // gesture handlers can be associated with them
  return RCTGetUIManagerQueue();
}

#ifdef RCT_NEW_ARCH_ENABLED
- (void)installJSIBindingsWithRuntime:(jsi::Runtime &)rnRuntime
                          callInvoker:(const std::shared_ptr<facebook::react::CallInvoker> &)callinvoker
{
  _rnRuntime = &rnRuntime;
  __weak RNGestureHandlerModule *weakSelf = self;

  RNGHRuntimeDecorator::installRNRuntimeBindings(rnRuntime, [weakSelf](int handlerTag, int state) {
    RNGestureHandlerModule *strongSelf = weakSelf;
    if (strongSelf != nil) {
      [strongSelf setGestureState:state forHandler:handlerTag];
    }
  });
}
#endif // RCT_NEW_ARCH_ENABLED

#ifdef RCT_NEW_ARCH_ENABLED
- (void)initialize
{
  _manager = [[RNGestureHandlerManager alloc] initWithModuleRegistry:self.moduleRegistry
                                                        viewRegistry:_viewRegistry_DEPRECATED];
  _operations = [NSMutableArray new];
}
#else
- (void)setBridge:(RCTBridge *)bridge
{
  [super setBridge:bridge];

  _manager = [[RNGestureHandlerManager alloc] initWithUIManager:bridge.uiManager
                                                eventDispatcher:bridge.eventDispatcher];
  _operations = [NSMutableArray new];

  [bridge.uiManager.observerCoordinator addObserver:self];
}
#endif // RCT_NEW_ARCH_ENABLED

- (bool)installUIRuntimeBindings
{
  __weak RNGestureHandlerModule *weakSelf = self;

  return RNGHRuntimeDecorator::installUIRuntimeBindings(*_rnRuntime, [weakSelf](int handlerTag, int state) {
    RNGestureHandlerModule *strongSelf = weakSelf;
    if (strongSelf != nil) {
      [strongSelf setGestureState:state forHandler:handlerTag];
    }
  });
}

RCT_EXPORT_METHOD(createGestureHandler
                  : (nonnull NSString *)handlerName handlerTag
                  : (double)handlerTag config
                  : (NSDictionary *)config)
{
  if (!_checkedReanimated) {
    _reanimatedAvailable = [self.moduleRegistry moduleForName:"ReanimatedModule"] != nil;
  }

  if (_reanimatedAvailable && !_uiRuntimeDecorated) {
    _uiRuntimeDecorated = [self installUIRuntimeBindings];
  }

  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager createGestureHandler:handlerName tag:[NSNumber numberWithDouble:handlerTag] config:config];
  }];
}

RCT_EXPORT_METHOD(attachGestureHandler : (double)handlerTag newView : (double)viewTag actionType : (double)actionType)
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager attachGestureHandler:[NSNumber numberWithDouble:handlerTag]
                    toViewWithTag:[NSNumber numberWithDouble:viewTag]
                   withActionType:(RNGestureHandlerActionType)[[NSNumber numberWithDouble:actionType] integerValue]];
  }];
}

RCT_EXPORT_METHOD(updateGestureHandler : (double)handlerTag newConfig : (NSDictionary *)config)
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager updateGestureHandler:[NSNumber numberWithDouble:handlerTag] config:config];
  }];
}

RCT_EXPORT_METHOD(dropGestureHandler : (double)handlerTag)
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager dropGestureHandler:[NSNumber numberWithDouble:handlerTag]];
  }];
}

RCT_EXPORT_METHOD(handleSetJSResponder : (double)viewTag blockNativeResponder : (BOOL)blockNativeResponder)
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager handleSetJSResponder:[NSNumber numberWithDouble:viewTag] blockNativeResponder:blockNativeResponder];
  }];
}

RCT_EXPORT_METHOD(handleClearJSResponder)
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager handleClearJSResponder];
  }];
}

RCT_EXPORT_METHOD(flushOperations)
{
  // On the new arch we rely on `flushOperations` for scheduling the operations on the UI thread.
  // On the old arch we rely on `uiManagerWillPerformMounting`
#ifdef RCT_NEW_ARCH_ENABLED
  if (_operations.count == 0) {
    return;
  }

  NSArray<GestureHandlerOperation> *operations = _operations;
  _operations = [NSMutableArray new];

  [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
    for (GestureHandlerOperation operation in operations) {
      operation(self->_manager);
    }
  }];
#endif // RCT_NEW_ARCH_ENABLED
}

- (void)setGestureState:(int)state forHandler:(int)handlerTag
{
  if (RCTIsMainQueue()) {
    [self setGestureStateSynchronously:state forHandler:handlerTag];
  } else {
    RCTExecuteOnMainQueue(^{
      [self setGestureStateSynchronously:state forHandler:handlerTag];
    });
  }
}

- (void)setGestureStateSynchronously:(int)state forHandler:(int)handlerTag
{
  RCTAssertMainQueue();
  RNGestureHandler *handler = [_manager handlerWithTag:@(handlerTag)];

  if (handler != nil) {
    if (state == 1) { // FAILED
      handler.recognizer.state = RNGHGestureRecognizerStateFailed;
    } else if (state == 2) { // BEGAN
      handler.recognizer.state = RNGHGestureRecognizerStatePossible;
    } else if (state == 3) { // CANCELLED
      handler.recognizer.state = RNGHGestureRecognizerStateCancelled;
    } else if (state == 4) { // ACTIVE
      [handler stopActivationBlocker];
      handler.recognizer.state = RNGHGestureRecognizerStateBegan;
    } else if (state == 5) { // ENDED
      handler.recognizer.state = RNGHGestureRecognizerStateEnded;
    }
  }

  // if the gesture was set to finish, cancel all pointers it was tracking
  if (state == 1 || state == 3 || state == 5) {
    [handler.pointerTracker cancelPointers];
  }

  // do not send state change event when activating because it bypasses
  // shouldRequireFailureOfGestureRecognizer
  if (state != 4) {
    [handler handleGesture:handler.recognizer];
  }
}

#pragma mark-- Batch handling

- (void)addOperationBlock:(GestureHandlerOperation)operation
{
  [_operations addObject:operation];
}

#ifndef RCT_NEW_ARCH_ENABLED

#pragma mark - RCTUIManagerObserver

- (void)uiManagerWillFlushUIBlocks:(RCTUIManager *)uiManager
{
  [self uiManagerWillPerformMounting:uiManager];
}

- (void)uiManagerWillPerformMounting:(RCTUIManager *)uiManager
{
  if (_operations.count == 0) {
    return;
  }

  NSArray<GestureHandlerOperation> *operations = _operations;
  _operations = [NSMutableArray new];

  [uiManager
      addUIBlock:^(__unused RCTUIManager *manager, __unused NSDictionary<NSNumber *, RNGHUIView *> *viewRegistry) {
        for (GestureHandlerOperation operation in operations) {
          operation(self->_manager);
        }
      }];
}

#endif // RCT_NEW_ARCH_ENABLED

#pragma mark Events

- (NSArray<NSString *> *)supportedEvents
{
  return @[ @"onGestureHandlerEvent", @"onGestureHandlerStateChange" ];
}

#pragma mark Module Constants

- (NSDictionary *)constantsToExport
{
  return @{
    @"State" : @{
      @"UNDETERMINED" : @(RNGestureHandlerStateUndetermined),
      @"BEGAN" : @(RNGestureHandlerStateBegan),
      @"ACTIVE" : @(RNGestureHandlerStateActive),
      @"CANCELLED" : @(RNGestureHandlerStateCancelled),
      @"FAILED" : @(RNGestureHandlerStateFailed),
      @"END" : @(RNGestureHandlerStateEnd)
    },
    @"Direction" : @{
      @"RIGHT" : @(RNGestureHandlerDirectionRight),
      @"LEFT" : @(RNGestureHandlerDirectionLeft),
      @"UP" : @(RNGestureHandlerDirectionUp),
      @"DOWN" : @(RNGestureHandlerDirectionDown)
    }
  };
}

#if RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNGestureHandlerModuleSpecJSI>(params);
}
#endif

@end
