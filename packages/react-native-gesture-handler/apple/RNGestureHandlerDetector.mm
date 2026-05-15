#import "RNGestureHandlerDetector.h"
#import "RNGestureHandlerButtonComponentView.h"
#import "RNGestureHandlerDetectorComponentDescriptor.h"
#import "RNGestureHandlerModule.h"

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>

#import <react/renderer/components/rngesturehandler_codegen/EventEmitters.h>
#import <react/renderer/components/rngesturehandler_codegen/Props.h>
#import <react/renderer/components/rngesturehandler_codegen/RCTComponentViewHelpers.h>

#import <React/RCTScrollViewComponentView.h>
#include <unordered_map>

@interface RNGestureHandlerDetector () <RCTRNGestureHandlerDetectorViewProtocol>

@property (nonatomic, nonnull) NSMutableSet *nativeHandlers;
@property (nonatomic, nonnull) NSMutableSet *subscribedHandlers;
@property (nonatomic, nonnull) NSMutableSet *attachedHandlers;
@property (nonatomic) std::unordered_map<int, NSMutableSet *> subscribedVirtualHandlers;

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
    [self setDefaultProps];
  }

  return self;
}

// TODO: I'm not sure whether this is the correct place for cleanup
// Possibly allowing recycling and doing this in prepareForRecycle would be better
- (void)willMoveToWindow:(RNGHWindow *)newWindow
{
  if (newWindow == nil) {
    RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
    react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager");

    [handlerManager.registry cancelAllObservationsForOwner:self];

    for (NSNumber *handlerTag in _attachedHandlers) {
      [handlerManager.registry detachHandlerWithTag:handlerTag fromHostDetector:self];
    }

    [_attachedHandlers removeAllObjects];
    _subscribedVirtualHandlers.clear();
    [_subscribedHandlers removeAllObjects];
    [_nativeHandlers removeAllObjects];
  } else {
    const auto &props = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(_props);
    [self attachHandlers:props.handlerTags
                actionType:RNGestureHandlerActionTypeNativeDetector
                   viewTag:-1
        subscribedHandlers:_subscribedHandlers];
    [self updateVirtualChildren:props.virtualChildren];
  }
}

