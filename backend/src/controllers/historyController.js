// backend/src/controllers/historyController.js
// Fetch all analysis history

const { prisma } = require('../models');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Get all analysis history
 * Returns: List of all past resume analyses (sorted by newest first)
 */
async function getHistoryController(req, res, next) {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch analyses from database
    const [analyses, totalCount] = await Promise.all([
      prisma.analysis.findMany({
        select: {
          id: true,
          targetRole: true,
          atsScore: true,
          roleMatch: true,
          interviewChance: true,
          oneLinerFeedback: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.analysis.count(),
    ]);

    // Format response
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      role: analysis.targetRole,
      atsScore: analysis.atsScore,
      matchPercentage: analysis.roleMatch,
      interviewChance: analysis.interviewChance,
      feedback: analysis.oneLinerFeedback,
      date: analysis.createdAt,
    }));

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: formattedAnalyses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.error('History Controller Error:', error);
    next(error);
  }
}

/**
 * Delete analysis from history
 */
async function deleteHistoryController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: 'Missing analysis ID',
      });
    }

    // Check if exists
    const existing = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    // Delete
    await prisma.analysis.delete({
      where: { id },
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Analysis deleted successfully',
    });

  } catch (error) {
    console.error('Delete History Error:', error);
    next(error);
  }
}

module.exports = { getHistoryController, deleteHistoryController };