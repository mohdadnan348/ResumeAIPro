// components/ui/ScoreCard.tsx
'use client';

import { Target, TrendingUp, Award, Star, AlertTriangle } from 'lucide-react';
import styles from './ScoreCard.module.css';

interface ScoreCardProps {
  atsScore: number;
  roleMatch: number;
  interviewChance: 'low' | 'medium' | 'high';
  oneLinerFeedback: string;
}

const ScoreCard = ({ atsScore, roleMatch, interviewChance, oneLinerFeedback }: ScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    return 'Needs Improvement';
  };

  const getInterviewChanceIcon = () => {
    switch (interviewChance) {
      case 'high':
        return <Star className={styles.chanceIconHigh} />;
      case 'medium':
        return <TrendingUp className={styles.chanceIconMedium} />;
      default:
        return <AlertTriangle className={styles.chanceIconLow} />;
    }
  };

  const getInterviewChanceText = () => {
    switch (interviewChance) {
      case 'high':
        return 'High Chance';
      case 'medium':
        return 'Medium Chance';
      default:
        return 'Low Chance';
    }
  };

  const scoreColor = getScoreColor(atsScore);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Resume Score Analysis</h3>
        <p className={styles.subtitle}>AI-powered ATS compatibility check</p>
      </div>

      <div className={styles.statsGrid}>
        {/* ATS Score */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Award className={styles.statIcon} style={{ color: scoreColor }} />
            <span className={styles.statLabel}>ATS Score</span>
          </div>
          <div className={styles.scoreCircle}>
            <svg className={styles.progressRing} viewBox="0 0 120 120">
              <circle
                className={styles.progressRingBg}
                cx="60"
                cy="60"
                r="52"
                stroke="#e2e8f0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                className={styles.progressRingFill}
                cx="60"
                cy="60"
                r="52"
                stroke={scoreColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(atsScore / 100) * 326.7} 326.7`}
                strokeLinecap="round"
              />
            </svg>
            <div className={styles.scoreValue}>
              <span className={styles.scoreNumber}>{atsScore}</span>
              <span className={styles.scoreMax}>/100</span>
            </div>
          </div>
          <div className={styles.scoreStatus} style={{ background: `${scoreColor}15`, color: scoreColor }}>
            {getScoreStatus(atsScore)}
          </div>
        </div>

        {/* Role Match */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Target className={styles.statIcon} style={{ color: '#8b5cf6' }} />
            <span className={styles.statLabel}>Role Match</span>
          </div>
          <div className={styles.matchPercentage}>
            <span className={styles.matchNumber}>{roleMatch}%</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${roleMatch}%`, background: '#8b5cf6' }} />
            </div>
          </div>
          <p className={styles.matchDesc}>Alignment with target role requirements</p>
        </div>

        {/* Interview Chance */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            {getInterviewChanceIcon()}
            <span className={styles.statLabel}>Interview Chance</span>
          </div>
          <div className={styles.chanceValue}>
            <span className={styles.chanceText}>{getInterviewChanceText()}</span>
          </div>
          <p className={styles.chanceDesc}>Based on resume strength and role match</p>
        </div>
      </div>

      {/* Feedback */}
      <div className={styles.feedbackCard}>
        <p className={styles.feedbackText}>“{oneLinerFeedback}”</p>
      </div>
    </div>
  );
};

export default ScoreCard;