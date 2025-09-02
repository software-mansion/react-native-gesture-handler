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

@property (nonatomic, nonnull) NSMutableSet *nativeHandlers;
@property (nonatomic, nonnull) NSMutableSet *attachedHandlers;

@end

typedef NS_ENUM(NSInteger, RNGestureHandlerMutation) {
  RNGestureHandlerMutationAttach = 1,
  RNGestureHandlerMutationDetach,
  RNGestureHandlerMutationKeep,
};

struct LogicChild {
  RNGHUIView *view;
  std::vector<int> handlerTags;
  NSMutableSet *nativeHandlers;
  NSMutableSet *attachedHandlers;
};

@implementation RNGestureHandlerDetector {
  int _moduleId;
  std::unordered_map<int, LogicChild> logicChildren;
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
    _nativeHandlers = [NSMutableSet set];
    _attachedHandlers = [NSMutableSet set];
  }

  return self;
}

// TODO: I'm not sure whether this is the correct place for cleanup
// Possibly allowing recycling and doing this in prepareForRecycle would be better
- (void)willMoveToWindow:(RNGHWindow *)newWindow
{
  if (newWindow == nil) {
    RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
    react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")
        const auto &props = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(_props);

    for (const auto handler : props.handlerTags) {
      NSNumber *handlerTag = [NSNumber numberWithInt:handler];
      [handlerManager.registry detachHandlerWithTag:handlerTag];
    }
    for (const auto &child : logicChildren) {
      for (id handlerTag : child.second.attachedHandlers) {
        [handlerManager.registry detachHandlerWithTag:handlerTag];
      }
    }
    logicChildren.clear();
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

- (void)dispatchLogicStateChangeEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerLogicStateChange)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerLogicStateChange(event);
  }
}

- (void)dispatchLogicGestureEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerLogicEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerLogicEvent(event);
  }
}

- (void)dispatchLogicTouchEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerLogicTouchEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerLogicTouchEvent(event);
  }
}

- (BOOL)shouldAttachGestureToSubview:(NSNumber *)handlerTag
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];

  return [[[handlerManager registry] handlerWithTag:handlerTag] wantsToAttachDirectlyToView];
}

- (void)didAddSubview:(RNGHUIView *)view
{
  [super didAddSubview:view];

  [self tryAttachNativeHandlersToChildView];
}

