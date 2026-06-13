// frontend/lib/api.ts
import axios from 'axios';
import { AnalysisResponse, HistoryItem, ApiError } from '@/types';

// Use environment variable for API URL (Render backend)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://resumeaipro-cfpf.onrender.com/api';

console.log('🔗 API Base URL:', API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 120 seconds timeout for AI analysis
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor for logging (development only)
if (process.env.NODE_ENV === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`❌ API Error:`, error.response?.status, error.message);
      return Promise.reject(error);
    }
  );
}

/**
 * Analyze resume with AI
 * @param file - PDF resume file
 * @param role - Target job role
 * @returns Analysis response with ATS score and suggestions
 */
export async function analyzeResume(file: File, role: string): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('role', role);

  try {
    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiError;
      throw new Error(apiError.message || 'Failed to analyze resume');
    }
    throw new Error('Network error. Please check if backend server is running.');
  }
}

/**
 * Get all analysis history
 * @returns Array of history items
 */
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const response = await apiClient.get('/history');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return [];
  }
}

/**
 * Get single analysis by ID
 * @param id - Analysis UUID
 * @returns Complete analysis data
 */
export async function getAnalysisById(id: string): Promise<AnalysisResponse | null> {
  try {
    const response = await apiClient.get(`/analysis/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch analysis ${id}:`, error);
    return null;
  }
}

/**
 * Delete analysis by ID
 * @param id - Analysis UUID
 */
export async function deleteAnalysis(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/history/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete analysis ${id}:`, error);
    return false;
  }
}

/**
 * Check backend health
 * @returns Health status
 */
export async function getHealth(): Promise<{ status: string; timestamp: string }> {
  try {
    const response = await axios.get('https://resumeaipro-cfpf.onrender.com/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy', timestamp: new Date().toISOString() };
  }
}

/**
 * Get statistics summary
 * @returns Stats object
 */
export async function getStats(): Promise<{
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  topMissingKeywords: { keyword: string; count: number }[];
}> {
  try {
    const response = await apiClient.get('/analysis/stats/summary');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      totalAnalyses: 0,
      averageScore: 0,
      bestScore: 0,
      topMissingKeywords: [],
    };
  }
}

/**
 * Upload resume with progress tracking
 * @param file - PDF file
 * @param role - Target role
 * @param onProgress - Progress callback
 */
export async function uploadResumeWithProgress(
  file: File,
  role: string,
  onProgress?: (progress: number) => void
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('role', role);

  try {
    const response = await apiClient.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || 'Upload failed');
    }
    throw new Error('Network error');
  }
}