import GenericTouchable from './GenericTouchable';
import React from 'react';

const TouchableWithoutFeedback = props => <GenericTouchable {...props} />;

TouchableWithoutFeedback.defaultProps = GenericTouchable.defaultProps;

TouchableWithoutFeedback.propTypes = GenericTouchable.publicPropTypes;

export default TouchableWithoutFeedback;
