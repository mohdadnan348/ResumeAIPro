// components/ui/SuggestionsList.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, Lightbulb, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import styles from './SuggestionsList.module.css';

interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  project_idea: string;
}

interface SuggestionsListProps {
  suggestions: Suggestion[];
}

const SuggestionsList = ({ suggestions }: SuggestionsListProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className={styles.priorityIconHigh} />;
      case 'medium':
        return <Lightbulb className={styles.priorityIconMedium} />;
      default:
        return <CheckCircle className={styles.priorityIconLow} />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      default:
        return 'Nice to Have';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Lightbulb size={20} />
          <span>Improvement Suggestions</span>
        </h3>
        <p className={styles.subtitle}>Actionable steps to improve your resume</p>
      </div>

      <div className={styles.suggestionsList}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`${styles.suggestionCard} ${styles[`priority${suggestion.priority}`]}`}
          >
            <div
              className={styles.suggestionHeader}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className={styles.priorityBadge}>
                {getPriorityIcon(suggestion.priority)}
                <span className={styles.priorityText}>{getPriorityLabel(suggestion.priority)}</span>
              </div>
              <div className={styles.suggestionAction}>
                <span className={styles.actionText}>{suggestion.action}</span>
                {expandedIndex === index ? (
                  <ChevronUp size={18} className={styles.chevron} />
                ) : (
                  <ChevronDown size={18} className={styles.chevron} />
                )}
              </div>
            </div>

            {expandedIndex === index && (
              <div className={styles.suggestionDetails}>
                <div className={styles.reasonSection}>
                  <h4 className={styles.sectionTitle}>Why this matters</h4>
                  <p className={styles.reasonText}>{suggestion.reason}</p>
                </div>
                <div className={styles.projectSection}>
                  <h4 className={styles.sectionTitle}>💡 Project Idea</h4>
                  <p className={styles.projectText}>{suggestion.project_idea}</p>
                  <button className={styles.learnMoreBtn}>
                    Learn More
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsList;