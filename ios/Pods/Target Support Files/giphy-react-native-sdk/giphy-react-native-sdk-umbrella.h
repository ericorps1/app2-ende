#ifdef __OBJC__
#import <UIKit/UIKit.h>
#else
#ifndef FOUNDATION_EXPORT
#if defined(__cplusplus)
#define FOUNDATION_EXPORT extern "C"
#else
#define FOUNDATION_EXPORT extern
#endif
#endif
#endif

#import "GiphyReactNativeSDK-Bridging-Header.h"

FOUNDATION_EXPORT double giphy_react_native_sdkVersionNumber;
FOUNDATION_EXPORT const unsigned char giphy_react_native_sdkVersionString[];

