import React, { PropsWithChildren } from 'react';
import styles from './styles.module.css';

interface Props extends PropsWithChildren {
  title: string;
}

const GestureFeatureItem = ({ title, children }: Props) => {
  return (
    <div className={styles.featureItem}>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureBody}>{children}</p>
    </div>
  );
};

export default GestureFeatureItem;
