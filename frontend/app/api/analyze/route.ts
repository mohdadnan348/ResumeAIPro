// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://resumeaipro-cfpf.onrender.com/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const role = formData.get('role') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'No role specified' },
        { status: 400 }
      );
    }

    // Create new FormData for backend request
    const backendFormData = new FormData();
    backendFormData.append('resume', file);
    backendFormData.append('role', role);

    // Forward request to backend
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'ResumeAI Pro API', 
      endpoints: {
        analyze: 'POST /api/analyze',
        history: 'GET /api/history',
        analysis: 'GET /api/analysis/:id'
      }
    },
    { status: 200 }
  );
}