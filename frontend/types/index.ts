// types/index.ts
export interface AnalysisRequest {
  role: string;
  resume: File;
}

export interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  project_idea: string;
}

export interface AnalysisResponse {
  success: boolean;
  id: string | null;
  ats_score: number;
  role_match_percentage: number;
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: Suggestion[];
  estimated_interview_chance: 'low' | 'medium' | 'high';
  one_liner_feedback: string;
}

export interface HistoryItem {
  id: string;
  role: string;
  atsScore: number;
  matchPercentage: number;
  interviewChance: string;
  feedback: string;
  date: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AnalysisStats {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  topMissingKeywords: Array<{
    keyword: string;
    count: number;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}