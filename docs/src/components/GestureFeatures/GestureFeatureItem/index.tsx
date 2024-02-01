import React, { PropsWithChildren } from 'react';
import styles from './styles.module.css';

interface Props extends PropsWithChildren{
    title: string;
}

const GestureFeatureItem = ({ title, children } : Props) => {
  return (
    <div className={styles.featureItem}>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
};

export default GestureFeatureItem;
