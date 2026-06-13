// components/ui/LoadingSpinner.tsx
'use client';

import { Loader2, Sparkles } from 'lucide-react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = 'Analyzing your resume...' }: LoadingSpinnerProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.spinnerRing}>
          <Loader2 className={styles.spinnerIcon} />
        </div>
        <div className={styles.particles}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
      <div className={styles.content}>
        <Sparkles className={styles.sparkle} />
        <p className={styles.message}>{message}</p>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepDot} />
            <span>Extracting text from PDF</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepDot} />
            <span>AI analyzing content</span>
          </div>
          <div className={styles.step}>
            <div className={styles.stepDot} />
            <span>Generating suggestions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;