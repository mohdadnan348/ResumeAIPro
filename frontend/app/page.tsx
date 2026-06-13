// app/page.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, FileText, X, CheckCircle, AlertCircle, Briefcase, 
  ChevronDown, Search, Sparkles, Shield, Zap, Star, 
  ArrowRight, Check, Loader2, Trash2, Plus 
} from 'lucide-react';
import { validatePDFFile } from '@/lib/utils';
import { analyzeResume } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import styles from './page.module.css';

const AVAILABLE_ROLES = [
  { title: 'Full Stack Developer', icon: '💻', color: '#6366f1' },
  { title: 'Frontend Developer', icon: '🎨', color: '#3b82f6' },
  { title: 'Backend Developer', icon: '⚙️', color: '#10b981' },
  { title: 'React Native Developer', icon: '📱', color: '#06b6d4' },
  { title: 'MERN Stack Developer', icon: '🔥', color: '#f59e0b' },
  { title: 'Next.js Developer', icon: '▲', color: '#000000' },
  { title: 'Node.js Developer', icon: '🟢', color: '#339933' },
  { title: 'AI/ML Engineer', icon: '🧠', color: '#8b5cf6' },
  { title: 'Software Engineer', icon: '🖥️', color: '#ef4444' },
  { title: 'DevOps Engineer', icon: '🚀', color: '#06b6d4' },
];

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredRoles = AVAILABLE_ROLES.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (selectedFile: File | null) => {
    if (selectedFile) {
      const validation = validatePDFFile(selectedFile);
      if (validation.valid) {
        setFile(selectedFile);
        setError(null);
        simulateProgress();
      } else {
        setError(validation.error || 'Invalid file');
      }
    } else {
      setFile(null);
      setUploadProgress(0);
    }
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setCustomRole('');
    setIsCustomMode(false);
    setIsDropdownOpen(false);
    setSearchTerm('');
    setError(null);
  };

  const handleCustomRoleToggle = () => {
    setIsCustomMode(true);
    setRole('');
    setIsDropdownOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      handleFileSelect(droppedFile);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload your resume');
      return;
    }

    if (!role && !customRole) {
      setError('Please select or enter a job role');
      return;
    }

    setLoading(true);
    setError(null);

    const targetRole = role || customRole;

    try {
      const result = await analyzeResume(file, targetRole);
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      sessionStorage.setItem('resumeName', file.name);
      router.push(`/results/${result.id || Date.now()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectedRoleData = AVAILABLE_ROLES.find(r => r.title === role);

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.bgGradient}>
        <div className={styles.bgBlur1} />
        <div className={styles.bgBlur2} />
        <div className={styles.bgBlur3} />
      </div>

      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span className={styles.badgeText}>AI-Powered Analysis</span>
          </div>
          <h1 className={styles.title}>
            Smart ATS Resume
            <span className={styles.titleHighlight}> Scorer</span>
          </h1>
          <p className={styles.description}>
            Upload your resume and get instant AI-powered analysis with ATS score,
            role match percentage, and actionable suggestions to land your dream job.
          </p>
          
          {/* Stats Row */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <Shield size={18} />
              <span>98% Accuracy</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <Zap size={18} />
              <span>Instant Results</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <Star size={18} />
              <span>10k+ Resumes Analyzed</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${styles.active}`}>
              <div className={styles.stepCircle}>
                <span className={styles.stepNumber}>1</span>
              </div>
              <span className={styles.stepLabel}>Upload Resume</span>
            </div>
            <div className={styles.stepLine}>
              <div className={`${styles.stepLineFill} ${file ? styles.stepLineCompleted : ''}`} />
            </div>
            <div className={`${styles.step} ${file ? styles.completed : ''}`}>
              <div className={styles.stepCircle}>
                {file ? <Check size={16} /> : <span className={styles.stepNumber}>2</span>}
              </div>
              <span className={styles.stepLabel}>Select Role</span>
            </div>
            <div className={styles.stepLine}>
              <div className={`${styles.stepLineFill} ${file && role ? styles.stepLineCompleted : ''}`} />
            </div>
            <div className={`${styles.step} ${file && role ? styles.completed : ''}`}>
              <div className={styles.stepCircle}>
                <span className={styles.stepNumber}>3</span>
              </div>
              <span className={styles.stepLabel}>Get Results</span>
            </div>
          </div>

          <div className={styles.form}>
            {/* File Upload Section */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <FileText size={16} />
                <span>Upload Resume (PDF)</span>
              </label>
              
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`${styles.dropzone} ${isDragging ? styles.dragActive : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                  />
                  <div className={styles.dropzoneContent}>
                    <div className={styles.iconWrapper}>
                      <Upload className={styles.uploadIcon} />
                    </div>
                    <h3 className={styles.dropzoneTitle}>Drop your resume here</h3>
                    <p className={styles.dropzoneSubtitle}>
                      or click to browse
                    </p>
                    <div className={styles.fileSpecs}>
                      <span className={styles.spec}>📄 PDF only</span>
                      <span className={styles.spec}>📏 Max 5MB</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.filePreview}>
                  <div className={styles.filePreviewContent}>
                    <div className={styles.fileIconWrapper}>
                      <FileText className={styles.fileIcon} />
                    </div>
                    <div className={styles.fileInfo}>
                      <p className={styles.fileName}>{file.name}</p>
                      <p className={styles.fileSize}>
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                      {uploadProgress < 100 && (
                        <div className={styles.progressBar}>
                          <div className={styles.progressFill} style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                    </div>
                    <button onClick={handleRemoveFile} className={styles.removeBtn}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {uploadProgress === 100 && (
                    <div className={styles.fileSuccess}>
                      <CheckCircle size={16} />
                      <span>File uploaded successfully</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Role Selection Section */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Briefcase size={16} />
                <span>Target Job Role</span>
              </label>

              {/* Role Type Toggle */}
              <div className={styles.roleToggle}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMode(false);
                    setRole('');
                    setError(null);
                  }}
                  className={`${styles.toggleBtn} ${!isCustomMode ? styles.toggleActive : ''}`}
                >
                  <Sparkles size={14} />
                  Select from list
                </button>
                <button
                  type="button"
                  onClick={handleCustomRoleToggle}
                  className={`${styles.toggleBtn} ${isCustomMode ? styles.toggleActive : ''}`}
                >
                  <Plus size={14} />
                  Enter custom role
                </button>
              </div>

              {!isCustomMode ? (
                <div className={styles.dropdownContainer}>
                  <div
                    className={`${styles.dropdownTrigger} ${role ? styles.hasValue : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedRoleData && (
                      <span className={styles.selectedRoleIcon}>{selectedRoleData.icon}</span>
                    )}
                    <input
                      type="text"
                      placeholder="Select a job role..."
                      value={role}
                      readOnly
                      className={styles.dropdownInput}
                    />
                    <ChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.chevronRotated : ''}`} size={18} />
                  </div>

                  {isDropdownOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                          type="text"
                          placeholder="Search roles..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={styles.searchInput}
                          autoFocus
                        />
                      </div>
                      <div className={styles.rolesList}>
                        {filteredRoles.length > 0 ? (
                          filteredRoles.map((r) => (
                            <button
                              key={r.title}
                              className={`${styles.roleOption} ${role === r.title ? styles.selected : ''}`}
                              onClick={() => handleRoleSelect(r.title)}
                            >
                              <div className={styles.roleOptionLeft}>
                                <span className={styles.roleIcon}>{r.icon}</span>
                                <span>{r.title}</span>
                              </div>
                              {role === r.title && <Check size={16} className={styles.checkmark} />}
                            </button>
                          ))
                        ) : (
                          <div className={styles.noResults}>
                            <p>No matching roles found</p>
                            <button
                              className={styles.customRoleBtn}
                              onClick={() => {
                                handleCustomRoleToggle();
                                setSearchTerm('');
                              }}
                            >
                              <Plus size={14} />
                              Use "{searchTerm}" as custom role
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Enter your target job role..."
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    setRole(e.target.value);
                    setError(null);
                  }}
                  className={styles.customInput}
                />
              )}

              {/* Popular Roles */}
              {!isCustomMode && !role && (
                <div className={styles.popularRoles}>
                  <span className={styles.popularLabel}>Quick select:</span>
                  <div className={styles.roleChips}>
                    {AVAILABLE_ROLES.slice(0, 4).map((r) => (
                      <button
                        key={r.title}
                        onClick={() => handleRoleSelect(r.title)}
                        className={styles.roleChip}
                      >
                        <span>{r.icon}</span>
                        {r.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || (!role && !customRole) || loading}
              className={styles.analyzeBtn}
            >
              {loading ? (
                <span className={styles.btnLoading}>
                  <Loader2 size={18} className={styles.spinning} />
                  Analyzing...
                </span>
              ) : (
                <>
                  Analyze Resume
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>📊</span>
            </div>
            <h3 className={styles.featureTitle}>ATS Score</h3>
            <p className={styles.featureDesc}>
              Get a clear score of how ATS-friendly your resume is
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>🎯</span>
            </div>
            <h3 className={styles.featureTitle}>Role Match</h3>
            <p className={styles.featureDesc}>
              See how well your resume matches your target role
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <span className={styles.featureIcon}>💡</span>
            </div>
            <h3 className={styles.featureTitle}>Smart Suggestions</h3>
            <p className={styles.featureDesc}>
              Get actionable suggestions to improve your resume
            </p>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="AI is analyzing your resume..." />}
    </div>
  );
}