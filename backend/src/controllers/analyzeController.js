// backend/src/controllers/analyzeController.js
// Main analysis logic - Resume upload + AI analysis + Save to DB

const { extractTextFromPDF } = require('../services/pdfService');
const { analyzeResume } = require('../services/openaiService');
const { prisma } = require('../models');
const { truncateText, sanitizeText, isValidRole } = require('../utils/helpers');
const { AVAILABLE_ROLES, HTTP_STATUS } = require('../utils/constants');

/**
 * Main analyze controller
 * Handles: Upload PDF → Extract Text → AI Analysis → Save to DB
 */
async function analyzeResumeController(req, res, next) {
  try {
    // 1. Check if file exists
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No resume file uploaded',
        message: 'Please upload a PDF file',
      });
    }

    // 2. Check file type
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid file type',
        message: 'Only PDF files are accepted',
      });
    }

    // 3. Get target role from request
    let { role } = req.body;
    
    if (!role) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'No role specified',
        message: 'Please select or enter a job role',
      });
    }

    // 4. Validate role
    if (!isValidRole(role, AVAILABLE_ROLES)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Invalid role',
        message: `Role must be one of: ${AVAILABLE_ROLES.join(', ')} or a custom role (3-50 characters)`,
      });
    }

    // 5. Extract text from PDF
    let resumeText;
    try {
      resumeText = await extractTextFromPDF(req.file.buffer);
      
      if (!resumeText || resumeText.trim().length < 50) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid PDF content',
          message: 'PDF file does not contain enough text. Please upload a valid resume.',
        });
      }
    } catch (pdfError) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'PDF parsing failed',
        message: 'Could not read PDF file. Please ensure it is not corrupted or password protected.',
      });
    }

    // 6. Sanitize text
    const sanitizedText = sanitizeText(resumeText);

    // 7. Call OpenAI for analysis
    let analysisResult;
    try {
      analysisResult = await analyzeResume(sanitizedText, role);
    } catch (aiError) {
      console.error('OpenAI Error:', aiError);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'AI analysis failed',
        message: 'Could not analyze resume. Please try again in a few moments.',
      });
    }

    // 8. Validate AI response
    if (!analysisResult || typeof analysisResult.ats_score !== 'number') {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Invalid AI response',
        message: 'AI returned invalid data. Please try again.',
      });
    }

    // 9. Save to database (Always try to save - even in mock mode)
    let savedAnalysis = null;
    try {
      savedAnalysis = await prisma.analysis.create({
        data: {
          resumeText: truncateText(sanitizedText, 5000),
          targetRole: role,
          atsScore: analysisResult.ats_score,
          roleMatch: analysisResult.role_match_percentage || 0,
          missingKeywords: analysisResult.missing_keywords || [],
          strengths: analysisResult.strengths || [],
          weaknesses: analysisResult.weaknesses || [],
          suggestions: analysisResult.suggestions || [],
          interviewChance: analysisResult.estimated_interview_chance || 'medium',
          oneLinerFeedback: analysisResult.one_liner_feedback || 'Review suggestions to improve your resume',
        },
      });
      console.log('✅ Analysis saved to database with ID:', savedAnalysis.id);
    } catch (dbError) {
      console.error('Database Save Error:', dbError.message);
      // Don't return early, just log and continue with response
    }

    // 10. Return success response
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      id: savedAnalysis?.id || null,
      ...analysisResult,
    });

  } catch (error) {
    console.error('Analyze Controller Error:', error);
    next(error);
  }
}

module.exports = { analyzeResumeController };