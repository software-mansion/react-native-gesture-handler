function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import * as React from 'react';
import GenericTouchable from './GenericTouchable';
const TouchableWithoutFeedback = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(GenericTouchable, _extends({
  ref: ref
}, props)));
TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;
export default TouchableWithoutFeedback;
//# sourceMappingURL=TouchableWithoutFeedback.js.map