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
@property (nonatomic) std::unordered_map<int, NSMutableSet *> attachedVirtualHandlers;

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
    for (const auto &child : _attachedVirtualHandlers) {
      for (id handlerTag : child.second) {
        [handlerManager.registry detachHandlerWithTag:handlerTag];
      }
    }
    _attachedVirtualHandlers.clear();
    _attachedHandlers = [NSMutableSet set];
  } else {
    const auto &props = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(_props);
    [self attachHandlers:props.handlerTags
              actionType:RNGestureHandlerActionTypeNativeDetector
                 viewTag:-1
        attachedHandlers:_attachedHandlers];
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
      if ([self shouldAttachGestureToSubview:@(tag)] && actionType == RNGestureHandlerActionTypeNativeDetector) {
        // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that
        // case we cannot attach `NativeViewGestureHandlers` here and we have to do it in `didAddSubview` method.
        [_nativeHandlers addObject:@(tag)];
      } else {
        if (actionType == RNGestureHandlerActionTypeVirtualDetector) {
          RNGHUIView *targetView = [handlerManager viewForReactTag:@(viewTag)];

          if (targetView != nil) {
            [handlerManager attachGestureHandler:@(tag)
                                   toViewWithTag:@(viewTag)
                                  withActionType:actionType
                                withHostDetector:self];
          } else {
            // Let's assume that if the native view for the virtual detector hasn't been found, the hierarchy was folded
            // into a single UIView.
            [handlerManager.registry attachHandlerWithTag:@(tag)
                                                   toView:self
                                           withActionType:actionType
                                         withHostDetector:self];
            [[handlerManager registry] handlerWithTag:@(tag)].virtualViewTag = @(viewTag);
          }
        } else {
          [handlerManager.registry attachHandlerWithTag:@(tag)
                                                 toView:self
                                         withActionType:actionType
                                       withHostDetector:self];
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
  if (self.subviews[0]) {
    [self tryAttachNativeHandlersToChildView];
  }
}

- (void)updateProps:(const Props::Shared &)propsBase oldProps:(const Props::Shared &)oldPropsBase
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(propsBase);
  _moduleId = newProps.moduleId;

  [self attachHandlers:newProps.handlerTags
            actionType:RNGestureHandlerActionTypeNativeDetector
               viewTag:-1
      attachedHandlers:_attachedHandlers];

  [super updateProps:propsBase oldProps:oldPropsBase];
  [self updateVirtualChildren:newProps.virtualChildren];

  // Override to force hittesting to work outside bounds
  self.clipsToBounds = NO;
}

- (void)updateVirtualChildren:(const std::vector<RNGestureHandlerDetectorVirtualChildrenStruct> &)virtualChildren
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager")

      NSMutableSet *virtualChildrenToDetach = [NSMutableSet set];
  for (const auto &child : _attachedVirtualHandlers) {
    [virtualChildrenToDetach addObject:@(child.first)];
  }

  for (const auto &child : virtualChildren) {
    [virtualChildrenToDetach removeObject:@(child.viewTag)];
  }

  for (const NSNumber *tag : virtualChildrenToDetach) {
    for (id handlerTag : _attachedVirtualHandlers[tag.intValue]) {
      [handlerManager.registry detachHandlerWithTag:handlerTag];
    }
    _attachedVirtualHandlers.erase(tag.intValue);
  }

  for (const auto &child : virtualChildren) {
    if (_attachedVirtualHandlers.find(child.viewTag) == _attachedVirtualHandlers.end()) {
      _attachedVirtualHandlers[child.viewTag] = [NSMutableSet set];
    }
    [self attachHandlers:child.handlerTags
              actionType:RNGestureHandlerActionTypeVirtualDetector
                 viewTag:child.viewTag
        attachedHandlers:_attachedVirtualHandlers[child.viewTag]];
  }
}

- (void)tryAttachNativeHandlersToChildView
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];

  RNGHUIView *view = self.subviews[0];

  if ([view isKindOfClass:[RCTViewComponentView class]]) {
    RCTViewComponentView *componentView = (RCTViewComponentView *)view;
    if (componentView.contentView != nil) {
      view = componentView.contentView;
    }
  }

  for (NSNumber *handlerTag in _nativeHandlers) {
    [handlerManager.registry attachHandlerWithTag:handlerTag
                                           toView:view
                                   withActionType:RNGestureHandlerActionTypeNativeDetector
                                 withHostDetector:self];

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
