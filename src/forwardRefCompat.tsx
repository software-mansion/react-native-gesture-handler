import React from 'react';

let forwardRef: typeof React.forwardRef;

// @ts-ignore React.createFactory was removed in React 0.19, we can rely on this to determine the version
if (React.createFactory) {
  // React 0.18
  forwardRef = React.forwardRef;
} else {
  // React 0.19
  // @ts-ignore The difference between this one and the one from React Native is $$typeof symbol
  forwardRef = (render) => {
    return ({ ref, ...rest }) => {
      return render(rest as any, ref ?? null);
    };
  };
}

export { forwardRef };