- (void)setDefaultProps
{
  static const auto defaultProps = std::make_shared<const RNGestureHandlerDetectorProps>();
  _props = defaultProps;
  _moduleId = -1;
  _nativeHandlers = [NSMutableSet set];
  _subscribedHandlers = [NSMutableSet set];
  _attachedHandlers = [NSMutableSet set];
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

- (void)dispatchAnimatedGestureEvent:(RNGestureHandlerDetectorEventEmitter::OnGestureHandlerEvent)event
{
  if (_eventEmitter != nullptr) {
    std::dynamic_pointer_cast<const RNGestureHandlerDetectorEventEmitter>(_eventEmitter)
        ->onGestureHandlerAnimatedEvent({
            .state = event.state,
            .handlerTag = event.handlerTag,
            .handlerData = event.handlerData,
        });
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

- (void)prepareForRecycle
{
  [super prepareForRecycle];

  [self setDefaultProps];
}

- (void)didAddSubview:(RNGHUIView *)view
{
  [super didAddSubview:view];

  if (_nativeHandlers.count > 0) {
    react_native_assert(
        self.subviews.count == 1 &&
        "Cannot have more than one child view when native gesture handlers are attached to the detector");
  }

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
    subscribedHandlers:(NSMutableSet *)subscribedHandlers
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager");

  NSMutableSet *handlersToDetach = [subscribedHandlers mutableCopy];

  __weak __typeof(self) weakSelf = self;
  const int capturedViewTag = viewTag;
  const RNGestureHandlerActionType capturedActionType = actionType;

  for (const int tag : handlerTags) {
    [handlersToDetach removeObject:@(tag)];
    if ([subscribedHandlers containsObject:@(tag)]) {
      continue;
    }
    [handlerManager.registry observeHandlerWithTag:@(tag)
                                             owner:self
                                        usingBlock:^(RNGestureHandler *handler) {
                                          __strong __typeof(weakSelf) strongSelf = weakSelf;
                                          if (strongSelf == nil) {
                                            return;
                                          }
                                          [strongSelf attachReadyHandler:handler
                                                              actionType:capturedActionType
                                                                 viewTag:capturedViewTag];
                                        }];
    [subscribedHandlers addObject:@(tag)];
  }

  for (const id tag : handlersToDetach) {
    [handlerManager.registry cancelObservationForTag:tag owner:self];
    if ([_attachedHandlers containsObject:tag]) {
      [handlerManager.registry detachHandlerWithTag:tag fromHostDetector:self];
      [_attachedHandlers removeObject:tag];
    }
    [subscribedHandlers removeObject:tag];
    [_nativeHandlers removeObject:tag];
  }
}

// Invoked from the registry's `observeHandlerWithTag:` block once the handler is known to exist.
// Branches on handler kind + actionType to pick the right binding flow. May be called multiple
// times for the same tag (handler re-registration), so each branch must be idempotent.
- (void)attachReadyHandler:(RNGestureHandler *)handler
                actionType:(RNGestureHandlerActionType)actionType
                   viewTag:(int)viewTag
{
  RNGestureHandlerManager *manager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(manager != nullptr && "Tried to access a non-existent handler manager");

  if ([handler wantsToAttachDirectlyToView] && actionType == RNGestureHandlerActionTypeNativeDetector) {
    react_native_assert(
        self.subviews.count <= 1 && "Cannot attach native gesture handlers when the detector has multiple children");
    [_nativeHandlers addObject:handler.tag];
    if (self.subviews.count != 0) {
      [self tryAttachNativeHandlersToChildView];
    }
    return;
  }

  if (actionType == RNGestureHandlerActionTypeVirtualDetector) {
    RNGHUIView *targetView = [manager viewForReactTag:@(viewTag)];
    if (targetView != nil) {
      [manager attachGestureHandler:handler.tag
                      toViewWithTag:@(viewTag)
                     withActionType:actionType
                   withHostDetector:self];
    } else {
      // Hierarchy was folded into a single UIView.
      [manager.registry attachHandlerWithTag:handler.tag toView:self withActionType:actionType withHostDetector:self];
      handler.virtualViewTag = @(viewTag);
    }
    [_attachedHandlers addObject:handler.tag];
    return;
  }

  [manager.registry attachHandlerWithTag:handler.tag toView:self withActionType:actionType withHostDetector:self];
  [_attachedHandlers addObject:handler.tag];
}

- (void)updateProps:(const Props::Shared &)propsBase oldProps:(const Props::Shared &)oldPropsBase
{
  const auto &newProps = *std::static_pointer_cast<const RNGestureHandlerDetectorProps>(propsBase);
  _moduleId = newProps.moduleId;

  [self attachHandlers:newProps.handlerTags
              actionType:RNGestureHandlerActionTypeNativeDetector
                 viewTag:-1
      subscribedHandlers:_subscribedHandlers];

  [super updateProps:propsBase oldProps:oldPropsBase];
  [self updateVirtualChildren:newProps.virtualChildren];

  // Override to force hittesting to work outside bounds
  self.clipsToBounds = NO;
}

- (void)updateVirtualChildren:(const std::vector<RNGestureHandlerDetectorVirtualChildrenStruct> &)virtualChildren
{
  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];
  react_native_assert(handlerManager != nullptr && "Tried to access a non-existent handler manager");

  NSMutableSet *virtualChildrenToDetach = [NSMutableSet set];
  for (const auto &child : _subscribedVirtualHandlers) {
    [virtualChildrenToDetach addObject:@(child.first)];
  }

  for (const auto &child : virtualChildren) {
    [virtualChildrenToDetach removeObject:@(child.viewTag)];
  }

  for (const NSNumber *tag : virtualChildrenToDetach) {
    for (id handlerTag : _subscribedVirtualHandlers[tag.intValue]) {
      [handlerManager.registry cancelObservationForTag:handlerTag owner:self];
      if ([_attachedHandlers containsObject:handlerTag]) {
        [handlerManager.registry detachHandlerWithTag:handlerTag fromHostDetector:self];
        [_attachedHandlers removeObject:handlerTag];
      }
    }
    _subscribedVirtualHandlers.erase(tag.intValue);
  }

  for (const auto &child : virtualChildren) {
    if (_subscribedVirtualHandlers.find(child.viewTag) == _subscribedVirtualHandlers.end()) {
      _subscribedVirtualHandlers[child.viewTag] = [NSMutableSet set];
    }
    [self attachHandlers:child.handlerTags
                actionType:RNGestureHandlerActionTypeVirtualDetector
                   viewTag:child.viewTag
        subscribedHandlers:_subscribedVirtualHandlers[child.viewTag]];
  }
}

- (void)tryAttachNativeHandlersToChildView
{
  if (_nativeHandlers.count == 0) {
    return;
  }

  react_native_assert(
      self.subviews.count == 1 &&
      "Cannot have more than one child view when native gesture handlers are attached to the detector");

  RNGestureHandlerManager *handlerManager = [RNGestureHandlerModule handlerManagerForModuleId:_moduleId];

  RNGHUIView *view = self.subviews[0];

  // TODO: figure out how to do it correctly
  if ([view isKindOfClass:[RCTViewComponentView class]]) {
    RCTViewComponentView *componentView = (RCTViewComponentView *)view;
    if (componentView.contentView != nil) {
      view = componentView.contentView;
    } else {
      auto buttonView = [self tryFindGestureHandlerButton:view];
      if (buttonView != nil) {
        view = buttonView;
      }
    }
  }

  for (NSNumber *handlerTag in _nativeHandlers) {
    // Defensive: a tag may be in `_nativeHandlers` from an earlier block fire but the underlying
    // handler may have been dropped since. Skip; a re-registration will fire the block again.
    if ([handlerManager.registry handlerWithTag:handlerTag] == nil) {
      continue;
    }
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
    if (![_attachedHandlers containsObject:handlerTag]) {
      continue;
    }
    [[handlerManager registry] detachHandlerWithTag:handlerTag fromHostDetector:self];
    [_attachedHandlers removeObject:handlerTag];
  }
}

- (RNGHUIView *)tryFindGestureHandlerButton:(RNGHUIView *)inView
{
  if (inView.subviews.count == 0) {
    return nil;
  }

  auto view = inView.subviews[0];

  if ([view isKindOfClass:[RNGestureHandlerButtonComponentView class]]) {
    RCTViewComponentView *componentView = (RCTViewComponentView *)view;

    if (componentView.contentView != nil) {
      return componentView.contentView;
    }
  }

  return nil;
}

@end

Class<RCTComponentViewProtocol> RNGestureHandlerDetectorCls(void)
{
  return RNGestureHandlerDetector.class;
}