- (void)willRemoveSubview:(RNGHUIView *)subview
{
  [self detachNativeGestureHandlers];

  [super willRemoveSubview:subview];
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

- (void)updatePropsInternal:(const std::vector<int> &)handlerTags
             oldHandlerTags:(const std::vector<int> &)oldHandlerTags
                    isLogic:(bool)isLogic
                    viewTag:(const int)viewTag
           attachedHandlers:(NSMutableSet *)attachedHandlers
             nativeHandlers:(NSMutableSet *)nativeHandlers

{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      std::unordered_map<int, RNGestureHandlerMutation>
          changes;
  for (const auto oldHandler : oldHandlerTags) {
    changes[oldHandler] = RNGestureHandlerMutationDetach;
  }

  for (const auto newHandler : handlerTags) {
    changes[newHandler] = changes.contains(newHandler) ? RNGestureHandlerMutationKeep : RNGestureHandlerMutationAttach;
  }

  for (const auto handlerChange : changes) {
    NSNumber *handlerTag = [NSNumber numberWithInt:handlerChange.first];

    if (handlerChange.second == RNGestureHandlerMutationAttach) {
      if ([self shouldAttachGestureToSubview:handlerTag]) {
        // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that
        // case we cannot attach `NativeViewGestureHandlers` here and we have to do it in `didAddSubview` method.
        [nativeHandlers addObject:handlerTag];
      } else {
        if (isLogic) {
          [handlerManager attachGestureHandler:handlerTag
                                 toViewWithTag:@(viewTag)
                                withActionType:RNGestureHandlerActionTypeLogicDetector];
        } else {
          [handlerManager.registry attachHandlerWithTag:handlerTag
                                                 toView:self
                                         withActionType:RNGestureHandlerActionTypeNativeDetector];
        }
        [attachedHandlers addObject:handlerTag];
      }
    } else if (handlerChange.second == RNGestureHandlerMutationDetach) {
      [handlerManager.registry detachHandlerWithTag:handlerTag];
      [attachedHandlers removeObject:handlerTag];
      [nativeHandlers removeObject:handlerTag];
    }
  }

  // This covers the case where `NativeViewGestureHandlers` are attached after child views were created.
  if (!self.subviews[0]) {
    [self tryAttachNativeHandlersToChildView];
  }
}

- (void)updateProps:(const Props::Shared &)propsBase oldProps:(const Props::Shared &)oldPropsBase
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(propsBase);
  const auto &oldProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(oldPropsBase);
  _moduleId = newProps.moduleId;

  static std::vector<int> emptyVector;
  const std::vector<int> &oldHandlerTags = (oldPropsBase != nullptr) ? oldProps.handlerTags : emptyVector;

  [self updatePropsInternal:newProps.handlerTags
             oldHandlerTags:oldHandlerTags
                    isLogic:false
                    viewTag:-1
           attachedHandlers:_attachedHandlers
             nativeHandlers:_nativeHandlers];
  [super updateProps:propsBase oldProps:oldPropsBase];
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      std::unordered_map<int, bool>
          shouldKeepLogicChild;
  for (const std::pair<const int, LogicChild> &child : logicChildren) {
    shouldKeepLogicChild[child.first] = false;
  }

  for (const RNGestureHandlerDetectorLogicChildrenStruct &child : newProps.logicChildren) {
    if (logicChildren.find(child.viewTag) == logicChildren.end()) {
      // Initialize the vector for a new logic child
      logicChildren[child.viewTag].view = [handlerManager viewForReactTag:@(child.viewTag)];
      logicChildren[child.viewTag].handlerTags = {};
      logicChildren[child.viewTag].attachedHandlers = [NSMutableSet set];
      logicChildren[child.viewTag].nativeHandlers = [NSMutableSet set];
      [[handlerManager registry] registerLogicChild:@(child.viewTag) toParent:@(self.tag)];
    }
    shouldKeepLogicChild[child.viewTag] = true;
    [self updatePropsInternal:child.handlerTags
               oldHandlerTags:logicChildren[child.viewTag].handlerTags
                      isLogic:true
                      viewTag:child.viewTag
             attachedHandlers:logicChildren[child.viewTag].attachedHandlers
               nativeHandlers:logicChildren[child.viewTag].nativeHandlers];
  }

  for (const auto &child : shouldKeepLogicChild) {
    if (!child.second) {
      for (id handlerTag : logicChildren[child.first].attachedHandlers) {
        [handlerManager.registry detachHandlerWithTag:handlerTag];
      }
      logicChildren.erase(child.first);
    }
  }

  // Override to force hittesting to work outside bounds
  self.clipsToBounds = NO;
}

- (void)tryAttachNativeHandlersToChildView
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];

  for (NSNumber *handlerTag in _nativeHandlers) {
    [handlerManager.registry attachHandlerWithTag:handlerTag
                                           toView:self.subviews[0]
                                   withActionType:RNGestureHandlerActionTypeNativeDetector];

    [_attachedHandlers addObject:handlerTag];
  }
}

- (void)detachNativeGestureHandlers
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];

  for (NSNumber *handlerTag in _nativeHandlers) {
    [[handlerManager registry] detachHandlerWithTag:handlerTag];
    [_attachedHandlers removeObject:handlerTag];
  }
}

@end

Class<RCTComponentViewProtocol> RNGestureHandlerDetectorCls(void)
{
  return RNGestureHandlerDetector.class;
}
