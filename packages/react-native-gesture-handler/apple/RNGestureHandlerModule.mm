#import "RNGestureHandlerModule.h"

#import <React/RCTComponent.h>
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTUIManagerObserverCoordinator.h>
#import <React/RCTUIManagerUtils.h>
#import <React/RCTViewManager.h>

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>
#import <ReactCommon/CallInvoker.h>
#import <ReactCommon/RCTTurboModule.h>
#import <ReactCommon/RCTTurboModuleWithJSIBindings.h>

#import "RNGHRuntimeDecorator.h"

#import "RNGestureHandler.h"
#import "RNGestureHandlerDirection.h"
#import "RNGestureHandlerState.h"

#import "RNGestureHandlerButton.h"

#import <React/RCTJSThread.h>
#import <jsi/jsi.h>

using namespace gesturehandler;
using namespace facebook;
using namespace react;

@interface RNGestureHandlerModule () <RCTTurboModule, RCTTurboModuleWithJSIBindings>

@end

typedef void (^GestureHandlerOperation)(RNGestureHandlerManager *manager);

@implementation RNGestureHandlerModule {
  // Oparations called after views have been updated.
  NSMutableArray<GestureHandlerOperation> *_operations;

  jsi::Runtime *_rnRuntime;
  int _moduleId;

  bool _checkedIfReanimatedIsAvailable;
  bool _isReanimatedAvailable;
  bool _uiRuntimeDecorated;
}

@synthesize viewRegistry_DEPRECATED = _viewRegistry_DEPRECATED;

static std::unordered_map<int, RNGestureHandlerManager *> _managers;

+ (RNGestureHandlerManager *)handlerManagerForModuleId:(int)moduleId
{
  return _managers[moduleId];
}

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)invalidate
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  dispatch_async(dispatch_get_main_queue(), ^{
    [handlerManager dropAllGestureHandlers];
  });

  _managers[_moduleId] = nullptr;
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

- (void)installJSIBindingsWithRuntime:(jsi::Runtime &)rnRuntime
                          callInvoker:(const std::shared_ptr<facebook::react::CallInvoker> &)callinvoker
{
  _rnRuntime = &rnRuntime;
  __weak RNGestureHandlerModule *weakSelf = self;

  RNGHRuntimeDecorator::installRNRuntimeBindings(rnRuntime, _moduleId, [weakSelf](int handlerTag, int state) {
    RNGestureHandlerModule *strongSelf = weakSelf;
    if (strongSelf != nil) {
      [strongSelf setGestureState:state forHandler:handlerTag];
    }
  });
}

- (void)initialize
{
  static int nextModuleId = 0;
  _moduleId = nextModuleId++;
  _managers[_moduleId] = [[RNGestureHandlerManager alloc] initWithModuleRegistry:self.moduleRegistry
                                                                    viewRegistry:_viewRegistry_DEPRECATED];
  _operations = [NSMutableArray new];
}

- (bool)installUIRuntimeBindings
{
  __weak RNGestureHandlerModule *weakSelf = self;

  return RNGHRuntimeDecorator::installUIRuntimeBindings(*_rnRuntime, _moduleId, [weakSelf](int handlerTag, int state) {
    RNGestureHandlerModule *strongSelf = weakSelf;
    if (strongSelf != nil) {
      [strongSelf setGestureState:state forHandler:handlerTag];
    }
  });
}

- (NSNumber *)createGestureHandler:(NSString *)handlerName handlerTag:(double)handlerTag config:(NSDictionary *)config
{
  if (!_checkedIfReanimatedIsAvailable) {
    _isReanimatedAvailable = [self.moduleRegistry moduleForName:"ReanimatedModule"] != nil;
  }

  if (_isReanimatedAvailable && !_uiRuntimeDecorated) {
    _uiRuntimeDecorated = [self installUIRuntimeBindings];
  }

  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager createGestureHandler:handlerName tag:[NSNumber numberWithDouble:handlerTag] config:config];
  }];

  return @1;
}

- (void)attachGestureHandler:(double)handlerTag newView:(double)viewTag actionType:(double)actionType
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager attachGestureHandler:[NSNumber numberWithDouble:handlerTag]
                    toViewWithTag:[NSNumber numberWithDouble:viewTag]
                   withActionType:(RNGestureHandlerActionType)[[NSNumber numberWithDouble:actionType] integerValue]];
  }];
}

- (void)setGestureHandlerConfig:(double)handlerTag newConfig:(NSDictionary *)config
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager setGestureHandlerConfig:[NSNumber numberWithDouble:handlerTag] config:config];
  }];
}

- (void)updateGestureHandlerConfig:(double)handlerTag newConfig:(NSDictionary *)config
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager updateGestureHandlerConfig:[NSNumber numberWithDouble:handlerTag] config:config];
  }];
}

- (void)configureRelations:(double)handlerTag relations:(NSDictionary *)relations
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager updateGestureHandlerRelations:[NSNumber numberWithDouble:handlerTag] relations:relations];
  }];
}

- (void)dropGestureHandler:(double)handlerTag
{
  [self addOperationBlock:^(RNGestureHandlerManager *manager) {
    [manager dropGestureHandler:[NSNumber numberWithDouble:handlerTag]];
  }];
}

- (void)flushOperations
{
  // On the new arch we rely on `flushOperations` for scheduling the operations on the UI thread.
  // On the old arch we rely on `uiManagerWillPerformMounting`
  if (_operations.count == 0) {
    return;
  }

  RNGestureHandlerManager *manager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  NSArray<GestureHandlerOperation> *operations = _operations;
  _operations = [NSMutableArray new];

  [self.viewRegistry_DEPRECATED addUIBlock:^(RCTViewRegistry *viewRegistry) {
    for (GestureHandlerOperation operation in operations) {
      operation(manager);
    }
  }];
}

- (void)setGestureState:(int)state forHandler:(int)handlerTag
{
  if (RCTIsMainQueue()) {
    [self setGestureStateSync:state forHandler:handlerTag];
  } else {
    RCTExecuteOnMainQueue(^{
      [self setGestureStateSync:state forHandler:handlerTag];
    });
  }
}

- (void)setGestureStateSync:(int)state forHandler:(int)handlerTag
{
  RCTAssertMainQueue();
  RNGestureHandlerManager *manager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  RNGestureHandler *handler = [manager handlerWithTag:@(handlerTag)];

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

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNGestureHandlerModuleSpecJSI>(params);
}

@end
