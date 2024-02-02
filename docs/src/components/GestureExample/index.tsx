import React from 'react';
import styles from './styles.module.css';

interface Props {
  title: string;
  component?: React.ReactNode;
}

const GestureExample = ({ title, component }: Props) => {
  return (
    <>
      <div className={styles.exampleContainer}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.circleContainer}>
          <div className={styles.circle} />
        </div>
      </div>
    </>
  );
};

export default GestureExample;
