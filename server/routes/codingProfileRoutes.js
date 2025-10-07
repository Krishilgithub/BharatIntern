/**
 * Coding Profile Scraper Routes for BharatIntern AI Platform
 * Handles scraping and analysis of coding profiles from GitHub, LeetCode, and other platforms
 */

const express = require('express');
const multer = require('multer');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateFile } = require('../middleware/upload');
const CodingProfileScraperService = require('../services/CodingProfileScraperService');
const router = express.Router();

// Initialize service
const scraperService = new CodingProfileScraperService();

// Configure multer for portfolio file uploads
const portfolioStorage = multer.memoryStorage();
const portfolioUpload = multer({
  storage: portfolioStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 5
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf', 'application/json', 'text/plain',
      'application/zip', 'application/x-zip-compressed',
      'image/png', 'image/jpeg', 'image/jpg'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, JSON, TXT, ZIP, Images'), false);
    }
  }
});

/**
 * @route POST /api/coding-profile/github/analyze
 * @desc Analyze GitHub profile and repositories
 * @access Private (All authenticated users)
 */
router.post('/github/analyze', authenticateToken, async (req, res) => {
  try {
    const {
      username,
      includePrivateRepos = false,
      analyzeCommits = true,
      includeForks = false,
      timeframe = '1y',
      detailedAnalysis = true
    } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'GitHub username is required'
      });
    }

    const analysisOptions = {
      includePrivateRepos,
      analyzeCommits,
      includeForks,
      timeframe,
      detailedAnalysis,
      requestedBy: req.user.id,
      userRole: req.user.role
    };

    const analysis = await scraperService.analyzeGitHubProfile(username, analysisOptions);

    res.json({
      success: true,
      message: 'GitHub profile analyzed successfully',
      data: {
        profile: analysis.profile,
        repositories: analysis.repositories,
        skills: analysis.skills,
        activity: analysis.activity,
        insights: analysis.insights,
        score: analysis.overallScore,
        recommendations: analysis.recommendations
      }
    });

  } catch (error) {
    console.error('Error analyzing GitHub profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze GitHub profile',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route POST /api/coding-profile/leetcode/analyze
 * @desc Analyze LeetCode profile and statistics
 * @access Private (All authenticated users)
 */
router.post('/leetcode/analyze', authenticateToken, async (req, res) => {
  try {
    const {
      username,
      includeSubmissions = true,
      analyzePatterns = true,
      compareWithPeers = false,
      detailLevel = 'standard'
    } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'LeetCode username is required'
      });
    }

    const analysisOptions = {
      includeSubmissions,
      analyzePatterns,
      compareWithPeers,
      detailLevel,
      requestedBy: req.user.id
    };

    const analysis = await scraperService.analyzeLeetCodeProfile(username, analysisOptions);

    res.json({
      success: true,
      message: 'LeetCode profile analyzed successfully',
      data: {
        profile: analysis.profile,
        statistics: analysis.statistics,
        problemsSolved: analysis.problemsSolved,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        competitiveRating: analysis.competitiveRating
      }
    });

  } catch (error) {
    console.error('Error analyzing LeetCode profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze LeetCode profile'
    });
  }
});

/**
 * @route POST /api/coding-profile/portfolio/analyze
 * @desc Analyze uploaded portfolio files and projects
 * @access Private (All authenticated users)
 */
router.post('/portfolio/analyze',
  authenticateToken,
  portfolioUpload.array('portfolioFiles', 5),
  async (req, res) => {
    try {
      const {
        portfolioUrl,
        projectDescription = '',
        techStack = '[]',
        analysisDepth = 'comprehensive',
        includeCodeQuality = true
      } = req.body;

      if (!req.files && !portfolioUrl) {
        return res.status(400).json({
          success: false,
          message: 'Either portfolio files or portfolio URL is required'
        });
      }

      const analysisOptions = {
        portfolioUrl,
        projectDescription,
        techStack: JSON.parse(techStack),
        analysisDepth,
        includeCodeQuality,
        candidateId: req.user.id
      };

      const analysis = await scraperService.analyzePortfolio(req.files, analysisOptions);

      res.json({
        success: true,
        message: 'Portfolio analyzed successfully',
        data: {
          overview: analysis.overview,
          projects: analysis.projects,
          skills: analysis.skills,
          codeQuality: analysis.codeQuality,
          technologies: analysis.technologies,
          recommendations: analysis.recommendations,
          score: analysis.overallScore
        }
      });

    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to analyze portfolio'
      });
    }
  }
);

