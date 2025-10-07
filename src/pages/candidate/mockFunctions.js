// Temporary fix for dashboard loading issue
// This file contains mock load functions to replace API calls

const mockLoadFunctions = `
  const loadRecommendations = async () => {
    console.log('Loading recommendations with mock data');
    setRecommendations([
      {
        id: 1,
        title: "Software Development Intern",
        company: "TechCorp India",
        location: "Bangalore",
        duration: "6 months",
        matchScore: 95,
        skills: ["React", "Node.js", "JavaScript", "MongoDB"],
        deadline: "2024-02-15",
        stipend: "₹25,000/month",
        type: "Full-time",
        applicants: 1250,
        isNew: true,
      },
      {
        id: 2,
        title: "Data Science Intern",
        company: "DataViz Solutions",
        location: "Mumbai",
        duration: "4 months",
        matchScore: 88,
        skills: ["Python", "Machine Learning", "SQL", "Tableau"],
        deadline: "2024-02-20",
        stipend: "₹22,000/month",
        type: "Remote",
        applicants: 890,
        isNew: false,
      },
    ]);
  };

  const loadApplications = async () => {
    console.log('Loading applications with mock data');
    setApplications([
      {
        id: 1,
        title: "Frontend Developer Intern",
        company: "WebTech Solutions",
        status: "Applied",
        appliedDate: "2024-01-15",
        matchScore: 92,
        nextStep: "Technical Interview",
        interviewDate: "2024-02-05",
      },
      {
        id: 2,
        title: "Backend Developer Intern",
        company: "ServerCorp",
        status: "Interview Scheduled",
        appliedDate: "2024-01-10",
        matchScore: 85,
        nextStep: "HR Round",
        interviewDate: "2024-02-03",
      },
    ]);
  };

  const loadStats = async () => {
    console.log('Loading stats with mock data');
    setStats({
      totalApplications: 15,
      interviewsScheduled: 3,
      offersReceived: 1,
      profileViews: 245,
      matchRate: 78,
      responseRate: 65,
    });
  };

  const loadRecentActivity = async () => {
    console.log('Loading recent activity with mock data');
    setRecentActivity([
      {
        id: 1,
        type: 'application',
        title: 'Applied to Software Developer Intern',
        company: 'TechCorp',
        time: '2 hours ago',
        icon: 'briefcase',
      },
      {
        id: 2,
        type: 'interview',
        title: 'Interview scheduled',
        company: 'DataViz Solutions',
        time: '1 day ago',
        icon: 'calendar',
      },
    ]);
  };

  const loadSkillProgress = async () => {
    console.log('Loading skill progress with mock data');
    setSkillProgress([
      { skill: 'React', progress: 85, target: 90 },
      { skill: 'Node.js', progress: 70, target: 80 },
      { skill: 'Python', progress: 60, target: 75 },
    ]);
  };

  const loadNotifications = async () => {
    console.log('Loading notifications with mock data');
    setNotifications([
      {
        id: 1,
        title: 'New job recommendation',
        message: 'Check out this perfect match for you!',
        time: '1 hour ago',
        unread: true,
      },
    ]);
  };

  const loadUpcomingDeadlines = async () => {
    console.log('Loading upcoming deadlines with mock data');
    setUpcomingDeadlines([
      {
        id: 1,
        title: 'Frontend Developer Application',
        company: 'TechCorp',
        deadline: '2024-02-10',
        daysLeft: 5,
      },
    ]);
  };
`;

export default mockLoadFunctions;