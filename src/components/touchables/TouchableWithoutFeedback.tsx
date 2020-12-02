// @ts-nocheck
import React from 'react';
import { TouchableWithoutFeedbackProps } from 'react-native';
import GenericTouchable from './GenericTouchable';

import { ContainedTouchableProperties } from '../../types';

const TouchableWithoutFeedback: React.Component<
  TouchableWithoutFeedbackProps | ContainedTouchableProperties
> = React.forwardRef((props, ref) => <GenericTouchable ref={ref} {...props} />);

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

TouchableWithoutFeedback.propTypes = GenericTouchable.publicPropTypes;

export default TouchableWithoutFeedback;