/**
 * @route POST /api/coding-profile/multi-platform
 * @desc Analyze profiles across multiple coding platforms
 * @access Private (All authenticated users)
 */
router.post('/multi-platform', authenticateToken, async (req, res) => {
  try {
    const {
      platforms = {},
      consolidatedAnalysis = true,
      includeComparisons = true,
      generateReport = false
    } = req.body;

    // Validate that at least one platform is provided
    const supportedPlatforms = ['github', 'leetcode', 'hackerrank', 'codechef', 'codeforces'];
    const providedPlatforms = Object.keys(platforms).filter(p => supportedPlatforms.includes(p));

    if (providedPlatforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one supported platform profile is required',
        supportedPlatforms: supportedPlatforms
      });
    }

    const analysisOptions = {
      consolidatedAnalysis,
      includeComparisons,
      generateReport,
      requestedBy: req.user.id
    };

    const analysis = await scraperService.analyzeMultiplePlatforms(platforms, analysisOptions);

    res.json({
      success: true,
      message: 'Multi-platform analysis completed successfully',
      data: {
        consolidated: analysis.consolidated,
        platformSpecific: analysis.platformSpecific,
        comparisons: analysis.comparisons,
        overallScore: analysis.overallScore,
        skillsMatrix: analysis.skillsMatrix,
        recommendations: analysis.recommendations,
        report: generateReport ? analysis.report : null
      }
    });

  } catch (error) {
    console.error('Error in multi-platform analysis:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete multi-platform analysis'
    });
  }
});

/**
 * @route POST /api/coding-profile/skills/validate
 * @desc Validate and score coding skills based on profile analysis
 * @access Private (All authenticated users)
 */
router.post('/skills/validate', authenticateToken, async (req, res) => {
  try {
    const {
      claimedSkills = [],
      platforms = {},
      portfolioData = {},
      validationDepth = 'standard',
      includeCertifications = true
    } = req.body;

    if (claimedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one skill must be provided for validation'
      });
    }

    const validationOptions = {
      validationDepth,
      includeCertifications,
      candidateId: req.user.id,
      requestedBy: req.user.id
    };

    const validation = await scraperService.validateSkills(
      claimedSkills,
      platforms,
      portfolioData,
      validationOptions
    );

    res.json({
      success: true,
      message: 'Skills validation completed successfully',
      data: {
        validatedSkills: validation.validatedSkills,
        evidenceScore: validation.evidenceScore,
        credibilityRating: validation.credibilityRating,
        missingEvidence: validation.missingEvidence,
        recommendations: validation.recommendations,
        certificationStatus: validation.certificationStatus
      }
    });

  } catch (error) {
    console.error('Error validating skills:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate skills'
    });
  }
});

/**
 * @route GET /api/coding-profile/repository/:platform/:username/:repo
 * @desc Get detailed analysis of a specific repository
 * @access Private (All authenticated users)
 */
router.get('/repository/:platform/:username/:repo', authenticateToken, async (req, res) => {
  try {
    const { platform, username, repo } = req.params;
    const {
      includeCommitHistory = true,
      analyzeCodeQuality = true,
      includeDependencies = false,
      generateInsights = true
    } = req.query;

    const supportedPlatforms = ['github', 'gitlab', 'bitbucket'];
    if (!supportedPlatforms.includes(platform.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported platform',
        supportedPlatforms: supportedPlatforms
      });
    }

    const analysisOptions = {
      includeCommitHistory: includeCommitHistory === 'true',
      analyzeCodeQuality: analyzeCodeQuality === 'true',
      includeDependencies: includeDependencies === 'true',
      generateInsights: generateInsights === 'true',
      requestedBy: req.user.id
    };

    const analysis = await scraperService.analyzeRepository(
      platform,
      username,
      repo,
      analysisOptions
    );

    res.json({
      success: true,
      data: {
        repository: analysis.repository,
        codeAnalysis: analysis.codeAnalysis,
        commitAnalysis: analysis.commitAnalysis,
        dependencies: analysis.dependencies,
        qualityMetrics: analysis.qualityMetrics,
        insights: analysis.insights,
        score: analysis.overallScore
      }
    });

  } catch (error) {
    console.error('Error analyzing repository:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze repository'
    });
  }
});

