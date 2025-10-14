#!/usr/bin/env node

/**
 * Test script to verify AI integration between frontend and backend
 * This script tests the key AI endpoints and data flow
 */

const axios = require("axios");

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Test data
const testResumeText = `
John Doe
Software Developer
Email: john.doe@email.com
Phone: +91 98765 43210
Location: Bangalore, India

EDUCATION:
B.Tech Computer Science - IIT Delhi (2020-2024)
CGPA: 8.5/10

SKILLS:
Programming Languages: Python, JavaScript, Java, C++
Frameworks: React, Node.js, Django, Spring Boot
Databases: MySQL, MongoDB, PostgreSQL
Tools: Git, Docker, AWS, Jenkins

EXPERIENCE:
Software Developer Intern - TechCorp India (2023)
- Developed web applications using React and Node.js
- Worked on RESTful APIs and database design
- Collaborated with team of 5 developers

PROJECTS:
E-commerce Platform (2023)
- Built full-stack web application using MERN stack
- Implemented user authentication and payment integration
- Deployed on AWS with CI/CD pipeline

CERTIFICATIONS:
AWS Certified Developer Associate
Google Cloud Professional Developer
`;

const testCandidateProfile = {
  id: "test-candidate-1",
  name: "John Doe",
  skills: ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
  experience: "2 years",
  location: "Bangalore",
  education: "B.Tech Computer Science",
};

const testJobPostings = [
  {
    id: "job-1",
    title: "Software Development Intern",
    company: "TechCorp India",
    location: "Bangalore",
    description: "Work on modern web applications using React and Node.js",
    required_skills: ["React", "JavaScript", "Node.js", "MongoDB"],
    required_experience: 1,
  },
  {
    id: "job-2",
    title: "Full Stack Developer Intern",
    company: "StartupXYZ",
    location: "Mumbai",
    description: "Develop end-to-end web solutions using modern technologies",
    required_skills: ["Python", "Django", "React", "PostgreSQL"],
    required_experience: 2,
  },
];

async function testHealthCheck() {
  console.log("🔍 Testing health check...");
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log("✅ Health check passed:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
    return false;
  }
}

async function testResumeAnalysis() {
  console.log("🔍 Testing resume analysis...");
  try {
    // Create a test file
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("file", Buffer.from(testResumeText), {
      filename: "test_resume.txt",
      contentType: "text/plain",
    });

    const response = await axios.post(
      `${API_BASE_URL}/ai/analyze-resume-advanced`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    console.log("✅ Resume analysis passed");
    console.log("📊 Analysis results:", {
      success: response.data.success,
      analyzers_used: response.data.analyzers_used,
      has_analysis: !!response.data.analysis,
    });
    return true;
  } catch (error) {
    console.error("❌ Resume analysis failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

async function testJobMatching() {
  console.log("🔍 Testing job matching...");
  try {
    const response = await axios.post(`${API_BASE_URL}/ai/match-jobs`, {
      candidate_profiles: [testCandidateProfile],
      job_descriptions: testJobPostings,
    });

    console.log("✅ Job matching passed");
    console.log("📊 Matching results:", {
      success: response.data.success,
      total_matches: response.data.matches?.[0]?.job_matches?.length || 0,
      has_statistics: !!response.data.statistics,
    });
    return true;
  } catch (error) {
    console.error("❌ Job matching failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

async function testAIHealth() {
  console.log("🔍 Testing AI system health...");
  try {
    const response = await axios.get(`${API_BASE_URL}/ai/health`);
    console.log("✅ AI health check passed");
    console.log("📊 AI system status:", response.data);
    return true;
  } catch (error) {
    console.error("❌ AI health check failed:", error.message);
    return false;
  }
}

async function testAnalytics() {
  console.log("🔍 Testing AI analytics...");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/ai/analytics?timeframe=30d`
    );
    console.log("✅ AI analytics passed");
    console.log("📊 Analytics data:", response.data);
    return true;
  } catch (error) {
    console.error("❌ AI analytics failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting AI Integration Tests...\n");

  const tests = [
    { name: "Health Check", fn: testHealthCheck },
    { name: "AI System Health", fn: testAIHealth },
    { name: "Resume Analysis", fn: testResumeAnalysis },
    { name: "Job Matching", fn: testJobMatching },
    { name: "AI Analytics", fn: testAnalytics },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    console.log("");
  }

  // Summary
  console.log("📋 Test Summary:");
  console.log("================");
  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.name}`);
  });

  const passedTests = results.filter((r) => r.passed).length;
  const totalTests = results.length;

  console.log(`\n🎯 Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! AI integration is working correctly.");
  } else {
    console.log(
      "⚠️  Some tests failed. Check the backend server and AI services."
    );
  }

  return passedTests === totalTests;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("💥 Test runner failed:", error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testHealthCheck,
  testResumeAnalysis,
  testJobMatching,
  testAIHealth,
  testAnalytics,
};
