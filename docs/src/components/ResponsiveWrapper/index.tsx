import React from 'react';
import styles from './style.module.css';

export const [appearOnMobile, vanishOnMobile] = [
  styles.appearOnMobile,
  styles.vanishOnMobile,
];

function ResponsiveWrapperComponent({ children, ...props }) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}

function ResponsiveWrapper(props) {
  return (
    <ResponsiveWrapperComponent {...props} />
  );
}

export default ResponsiveWrapper;