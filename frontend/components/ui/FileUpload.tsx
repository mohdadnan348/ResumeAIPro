// components/ui/FileUpload.tsx
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error?: string;  // '?' optional banaya
}

const FileUpload = ({ onFileSelect, selectedFile, error }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handleRemoveFile = () => {
    onFileSelect(null as any);
  };

  return (
    <div className={styles.container}>
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive || isDragging ? styles.dragActive : ''}`}
        >
          <input {...getInputProps()} />
          <div className={styles.dropzoneContent}>
            <div className={styles.iconWrapper}>
              <Upload className={styles.uploadIcon} />
            </div>
            <h3 className={styles.title}>Upload your resume</h3>
            <p className={styles.subtitle}>
              Drag & drop your PDF file here, or click to browse
            </p>
            <div className={styles.fileSpecs}>
              <span className={styles.spec}>PDF only</span>
              <span className={styles.spec}>Max 5MB</span>
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
              <p className={styles.fileName}>{selectedFile.name}</p>
              <p className={styles.fileSize}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button onClick={handleRemoveFile} className={styles.removeBtn}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.fileSuccess}>
            <CheckCircle size={16} />
            <span>File ready for analysis</span>
          </div>
        </div>
      )}
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;