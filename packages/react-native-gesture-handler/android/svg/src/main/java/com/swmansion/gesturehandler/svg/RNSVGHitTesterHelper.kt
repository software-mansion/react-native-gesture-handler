package com.swmansion.gesturehandler.svg

internal object RNSVGHitTesterHelper {
  private const val SVG_VIEW_CLASS = "com.horcrux.svg.SvgView"
  private const val IMPLEMENTATION_CLASS =
    "com.swmansion.gesturehandler.svg.SvgHitTesterImpl"

  fun provide(): SvgHitTester {
    return try {
      Class.forName(SVG_VIEW_CLASS)
      val implementationClass = Class.forName(IMPLEMENTATION_CLASS)
      implementationClass.getDeclaredConstructor().newInstance() as SvgHitTester
    } catch (_: ClassNotFoundException) {
      SvgHitTesterNoOp
    } catch (_: ReflectiveOperationException) {
      SvgHitTesterNoOp
    }
  }
}

