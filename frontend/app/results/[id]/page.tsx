// app/results/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ScoreCard from '@/components/ui/ScoreCard';
import StrengthsWeaknesses from '@/components/ui/StrengthsWeaknesses';
import SuggestionsList from '@/components/ui/SuggestionsList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Download, Share2, ArrowLeft, FileText } from 'lucide-react';
import styles from './page.module.css';

interface AnalysisResult {
  success: boolean;
  id: string;
  ats_score: number;
  role_match_percentage: number;
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    project_idea: string;
  }>;
  estimated_interview_chance: 'low' | 'medium' | 'high';
  one_liner_feedback: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadResult = () => {
      const storedResult = sessionStorage.getItem('analysisResult');
      if (storedResult) {
        setResult(JSON.parse(storedResult));
        setLoading(false);
      } else {
        setError('No analysis result found. Please upload your resume again.');
        setLoading(false);
      }
    };

    loadResult();
  }, [params.id]);

  // Generate HTML Report Content
  const generateHTMLContent = () => {
    if (!result) return '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume Analysis Report - ResumeAI Pro</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            padding: 2rem;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            border-radius: 32px 32px 0 0;
        }
        .header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        .header p {
            opacity: 0.9;
        }
        .content {
            padding: 2rem;
        }
        .score-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .score-card {
            background: #f8fafc;
            border-radius: 20px;
            padding: 1.5rem;
            text-align: center;
        }
        .score-label {
            font-size: 0.875rem;
            color: #64748b;
            margin-bottom: 0.5rem;
        }
        .score-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1e293b;
        }
        .score-unit {
            font-size: 0.875rem;
            color: #94a3b8;
        }
        .feedback-card {
            background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        .feedback-text {
            font-size: 1.125rem;
            color: #4c1d95;
            font-style: italic;
        }
        .section {
            margin-bottom: 2rem;
        }
        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #e2e8f0;
        }
        .strengths {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 16px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .weaknesses {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border-radius: 16px;
            padding: 1rem;
            margin-bottom: 1rem;
        }
        .strength-item, .weakness-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        .check-icon { color: #10b981; font-weight: bold; }
        .x-icon { color: #ef4444; font-weight: bold; }
        .suggestion-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid;
        }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .suggestion-title {
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .keyword {
            background: #f1f5f9;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            color: #475569;
        }
        .footer {
            background: #f8fafc;
            padding: 1.5rem;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.75rem;
            border-radius: 0 0 32px 32px;
        }
        @media print {
            body {
                padding: 0;
            }
            .container {
                box-shadow: none;
            }
        }
        @media (max-width: 768px) {
            .score-section {
                grid-template-columns: 1fr;
            }
            body {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ResumeAI Pro</h1>
            <p>ATS Resume Analysis Report</p>
        </div>
        <div class="content">
            <div class="score-section">
                <div class="score-card">
                    <div class="score-label">ATS Score</div>
                    <div class="score-value">${result.ats_score}<span class="score-unit">/100</span></div>
                </div>
                <div class="score-card">
                    <div class="score-label">Role Match</div>
                    <div class="score-value">${result.role_match_percentage}<span class="score-unit">%</span></div>
                </div>
                <div class="score-card">
                    <div class="score-label">Interview Chance</div>
                    <div class="score-value" style="text-transform: capitalize; font-size: 1.5rem;">${result.estimated_interview_chance}</div>
                </div>
            </div>

            <div class="feedback-card">
                <p class="feedback-text">“${result.one_liner_feedback}”</p>
            </div>

            <div class="section">
                <h2 class="section-title">✓ Strengths</h2>
                <div class="strengths">
                    ${result.strengths.map(s => `<div class="strength-item"><span class="check-icon">✓</span> ${s}</div>`).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">⚠ Areas for Improvement</h2>
                <div class="weaknesses">
                    ${result.weaknesses.map(w => `<div class="weakness-item"><span class="x-icon">✗</span> ${w}</div>`).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">💡 Improvement Suggestions</h2>
                ${result.suggestions.map(s => `
                    <div class="suggestion-card priority-${s.priority}">
                        <div class="suggestion-title">${s.action}</div>
                        <p style="font-size: 0.875rem; color: #475569; margin-bottom: 0.5rem;"><strong>Why:</strong> ${s.reason}</p>
                        <p style="font-size: 0.875rem; color: #6d28d9;"><strong>Project Idea:</strong> ${s.project_idea}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2 class="section-title">📋 Missing Keywords</h2>
                <div class="keywords">
                    ${result.missing_keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
                </div>
            </div>
        </div>
        <div class="footer">
            <p>Generated by ResumeAI Pro - AI-Powered ATS Resume Scorer</p>
            <p>Report Date: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  };

  // Download PDF using browser print
  const handleDownloadPDF = () => {
    if (!result) return;
    
    const htmlContent = generateHTMLContent();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNewAnalysis = () => {
    sessionStorage.removeItem('analysisResult');
    sessionStorage.removeItem('resumeData');
    sessionStorage.removeItem('resumeName');
    router.push('/');
  };

  if (loading) {
    return <LoadingSpinner message="Loading your analysis..." />;
  }

  if (error || !result) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error || 'Analysis result not found'}</p>
          <button onClick={handleNewAnalysis} className={styles.retryBtn}>
            Upload New Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div className={styles.actionButtons}>
          <button onClick={handleDownloadPDF} className={styles.actionBtn}>
            <FileText size={18} />
            Download PDF Report
          </button>
          <button onClick={handleShare} className={styles.actionBtn}>
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <ScoreCard
          atsScore={result.ats_score}
          roleMatch={result.role_match_percentage}
          interviewChance={result.estimated_interview_chance}
          oneLinerFeedback={result.one_liner_feedback}
        />

        <div className={styles.grid}>
          <StrengthsWeaknesses
            strengths={result.strengths}
            weaknesses={result.weaknesses}
          />

          <SuggestionsList suggestions={result.suggestions} />
        </div>

        <div className={styles.missingKeywords}>
          <h3 className={styles.keywordsTitle}>Missing Keywords to Add</h3>
          <div className={styles.keywordsList}>
            {result.missing_keywords.map((keyword, index) => (
              <span key={index} className={styles.keywordChip}>
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <button onClick={handleNewAnalysis} className={styles.newAnalysisBtn}>
          Analyze Another Resume
        </button>
      </div>
    </div>
  );
}