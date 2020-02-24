import PropTypes from 'prop-types';
import React from 'react';
import { findNodeHandle, View, ViewPropTypes, requireNativeComponent, StyleSheet } from 'react-native';

import createHandler from './createHandler';
import GestureHandlerPropTypes from './GestureHandlerPropTypes';
import PlatformConstants from './PlatformConstants';
import { DragMode } from './DragConstants';

export const TapGestureHandler = createHandler(
  'TapGestureHandler',
  {
    ...GestureHandlerPropTypes,
    maxDurationMs: PropTypes.number,
    maxDelayMs: PropTypes.number,
    numberOfTaps: PropTypes.number,
    maxDeltaX: PropTypes.number,
    maxDeltaY: PropTypes.number,
    maxDist: PropTypes.number,
    minPointers: PropTypes.number,
  },
  {}
);

export const FlingGestureHandler = createHandler(
  'FlingGestureHandler',
  {
    ...GestureHandlerPropTypes,
    numberOfPointers: PropTypes.number,
    direction: PropTypes.number,
  },
  {}
);

class ForceTouchFallback extends React.Component {
  componentDidMount() {
    console.warn(
      'ForceTouchGestureHandler is not available on this platform. Please use ForceTouchGestureHandler.forceTouchAvailable to conditionally render other components that would provide a fallback behavior specific to your usecase'
    );
  }
  render() {
    return this.props.children;
  }
}

export const ForceTouchGestureHandler =
  PlatformConstants && PlatformConstants.forceTouchAvailable
    ? createHandler(
      'ForceTouchGestureHandler',
      {
        ...GestureHandlerPropTypes,
        minForce: PropTypes.number,
        maxForce: PropTypes.number,
        feedbackOnActivation: PropTypes.bool,
      },
      {}
    )
    : ForceTouchFallback;

ForceTouchGestureHandler.forceTouchAvailable =
  (PlatformConstants && PlatformConstants.forceTouchAvailable) || false;

export const LongPressGestureHandler = createHandler(
  'LongPressGestureHandler',
  {
    ...GestureHandlerPropTypes,
    minDurationMs: PropTypes.number,
    maxDist: PropTypes.number,
  },
  {}
);

