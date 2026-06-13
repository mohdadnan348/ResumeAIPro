// components/ui/StrengthsWeaknesses.tsx
'use client';

import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';
import styles from './StrengthsWeaknesses.module.css';

interface StrengthsWeaknessesProps {
  strengths: string[];
  weaknesses: string[];
}

const StrengthsWeaknesses = ({ strengths, weaknesses }: StrengthsWeaknessesProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Strengths Section */}
        <div className={styles.strengthsCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperStrengths}>
              <ThumbsUp size={18} />
            </div>
            <h3 className={styles.cardTitle}>Strengths</h3>
            <span className={styles.badgeStrengths}>What works well</span>
          </div>
          <ul className={styles.list}>
            {strengths.map((strength, index) => (
              <li key={index} className={styles.listItemStrengths}>
                <CheckCircle size={16} className={styles.checkIcon} />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses Section */}
        <div className={styles.weaknessesCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapperWeaknesses}>
              <ThumbsDown size={18} />
            </div>
            <h3 className={styles.cardTitle}>Areas for Improvement</h3>
            <span className={styles.badgeWeaknesses}>Needs attention</span>
          </div>
          <ul className={styles.list}>
            {weaknesses.map((weakness, index) => (
              <li key={index} className={styles.listItemWeaknesses}>
                <XCircle size={16} className={styles.xIcon} />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StrengthsWeaknesses;