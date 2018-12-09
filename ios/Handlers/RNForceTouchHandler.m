#import "RNForceTouchHandler.h"

#import <UIKit/UIGestureRecognizerSubclass.h>

#import <React/RCTConvert.h>

@interface RNForceTouchGestureRecognizer : UIGestureRecognizer

@property (nonatomic) CGFloat maxForce;
@property (nonatomic) CGFloat minForce;
@property (nonatomic) BOOL avgForce;


@end

@implementation RNForceTouchGestureRecognizer
- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  
}
- (void)touchesMoved:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  [touches anyObject]
  
}
- (void)touchesEnded:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event
{
  
}
@end

@implementation RNForceTouchHandler

- (instancetype)initWithTag:(NSNumber *)tag
{
  if ((self = [super initWithTag:tag])) {
    _recognizer = [[RNForceTouchGestureRecognizer alloc] init];
  }
  return self;
}

- (void)configure:(NSDictionary *)config
{
  [super configure:config];
  RNForceTouchGestureRecognizer *recognizer = (RNForceTouchGestureRecognizer *)_recognizer;
  

  APPLY_FLOAT_PROP(maxForce);
  APPLY_FLOAT_PROP(minForce);
  
  id prop = config[@"avgForce"];
  if (prop != nil) {
    recognizer.avgForce = [RCTConvert BOOL:prop];
  }
}

@end

