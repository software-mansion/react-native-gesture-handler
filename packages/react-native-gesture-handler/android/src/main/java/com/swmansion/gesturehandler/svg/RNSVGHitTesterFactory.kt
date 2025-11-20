package com.swmansion.gesturehandler.svg

object RNSVGHitTesterFactory {
  private const val SVG_VIEW_CLASS = "com.horcrux.svg.SvgView"
  private const val SVG_IMPLEMENTATION_CLASS =
    "com.swmansion.gesturehandler.svg.RNSVGHitTesterImpl"

  fun create(): RNSVGHitTester {
    return try {
      Class.forName(SVG_VIEW_CLASS)
      val implementationClass = Class.forName(SVG_IMPLEMENTATION_CLASS)
      implementationClass.getDeclaredConstructor().newInstance() as RNSVGHitTester
    } catch (_: ClassNotFoundException) {
      RNSVGHitTesterNoOp()
    } catch (_: ReflectiveOperationException) {
      RNSVGHitTesterNoOp()
    }
  }
}