function validatePanGestureHandlerProps(props) {
  if (props.minDeltaX && props.activeOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.maxDeltaX && props.failOffsetX) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetXStart or activeOffsetXEnd`
    );
  }
  if (props.minDeltaY && props.activeOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (props.maxDeltaY && props.failOffsetY) {
    throw new Error(
      `It's not supported use minDeltaX with activeOffsetYStart or activeOffsetYEnd`
    );
  }
  if (
    Array.isArray(props.activeOffsetX) &&
    (props.activeOffsetX[0] > 0 || props.activeOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.activeOffsetY) &&
    (props.activeOffsetY[0] > 0 || props.activeOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of activeOffsetY should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetX) &&
    (props.failOffsetX[0] > 0 || props.failOffsetX[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetX should be negative, a the second one should be positive`
    );
  }

  if (
    Array.isArray(props.failOffsetY) &&
    (props.failOffsetY[0] > 0 || props.failOffsetY[1] < 0)
  ) {
    throw new Error(
      `First element of failOffsetY should be negative, a the second one should be positive`
    );
  }
}

function transformPanGestureHandlerProps(props) {
  const res = { ...props };
  if (props.minDeltaX !== undefined) {
    delete res['minDeltaX'];
    res.activeOffsetXStart = -props.minDeltaX;
    res.activeOffsetXEnd = props.minDeltaX;
  }
  if (props.maxDeltaX !== undefined) {
    delete res['maxDeltaX'];
    res.failOffsetXStart = -props.maxDeltaX;
    res.failOffsetXEnd = props.maxDeltaX;
  }
  if (props.minOffsetX !== undefined) {
    delete res['minOffsetX'];
    if (props.minOffsetX < 0) {
      res.activeOffsetXStart = props.minOffsetX;
    } else {
      res.activeOffsetXEnd = props.minOffsetX;
    }
  }

  if (props.minDeltaY !== undefined) {
    delete res['minDeltaY'];
    res.activeOffsetYStart = -props.minDeltaY;
    res.activeOffsetYEnd = props.minDeltaY;
  }
  if (props.maxDeltaY !== undefined) {
    delete res['maxDeltaY'];
    res.failOffsetYStart = -props.maxDeltaY;
    res.failOffsetYEnd = props.maxDeltaY;
  }

  if (props.minOffsetY !== undefined) {
    delete res['minOffsetY'];
    if (props.minOffsetY < 0) {
      res.activeOffsetYStart = props.minOffsetY;
    } else {
      res.activeOffsetYEnd = props.minOffsetY;
    }
  }

  if (props.activeOffsetX !== undefined) {
    delete res['activeOffsetX'];
    if (Array.isArray(props.activeOffsetX)) {
      res.activeOffsetXStart = props.activeOffsetX[0];
      res.activeOffsetXEnd = props.activeOffsetX[1];
    } else if (props.activeOffsetX < 0) {
      res.activeOffsetXStart = props.activeOffsetX;
    } else {
      res.activeOffsetXEnd = props.activeOffsetX;
    }
  }

  if (props.activeOffsetY !== undefined) {
    delete res['activeOffsetY'];
    if (Array.isArray(props.activeOffsetY)) {
      res.activeOffsetYStart = props.activeOffsetY[0];
      res.activeOffsetYEnd = props.activeOffsetY[1];
    } else if (props.activeOffsetY < 0) {
      res.activeOffsetYStart = props.activeOffsetY;
    } else {
      res.activeOffsetYEnd = props.activeOffsetY;
    }
  }

  if (props.failOffsetX !== undefined) {
    delete res['failOffsetX'];
    if (Array.isArray(props.failOffsetX)) {
      res.failOffsetXStart = props.failOffsetX[0];
      res.failOffsetXEnd = props.failOffsetX[1];
    } else if (props.failOffsetX < 0) {
      res.failOffsetXStart = props.failOffsetX;
    } else {
      res.failOffsetXEnd = props.failOffsetX;
    }
  }

  if (props.failOffsetY !== undefined) {
    delete res['failOffsetY'];
    if (Array.isArray(props.failOffsetY)) {
      res.failOffsetYStart = props.failOffsetY[0];
      res.failOffsetYEnd = props.failOffsetY[1];
    } else if (props.failOffsetY < 0) {
      res.failOffsetYStart = props.failOffsetY;
    } else {
      res.failOffsetYEnd = props.failOffsetY;
    }
  }

  return res;
}

function managePanProps(props) {
  if (__DEV__) {
    validatePanGestureHandlerProps(props);
  }
  return transformPanGestureHandlerProps(props);
}

export const PanGestureHandler = createHandler(
  'PanGestureHandler',
  {
    ...GestureHandlerPropTypes,
    activeOffsetY: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    activeOffsetX: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    failOffsetY: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    failOffsetX: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    minDist: PropTypes.number,
    minVelocity: PropTypes.number,
    minVelocityX: PropTypes.number,
    minVelocityY: PropTypes.number,
    minPointers: PropTypes.number,
    maxPointers: PropTypes.number,
    avgTouches: PropTypes.bool,
  },
  {},
  managePanProps,
  {
    activeOffsetYStart: true,
    activeOffsetYEnd: true,
    activeOffsetXStart: true,
    activeOffsetXEnd: true,
    failOffsetYStart: true,
    failOffsetYEnd: true,
    failOffsetXStart: true,
    failOffsetXEnd: true,
  }
);
export const PinchGestureHandler = createHandler(
  'PinchGestureHandler',
  GestureHandlerPropTypes,
  {}
);
export const RotationGestureHandler = createHandler(
  'RotationGestureHandler',
  GestureHandlerPropTypes,
  {}
);

const DragGestureHandlerBase = createHandler(
  'DragGestureHandler',
  {
    ...GestureHandlerPropTypes,
    data: PropTypes.object.isRequired,
    types: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired,
    shadowEnabled: PropTypes.bool,
    shadowViewTag: PropTypes.number,
    shadow: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.func,
      PropTypes.object,
    ]),
    dragMode: PropTypes.oneOf([
      ...Object.keys(DragMode).map(key => key.toLowerCase()),
      ...Object.keys(DragMode).map(key => DragMode[key])
    ])
  },
  {},
  (props) => {
    const { shadow, ...res } = props;
    // `shadow` prop is handled by DragGestureHandler
    return res;
  },
  {
    data: true,
    types: true,
    shadowEnabled: true,
    shadowViewTag: true,
    dragMode: true
  }
);
export class DragGestureHandler extends DragGestureHandlerBase {

  static GestureHandlerDragShadowView = requireNativeComponent(
    'GestureHandlerDragShadowView',
    {
      name: 'GestureHandlerDragShadowView',
      propTypes: {
        ...ViewPropTypes,
      },
    }
  );

  static _defaultStyle = StyleSheet.create({
    shadow: {
      position: 'absolute',
      opacity: 0
    }
  });

  _shadowRef = React.createRef();

  componentDidMount() {
    const { shadow } = this.props;
    super.componentDidMount();
    if (this._needsToRenderShadow() || (shadow && shadow.current === null)) {
      // resolve `shadow` prop ref
      if (this._updateEnqueued) {
        clearImmediate(this._updateEnqueued);
      }
      this._updateEnqueued = setImmediate(() => {
        this._updateEnqueued = null;
        this._update();
      });
    }
  }

  _needsToRenderShadow() {
    const { shadow } = this.props;
    return typeof shadow === 'function' || React.isValidElement(shadow);
  }

  _renderShadow() {
    const { shadow } = this.props;
    return typeof shadow === 'function' ?
      shadow() :
      React.isValidElement(shadow) ?
        shadow :
        null;
  }

  _filterConfig() {
    const config = super._filterConfig();
    const { shadowViewTag, shadow } = this.props;
    if (shadowViewTag) {
      // remains the same
    } else if (this._needsToRenderShadow()) {
      config.shadowViewTag = this._shadowRef.current ? findNodeHandle(this._shadowRef.current) : null;
    } else if (shadow && shadow.current) {
      config.shadowViewTag = shadow.current ? findNodeHandle(shadow.current) : null;
    }
    return config;
  }

  _shadowHandler = (ref) => {
    this._shadowRef = ref;
    if (this._shadowRef) {
      this._update();
    }
  }

  render() {
    const base = super.render();
    const shadow = this._needsToRenderShadow() && (
      <DragGestureHandler.GestureHandlerDragShadowView
        collapsable={false}
        pointerEvents='none'
        style={DragGestureHandler._defaultStyle.shadow}
        ref={this._shadowRef}
        dragGestureHandlerTag={this._handlerTag}
      >
        {this._renderShadow()}
      </DragGestureHandler.GestureHandlerDragShadowView>
    );
    return (
      <>
        {base}
        {shadow}
      </>
    );
  }
}

export const DropGestureHandler = createHandler(
  'DropGestureHandler',
  {
    ...GestureHandlerPropTypes,
    types: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]).isRequired
  },
  {},
  null,
  { types: true }
);