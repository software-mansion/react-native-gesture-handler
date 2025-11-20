package com.swmansion.gesturehandler

import com.swmansion.gesturehandler.svg.RNSVGHitTester
import com.swmansion.gesturehandler.svg.RNSVGHitTesterFactory

object GestureHandlerEnvironment {
  val hitTester: RNSVGHitTester by lazy { RNSVGHitTesterFactory.create() }
}

