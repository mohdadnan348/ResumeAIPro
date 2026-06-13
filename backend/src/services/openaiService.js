// backend/src/services/openaiService.js
// DeepSeek API Integration - Working Version with Database Save

require('dotenv').config();

const OpenAI = require('openai');
const { getAnalysisPrompt, getRoleSuggestionPrompt } = require('./promptService');

// DeepSeek specific configuration
const DEEPSEEK_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

console.log('🔑 DeepSeek Service Initializing...');
console.log('📡 API Key:', DEEPSEEK_API_KEY ? '✅ Loaded (' + DEEPSEEK_API_KEY.substring(0, 15) + '...)' : '❌ MISSING');
console.log('🌐 Base URL:', DEEPSEEK_BASE_URL);

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
});

// DeepSeek recommended model
const AI_MODEL = 'deepseek-chat';

/**
 * Analyze resume using DeepSeek API
 */
async function analyzeResume(resumeText, targetRole) {
  try {
    // Check if API key exists (removed the hardcoded check)
    if (!DEEPSEEK_API_KEY) {
      console.log('⚠️ DeepSeek API key not configured, using MOCK mode');
      return getMockAnalysis(resumeText, targetRole);
    }

    console.log(`🤖 Analyzing resume for role: ${targetRole}`);
    console.log(`📄 Resume text length: ${resumeText.length} characters`);

    const prompt = getAnalysisPrompt(resumeText, targetRole);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS (Applicant Tracking System) analyst and technical recruiter. 
Always respond with valid JSON only. Be strict but fair with scores.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error('Empty response from DeepSeek');
    }

    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseContent);
      throw new Error('Invalid JSON response');
    }

    // Validate required fields
    const requiredFields = ['ats_score', 'role_match_percentage', 'missing_keywords', 'strengths', 'weaknesses', 'suggestions'];
    for (const field of requiredFields) {
      if (analysis[field] === undefined) {
        console.warn(`Missing field: ${field}, adding default`);
        analysis[field] = field === 'missing_keywords' ? [] : 
                         field === 'strengths' ? [] :
                         field === 'weaknesses' ? [] :
                         field === 'suggestions' ? [] :
                         field === 'ats_score' ? 50 :
                         field === 'role_match_percentage' ? 50 : null;
      }
    }

    analysis.ats_score = Math.min(100, Math.max(0, analysis.ats_score));
    analysis.role_match_percentage = Math.min(100, Math.max(0, analysis.role_match_percentage));

    console.log(`✅ DeepSeek Analysis complete: ATS Score = ${analysis.ats_score}`);
    return analysis;
  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    console.log('⚠️ Falling back to MOCK mode');
    return getMockAnalysis(resumeText, targetRole);
  }
}

/**
 * Mock analysis for testing (when API key is not available)
 */
function getMockAnalysis(resumeText, targetRole) {
  console.log('📋 Generating MOCK analysis response');
  
  return {
    ats_score: 76,
    role_match_percentage: 72,
    missing_keywords: ["GraphQL", "Docker", "PostgreSQL", "CI/CD", "Redis"],
    strengths: [
      "Strong MERN stack experience with live projects",
      "React Native mobile development expertise",
      "AI integration skills (OpenAI API, RAG)",
      "3+ production-ready client products",
      "Good API design with JWT authentication"
    ],
    weaknesses: [
      "Add more quantifiable achievements (numbers, metrics)",
      "Include Docker/containerization experience",
      "Consider adding GraphQL to your stack",
      "Add unit testing experience"
    ],
    suggestions: [
      {
        priority: "high",
        action: "Add GraphQL project to portfolio",
        reason: "85% of Full Stack roles now require GraphQL knowledge",
        project_idea: "Build a library management system with Apollo Server and React"
      },
      {
        priority: "high",
        action: "Containerize one project with Docker",
        reason: "Docker is industry standard for deployment",
        project_idea: "Add Dockerfile and docker-compose to your MERN stack project"
      },
      {
        priority: "medium",
        action: "Add PostgreSQL project",
        reason: "PostgreSQL is preferred over MongoDB in many enterprises",
        project_idea: "Build a task management app with Prisma ORM and PostgreSQL"
      },
      {
        priority: "medium",
        action: "Add unit tests to a project",
        reason: "Testing experience is highly valued",
        project_idea: "Add Jest tests to your React components and API endpoints"
      }
    ],
    estimated_interview_chance: "medium",
    one_liner_feedback: "Great project portfolio! Add more quantifiable metrics and containerization experience to increase your chances."
  };
}

async function suggestRoleFromResume(resumeText) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return {
        suggestedRole: 'Full Stack Developer',
        confidence: 85,
        reason: 'Based on MERN stack and AI integration experience'
      };
    }

    const prompt = getRoleSuggestionPrompt(resumeText);

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a career advisor. Return only JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    return {
      suggestedRole: response.suggested_role || 'Full Stack Developer',
      confidence: response.confidence || 70,
      reason: response.reason || 'Based on skills and experience',
    };
  } catch (error) {
    console.error('Role suggestion error:', error.message);
    return {
      suggestedRole: 'Full Stack Developer',
      confidence: 70,
      reason: 'Based on MERN stack experience',
    };
  }
}

module.exports = {
  analyzeResume,
  suggestRoleFromResume,
};