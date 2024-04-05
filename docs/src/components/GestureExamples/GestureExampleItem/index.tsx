import React from 'react';
import styles from './styles.module.css';
import LandingExampleComponent from '@site/src/components/LandingExampleComponent';

interface Props {
  title: string;
  component?: React.ReactNode;
  idx: number;
  href: string;
}

const GestureExampleItem = ({ title, component, idx, href }: Props) => {
  return (
    <>
      <div className={styles.exampleContainer}>
        <a className={styles.title} href={href}>
          {title}
        </a>
        <div className={styles.interactiveExampleWrapper}>
          <LandingExampleComponent idx={idx} component={component} />
        </div>
      </div>
    </>
  );
};

export default GestureExampleItem;