/**
 * @route POST /api/coding-profile/competitive/analyze
 * @desc Analyze competitive programming profiles
 * @access Private (All authenticated users)
 */
router.post('/competitive/analyze', authenticateToken, async (req, res) => {
  try {
    const {
      platforms = {},
      includeRatings = true,
      analyzePerformance = true,
      includeTrends = true,
      timeframe = '1y'
    } = req.body;

    const competitivePlatforms = ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'atcoder'];
    const providedPlatforms = Object.keys(platforms).filter(p => competitivePlatforms.includes(p));

    if (providedPlatforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one competitive programming platform is required',
        supportedPlatforms: competitivePlatforms
      });
    }

    const analysisOptions = {
      includeRatings,
      analyzePerformance,
      includeTrends,
      timeframe,
      requestedBy: req.user.id
    };

    const analysis = await scraperService.analyzeCompetitiveProgramming(platforms, analysisOptions);

    res.json({
      success: true,
      message: 'Competitive programming analysis completed',
      data: {
        overall: analysis.overall,
        platformBreakdown: analysis.platformBreakdown,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        trends: analysis.trends,
        recommendations: analysis.recommendations,
        competitiveScore: analysis.competitiveScore
      }
    });

  } catch (error) {
    console.error('Error analyzing competitive programming:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze competitive programming profiles'
    });
  }
});

/**
 * @route GET /api/coding-profile/profiles/:candidateId
 * @desc Get stored coding profiles for a candidate
 * @access Private (Owner/Company/Admin)
 */
router.get('/profiles/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const {
      includeAnalysis = true,
      includeCached = false,
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;

    // Check permissions
    const hasAccess = candidateId === req.user.id || 
                     req.user.role === 'company' || 
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to view these profiles'
      });
    }

    const options = {
      includeAnalysis: includeAnalysis === 'true',
      includeCached: includeCached === 'true',
      sortBy,
      sortOrder,
      requestedBy: req.user.id
    };

    const profiles = await scraperService.getCandidateProfiles(candidateId, options);

    res.json({
      success: true,
      data: {
        profiles: profiles.profiles,
        summary: profiles.summary,
        lastUpdated: profiles.lastUpdated,
        analytics: profiles.analytics
      }
    });

  } catch (error) {
    console.error('Error fetching candidate profiles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coding profiles'
    });
  }
});

/**
 * @route POST /api/coding-profile/bulk-analyze
 * @desc Bulk analyze multiple candidates' coding profiles
 * @access Private (Company/Admin)
 */
router.post('/bulk-analyze',
  authenticateToken,
  requireRole(['company', 'admin']),
  async (req, res) => {
    try {
      const {
        candidates = [],
        platforms = ['github'],
        analysisDepth = 'standard',
        includeReports = true,
        compareProfiles = false
      } = req.body;

      if (candidates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one candidate profile is required'
        });
      }

      if (candidates.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 candidates can be analyzed in bulk'
        });
      }

      const analysisOptions = {
        platforms,
        analysisDepth,
        includeReports,
        compareProfiles,
        requestedBy: req.user.id,
        companyId: req.user.companyId
      };

      const analysis = await scraperService.bulkAnalyzeProfiles(candidates, analysisOptions);

      res.json({
        success: true,
        message: 'Bulk analysis completed successfully',
        data: {
          results: analysis.results,
          summary: analysis.summary,
          comparisons: analysis.comparisons,
          recommendations: analysis.recommendations,
          reports: analysis.reports,
          processingTime: analysis.processingTime
        }
      });

    } catch (error) {
      console.error('Error in bulk analysis:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to complete bulk analysis'
      });
    }
  }
);

/**
 * @route POST /api/coding-profile/skills/extract
 * @desc Extract and categorize skills from coding profiles
 * @access Private (All authenticated users)
 */
