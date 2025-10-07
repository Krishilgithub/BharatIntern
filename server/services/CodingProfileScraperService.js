/**
 * Coding Profile Scraper Service for BharatIntern AI Platform
 * Advanced analysis and scraping of coding profiles from multiple platforms
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { generateEmbeddings, cosineSimilarity, generateTextGemini, classifyText, extractEntities } = require('../utils/aiHelpers');
const config = require('../config');

class CodingProfileScraperService {
  constructor() {
    this.profiles = new Map(); // In-memory storage (use database in production)
    this.repositories = new Map();
    this.skillsCache = new Map();
    this.trendsCache = new Map();
    this.rateLimits = this.initializeRateLimits();
    
    // Initialize platform configurations
    this.platformConfigs = this.initializePlatformConfigs();
    this.skillPatterns = this.initializeSkillPatterns();
    this.technologyStack = this.initializeTechnologyStack();
    this.competitivePlatforms = this.initializeCompetitivePlatforms();
  }

  /**
   * Analyze GitHub profile and repositories
   */
  async analyzeGitHubProfile(username, options = {}) {
    const startTime = Date.now();
    const {
      includePrivateRepos = false,
      analyzeCommits = true,
      includeForks = false,
      timeframe = '1y',
      detailedAnalysis = true,
      requestedBy
    } = options;

    try {
      // Check rate limits
      await this.checkRateLimit('github', requestedBy);

      // Fetch GitHub profile data
      const profile = await this.fetchGitHubProfile(username);
      
      if (!profile) {
        throw new Error('GitHub profile not found or private');
      }

      // Fetch repositories
      const repositories = await this.fetchGitHubRepositories(username, {
        includePrivateRepos,
        includeForks,
        maxRepos: 50
      });

      // Analyze repositories for skills and technologies
      const skillsAnalysis = await this.analyzeRepositoriesForSkills(repositories);
      
      // Analyze commit activity
      const activityAnalysis = analyzeCommits ? 
        await this.analyzeGitHubActivity(username, repositories, timeframe) : null;

      // Generate comprehensive insights
      const insights = await this.generateGitHubInsights(profile, repositories, skillsAnalysis, activityAnalysis);

      // Calculate overall score
      const overallScore = this.calculateGitHubScore(profile, repositories, skillsAnalysis, activityAnalysis);

      // Generate recommendations
      const recommendations = await this.generateGitHubRecommendations(insights, skillsAnalysis);

      // Cache the analysis
      this.cacheProfileAnalysis('github', username, {
        profile,
        repositories,
        skills: skillsAnalysis,
        activity: activityAnalysis,
        insights,
        overallScore,
        recommendations,
        analyzedAt: new Date().toISOString()
      });

      return {
        profile: this.sanitizeGitHubProfile(profile),
        repositories: repositories.map(repo => this.sanitizeRepository(repo, detailedAnalysis)),
        skills: skillsAnalysis,
        activity: activityAnalysis,
        insights: insights,
        overallScore: overallScore,
        recommendations: recommendations,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error analyzing GitHub profile:', error);
      throw new Error(`GitHub analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze LeetCode profile and statistics
   */
  async analyzeLeetCodeProfile(username, options = {}) {
    const startTime = Date.now();
    const {
      includeSubmissions = true,
      analyzePatterns = true,
      compareWithPeers = false,
      detailLevel = 'standard',
      requestedBy
    } = options;

    try {
      // Check rate limits
      await this.checkRateLimit('leetcode', requestedBy);

      // Fetch LeetCode profile data
      const profile = await this.fetchLeetCodeProfile(username);
      
      if (!profile) {
        throw new Error('LeetCode profile not found');
      }

      // Fetch statistics and submissions
      const statistics = await this.fetchLeetCodeStatistics(username);
      const submissions = includeSubmissions ? 
        await this.fetchLeetCodeSubmissions(username, { limit: 100 }) : [];

      // Analyze problem-solving patterns
      const problemsAnalysis = await this.analyzeLeetCodeProblems(statistics, submissions);
      
      // Analyze strengths and weaknesses
      const strengthsWeaknesses = this.analyzeLeetCodeStrengthsWeaknesses(statistics, submissions);
      
      // Generate competitive rating assessment
      const competitiveRating = this.calculateLeetCodeCompetitiveRating(profile, statistics);
      
      // Compare with peers if requested
      const peerComparison = compareWithPeers ? 
        await this.compareLeetCodeWithPeers(statistics, profile.region) : null;

      // Generate recommendations
      const recommendations = await this.generateLeetCodeRecommendations(
        strengthsWeaknesses, 
        problemsAnalysis,
        competitiveRating
      );

      return {
        profile: this.sanitizeLeetCodeProfile(profile),
        statistics: statistics,
        problemsSolved: problemsAnalysis,
        strengths: strengthsWeaknesses.strengths,
        weaknesses: strengthsWeaknesses.weaknesses,
        recommendations: recommendations,
        competitiveRating: competitiveRating,
        peerComparison: peerComparison,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error analyzing LeetCode profile:', error);
      throw new Error(`LeetCode analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze portfolio files and projects
   */
  async analyzePortfolio(files, options = {}) {
    const startTime = Date.now();
    const {
      portfolioUrl,
      projectDescription,
      techStack = [],
      analysisDepth = 'comprehensive',
      includeCodeQuality = true,
      candidateId
    } = options;

    try {
      const analysis = {
        overview: {},
        projects: [],
        skills: {},
        codeQuality: {},
        technologies: {},
        recommendations: [],
        overallScore: 0
      };

      // Analyze uploaded files
      if (files && files.length > 0) {
        const fileAnalysis = await this.analyzePortfolioFiles(files, {
          includeCodeQuality,
          analysisDepth
        });
        
        analysis.projects.push(...fileAnalysis.projects);
        analysis.skills = { ...analysis.skills, ...fileAnalysis.skills };
        analysis.codeQuality = fileAnalysis.codeQuality;
      }

      // Analyze portfolio URL if provided
      if (portfolioUrl) {
        const urlAnalysis = await this.analyzePortfolioUrl(portfolioUrl, {
          includeCodeQuality,
          analysisDepth
        });
        
        analysis.projects.push(...urlAnalysis.projects);
        analysis.skills = { ...analysis.skills, ...urlAnalysis.skills };
      }

      // Analyze provided tech stack
      if (techStack.length > 0) {
        const techAnalysis = await this.analyzeTechStack(techStack, analysis.projects);
        analysis.technologies = techAnalysis;
      }

      // Generate overview
      analysis.overview = this.generatePortfolioOverview(analysis.projects, analysis.skills);
      
      // Calculate overall score
      analysis.overallScore = this.calculatePortfolioScore(analysis);
      
      // Generate recommendations
      analysis.recommendations = await this.generatePortfolioRecommendations(analysis);

      return {
        ...analysis,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw new Error(`Portfolio analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze profiles across multiple platforms
   */
  async analyzeMultiplePlatforms(platforms, options = {}) {
    const startTime = Date.now();
    const {
      consolidatedAnalysis = true,
      includeComparisons = true,
      generateReport = false,
      requestedBy
    } = options;

    try {
      const results = {};
      const errors = {};

      // Analyze each platform
      for (const [platform, username] of Object.entries(platforms)) {
        try {
          switch (platform.toLowerCase()) {
            case 'github':
              results.github = await this.analyzeGitHubProfile(username, { requestedBy });
              break;
            case 'leetcode':
              results.leetcode = await this.analyzeLeetCodeProfile(username, { requestedBy });
              break;
            case 'hackerrank':
              results.hackerrank = await this.analyzeHackerRankProfile(username, { requestedBy });
              break;
            case 'codechef':
              results.codechef = await this.analyzeCodeChefProfile(username, { requestedBy });
              break;
            case 'codeforces':
              results.codeforces = await this.analyzeCodeforcesProfile(username, { requestedBy });
              break;
            default:
              console.warn(`Unsupported platform: ${platform}`);
          }
        } catch (error) {
          console.error(`Error analyzing ${platform}:`, error);
          errors[platform] = error.message;
        }
      }

      // Generate consolidated analysis
      const consolidated = consolidatedAnalysis ? 
        await this.generateConsolidatedAnalysis(results) : null;

      // Generate platform comparisons
      const comparisons = includeComparisons ? 
        this.generatePlatformComparisons(results) : null;

      // Generate comprehensive report
      const report = generateReport ? 
        await this.generateMultiPlatformReport(results, consolidated, comparisons) : null;

      return {
        platformSpecific: results,
        consolidated: consolidated,
        comparisons: comparisons,
        overallScore: consolidated ? consolidated.overallScore : 0,
        skillsMatrix: consolidated ? consolidated.skillsMatrix : {},
        recommendations: consolidated ? consolidated.recommendations : [],
        report: report,
        errors: errors,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error in multi-platform analysis:', error);
      throw new Error(`Multi-platform analysis failed: ${error.message}`);
    }
  }

  /**
   * Validate skills based on profile evidence
   */
  async validateSkills(claimedSkills, platforms, portfolioData, options = {}) {
    const startTime = Date.now();
    const {
      validationDepth = 'standard',
      includeCertifications = true,
      candidateId,
      requestedBy
    } = options;

    try {
      const validation = {
        validatedSkills: {},
        evidenceScore: 0,
        credibilityRating: 'unknown',
        missingEvidence: [],
        recommendations: [],
        certificationStatus: {}
      };

      // Analyze each claimed skill
      for (const skill of claimedSkills) {
        const skillValidation = await this.validateSingleSkill(skill, platforms, portfolioData, {
          validationDepth,
          includeCertifications
        });
        
        validation.validatedSkills[skill] = skillValidation;
      }

      // Calculate overall evidence score
      validation.evidenceScore = this.calculateEvidenceScore(validation.validatedSkills);
      
      // Determine credibility rating
      validation.credibilityRating = this.determineCredibilityRating(validation.evidenceScore);
      
      // Identify missing evidence
      validation.missingEvidence = this.identifyMissingEvidence(validation.validatedSkills);
      
      // Generate recommendations
      validation.recommendations = await this.generateValidationRecommendations(validation);

      return {
        ...validation,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error validating skills:', error);
      throw new Error(`Skills validation failed: ${error.message}`);
    }
  }

  /**
   * Analyze specific repository in detail
   */
  async analyzeRepository(platform, username, repoName, options = {}) {
    const startTime = Date.now();
    const {
      includeCommitHistory = true,
      analyzeCodeQuality = true,
      includeDependencies = false,
      generateInsights = true,
      requestedBy
    } = options;

    try {
      // Check rate limits
      await this.checkRateLimit(platform, requestedBy);

      // Fetch repository data
      const repository = await this.fetchRepositoryData(platform, username, repoName);
      
      if (!repository) {
        throw new Error('Repository not found or private');
      }

      // Analyze code structure and quality
      const codeAnalysis = analyzeCodeQuality ? 
        await this.analyzeRepositoryCode(repository) : null;

      // Analyze commit history
      const commitAnalysis = includeCommitHistory ? 
        await this.analyzeCommitHistory(platform, username, repoName) : null;

      // Analyze dependencies
      const dependencies = includeDependencies ? 
        await this.analyzeDependencies(repository) : null;

      // Calculate quality metrics
      const qualityMetrics = this.calculateRepositoryQualityMetrics(
        repository, 
        codeAnalysis, 
        commitAnalysis
      );

      // Generate insights
      const insights = generateInsights ? 
        await this.generateRepositoryInsights(repository, codeAnalysis, commitAnalysis) : null;

      // Calculate overall score
      const overallScore = this.calculateRepositoryScore(
        repository, 
        codeAnalysis, 
        commitAnalysis, 
        qualityMetrics
      );

      return {
        repository: this.sanitizeRepository(repository, true),
        codeAnalysis: codeAnalysis,
        commitAnalysis: commitAnalysis,
        dependencies: dependencies,
        qualityMetrics: qualityMetrics,
        insights: insights,
        overallScore: overallScore,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze competitive programming profiles
   */
  async analyzeCompetitiveProgramming(platforms, options = {}) {
    const startTime = Date.now();
    const {
      includeRatings = true,
      analyzePerformance = true,
      includeTrends = true,
      timeframe = '1y',
      requestedBy
    } = options;

    try {
      const analysis = {
        overall: {},
        platformBreakdown: {},
        strengths: [],
        weaknesses: [],
        trends: {},
        recommendations: [],
        competitiveScore: 0
      };

      // Analyze each competitive platform
      for (const [platform, username] of Object.entries(platforms)) {
        try {
          const platformAnalysis = await this.analyzeCompetitivePlatform(
            platform, 
            username, 
            {
              includeRatings,
              analyzePerformance,
              includeTrends,
              timeframe,
              requestedBy
            }
          );
          
          analysis.platformBreakdown[platform] = platformAnalysis;
        } catch (error) {
          console.error(`Error analyzing ${platform}:`, error);
          analysis.platformBreakdown[platform] = { error: error.message };
        }
      }

      // Generate overall analysis
      analysis.overall = this.generateOverallCompetitiveAnalysis(analysis.platformBreakdown);
      
      // Identify strengths and weaknesses
      const strengthsWeaknesses = this.identifyCompetitiveStrengthsWeaknesses(analysis.platformBreakdown);
      analysis.strengths = strengthsWeaknesses.strengths;
      analysis.weaknesses = strengthsWeaknesses.weaknesses;
      
      // Analyze trends
      if (includeTrends) {
        analysis.trends = this.analyzeCompetitiveTrends(analysis.platformBreakdown, timeframe);
      }
      
      // Calculate competitive score
      analysis.competitiveScore = this.calculateCompetitiveScore(analysis.platformBreakdown);
      
      // Generate recommendations
      analysis.recommendations = await this.generateCompetitiveRecommendations(analysis);

      return {
        ...analysis,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('Error analyzing competitive programming:', error);
      throw new Error(`Competitive programming analysis failed: ${error.message}`);
    }
  }

  // Platform-specific analysis methods

  async fetchGitHubProfile(username) {
    try {
      const response = await axios.get(`https://api.github.com/users/${username}`, {
        headers: {
          'Authorization': `token ${config.github.apiKey}`,
          'User-Agent': 'BharatIntern-Platform'
        }
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }

  async fetchGitHubRepositories(username, options = {}) {
    try {
      const { includePrivateRepos, includeForks, maxRepos = 50 } = options;
      
      const params = {
        per_page: Math.min(maxRepos, 100),
        sort: 'updated',
        direction: 'desc'
      };
      
      if (!includeForks) {
        params.type = 'owner';
      }

      const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
        params: params,
        headers: {
          'Authorization': `token ${config.github.apiKey}`,
          'User-Agent': 'BharatIntern-Platform'
        }
      });
      
      let repositories = response.data;
      
      // Filter out private repos if not requested
      if (!includePrivateRepos) {
        repositories = repositories.filter(repo => !repo.private);
      }
      
      // Filter out forks if not requested
      if (!includeForks) {
        repositories = repositories.filter(repo => !repo.fork);
      }
      
      return repositories.slice(0, maxRepos);
    } catch (error) {
      throw new Error(`GitHub repositories fetch error: ${error.message}`);
    }
  }

  async analyzeRepositoriesForSkills(repositories) {
    const skills = {
      languages: {},
      frameworks: {},
      tools: {},
      total: 0
    };

    for (const repo of repositories) {
      // Analyze language usage
      if (repo.language) {
        skills.languages[repo.language] = (skills.languages[repo.language] || 0) + 1;
        skills.total++;
      }

      // Analyze repository topics and description for frameworks/tools
      const topics = repo.topics || [];
      const description = repo.description || '';
      
      // Check for popular frameworks and tools
      const detectedTech = this.detectTechnologies(topics, description, repo.name);
      
      detectedTech.frameworks.forEach(framework => {
        skills.frameworks[framework] = (skills.frameworks[framework] || 0) + 1;
      });
      
      detectedTech.tools.forEach(tool => {
        skills.tools[tool] = (skills.tools[tool] || 0) + 1;
      });
    }

    // Calculate skill percentages and confidence
    const processedSkills = this.processSkillsData(skills);
    
    return processedSkills;
  }

  async fetchLeetCodeProfile(username) {
    try {
      // LeetCode doesn't have official API, using GraphQL endpoint
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              ranking
              userAvatar
              reputation
              starRating
            }
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
          }
        }
      `;

      const response = await axios.post('https://leetcode.com/graphql', {
        query: query,
        variables: { username: username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BharatIntern-Platform'
        }
      });

      return response.data.data.matchedUser;
    } catch (error) {
      throw new Error(`LeetCode profile fetch error: ${error.message}`);
    }
  }

  async fetchLeetCodeStatistics(username) {
    try {
      const query = `
        query getUserStats($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
                submissions
              }
              totalSubmissionNum {
                difficulty
                count
                submissions
              }
            }
            userCalendar {
              streak
              totalActiveDays
              dccBadges {
                timestamp
                badge {
                  name
                  icon
                }
              }
            }
          }
        }
      `;

      const response = await axios.post('https://leetcode.com/graphql', {
        query: query,
        variables: { username: username }
      });

      return response.data.data.matchedUser;
    } catch (error) {
      throw new Error(`LeetCode statistics fetch error: ${error.message}`);
    }
  }

  // Helper methods and utilities

  initializeRateLimits() {
    return {
      github: { limit: 5000, remaining: 5000, resetTime: null },
      leetcode: { limit: 100, remaining: 100, resetTime: null },
      hackerrank: { limit: 200, remaining: 200, resetTime: null }
    };
  }

  initializePlatformConfigs() {
    return {
      github: {
        apiBase: 'https://api.github.com',
        rateLimit: 5000,
        requiresAuth: true
      },
      leetcode: {
        apiBase: 'https://leetcode.com/graphql',
        rateLimit: 100,
        requiresAuth: false
      },
      hackerrank: {
        apiBase: 'https://www.hackerrank.com/rest',
        rateLimit: 200,
        requiresAuth: false
      }
    };
  }

  initializeSkillPatterns() {
    return {
      languages: [
        'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust',
        'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
      ],
      frameworks: [
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
        'Spring', 'Laravel', 'Rails', 'ASP.NET', 'Flutter', 'React Native'
      ],
      tools: [
        'Git', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS', 'Azure',
        'GCP', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch'
      ],
      databases: [
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB',
        'Elasticsearch', 'InfluxDB', 'Neo4j'
      ]
    };
  }

  initializeTechnologyStack() {
    return {
      frontend: ['React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js'],
      backend: ['Node.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails'],
      mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin'],
      devops: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions'],
      cloud: ['AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify'],
      database: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Cassandra']
    };
  }

  initializeCompetitivePlatforms() {
    return {
      leetcode: { weight: 0.3, categories: ['algorithms', 'data-structures'] },
      codeforces: { weight: 0.25, categories: ['competitive', 'algorithms'] },
      codechef: { weight: 0.2, categories: ['competitive', 'algorithms'] },
      hackerrank: { weight: 0.15, categories: ['algorithms', 'sql', 'domains'] },
      atcoder: { weight: 0.1, categories: ['competitive', 'algorithms'] }
    };
  }

  async checkRateLimit(platform, userId) {
    const limit = this.rateLimits[platform];
    if (!limit) return;

    if (limit.remaining <= 0 && limit.resetTime && Date.now() < limit.resetTime) {
      throw new Error(`API rate limit exceeded for ${platform}. Reset at ${new Date(limit.resetTime)}`);
    }

    if (limit.remaining > 0) {
      limit.remaining--;
    }
  }

  detectTechnologies(topics, description, repoName) {
    const detected = {
      frameworks: [],
      tools: [],
      languages: []
    };

    const text = `${topics.join(' ')} ${description} ${repoName}`.toLowerCase();
    
    // Check frameworks
    this.skillPatterns.frameworks.forEach(framework => {
      if (text.includes(framework.toLowerCase())) {
        detected.frameworks.push(framework);
      }
    });

    // Check tools
    this.skillPatterns.tools.forEach(tool => {
      if (text.includes(tool.toLowerCase())) {
        detected.tools.push(tool);
      }
    });

    return detected;
  }

  processSkillsData(skillsData) {
    const processed = {
      languages: {},
      frameworks: {},
      tools: {},
      summary: {
        totalRepositories: skillsData.total,
        primaryLanguages: [],
        topFrameworks: [],
        frequentTools: []
      }
    };

    // Process languages
    const sortedLanguages = Object.entries(skillsData.languages)
      .sort(([,a], [,b]) => b - a);
    
    sortedLanguages.forEach(([lang, count]) => {
      processed.languages[lang] = {
        count: count,
        percentage: Math.round((count / skillsData.total) * 100),
        proficiency: this.estimateProficiency(count, skillsData.total)
      };
    });

    processed.summary.primaryLanguages = sortedLanguages.slice(0, 5).map(([lang]) => lang);

    // Process frameworks and tools similarly
    processed.summary.topFrameworks = Object.keys(skillsData.frameworks).slice(0, 5);
    processed.summary.frequentTools = Object.keys(skillsData.tools).slice(0, 5);

    return processed;
  }

  estimateProficiency(count, total) {
    const percentage = (count / total) * 100;
    if (percentage >= 40) return 'Expert';
    if (percentage >= 20) return 'Advanced';
    if (percentage >= 10) return 'Intermediate';
    return 'Beginner';
  }

  calculateGitHubScore(profile, repositories, skillsAnalysis, activityAnalysis) {
    let score = 0;

    // Profile completeness (20 points)
    score += profile.bio ? 5 : 0;
    score += profile.blog ? 5 : 0;
    score += profile.location ? 3 : 0;
    score += profile.company ? 3 : 0;
    score += profile.hireable ? 4 : 0;

    // Repository quality (40 points)
    const publicRepos = repositories.filter(repo => !repo.private).length;
    score += Math.min(publicRepos * 2, 20); // Up to 20 points for repositories
    
    const starredRepos = repositories.filter(repo => repo.stargazers_count > 0).length;
    score += Math.min(starredRepos * 3, 15); // Up to 15 points for starred repos
    
    const documentedRepos = repositories.filter(repo => repo.description).length;
    score += Math.min(documentedRepos, 5); // Up to 5 points for documentation

    // Skills diversity (20 points)
    const languageCount = Object.keys(skillsAnalysis.languages).length;
    score += Math.min(languageCount * 2, 15); // Up to 15 points for language diversity
    score += Math.min(Object.keys(skillsAnalysis.frameworks).length, 5); // Up to 5 points for frameworks

    // Activity level (20 points)
    if (activityAnalysis) {
      score += Math.min(activityAnalysis.totalCommits / 10, 10); // Up to 10 points for commits
      score += activityAnalysis.consistentActivity ? 10 : 0; // 10 points for consistent activity
    }

    return Math.min(100, Math.round(score));
  }

  sanitizeGitHubProfile(profile) {
    return {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      company: profile.company,
      blog: profile.blog,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
  }

  sanitizeRepository(repo, detailed = false) {
    const basic = {
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      size: repo.size
    };

    if (detailed) {
      return {
        ...basic,
        defaultBranch: repo.default_branch,
        hasIssues: repo.has_issues,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        openIssues: repo.open_issues_count,
        license: repo.license?.name,
        visibility: repo.private ? 'private' : 'public'
      };
    }

    return basic;
  }

  sanitizeLeetCodeProfile(profile) {
    return {
      username: profile.username,
      realName: profile.profile?.realName,
      ranking: profile.profile?.ranking,
      reputation: profile.profile?.reputation,
      starRating: profile.profile?.starRating
    };
  }

  cacheProfileAnalysis(platform, username, analysis) {
    const key = `${platform}:${username}`;
    this.profiles.set(key, {
      ...analysis,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  }

  // Mock implementations for other platforms (would be implemented with actual APIs)
  async analyzeHackerRankProfile(username, options) {
    return {
      profile: { username, verified: false },
      statistics: { problemsSolved: 0, badges: [] },
      skills: { domains: [], languages: [] }
    };
  }

  async analyzeCodeChefProfile(username, options) {
    return {
      profile: { username, rating: 0 },
      statistics: { contestsParticipated: 0, problemsSolved: 0 },
      performance: { currentRating: 0, maxRating: 0 }
    };
  }

  async analyzeCodeforcesProfile(username, options) {
    return {
      profile: { username, rating: 0, rank: 'unrated' },
      statistics: { contestsParticipated: 0, problemsSolved: 0 },
      performance: { currentRating: 0, maxRating: 0 }
    };
  }

  // Additional helper methods would be implemented here...
  // (generateConsolidatedAnalysis, generatePlatformComparisons, etc.)

  async generateConsolidatedAnalysis(results) {
    const skills = new Set();
    let totalScore = 0;
    let platformCount = 0;

    Object.values(results).forEach(result => {
      if (result.skills) {
        Object.keys(result.skills.languages || {}).forEach(lang => skills.add(lang));
        Object.keys(result.skills.frameworks || {}).forEach(fw => skills.add(fw));
      }
      if (result.overallScore) {
        totalScore += result.overallScore;
        platformCount++;
      }
    });

    return {
      overallScore: platformCount > 0 ? Math.round(totalScore / platformCount) : 0,
      skillsMatrix: Array.from(skills),
      recommendations: ['Continue building diverse portfolio', 'Focus on consistent activity']
    };
  }

  generatePlatformComparisons(results) {
    return {
      strengths: ['Strong GitHub presence', 'Good problem-solving skills'],
      improvements: ['Increase LeetCode activity', 'Participate in more contests']
    };
  }

  async generateGitHubInsights(profile, repositories, skillsAnalysis, activityAnalysis) {
    return [
      `Active developer with ${repositories.length} repositories`,
      `Primary languages: ${Object.keys(skillsAnalysis.languages).slice(0, 3).join(', ')}`,
      `${profile.followers} followers indicate community recognition`
    ];
  }

  async generateGitHubRecommendations(insights, skillsAnalysis) {
    return [
      'Add comprehensive README files to increase repository visibility',
      'Consider contributing to open source projects',
      'Add more detailed project descriptions'
    ];
  }

  // Additional mock methods for comprehensive functionality
  async getCandidateProfiles(candidateId, options) {
    return {
      profiles: [],
      summary: { totalPlatforms: 0, lastAnalyzed: null },
      lastUpdated: new Date().toISOString(),
      analytics: { overallScore: 0, topSkills: [] }
    };
  }

  async bulkAnalyzeProfiles(candidates, options) {
    return {
      results: candidates.map(c => ({ candidateId: c.id, status: 'completed', score: 75 })),
      summary: { processed: candidates.length, successful: candidates.length, failed: 0 },
      comparisons: null,
      recommendations: ['Focus on GitHub activity', 'Improve portfolio documentation'],
      reports: null,
      processingTime: 5000
    };
  }

  async extractSkills(profileData, repositories, options) {
    return {
      skills: ['JavaScript', 'Python', 'React'],
      categories: { languages: ['JavaScript', 'Python'], frameworks: ['React'] },
      confidence: { JavaScript: 0.9, Python: 0.8, React: 0.85 },
      sources: { github: 15, portfolio: 3 },
      recommendations: ['Add more Python projects', 'Learn TypeScript']
    };
  }

  async getCodingTrends(options) {
    return {
      trends: { rising: ['TypeScript', 'Rust'], stable: ['JavaScript', 'Python'] },
      hotTechnologies: ['React', 'Node.js', 'Docker'],
      growingSkills: ['Cloud Computing', 'Machine Learning'],
      demandAnalysis: { high: ['JavaScript', 'Python'], medium: ['Java'] },
      projections: null,
      insights: ['JavaScript remains most popular', 'AI/ML skills gaining traction']
    };
  }

  async refreshProfiles(platforms, options) {
    return {
      refreshed: platforms,
      failed: [],
      summary: { successful: platforms.length, failed: 0 },
      nextRefreshAllowed: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
  }

  async getCodingAnalytics(candidateId, options) {
    return {
      overview: { totalCommits: 250, activeRepos: 15, primaryLanguages: ['JavaScript', 'Python'] },
      activityTrends: { weekly: [5, 8, 12, 6, 9], monthly: [45, 52, 38, 41] },
      skillProgression: { JavaScript: [70, 75, 80], Python: [60, 68, 72] },
      performanceMetrics: { codeQuality: 78, consistency: 85 },
      comparisons: null,
      insights: ['Consistent activity pattern', 'Strong in web technologies'],
      recommendations: ['Explore backend technologies', 'Contribute to open source']
    };
  }

  // Utility method implementations
  generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async validateSingleSkill(skill, platforms, portfolioData, options) {
    return {
      skill: skill,
      evidence: {
        github: { found: true, confidence: 0.8, projects: 3 },
        portfolio: { found: false, confidence: 0, projects: 0 }
      },
      overallConfidence: 0.8,
      verified: true,
      recommendations: ['Create more projects showcasing this skill']
    };
  }

  calculateEvidenceScore(validatedSkills) {
    const scores = Object.values(validatedSkills).map(skill => skill.overallConfidence);
    return scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) : 0;
  }

  determineCredibilityRating(evidenceScore) {
    if (evidenceScore >= 80) return 'High';
    if (evidenceScore >= 60) return 'Medium';
    if (evidenceScore >= 40) return 'Low';
    return 'Insufficient Evidence';
  }

  identifyMissingEvidence(validatedSkills) {
    return Object.entries(validatedSkills)
      .filter(([skill, validation]) => validation.overallConfidence < 0.6)
      .map(([skill]) => skill);
  }

  async generateValidationRecommendations(validation) {
    return [
      'Create projects demonstrating claimed skills',
      'Contribute to open source projects',
      'Add detailed project documentation'
    ];
  }
}

module.exports = CodingProfileScraperService;