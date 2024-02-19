import React from 'react';
import styles from './styles.module.css';
import InteractiveExampleComponent from '@site/src/components/InteractiveExampleComponent';

interface Props {
  title: string;
  component?: React.ReactNode;
  idx: number;
}

const GestureExampleItem = ({ title, component, idx }: Props) => {
  return (
    <>
      <div className={styles.exampleContainer}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.interactiveExampleWrapper}>
          <InteractiveExampleComponent idx={idx} component={component} />
        </div>
      </div>
    </>
  );
};

export default GestureExampleItem;
