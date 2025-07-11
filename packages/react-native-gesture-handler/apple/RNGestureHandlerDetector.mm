#import "RNGestureHandlerDetector.h"
#import "RNGestureHandlerDetectorComponentDescriptor.h"
#import "RNGestureHandlerModule.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

#include <unordered_map>

@interface RNGestureHandlerDetector () <RCTRNGestureHandlerDetectorViewProtocol>
@end

typedef NS_ENUM(NSInteger, RNGestureHandlerMutation) {
  RNGestureHandlerMutationAttach = 1,
  RNGestureHandlerMutationDetach,
  RNGestureHandlerMutationKeep,
};

@implementation RNGestureHandlerDetector {
  int _moduleId;
}

#if TARGET_OS_OSX
+ (BOOL)shouldBeRecycled
{
  return NO;
}
#endif

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RNGestureHandlerDetectorProps>();
    _props = defaultProps;
    _moduleId = -1;
  }

  return self;
}

// TODO: I'm not sure whether this is the correct place for cleanup
// Possibly allowing recycling and doing this in prepareForRecycle would be better
- (void)willMoveToWindow:(UIWindow *)newWindow
{
  if (newWindow == nil) {
    RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
    react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")
        const auto &props = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(_props);

    for (const auto handler : props.handlerTags) {
      NSNumber *handlerTag = [NSNumber numberWithInt:handler];
      [handlerManager.registry detachHandlerWithTag:handlerTag];
    }
  }
}

- (void)dispatchStateChangeEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerStateChange(event);
  }
}

- (void)dispatchGestureEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)->onGestureHandlerEvent(event);
  }
}

- (void)dispatchTouchEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerTouchEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerTouchEvent(event);
  }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerDetectorComponentDescriptor>();
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  auto newLayoutMetrics = layoutMetrics;
  // Override to force hittesting to work outside bounds
  newLayoutMetrics.overflowInset = {.left = 1, .right = 1, .top = 1, .bottom = 1};

  [super updateLayoutMetrics:newLayoutMetrics oldLayoutMetrics:oldLayoutMetrics];
}

- (void)updateProps:(const Props::Shared &)propsBase oldProps:(const Props::Shared &)oldPropsBase
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(propsBase);
  const auto &oldProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(oldPropsBase);

  _moduleId = newProps.moduleId;
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      std::unordered_map<int, RNGestureHandlerMutation>
          changes;

  if (oldPropsBase != nullptr) {
    for (const auto oldHandler : oldProps.handlerTags) {
      changes[oldHandler] = RNGestureHandlerMutationDetach;
    }
  }

  for (const auto newHandler : newProps.handlerTags) {
    changes[newHandler] = changes.contains(newHandler) ? RNGestureHandlerMutationKeep : RNGestureHandlerMutationAttach;
  }

  for (const auto handlerChange : changes) {
    NSNumber *handlerTag = [NSNumber numberWithInt:handlerChange.first];

    if (handlerChange.second == RNGestureHandlerMutationAttach) {
      // TODO: Attach to the child when NativeGestureHandler remounts, track children changes?
      [handlerManager.registry
          attachHandlerWithTag:handlerTag
                        toView:self
                withActionType:newProps.dispatchesAnimatedEvents ? RNGestureHandlerActionTypeNativeDetectorAnimatedEvent
                                                                 : RNGestureHandlerActionTypeNativeDetector];
    } else if (handlerChange.second == RNGestureHandlerMutationDetach) {
      [handlerManager.registry detachHandlerWithTag:handlerTag];
    }
  }

  [super updateProps:propsBase oldProps:oldPropsBase];
  // Override to force hittesting to work outside bounds
  self.clipsToBounds = NO;
}
@end

Class<RCTComponentViewProtocol> RNGestureHandlerDetectorCls(void)
{
  return RNGestureHandlerDetector.class;
}
