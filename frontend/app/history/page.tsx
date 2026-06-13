// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, Eye, Trash2, ExternalLink } from 'lucide-react';
import { getHistory, deleteAnalysis } from '@/lib/api';
import { formatDate, getScoreColor, getInterviewChanceColor } from '@/lib/utils';
import styles from './page.module.css';

interface HistoryItem {
  id: string;
  role: string;
  atsScore: number;
  matchPercentage: number;
  interviewChance: string;
  feedback: string;
  date: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/results/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      await deleteAnalysis(id);
      setHistory(history.filter(item => item.id !== id));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading history...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analysis History</h1>
        <p className={styles.subtitle}>View all your previous resume analyses</p>
      </div>

      {history.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <h3 className={styles.emptyTitle}>No analyses yet</h3>
          <p className={styles.emptyText}>
            Upload your first resume to get AI-powered analysis
          </p>
          <button onClick={() => router.push('/')} className={styles.uploadBtn}>
            Upload Resume
          </button>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((item) => (
            <div key={item.id} className={styles.historyCard}>
              <div className={styles.cardHeader}>
                <div className={styles.roleInfo}>
                  <h3 className={styles.roleName}>{item.role}</h3>
                  <span className={styles.date}>
                    <Calendar size={14} />
                    {formatDate(item.date)}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleView(item.id)}
                    className={styles.viewBtn}
                    title="View details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.deleteBtn}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>ATS Score</span>
                  <span
                    className={styles.statValue}
                    style={{ color: getScoreColor(item.atsScore) }}
                  >
                    {item.atsScore}/100
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Role Match</span>
                  <span className={styles.statValue}>{item.matchPercentage}%</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Interview Chance</span>
                  <span
                    className={`${styles.chanceBadge} ${
                      item.interviewChance === 'high'
                        ? styles.chanceHigh
                        : item.interviewChance === 'medium'
                        ? styles.chanceMedium
                        : styles.chanceLow
                    }`}
                  >
                    {item.interviewChance}
                  </span>
                </div>
              </div>

              <p className={styles.feedback}>{item.feedback}</p>

              <button
                onClick={() => handleView(item.id)}
                className={styles.detailsBtn}
              >
                View Full Analysis
                <ExternalLink size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}