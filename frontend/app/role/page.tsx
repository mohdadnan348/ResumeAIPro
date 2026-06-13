// app/role/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleSelector from '@/components/ui/RoleSelector';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { analyzeResume } from '@/lib/api';
import styles from './page.module.css';

export default function RolePage() {
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if resume data exists
    const resumeData = sessionStorage.getItem('resumeData');
    if (!resumeData) {
      router.push('/');
    }
  }, [router]);

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!role) {
      setError('Please select a job role');
      return;
    }

    setLoading(true);
    setError(null);

    const resumeBase64 = sessionStorage.getItem('resumeData');
    const resumeName = sessionStorage.getItem('resumeName');

    if (!resumeBase64) {
      setError('Resume data not found. Please upload again.');
      router.push('/');
      return;
    }

    // Convert base64 to file
    const byteCharacters = atob(resumeBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], resumeName || 'resume.pdf', { type: 'application/pdf' });

    try {
      const result = await analyzeResume(file, role);
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      router.push(`/results/${result.id || Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${styles.completed}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Upload</span>
            </div>
            <div className={styles.stepLine} />
            <div className={`${styles.step} ${styles.active}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Role</span>
            </div>
            <div className={styles.stepLine} />
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepLabel}>Results</span>
            </div>
          </div>

          <h1 className={styles.title}>Select Your Target Role</h1>
          <p className={styles.subtitle}>
            Choose the job role you're applying for to get personalized analysis
          </p>
        </div>

        <div className={styles.content}>
          <RoleSelector
            selectedRole={role}
            onRoleSelect={handleRoleSelect}
            error={error || undefined}
          />

          <button
            onClick={handleAnalyze}
            disabled={!role || loading}
            className={styles.analyzeBtn}
          >
            {loading ? (
              <span className={styles.btnLoading}>
                <span className={styles.spinner} />
                Analyzing...
              </span>
            ) : (
              'Analyze Resume →'
            )}
          </button>
        </div>

        <div className={styles.rolesList}>
          <h3 className={styles.rolesTitle}>Popular Roles</h3>
          <div className={styles.rolesGrid}>
            {[
              'Full Stack Developer',
              'Frontend Developer',
              'Backend Developer',
              'React Native Developer',
              'MERN Stack Developer',
              'Next.js Developer',
            ].map((popularRole) => (
              <button
                key={popularRole}
                onClick={() => handleRoleSelect(popularRole)}
                className={styles.roleChip}
              >
                {popularRole}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="AI is analyzing your resume..." />}
    </div>
  );
}