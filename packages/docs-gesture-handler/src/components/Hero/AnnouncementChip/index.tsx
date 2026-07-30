import React from 'react';

import styles from './styles.module.css';

const AnnouncementChip: React.FC<{
  label: string;
  linkLabel: string;
  href: string;
}> = ({ label, linkLabel, href }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={styles.chip}>
      <span className={styles.label}>{label}</span>
      <span className={styles.link}>{linkLabel}</span>
    </a>
  );
};

export default AnnouncementChip;
