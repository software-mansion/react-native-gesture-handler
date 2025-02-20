#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RNGestureHandlerDetectorManager : RCTViewManager
@end

@implementation RNGestureHandlerDetectorManager

RCT_EXPORT_MODULE(RNGestureHandlerDetector)

RCT_EXPORT_VIEW_PROPERTY(handlerTags, NSArray)

@end
