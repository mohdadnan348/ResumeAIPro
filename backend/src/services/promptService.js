// backend/src/services/promptService.js
// Prompt templates for OpenAI

/**
 * Main analysis prompt for resume scoring
 * @param {string} resumeText - Extracted resume text
 * @param {string} targetRole - Target job role
 * @returns {string} - Formatted prompt
 */
function getAnalysisPrompt(resumeText, targetRole) {
  return `
You are an ATS (Applicant Tracking System) expert and technical recruiter with 10+ years of experience at top tech companies like Google, Amazon, and Microsoft.

## TASK
Analyze the following resume for the role of **${targetRole}** and provide a detailed, honest assessment.

## RESUME TEXT
"""
${resumeText.substring(0, 8000)}
"""

## EVALUATION CRITERIA

### 1. ATS Score (0-100) - Based on:
- Keyword optimization (30%): Does it include relevant keywords for ${targetRole}?
- Formatting (20%): Is it ATS-friendly (no tables, graphics, columns)?
- Section completeness (20%): Has Summary, Experience, Education, Skills?
- Action verbs & metrics (30%): Uses strong action verbs and quantifiable achievements?

### 2. Role Match Percentage (0-100) - Based on:
- Required skills match for ${targetRole}
- Years of relevant experience
- Technology stack alignment
- Domain knowledge

### 3. Missing Keywords
List 5-7 important keywords/skills missing from the resume that are essential for ${targetRole}

### 4. Strengths (3-5 points)
What does this resume do well?

### 5. Weaknesses (3-5 points)
What needs improvement?

### 6. Suggestions (3-5 items with priorities)
For each suggestion, provide:
- priority: "high", "medium", or "low"
- action: Specific action to take
- reason: Why this matters
- project_idea: Specific project they can build to demonstrate this skill

### 7. Interview Chance
- "high" = Score 80+ and good match
- "medium" = Score 50-79
- "low" = Score below 50

### 8. One-line Feedback
A single sentence summarizing the most important improvement needed.

## RESPONSE FORMAT (JSON only - no other text)
{
  "ats_score": <number 0-100>,
  "role_match_percentage": <number 0-100>,
  "ats_issues": ["issue1", "issue2", "issue3", "issue4", "issue5"],
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": [
    {
      "priority": "high",
      "action": "add GraphQL to your tech stack",
      "reason": "85% of ${targetRole} jobs require GraphQL",
      "project_idea": "Build a library management system with Apollo Server"
    }
  ],
  "estimated_interview_chance": "low/medium/high",
  "one_liner_feedback": "Focus on adding more quantifiable achievements to your experience section"
}

Be honest, specific, and actionable. Return ONLY valid JSON.`;
}

/**
 * Role suggestion prompt
 * @param {string} resumeText - Extracted resume text
 * @returns {string} - Formatted prompt
 */
function getRoleSuggestionPrompt(resumeText) {
  return `
Based on this resume, suggest the BEST job role match.

Resume: ${resumeText.substring(0, 3000)}

Return JSON:
{
  "suggested_role": "role name",
  "confidence": 0-100,
  "reason": "short reason"
}

Possible roles: Frontend Developer, Backend Developer, Full Stack Developer, React Native Developer, MERN Stack Developer, Next.js Developer, AI/ML Engineer, DevOps Engineer, Data Scientist
`;
}

/**
 * Short analysis prompt (faster, cheaper)
 * @param {string} resumeText - Extracted resume text
 * @param {string} targetRole - Target job role
 * @returns {string} - Shortened prompt
 */
function getShortAnalysisPrompt(resumeText, targetRole) {
  return `
Analyze this resume for ${targetRole}.

Resume: ${resumeText.substring(0, 2000)}

Return JSON:
{
  "ats_score": 0-100,
  "role_match": 0-100,
  "top_3_missing": ["skill1", "skill2", "skill3"],
  "top_suggestion": "most important improvement",
  "interview_chance": "low/medium/high"
}`;
}

module.exports = {
  getAnalysisPrompt,
  getRoleSuggestionPrompt,
  getShortAnalysisPrompt,
};