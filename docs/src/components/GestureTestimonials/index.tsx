import React from 'react';
import styles from './styles.module.css';
import GestureTestimonialList from '@site/src/components/GestureTestimonials/GestureTestimonialList';

const GestureTestimonals = () => {
  return (
    <div className={styles.testimonialsContainer}>
      <h2 className={styles.title}>Testimonials</h2>
      <GestureTestimonialList />
    </div>
  );
};

export default GestureTestimonals;
