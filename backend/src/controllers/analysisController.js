// backend/src/controllers/analysisController.js
// Fetch single analysis by ID

const { prisma } = require('../models');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Get single analysis by ID
 * Returns: Complete analysis details for a specific resume
 */
async function getAnalysisByIdController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Missing analysis ID',
      });
    }

    // Fetch from database
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Analysis not found',
        message: 'No analysis found with this ID',
      });
    }

    // Format response
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: analysis.id,
        targetRole: analysis.targetRole,
        atsScore: analysis.atsScore,
        roleMatch: analysis.roleMatch,
        missingKeywords: analysis.missingKeywords,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        suggestions: analysis.suggestions,
        interviewChance: analysis.interviewChance,
        oneLinerFeedback: analysis.oneLinerFeedback,
        createdAt: analysis.createdAt,
        resumeTextPreview: analysis.resumeText.substring(0, 500) + '...',
      },
    });

  } catch (error) {
    console.error('Get Analysis By ID Error:', error);
    next(error);
  }
}

/**
 * Get analysis statistics
 * Returns: Summary stats like average score, most common missing keywords, etc.
 */
async function getAnalysisStatsController(req, res, next) {
  try {
    const analyses = await prisma.analysis.findMany();

    if (analyses.length === 0) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          totalAnalyses: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 0,
          topMissingKeywords: [],
        },
      });
    }

    // Calculate stats
    const scores = analyses.map(a => a.atsScore);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // Count missing keywords
    const keywordCount = {};
    analyses.forEach(analysis => {
      analysis.missingKeywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    const topMissingKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        totalAnalyses: analyses.length,
        averageScore,
        bestScore,
        worstScore,
        topMissingKeywords,
      },
    });

  } catch (error) {
    console.error('Stats Controller Error:', error);
    next(error);
  }
}

module.exports = {
  getAnalysisByIdController,
  getAnalysisStatsController,
};