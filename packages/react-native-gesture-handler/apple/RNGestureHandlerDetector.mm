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

@implementation RNGestureHandlerDetector {
  int _moduleId;
  std::unordered_map<int, NSMutableSet *> logicChildren;
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
      for (id handlerTag : child.second) {
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

- (void)dispatchReanimatedStateChangeEvent:
    (RNGestureHandlerDetectorEventEmitter::OnGestureHandlerReanimatedStateChange)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerReanimatedStateChange(event);
  }
}

- (void)dispatchReanimatedGestureEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerReanimatedEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerReanimatedEvent(event);
  }
}

- (void)dispatchReanimatedTouchEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerReanimatedTouchEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerReanimatedTouchEvent(event);
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

- (void)attachHandlers:(const std::vector<int> &)handlerTags
            actionType:(RNGestureHandlerActionType)actionType
               viewTag:(const int)viewTag
      attachedHandlers:(NSMutableSet *)attachedHandlers
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      NSMutableSet *handlersToDetach = [attachedHandlers mutableCopy];

  for (const int tag : handlerTags) {
    [handlersToDetach removeObject:@(tag)];
    if (![attachedHandlers containsObject:@(tag)]) {
      if ([self shouldAttachGestureToSubview:@(tag)]) {
        // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that
        // case we cannot attach `NativeViewGestureHandlers` here and we have to do it in `didAddSubview` method.
        [_nativeHandlers addObject:@(tag)];
      } else {
        if (actionType == RNGestureHandlerActionTypeLogicDetector) {
          [[[handlerManager registry] handlerWithTag:@(tag)] setParentTag:@(self.tag)];

          [handlerManager attachGestureHandler:@(tag) toViewWithTag:@(viewTag) withActionType:actionType];
        } else {
          [handlerManager.registry attachHandlerWithTag:@(tag) toView:self withActionType:actionType];
        }
        [attachedHandlers addObject:@(tag)];
      }
    }
  }

  for (const id tag : handlersToDetach) {
    [handlerManager.registry detachHandlerWithTag:tag];
    [attachedHandlers removeObject:tag];
    [_nativeHandlers removeObject:tag];
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

  [self attachHandlers:newProps.handlerTags
            actionType:RNGestureHandlerActionTypeNativeDetector
               viewTag:-1
      attachedHandlers:_attachedHandlers];

  [super updateProps:propsBase oldProps:oldPropsBase];
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      NSMutableSet *logicChildrenToDelete = [NSMutableSet set];
  for (const std::pair<const int, NSMutableSet *> &child : logicChildren) {
    [logicChildrenToDelete addObject:@(child.first)];
  }

  for (const RNGestureHandlerDetectorLogicChildrenStruct &child : newProps.logicChildren) {
    if (logicChildren.find(child.viewTag) == logicChildren.end()) {
      logicChildren[child.viewTag] = [NSMutableSet set];
    }

    [logicChildrenToDelete removeObject:@(child.viewTag)];

    [self attachHandlers:child.handlerTags
              actionType:RNGestureHandlerActionTypeLogicDetector
                 viewTag:child.viewTag
        attachedHandlers:logicChildren[child.viewTag]];
  }

  for (const NSNumber *childTag : logicChildrenToDelete) {
    for (id handlerTag : logicChildren[childTag.intValue]) {
      [handlerManager.registry detachHandlerWithTag:handlerTag];
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
