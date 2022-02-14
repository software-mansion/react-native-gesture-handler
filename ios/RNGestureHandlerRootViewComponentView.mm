#import "RCTFabricComponentsPlugins.h"

Class<RCTComponentViewProtocol> RNGestureHandlerRootViewCls(void)
{
  // RNGestureHandlerRootView is Android-only but currently
  // `{ excludedPlatforms: ['iOS'] }` in react-native-codegen seems to be buggy
  return nil;
}
