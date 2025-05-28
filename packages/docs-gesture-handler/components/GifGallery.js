import React, { Children, cloneElement } from 'react';

const GifGallery = ({ children }) => (
  <div style={styles.container}>
    {Children.map(children, e =>
      cloneElement(e, { ...e.props.style, style: styles.img })
    )}
  </div>
);

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
  },
  img: {
    border: '1px solid #acacac',
    borderRadius: '6px',
    boxShadow: '0 0 20px #acacac',
    marginTop: '1em',
    marginBottom: '1em',
  },
};

export default GifGallery;
