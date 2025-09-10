import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Building2, BarChart3, Target, Zap, Shield, Award } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: "AI-Powered Matching",
      description: "Advanced algorithms match candidates with the perfect internship based on skills, preferences, and requirements."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Quota Management",
      description: "Intelligent quota enforcement ensures fair distribution across demographics while maintaining quality standards."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Resume Analysis",
      description: "Automated resume parsing extracts skills and suggests improvements to boost your chances of selection."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with comprehensive audit trails and data protection measures."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Candidates" },
    { number: "500+", label: "Partner Companies" },
    { number: "95%", label: "Match Accuracy" },
    { number: "50+", label: "Industries Covered" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              AI-Driven Internship
              <span className="block text-accent">Recommendation Engine</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Empowering the PM Internship Scheme with intelligent matching, 
              quota management, and seamless allocation processes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-accent text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center bg-white/20 text-white hover:bg-white/30"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools for candidates, companies, and administrators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for different user types
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Candidate Card */}
            <div className="card text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                For Candidates
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your resume, get AI-powered recommendations, and track your applications.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Resume Analysis & Skills Extraction
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Personalized Recommendations
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Application Tracking
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Learning Roadmap
                </li>
              </ul>
              <Link
                to="/signup"
                className="btn-primary w-full"
              >
                Sign Up as Candidate
              </Link>
            </div>

            {/* Company Card */}
            <div className="card text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                For Companies
              </h3>
              <p className="text-gray-600 mb-6">
                Create postings, review applications, and manage your internship program.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Posting Management
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Auto-Shortlisting
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Candidate Analytics
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Selection Workflow
                </li>
              </ul>
              <Link
                to="/signup"
                className="btn-accent w-full"
              >
                Sign Up as Company
              </Link>
            </div>

            {/* Admin Card */}
            <div className="card text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                For Administrators
              </h3>
              <p className="text-gray-600 mb-6">
                Manage quotas, run simulations, and oversee the entire allocation process.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Quota Configuration
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  What-If Simulations
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Batch Matching
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-accent mr-2" />
                  Analytics Dashboard
                </li>
              </ul>
              <Link
                to="/signup"
                className="btn-secondary w-full"
              >
                Sign Up as Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Internship Matching?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of candidates and companies already using our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="btn-accent text-lg px-8 py-4"
            >
              Start Your Journey
            </Link>
            <Link
              to="/contact"
              className="btn-secondary text-lg px-8 py-4 bg-white/20 text-white hover:bg-white/30"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
