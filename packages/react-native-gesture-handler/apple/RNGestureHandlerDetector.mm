#ifdef RCT_NEW_ARCH_ENABLED

#import "RNGestureHandlerDetector.h"
#import "RNGestureHandlerDetectorComponentDescriptor.h"
#import "RNGestureHandlerModule.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

#include <unordered_map>

using namespace facebook::react;

@interface RNGestureHandlerDetector () <RCTRNGestureHandlerDetectorViewProtocol>
@end

@implementation RNGestureHandlerDetector {
  int _moduleId;
}

#if TARGET_OS_OSX
+ (BOOL)shouldBeRecycled
{
  return NO;
}
#endif

// Needed because of this: https://github.com/facebook/react-native/pull/37274
+ (void)load
{
  [super load];
}

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

- (void)dispatchStateChangeEvent:
    (facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerStateChange)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const facebook::react::RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerStateChange(event);
  }
}

- (void)dispatchGestureEvent:(facebook::react::RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const facebook::react::RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerEvent(event);
  }
}

#pragma mark - RCTComponentViewProtocol

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RNGestureHandlerDetectorComponentDescriptor>();
}

- (void)updateProps:(const Props::Shared &)propsBase oldProps:(const Props::Shared &)oldPropsBase
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(propsBase);
  const auto &oldProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(oldPropsBase);

  _moduleId = newProps.moduleId;
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      const int KEEP = 0,
                DROP = 1, ATTACH = 2;
  std::unordered_map<int, int> changes;

  if (oldPropsBase != nullptr) {
    for (const auto oldHandler : oldProps.handlerTags) {
      changes[oldHandler] = DROP;
    }
  }

  for (const auto newHandler : newProps.handlerTags) {
    changes[newHandler] = changes.contains(newHandler) ? KEEP : ATTACH;
  }

  for (const auto handlerChange : changes) {
    NSNumber *handlerTag = [NSNumber numberWithInt:handlerChange.first];

    // TODO: Do this better than exposing handlerManager as a static property
    if (handlerChange.second == ATTACH) {
      // TODO: Attach to the child when NativeGestureHandler, track children changes?
      [handlerManager.registry attachHandlerWithTag:handlerTag
                                             toView:self
                                     withActionType:RNGestureHandlerActionTypeNativeDetector];
    } else if (handlerChange.second == DROP) {
      [handlerManager.registry detachHandlerWithTag:handlerTag];
    }
  }

  [super updateProps:propsBase oldProps:oldPropsBase];
}
@end

Class<RCTComponentViewProtocol> RNGestureHandlerDetectorCls(void)
{
  return RNGestureHandlerDetector.class;
}

#endif // RCT_NEW_ARCH_ENABLED