router.post('/skills/extract', authenticateToken, async (req, res) => {
  try {
    const {
      profileData = {},
      repositories = [],
      includeInferred = true,
      confidenceThreshold = 0.6,
      categorizeSkills = true
    } = req.body;

    if (Object.keys(profileData).length === 0 && repositories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Profile data or repositories are required for skill extraction'
      });
    }

    const extractionOptions = {
      includeInferred,
      confidenceThreshold,
      categorizeSkills,
      candidateId: req.user.id
    };

    const extraction = await scraperService.extractSkills(
      profileData,
      repositories,
      extractionOptions
    );

    res.json({
      success: true,
      message: 'Skills extracted successfully',
      data: {
        skills: extraction.skills,
        categories: extraction.categories,
        confidence: extraction.confidence,
        sources: extraction.sources,
        recommendations: extraction.recommendations
      }
    });

  } catch (error) {
    console.error('Error extracting skills:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract skills'
    });
  }
});

/**
 * @route GET /api/coding-profile/trends
 * @desc Get coding trends and technology insights
 * @access Private (All authenticated users)
 */
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const {
      timeframe = '6m',
      category = 'all',
      includeProjections = false,
      region = 'global'
    } = req.query;

    const trendsData = await scraperService.getCodingTrends({
      timeframe,
      category,
      includeProjections: includeProjections === 'true',
      region
    });

    res.json({
      success: true,
      data: {
        trends: trendsData.trends,
        hotTechnologies: trendsData.hotTechnologies,
        growingSkills: trendsData.growingSkills,
        demandAnalysis: trendsData.demandAnalysis,
        projections: trendsData.projections,
        insights: trendsData.insights
      }
    });

  } catch (error) {
    console.error('Error fetching coding trends:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coding trends'
    });
  }
});

/**
 * @route POST /api/coding-profile/refresh
 * @desc Refresh cached profile data
 * @access Private (Profile owner)
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const {
      platforms = [],
      forceRefresh = false,
      includePrivate = false
    } = req.body;

    if (platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one platform must be specified for refresh'
      });
    }

    const refreshOptions = {
      forceRefresh,
      includePrivate,
      candidateId: req.user.id
    };

    const refreshResult = await scraperService.refreshProfiles(platforms, refreshOptions);

    res.json({
      success: true,
      message: 'Profile refresh completed',
      data: {
        refreshed: refreshResult.refreshed,
        failed: refreshResult.failed,
        summary: refreshResult.summary,
        nextRefreshAllowed: refreshResult.nextRefreshAllowed
      }
    });

  } catch (error) {
    console.error('Error refreshing profiles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh profiles'
    });
  }
});

/**
 * @route GET /api/coding-profile/analytics/:candidateId
 * @desc Get coding analytics and insights for a candidate
 * @access Private (Owner/Company/Admin)
 */
router.get('/analytics/:candidateId', authenticateToken, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const {
      period = '1y',
      includeComparisons = false,
      detailLevel = 'standard'
    } = req.query;

    // Check permissions
    const hasAccess = candidateId === req.user.id || 
                     req.user.role === 'company' || 
                     req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to analytics data'
      });
    }

    const analyticsOptions = {
      period,
      includeComparisons: includeComparisons === 'true',
      detailLevel,
      requestedBy: req.user.id
    };

    const analytics = await scraperService.getCodingAnalytics(candidateId, analyticsOptions);

    res.json({
      success: true,
      data: {
        overview: analytics.overview,
        activityTrends: analytics.activityTrends,
        skillProgression: analytics.skillProgression,
        performanceMetrics: analytics.performanceMetrics,
        comparisons: analytics.comparisons,
        insights: analytics.insights,
        recommendations: analytics.recommendations
      }
    });

  } catch (error) {
    console.error('Error fetching coding analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coding analytics'
    });
  }
});

// Error handling middleware specific to coding profile routes
router.use((error, req, res, next) => {
  console.error('Coding Profile Route Error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Portfolio files too large. Maximum size is 20MB per file.'
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Allowed: PDF, JSON, TXT, ZIP, Images.'
    });
  }

  if (error.message.includes('API rate limit')) {
    return res.status(429).json({
      success: false,
      message: 'Platform API rate limit exceeded. Please try again later.',
      retryAfter: error.retryAfter || 3600
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Coding profile analysis error occurred',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;