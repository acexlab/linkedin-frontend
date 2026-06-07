import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppData, User, Post, Connection, Conversation, Message, Job, Notification, Comment, Application, Company, Experience, Education, ProfileView, JobAlert, Ad, UserReport } from './state.types';

const STORAGE_KEY = 'linkedin_clone_data_v2';

const SEED_COMPANIES: Company[] = [
  {
    id: "co1",
    name: "Google",
    tagline: "Organize the world's information",
    about: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.",
    industry: "Technology",
    size: "10,001+ employees",
    headquarters: "Mountain View, CA",
    website: "google.com",
    logo: "G",
    logoColor: "#4285F4",
    coverColor: "linear-gradient(135deg, #4285F4, #0F52BA)",
    followers: 28400000,
    employeeIds: ["u1"],
  },
  {
    id: "co2",
    name: "Meta",
    tagline: "Connecting the world",
    about: "Meta Platforms, Inc. builds technologies that help people connect, find communities, and grow businesses.",
    industry: "Technology",
    size: "10,001+ employees",
    headquarters: "Menlo Park, CA",
    website: "meta.com",
    logo: "M",
    logoColor: "#0866FF",
    coverColor: "linear-gradient(135deg, #0866FF, #003ea3)",
    followers: 14200000,
    employeeIds: ["u2"],
  },
  {
    id: "co3",
    name: "Apple",
    tagline: "Think Different",
    about: "Apple is a technology company that designs, develops, and sells consumer electronics, computer software, and online services.",
    industry: "Technology",
    size: "10,001+ employees",
    headquarters: "Cupertino, CA",
    website: "apple.com",
    logo: "A",
    logoColor: "#555555",
    coverColor: "linear-gradient(135deg, #555555, #111111)",
    followers: 18600000,
    employeeIds: ["u3"],
  },
  {
    id: "co4",
    name: "Stripe",
    tagline: "Financial infrastructure for the internet",
    about: "Stripe is a financial services and software as a service company. Its software allows infrastructure builders and businesses to accept payments and manage transactions over the internet.",
    industry: "Financial Technology",
    size: "1,001–5,000 employees",
    headquarters: "San Francisco, CA",
    website: "stripe.com",
    logo: "S",
    logoColor: "#635BFF",
    coverColor: "linear-gradient(135deg, #635BFF, #3a35a0)",
    followers: 1200000,
    employeeIds: [],
  },
  {
    id: "co5",
    name: "OpenAI",
    tagline: "AI research and deployment company",
    about: "OpenAI is an artificial intelligence research laboratory consisting of the for-profit corporation OpenAI LP and its parent company, the non-profit OpenAI Inc.",
    industry: "Artificial Intelligence",
    size: "201–500 employees",
    headquarters: "San Francisco, CA",
    website: "openai.com",
    logo: "O",
    logoColor: "#10A37F",
    coverColor: "linear-gradient(135deg, #10A37F, #0a6b53)",
    followers: 3800000,
    employeeIds: [],
  },
  {
    id: "co_nest",
    name: "NeST Group",
    tagline: "Leading global technology solutions",
    about: "NeST Group is a diversified conglomerate with global footprints. We provide end-to-end hardware and software solutions across aerospace, healthcare, and software domains.",
    industry: "Information Technology",
    size: "10,001+ employees",
    headquarters: "Kochi, Kerala",
    website: "nestgroup.net",
    logo: "NG",
    logoColor: "#0A66C2",
    coverColor: "linear-gradient(135deg, #0A66C2, #004182)",
    followers: 45000,
    employeeIds: ["u_business"]
  },
  {
    id: "co_techcorp",
    name: "TechCorp Inc.",
    tagline: "Innovating cloud scale operations",
    about: "TechCorp is an early-stage startup developing advanced DevOps automation workflows.",
    industry: "Software & Technology",
    size: "11-50 employees",
    headquarters: "Bengaluru, Karnataka",
    website: "techcorp.io",
    logo: "TC",
    logoColor: "#8B44AC",
    coverColor: "linear-gradient(135deg, #8B44AC, #000)",
    followers: 120,
    employeeIds: ["u_pending_biz"]
  }
];

function makeUser(u: Omit<User, 'savedJobs' | 'savedPosts' | 'openToWork' | 'following'> & Partial<Pick<User, 'savedJobs' | 'savedPosts' | 'openToWork' | 'following'>>): User {
  return {
    savedJobs: [],
    savedPosts: [],
    openToWork: false,
    following: [],
    ...u,
  };
}

const SEED_USERS: User[] = [
  makeUser({
    id: "u1", name: "Jonadh E F", email: "alex@example.com", password: "password",
    headline: "Student at Mar Baselios Institute of Technology and Science, Thrissur, Kerala", location: "Thrissur, Kerala",
    about: "Student eager to build innovative web applications. Passionate about frontend development, design, and software engineering.",
    connections: 143, profileViews: 13,
    experience: [
      { id: "e1", title: "Student Ambassador", company: "Mar Baselios Institute", startDate: "2023-09", endDate: null, description: "Engaging in student events and supporting community learning programs." }
    ],
    education: [{ id: "ed1", school: "Mar Baselios Institute of Technology and Science", degree: "Bachelor of Technology", field: "Computer Science", startYear: "2022", endYear: "2026" }],
    skills: ["TypeScript", "Angular", "Tailwind CSS", "HTML5", "UX Design"],
    avatarInitials: "JF", avatarColor: "#0A66C2", coverColor: "linear-gradient(135deg, #0A66C2, #004182)",
  }),
  makeUser({
    id: "u2", name: "Sarah Chen", email: "sarah@example.com", password: "password",
    headline: "Product Manager at Meta", location: "Seattle, WA",
    about: "Building products that connect people. Former engineer turned PM. I love user research and data-driven decisions.",
    connections: 412, profileViews: 890,
    experience: [{ id: "e1", title: "Senior Product Manager", company: "Meta", startDate: "2021-01", endDate: null, description: "Leading Instagram Stories product strategy and roadmap." }],
    education: [{ id: "ed1", school: "MIT", degree: "M.S.", field: "Computer Science", startYear: "2013", endYear: "2015" }],
    skills: ["Product Strategy", "User Research", "Agile", "SQL", "Figma"],
    avatarInitials: "SC", avatarColor: "#057642", coverColor: "linear-gradient(135deg, #057642, #03422a)",
  }),
  makeUser({
    id: "u3", name: "Marcus Williams", email: "marcus@example.com", password: "password",
    headline: "UX Designer at Apple", location: "Cupertino, CA",
    about: "Designing the future of computing. I believe great design is invisible.",
    connections: 284, profileViews: 654,
    experience: [{ id: "e1", title: "Senior UX Designer", company: "Apple", startDate: "2019-05", endDate: null, description: "Designing experiences for macOS and iOS." }],
    education: [{ id: "ed1", school: "RISD", degree: "B.F.A.", field: "Graphic Design", startYear: "2012", endYear: "2016" }],
    skills: ["Figma", "Sketch", "Prototyping", "User Testing", "Design Systems"],
    avatarInitials: "MW", avatarColor: "#8B44AC", coverColor: "linear-gradient(135deg, #8B44AC, #5a2d72)",
  }),
  makeUser({
    id: "u4", name: "Priya Patel", email: "priya@example.com", password: "password",
    headline: "Machine Learning Engineer at Amazon", location: "New York, NY",
    about: "Building AI-powered systems at scale. Research interests in NLP and recommendation systems.",
    connections: 391, profileViews: 720,
    experience: [{ id: "e1", title: "ML Engineer", company: "Amazon", startDate: "2020-08", endDate: null, description: "Building recommendation systems for Amazon's retail platform." }],
    education: [{ id: "ed1", school: "Carnegie Mellon University", degree: "M.S.", field: "Machine Learning", startYear: "2018", endYear: "2020" }],
    skills: ["Python", "PyTorch", "TensorFlow", "MLOps", "Spark"],
    avatarInitials: "PP", avatarColor: "#C77800", coverColor: "linear-gradient(135deg, #C77800, #8a5300)",
  }),
  makeUser({
    id: "u5", name: "James Rodriguez", email: "james@example.com", password: "password",
    headline: "Engineering Manager at Netflix", location: "Los Gatos, CA",
    about: "Leading engineering teams building the future of entertainment. Passionate about team culture and technical excellence.",
    connections: 618, profileViews: 1450,
    experience: [{ id: "e1", title: "Engineering Manager", company: "Netflix", startDate: "2018-11", endDate: null, description: "Managing 3 teams working on streaming infrastructure." }],
    education: [{ id: "ed1", school: "UC Berkeley", degree: "B.S.", field: "EECS", startYear: "2008", endYear: "2012" }],
    skills: ["Team Leadership", "System Design", "Java", "Microservices", "Cloud"],
    avatarInitials: "JR", avatarColor: "#CC0000", coverColor: "linear-gradient(135deg, #CC0000, #880000)",
  }),
  makeUser({
    id: "u6", name: "Emily Zhang", email: "emily@example.com", password: "password",
    headline: "Frontend Engineer at Airbnb", location: "San Francisco, CA",
    about: "Crafting delightful user experiences. Performance obsessed.",
    connections: 215, profileViews: 430,
    experience: [{ id: "e1", title: "Senior Frontend Engineer", company: "Airbnb", startDate: "2021-03", endDate: null, description: "Building the Airbnb web experience with React." }],
    education: [{ id: "ed1", school: "UCLA", degree: "B.S.", field: "Computer Science", startYear: "2015", endYear: "2019" }],
    skills: ["React", "TypeScript", "CSS", "Performance", "Accessibility"],
    avatarInitials: "EZ", avatarColor: "#FF5A5F", coverColor: "linear-gradient(135deg, #FF5A5F, #c43a40)",
  }),
  makeUser({
    id: "u7", name: "David Kim", email: "david@example.com", password: "password",
    headline: "DevOps Engineer at Microsoft", location: "Redmond, WA",
    about: "Building reliable infrastructure and CI/CD pipelines. Azure certified.",
    connections: 178, profileViews: 312,
    experience: [{ id: "e1", title: "Senior DevOps Engineer", company: "Microsoft", startDate: "2019-09", endDate: null, description: "Managing Azure infrastructure for Microsoft Teams." }],
    education: [{ id: "ed1", school: "University of Washington", degree: "B.S.", field: "Computer Science", startYear: "2014", endYear: "2018" }],
    skills: ["Azure", "Terraform", "Docker", "CI/CD", "Monitoring"],
    avatarInitials: "DK", avatarColor: "#00A4EF", coverColor: "linear-gradient(135deg, #00A4EF, #006699)",
  }),
  makeUser({
    id: "u8", name: "Olivia Thompson", email: "olivia@example.com", password: "password",
    headline: "Data Scientist at Spotify", location: "New York, NY",
    about: "Turning data into insights that improve music discovery for millions of users.",
    connections: 302, profileViews: 580,
    experience: [{ id: "e1", title: "Data Scientist", company: "Spotify", startDate: "2020-02", endDate: null, description: "Building music recommendation algorithms." }],
    education: [{ id: "ed1", school: "Columbia University", degree: "M.S.", field: "Data Science", startYear: "2017", endYear: "2019" }],
    skills: ["Python", "R", "SQL", "A/B Testing", "Statistics"],
    avatarInitials: "OT", avatarColor: "#1DB954", coverColor: "linear-gradient(135deg, #1DB954, #117a37)",
  }),
  makeUser({
    id: "u9", name: "Ahmed Hassan", email: "ahmed@example.com", password: "password",
    headline: "Backend Engineer at Uber", location: "San Francisco, CA",
    about: "Scaling backend systems to handle millions of rides per day.",
    connections: 259, profileViews: 490,
    experience: [{ id: "e1", title: "Senior Backend Engineer", company: "Uber", startDate: "2019-07", endDate: null, description: "Building dispatch and routing systems." }],
    education: [{ id: "ed1", school: "Georgia Tech", degree: "B.S.", field: "Computer Science", startYear: "2014", endYear: "2018" }],
    skills: ["Go", "gRPC", "PostgreSQL", "Redis", "Kafka"],
    avatarInitials: "AH", avatarColor: "#000000", coverColor: "linear-gradient(135deg, #000000, #333333)",
  }),
  makeUser({
    id: "u10", name: "Lisa Park", email: "lisa@example.com", password: "password",
    headline: "Product Designer at Figma", location: "San Francisco, CA",
    about: "Designing tools that empower designers. Meta-designer.",
    connections: 445, profileViews: 920,
    experience: [{ id: "e1", title: "Product Designer", company: "Figma", startDate: "2020-06", endDate: null, description: "Designing core Figma product features." }],
    education: [{ id: "ed1", school: "Parsons School of Design", degree: "B.F.A.", field: "Communication Design", startYear: "2014", endYear: "2018" }],
    skills: ["Figma", "Motion Design", "Brand Design", "User Research", "Prototyping"],
    avatarInitials: "LP", avatarColor: "#A259FF", coverColor: "linear-gradient(135deg, #A259FF, #6b35aa)",
  }),
  makeUser({
    id: "u11", name: "Jyothis M S", email: "jyothis@example.com", password: "password",
    headline: "Associate Product Engineer at ConceptNXT Technologies", location: "Kochi, Kerala",
    about: "Delivering high-quality software solutions and scaling products.",
    connections: 180, profileViews: 245,
    experience: [{ id: "e1", title: "Associate Product Engineer", company: "ConceptNXT Technologies", startDate: "2024-01", endDate: null, description: "Developing backend features and managing database pipelines." }],
    education: [{ id: "ed1", school: "CUSAT", degree: "B.Tech", field: "Information Technology", startYear: "2020", endYear: "2024" }],
    skills: ["Node.js", "Express", "MongoDB", "SQL"],
    avatarInitials: "JM", avatarColor: "#9b59b6", coverColor: "linear-gradient(135deg, #9b59b6, #8e44ad)",
  }),
  makeUser({
    id: "u12", name: "Jae O.", email: "jaeo@example.com", password: "password",
    headline: "Head of Ads, Formats, Placements, Measurement & Audiences at LinkedIn", location: "Bengaluru, Karnataka",
    about: "Building the future of ad tech formats and digital marketing solutions.",
    connections: 520, profileViews: 1205,
    experience: [{ id: "e1", title: "Head of Ads & Formats", company: "LinkedIn", startDate: "2022-03", endDate: null, description: "Leading formats, placements, and ads measurement software teams." }],
    education: [{ id: "ed1", school: "IIM Bangalore", degree: "MBA", field: "Marketing & Strategy", startYear: "2018", endYear: "2020" }],
    skills: ["Product Strategy", "Ad Tech", "Analytics", "Scaling Platforms"],
    avatarInitials: "JO", avatarColor: "#e67e22", coverColor: "linear-gradient(135deg, #e67e22, #d35400)",
  }),
  makeUser({
    id: "u13", name: "Basil K Jijo", email: "basil@example.com", password: "password",
    headline: "ASP.NET Developer | Python Developer | Front-end Developer", location: "Kochi, Kerala",
    about: "ASP.NET developer focused on building scalable cloud services and modern web frontends.",
    connections: 119, profileViews: 84,
    experience: [{ id: "e1", title: "Junior Developer", company: "Freelance", startDate: "2023-01", endDate: null, description: "Building websites and APIs." }],
    education: [{ id: "ed1", school: "MG University", degree: "B.Tech", field: "Computer Science", startYear: "2019", endYear: "2023" }],
    skills: ["ASP.NET", "C#", "Python", "HTML", "CSS"],
    avatarInitials: "BJ", avatarColor: "#8B44AC", coverColor: "linear-gradient(135deg, #8B44AC, #5a2d72)",
  }),
  makeUser({
    id: "u14", name: "Alan Baby", email: "alan@example.com", password: "password",
    headline: "Software Developer | Exploring AI, ML & Robotics", location: "Thrissur, Kerala",
    about: "Passionate about robotics, deep learning, and embedding AI solutions.",
    connections: 98, profileViews: 142,
    experience: [{ id: "e1", title: "ML Intern", company: "NeST Group", startDate: "2024-02", endDate: null, description: "Developing vision-based sorting algorithms." }],
    education: [{ id: "ed1", school: "APJ Abdul Kalam Technological University", degree: "B.Tech", field: "Robotics Engineering", startYear: "2021", endYear: "2025" }],
    skills: ["Python", "TensorFlow", "ROS", "C++"],
    avatarInitials: "AB", avatarColor: "#C77800", coverColor: "linear-gradient(135deg, #C77800, #8a5300)",
  }),
  makeUser({
    id: "u15", name: "Abin Babu", email: "abin@example.com", password: "password",
    headline: "CSE graduate | Full stack developer| video editor", location: "Ernakulam, Kerala",
    about: "Full stack software engineer and technical content creator specializing in educational videos.",
    connections: 156, profileViews: 231,
    experience: [{ id: "e1", title: "Full Stack Engineer", company: "ConceptNXT Technologies", startDate: "2024-05", endDate: null, description: "Developing web dashboard systems." }],
    education: [{ id: "ed1", school: "APJ Abdul Kalam Technological University", degree: "B.Tech", field: "Computer Science", startYear: "2020", endYear: "2024" }],
    skills: ["Node.js", "Angular", "Express", "Video Editing"],
    avatarInitials: "AB", avatarColor: "#CC0000", coverColor: "linear-gradient(135deg, #CC0000, #880000)",
  }),
  makeUser({
    id: "u_admin", name: "System Admin", email: "admin@example.com", password: "password",
    headline: "System Administrator at LinkedIn", location: "Kochi, Kerala",
    about: "Administering the platform and managing job and ad approvals.",
    connections: 10, profileViews: 5, experience: [], education: [], skills: [],
    avatarInitials: "AD", avatarColor: "#333333", coverColor: "linear-gradient(135deg, #333333, #111111)",
    role: "admin"
  }),
  makeUser({
    id: "u_business", name: "Business Recruiter", email: "business@example.com", password: "password",
    headline: "Hiring Manager at NeST Group", location: "Kochi, Kerala",
    about: "Recruiting top talent and promoting job postings and advertisements.",
    connections: 85, profileViews: 42, experience: [], education: [], skills: [],
    avatarInitials: "BR", avatarColor: "#057642", coverColor: "linear-gradient(135deg, #057642, #03422a)",
    role: "business", isApprovedBusiness: true
  }),
  makeUser({
    id: "u_pending_biz", name: "TechCorp Recruiter", email: "recruiter@techcorp.com", password: "password",
    headline: "HR & Talent Lead at TechCorp Inc.", location: "Bengaluru, Karnataka",
    about: "Hiring engineering talent for our cloud automation platform.",
    connections: 3, profileViews: 1, experience: [], education: [], skills: [],
    avatarInitials: "TC", avatarColor: "#8B44AC", coverColor: "linear-gradient(135deg, #8B44AC, #000)",
    role: "business", isApprovedBusiness: false
  }),
];

const SEED_POSTS: Post[] = [
  {
    id: "p_jaeo",
    authorId: "u12",
    content: "Attention is easy to measure, influence is harder, but it's what matters.",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    likes: ["u1", "u2", "u11"],
    comments: [],
    reposts: 5,
    image: "/hero_explore.png"
  },
  {
    id: "p_jyothis",
    authorId: "u11",
    content: "Jyothis M S started a new position as Associate Product Engineer at ConceptNXT Technologies",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    likes: ["u1", "u2", "u3", "u4"],
    comments: [
      { id: "c_j1", authorId: "u2", content: "Congratulations! Wishing you the best.", createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() }
    ],
    reposts: 1,
    isJobUpdate: true
  },
  { id: "p1", authorId: "u1", content: "Excited to share that I just hit my 500th connection on LinkedIn! To everyone who's been part of my professional journey — thank you. The tech community never ceases to amaze me with its generosity and knowledge sharing. Here's to the next 500!", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), likes: ["u2", "u3", "u4", "u5", "u6"], comments: [{ id: "c1", authorId: "u2", content: "Congratulations Alex! Well deserved.", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }, { id: "c2", authorId: "u3", content: "Keep it up! The network effects are real.", createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() }], reposts: 3 },
  { id: "p2", authorId: "u2", content: "Just wrapped up our Q3 product review. Key takeaway: the features users love most are almost never the ones we think they will. Ship, measure, iterate. Every time.\n\nUser research before roadmap planning > assumptions. Every single time.", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u4", "u5", "u7", "u8", "u9"], comments: [{ id: "c1", authorId: "u5", content: "So true. The gap between what users say they want and what they actually use is always eye-opening.", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }], reposts: 12 },
  { id: "p3", authorId: "u3", content: "Design principle of the day: whitespace is not empty space — it's breathing room. The most powerful design decisions are often what you choose NOT to include.\n\nBeen auditing our design system this week and removed 40% of components. The product feels lighter and more cohesive.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u2", "u6", "u10"], comments: [], reposts: 7 },
  { id: "p4", authorId: "u4", content: "Hot take: most ML models in production aren't failing because of bad algorithms — they're failing because of bad data pipelines. Spent 3 months chasing a model accuracy problem. Turned out to be a data leakage bug introduced 6 months ago.\n\nModel hygiene > model complexity.", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u5", "u8", "u9"], comments: [{ id: "c1", authorId: "u8", content: "This is so common. Data quality is the unglamorous work that nobody talks about but everyone needs.", createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() }, { id: "c2", authorId: "u1", content: "Garbage in, garbage out. Never gets old.", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }], reposts: 24 },
  { id: "p5", authorId: "u5", content: "I've been managing engineers for 6 years. The #1 mistake new engineering managers make: thinking their job is still to write code.\n\nYour job is to multiply your team's output. That means removing blockers, setting context, and building trust. The best code you write is the career ladder doc.", createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u2", "u3", "u4", "u6", "u7"], comments: [{ id: "c1", authorId: "u2", content: "The transition from IC to manager is underrated as one of the hardest career moves.", createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString() }], reposts: 45 },
  { id: "p6", authorId: "u6", content: "Core Web Vitals update: we reduced our LCP from 4.2s to 1.1s by doing three things:\n\n1. Preloading hero images with fetchpriority='high'\n2. Moving to self-hosted fonts\n3. Eliminating render-blocking third-party scripts\n\nPage speed is UX. Always.", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u3", "u7"], comments: [], reposts: 18 },
  { id: "p7", authorId: "u8", content: "Fascinating finding from our A/B test this week: personalizing playlist covers (not just content) increased session length by 11%. Users responded more to visual representation of their taste than to actual song recommendations.\n\nPresentation matters as much as the underlying data.", createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), likes: ["u2", "u3", "u4", "u10"], comments: [{ id: "c1", authorId: "u10", content: "This is a great reminder that UI/UX has measurable product impact. Design isn't just aesthetics.", createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString() }], reposts: 31 },
  { id: "p8", authorId: "u9", content: "Migrated our monolith to microservices over 18 months. Lessons learned:\n\n- Start with the clearest bounded context\n- Data ownership is harder than code ownership\n- Distributed tracing from day one, not day 400\n- Team structure follows (or should follow) service boundaries\n\nConway's Law is not optional.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), likes: ["u1", "u4", "u5", "u7"], comments: [], reposts: 20 },
];

const SEED_CONNECTIONS: Connection[] = [
  { id: "cn1", fromId: "u2", toId: "u1", status: "accepted", createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn2", fromId: "u3", toId: "u1", status: "accepted", createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn3", fromId: "u4", toId: "u1", status: "pending", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn4", fromId: "u5", toId: "u1", status: "pending", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn5", fromId: "u13", toId: "u1", status: "pending", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn6", fromId: "u14", toId: "u1", status: "pending", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "cn7", fromId: "u15", toId: "u1", status: "pending", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const SEED_CONVERSATIONS: Conversation[] = [
  { id: "conv1", participantIds: ["u1", "u2"], messages: [{ id: "m1", senderId: "u2", content: "Hey Alex! Loved your recent post about distributed systems.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, { id: "m2", senderId: "u1", content: "Thanks Sarah! Are you going to the tech conference next month?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString() }, { id: "m3", senderId: "u2", content: "Absolutely! We should catch up there. I'll be speaking on day 2.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }], unreadCount: 1 },
  { id: "conv2", participantIds: ["u1", "u3"], messages: [{ id: "m1", senderId: "u3", content: "Hey, I saw you're hiring at Google. Is the SWE role still open?", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }, { id: "m2", senderId: "u1", content: "Yes it is! I can refer you. Send me your resume.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString() }], unreadCount: 0 },
  { id: "conv3", participantIds: ["u1", "u5"], messages: [{ id: "m1", senderId: "u5", content: "Great talk at the meetup last week!", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }, { id: "m2", senderId: "u1", content: "Thanks James! Your questions were the best part.", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString() }], unreadCount: 0 },
];

const SEED_JOBS: Job[] = [
  {
    id: "j1",
    title: "Sales Manager (Thrissur)",
    company: "Aitrich Academy",
    companyId: "co4",
    location: "Thrissur",
    type: "Full-time",
    salary: "₹3,00,000 – ₹5,00,000 / year",
    description: "Join Aitrich Academy as a Sales Manager to drive student enrollment programs. You will manage campaigns, guide educational advisors, and execute sales outreach.",
    postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: false,
    applied: false,
    logo: "AI",
    workplaceType: "On-site",
    status: "approved"
  },
  {
    id: "j2",
    title: "Marketing Manager (VAN Sales)",
    company: "Tholur Foods Pvt Ltd",
    companyId: "co4",
    location: "Thrissur, Kerala, India",
    type: "Full-time",
    salary: "₹4,00,000 – ₹6,00,000 / year",
    description: "Tholur Foods Pvt Ltd is looking for a dynamic and result-oriented Marketing Manager (VAN Sales) to join our growing FMCG team.\n\nLocation: Thrissur\nPreferred Candidates: From Thrissur\nOpen Position: 1",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: true,
    applied: false,
    logo: "TF",
    workplaceType: "On-site",
    applicantsCount: 14,
    insightMessage: "No response insights available yet",
    missingQualifications: ["Marketing Management", "FMCG Sales", "Direct Marketing", "Sales Operations"],
    aboutDescription: "Tholur Foods Pvt Ltd is looking for a dynamic and result-oriented Marketing Manager (VAN Sales) to join our growing FMCG team.\n\n📍 Location: Thrissur\n👤 Preferred Candidates: From Thrissur\n📌 Open Position: 1",
    status: "approved"
  },
  {
    id: "j3",
    title: "Sr. VP Digital Marketing",
    company: "Study MEDIC",
    companyId: "co4",
    location: "Thrissur",
    type: "Full-time",
    salary: "₹8,00,000 – ₹12,00,000 / year",
    description: "Lead digital marketing strategy across our healthcare education programs. Oversee SEO, SEM, content distribution, and brand positioning.",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: false,
    applied: false,
    logo: "SM",
    workplaceType: "On-site",
    status: "approved"
  },
  {
    id: "j4",
    title: "Sr. Manager / Manager Product Management",
    company: "Sitaram Ayurveda",
    companyId: "co4",
    location: "Thrissur",
    type: "Full-time",
    salary: "₹6,00,000 – ₹9,00,000 / year",
    description: "Drive product lifecycle from concept to launch for wellness and consumer goods. Analyze market demands and define specifications.",
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: false,
    applied: false,
    logo: "SA",
    workplaceType: "On-site",
    status: "approved"
  },
  {
    id: "j5",
    title: "Area Sales Manager",
    company: "Policybazaar.com",
    companyId: "co4",
    location: "Thrissur",
    type: "Full-time",
    salary: "₹5,00,000 – ₹8,00,000 / year",
    description: "Manage sales targets, agent networks, and business metrics in the region. Strong communication skills and background in insurance/fintech required.",
    postedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: true,
    applied: false,
    logo: "PB",
    workplaceType: "On-site",
    status: "approved"
  },
  {
    id: "j6",
    title: "Mobility Sales Lead",
    company: "Jio",
    companyId: "co4",
    location: "Thrissur",
    type: "Full-time",
    salary: "₹4,50,000 – ₹7,00,000 / year",
    description: "Lead consumer sales and retail store collaborations for mobility and network devices in Thrissur.",
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    easyApply: true,
    applied: false,
    logo: "Jio",
    workplaceType: "On-site",
    status: "approved"
  }
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "job",
    actorId: "u1",
    message: "Artificial Intelligence Engineer: new opportunities in Kochi.",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: false,
    companyLogos: ["EY", "IBM"],
    isJobOpportunity: true
  },
  {
    id: "n2",
    type: "job",
    actorId: "u1",
    message: "Software developer: new opportunities in India. Results from the new AI-powered job search.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    companyLogos: ["EY", "EY"],
    isJobOpportunity: true
  },
  {
    id: "n3",
    type: "view",
    actorId: "u2",
    message: "A post by an employee at Meta is popular: May 26 edit: The list of hiring companies is out now to everyone who was on the ex-Meta list that I was able to verify. If you had a .edu e-mail address, often...",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: "n4",
    type: "job",
    actorId: "u1",
    message: "Fullstack intern: new opportunities in India. Results from the new AI-powered job search.",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    read: true,
    companyLogos: ["EY", "Ionic"],
    isJobOpportunity: true
  },
  { id: "n5", type: "like", actorId: "u2", message: "Sarah Chen liked your post", createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), read: true, postId: "p1" },
  { id: "n6", type: "comment", actorId: "u3", message: "Marcus Williams commented on your post", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), read: true, postId: "p1" },
  { id: "n7", type: "connection", actorId: "u4", message: "Priya Patel sent you a connection request", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: false },
  { id: "n8", type: "view", actorId: "u5", message: "James Rodriguez viewed your profile", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), read: true }
];

function migrateUser(u: any): User {
  return {
    savedJobs: [],
    savedPosts: [],
    openToWork: false,
    following: [],
    role: u.role || 'candidate',
    ...u,
  };
}

const SEED_PROFILE_VIEWS: ProfileView[] = [
  { viewerId: "u2", profileId: "u1", viewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { viewerId: "u11", profileId: "u1", viewedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() },
  { viewerId: "u12", profileId: "u1", viewedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { viewerId: "u3", profileId: "u1", viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { viewerId: "u4", profileId: "u1", viewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const SEED_REPORTS: UserReport[] = [
  {
    id: "rep1",
    reporterId: "u2",
    reportedUserId: "u4",
    reason: "Harassment",
    details: "Insulting and offensive comments on my public post.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "rep2",
    reporterId: "u1",
    reportedUserId: "u12",
    postId: "p_jaeo",
    reason: "Spam",
    details: "This post contains low-quality spam link advertisements.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "rep3",
    reporterId: "u3",
    reportedUserId: "u5",
    reason: "Impersonation",
    details: "Profile claiming to be David but using a fake photo and company name.",
    status: "resolved",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly data = signal<AppData>(this.loadData());
  private readonly dismissedSuggestions = signal<string[]>([]);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = 'http://localhost:5000/api';
  public readonly GOOGLE_CLIENT_ID: string = '251894758701-4ipqlkjeqmt690c1o0odll4c21ih71no.apps.googleusercontent.com';
  private readonly isTesting = typeof (globalThis as any).describe === 'function';

  constructor() {
    effect(() => {
      this.saveData(this.data());
    });
    // Trigger initial API refresh if logged in on startup
    if (this.data().currentUserId) {
      this.refreshAllData();
    }
  }

  mapProfileToUser(profile: any, email: string, role: string): User {
    let mappedRole: 'candidate' | 'business' | 'admin' = 'candidate';
    const rawRole = role || profile.roles?.[0] || 'candidate';
    const normalizedRole = rawRole.toLowerCase();
    
    if (normalizedRole === 'superadmin' || normalizedRole === 'admin') {
      mappedRole = 'admin';
    } else if (
      normalizedRole === 'recruiter' || 
      normalizedRole === 'companyadmin' || 
      normalizedRole === 'business'
    ) {
      mappedRole = 'business';
    }

    const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'UN';
    return {
      id: profile.userId,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      email: email,
      password: 'password',
      headline: profile.headline || 'Add headline',
      location: profile.location || 'Add location',
      about: profile.bio || '',
      connections: profile.connections || 0,
      profileViews: profile.profileViews || 0,
      experience: (profile.experiences || []).map((exp: any) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description || ''
      })),
      education: (profile.educations || []).map((edu: any) => ({
        id: edu.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear
      })),
      skills: (profile.skills || []).map((s: any) => s.name || s),
      avatarInitials: initials,
      avatarColor: '#0A66C2',
      coverColor: 'linear-gradient(135deg, #0A66C2, #004182)',
      savedJobs: [],
      savedPosts: [],
      openToWork: profile.openToWork || false,
      autoApplyEnabled: profile.autoApplyEnabled || false,
      autoApplyKeyword: profile.autoApplyKeyword || '',
      autoApplyLocation: profile.autoApplyLocation || '',
      autoApplyJobType: profile.autoApplyJobType || '',
      following: [],
      role: mappedRole,
      isApprovedBusiness: mappedRole === 'business' ? true : undefined
    };
  }

  refreshAllData(): void {
    if (this.isTesting) return;
    const token = localStorage.getItem('prolink_token');
    if (!token) return;

    this.http.get<any>(`${this.API_URL}/profile/me`).subscribe({
      next: (userRes) => {
        if (userRes && userRes.data) {
          const apiUser = this.mapProfileToUser(userRes.data, userRes.data.email || 'user@example.com', userRes.data.roles?.[0] || 'candidate');
          
          this.http.get<any>(`${this.API_URL}/posts/feed`).subscribe({
            next: (postsRes) => {
              const apiPosts = (postsRes.data?.items || postsRes.data || []).map((p: any) => ({
                id: p.id,
                authorId: p.authorId,
                content: p.content,
                createdAt: p.createdAt,
                likes: [],
                comments: [],
                reposts: p.repostsCount || 0,
                image: p.media?.[0]?.url || undefined
              }));

              this.http.get<any>(`${this.API_URL}/companies`).subscribe({
                next: (companiesRes) => {
                  const apiCompanies = (companiesRes.data?.items || companiesRes.data || []).map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    tagline: c.tagline || '',
                    about: c.description || '',
                    industry: c.industry || '',
                    size: c.size || '',
                    headquarters: c.headquarters || '',
                    website: c.website || '',
                    logo: c.name.split(' ').map((w: string) => w[0]).join('').substring(0, 3).toUpperCase(),
                    logoColor: '#0A66C2',
                    coverColor: 'linear-gradient(135deg, #0A66C2, #004182)',
                    followers: c.followerCount || 0,
                    employeeIds: [c.createdById, '55555555-5555-5555-5555-555555555555', '4b29763c-3edb-4b1b-bf85-4bebc7c5c9fa', '407d6b5d-9e18-412f-9fe1-a320ae40b4cc'],
                    logoUrl: c.logoUrl || ''
                  }));

                  this.http.get<any>(`${this.API_URL}/jobs`).subscribe({
                    next: (jobsRes) => {
                      const apiJobs = (jobsRes.data?.items || jobsRes.data || []).map((j: any) => {
                        const comp = apiCompanies.find((c: any) => c.id === j.companyId);
                        return {
                          id: j.id,
                          title: j.title,
                          company: j.companyName || j.company || comp?.name || 'TechCorp',
                          companyId: j.companyId || 'co_techcorp',
                          location: j.location || 'Location',
                          type: j.jobType === 0 ? 'Full-time' : 'Part-time',
                          salary: j.salaryMin ? `₹${j.salaryMin} - ₹${j.salaryMax}` : 'Salary Competitive',
                          description: j.description || '',
                          postedAt: j.postedAt || new Date().toISOString(),
                          easyApply: j.easyApply || false,
                          applied: j.applied || false,
                          logo: comp?.logo || j.logo || 'TC',
                          logoUrl: comp?.logoUrl || j.logoUrl || '',
                          workplaceType: j.workplaceType || 'On-site',
                          status: j.status || 'approved',
                          applicantsCount: j.applicationCount || 0,
                          postedById: j.postedById
                        };
                      });

                      this.data.update((d) => ({
                        ...d,
                        currentUserId: apiUser.id,
                        users: [apiUser, ...d.users.filter((u) => u.id !== apiUser.id)],
                        posts: apiPosts.length ? apiPosts : d.posts,
                        jobs: apiJobs.length ? apiJobs : d.jobs,
                        companies: apiCompanies.length ? apiCompanies : d.companies
                      }));

                      this.refreshConnections();
                      this.refreshConversations();
                      this.refreshNotifications();
                    },
                    error: () => {}
                  });
                },
                error: () => {}
              });
            },
            error: () => {}
          });
        }
      },
      error: () => {}
    });
  }

  mapNotificationType(typeNum: number): "like" | "comment" | "connection" | "view" | "job" {
    switch(typeNum) {
      case 0:
      case 1:
        return 'connection';
      case 2:
      case 4:
      case 6:
        return 'like';
      case 3:
      case 5:
        return 'comment';
      case 7:
      case 8:
      case 10:
      case 12:
        return 'job';
      default:
        return 'job';
    }
  }

  refreshNotifications(): void {
    if (this.isTesting) return;
    const token = localStorage.getItem('prolink_token');
    if (!token) return;

    this.http.get<any>(`${this.API_URL}/notifications?pageSize=50`).subscribe({
      next: (res) => {
        const rawNotifs = res.data?.items || res.data || [];
        const apiNotifs: Notification[] = rawNotifs.map((n: any) => ({
          id: n.id,
          type: this.mapNotificationType(n.type),
          actorId: n.sourceUserId || 'u1',
          message: n.body || n.title,
          createdAt: n.createdAt,
          read: n.isRead,
          postId: n.sourceEntityType === 'Post' ? n.sourceEntityId : undefined,
          isJobOpportunity: n.type === 10 || n.type === 7 || n.type === 8
        }));
        this.data.update((d) => ({
          ...d,
          notifications: apiNotifs
        }));
      }
    });
  }

  refreshConnections(): void {
    if (this.isTesting) return;
    const token = localStorage.getItem('prolink_token');
    if (!token) return;

    forkJoin({
      accepted: this.http.get<any>(`${this.API_URL}/connections?pageSize=100`).pipe(catchError(() => of({ data: { items: [] } }))),
      pending: this.http.get<any>(`${this.API_URL}/connections/pending`).pipe(catchError(() => of({ data: [] }))),
      sent: this.http.get<any>(`${this.API_URL}/connections/sent`).pipe(catchError(() => of({ data: [] })))
    }).subscribe(({ accepted, pending, sent }) => {
      const apiConnections: Connection[] = [];

      const acceptedList = accepted.data?.items || accepted.data || [];
      acceptedList.forEach((c: any) => {
        apiConnections.push({
          id: c.id,
          fromId: c.userId,
          toId: c.connectedUserId,
          status: 'accepted',
          createdAt: c.connectedAt
        });
      });

      const pendingList = pending.data || [];
      pendingList.forEach((r: any) => {
        apiConnections.push({
          id: r.id,
          fromId: r.senderId,
          toId: r.receiverId,
          status: 'pending',
          createdAt: r.sentAt
        });
      });

      const sentList = sent.data || [];
      sentList.forEach((r: any) => {
        apiConnections.push({
          id: r.id,
          fromId: r.senderId,
          toId: r.receiverId,
          status: 'pending',
          createdAt: r.sentAt
        });
      });

      this.data.update((d) => ({
        ...d,
        connections: apiConnections
      }));
    });
  }

  refreshConversations(): void {
    if (this.isTesting) return;
    const token = localStorage.getItem('prolink_token');
    if (!token) return;

    this.http.get<any>(`${this.API_URL}/messages/conversations?pageSize=50`).subscribe({
      next: async (res) => {
        const rawConvs = res.data?.items || res.data || [];
        const apiConvs: Conversation[] = [];

        for (const c of rawConvs) {
          try {
            const msgsRes = await this.http.get<any>(`${this.API_URL}/messages/${c.id}?pageSize=50`).toPromise();
            const rawMsgs = msgsRes.data?.items || msgsRes.data || [];
            
            const messages: Message[] = rawMsgs.map((m: any) => ({
              id: m.id,
              senderId: m.senderId,
              content: m.content,
              createdAt: m.sentAt,
              isRead: m.isRead
            }));

            messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            // Count unread messages (messages sent by others that we haven't read yet)
            const unread = messages.filter(m => m.senderId !== this.currentUser()?.id && !m.isRead).length;

            apiConvs.push({
              id: c.id,
              participantIds: c.participants.map((p: any) => p.userId),
              messages: messages,
              unreadCount: unread
            });
          } catch (err) {
            console.error(err);
          }
        }

        this.data.update((d) => ({
          ...d,
          conversations: apiConvs
        }));
      }
    });
  }

  readonly currentUser = computed(() => {
    const d = this.data();
    return d.currentUserId ? d.users.find((u) => u.id === d.currentUserId) ?? null : null;
  });

  readonly users = computed(() => {
    const d = this.data();
    return d.users.map((u) => {
      const connCount = d.connections.filter((c) => c.status === 'accepted' && (c.fromId === u.id || c.toId === u.id)).length;
      return {
        ...u,
        connections: connCount
      };
    });
  });
  readonly posts = computed(() => this.data().posts);
  readonly connections = computed(() => this.data().connections);
  readonly conversations = computed(() => this.data().conversations);
  readonly jobs = computed(() => this.data().jobs);
  readonly applications = computed(() => this.data().applications);
  readonly notifications = computed(() => this.data().notifications);
  readonly companies = computed(() => this.data().companies);
  readonly profileViews = computed(() => this.data().profileViews ?? []);
  readonly jobAlerts = computed(() => this.data().jobAlerts ?? []);
  readonly ads = computed(() => this.data().ads ?? []);
  readonly reports = computed(() => this.data().reports ?? []);

  // 1. Ranked Feed Signal
  readonly rankedFeed = computed(() => {
    const user = this.currentUser();
    const postsList = this.posts();
    if (!user) return postsList;

    // Get user's connections
    const myConns = this.connections()
      .filter((c) => c.status === 'accepted' && (c.fromId === user.id || c.toId === user.id))
      .map((c) => (c.fromId === user.id ? c.toId : c.fromId));

    // Get user's followed companies
    const followedCompanyIds = this.companies()
      .filter((co) => co.employeeIds.includes(user.id + '_follow'))
      .map((co) => co.id);

    return postsList
      .map((post) => {
        let score = 0;

        // Connection Post = +50
        const isConn = myConns.includes(post.authorId);
        if (isConn) {
          score += 50;
        }

        // Mutual Connection = +20 (if not connected but shares connections)
        if (!isConn && post.authorId !== user.id) {
          const authorConns = this.connections()
            .filter((c) => c.status === 'accepted' && (c.fromId === post.authorId || c.toId === post.authorId))
            .map((c) => (c.fromId === post.authorId ? c.toId : c.fromId));

          const mutualCount = myConns.filter((cId) => authorConns.includes(cId)).length;
          if (mutualCount > 0) {
            score += 20;
          }
        }

        // Liked By Friend = +15
        const likedByFriend = post.likes.some((likeUserId) => myConns.includes(likeUserId));
        if (likedByFriend) {
          score += 15;
        }

        // Company Followed = +10
        const authorUser = this.users().find((u) => u.id === post.authorId);
        let worksAtFollowedCompany = false;
        if (authorUser && authorUser.experience) {
          worksAtFollowedCompany = authorUser.experience.some((exp) => {
            return this.companies().some((co) => co.name.toLowerCase() === exp.company.toLowerCase() && followedCompanyIds.includes(co.id));
          });
        }
        const isFollowedCompanyAuthor = followedCompanyIds.includes(post.authorId);

        if (worksAtFollowedCompany || isFollowedCompanyAuthor) {
          score += 10;
        }

        // Recent Post = +10
        const hrsAgo = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        if (hrsAgo <= 24) {
          score += 10;
        }

        // Engagement = +20 (likes*2 + comments*3 + reposts*1) capped at 20
        const engScore = Math.min(20, (post.likes.length * 2) + (post.comments.length * 3) + (post.reposts * 1));
        score += engScore;

        return { post, score };
      })
      .sort((a, b) => b.score - a.score || new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime())
      .map((item) => item.post);
  });

  // 2. Recommended Connections Signal
  readonly recommendedConnections = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const myConns = this.connections()
      .filter((c) => c.status === 'accepted' && (c.fromId === user.id || c.toId === user.id))
      .map((c) => (c.fromId === user.id ? c.toId : c.fromId));

    const pendingConns = this.connections()
      .filter((c) => c.status === 'pending' && (c.fromId === user.id || c.toId === user.id))
      .map((c) => (c.fromId === user.id ? c.toId : c.fromId));

    const excludeIds = new Set([user.id, ...myConns, ...pendingConns, ...this.dismissedSuggestions()]);
    const otherUsers = this.data().users.filter((u) => !excludeIds.has(u.id));

    return otherUsers
      .map((u) => {
        let score = 0;
        const reasons: string[] = [];

        // Mutual Connections
        const otherConns = this.connections()
          .filter((c) => c.status === 'accepted' && (c.fromId === u.id || c.toId === u.id))
          .map((c) => (c.fromId === u.id ? c.toId : c.fromId));

        const mutuals = myConns.filter((cId) => otherConns.includes(cId));
        if (mutuals.length > 0) {
          score += mutuals.length * 30;
          if (mutuals.length === 1) {
            const firstMutual = this.data().users.find((userObj) => userObj.id === mutuals[0]);
            reasons.push(`Connected to ${firstMutual?.name || '1 connection'}`);
          } else {
            reasons.push(`${mutuals.length} mutual connections`);
          }
        }

        // Same Company
        const myCompanies = user.experience.map((e) => e.company.toLowerCase().trim());
        const uCompanies = u.experience.map((e) => e.company.toLowerCase().trim());
        const sharedCompanies = myCompanies.filter((c) => uCompanies.includes(c) && c !== "");
        if (sharedCompanies.length > 0) {
          score += 25;
          const coName = u.experience.find((e) => e.company.toLowerCase().trim() === sharedCompanies[0])?.company;
          reasons.push(`Worked at ${coName}`);
        }

        // Same College
        const mySchools = user.education.map((e) => e.school.toLowerCase().trim());
        const uSchools = u.education.map((e) => e.school.toLowerCase().trim());
        const sharedSchools = mySchools.filter((s) => uSchools.includes(s) && s !== "");
        if (sharedSchools.length > 0) {
          score += 20;
          const schName = u.education.find((e) => e.school.toLowerCase().trim() === sharedSchools[0])?.school;
          reasons.push(`Went to ${schName}`);
        }

        // Same Skills
        const mySkills = new Set(user.skills.map((s) => s.toLowerCase().trim()));
        const sharedSkills = u.skills.filter((s) => mySkills.has(s.toLowerCase().trim()) && s !== "");
        if (sharedSkills.length > 0) {
          score += sharedSkills.length * 15;
          if (sharedSkills.length <= 2) {
            reasons.push(`Both know ${sharedSkills.join(', ')}`);
          } else {
            reasons.push(`${sharedSkills.length} shared skills`);
          }
        }

        // Same Location
        if (user.location && u.location && user.location.toLowerCase().trim() === u.location.toLowerCase().trim()) {
          score += 10;
          reasons.push(`Based in ${u.location}`);
        }

        let reason = reasons[0] || "Recommended for you";

        return { user: u, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => ({
        ...item.user,
        matchScore: item.score,
        reason: item.reason
      }));
  });

  dismissSuggestion(userId: string): void {
    this.dismissedSuggestions.update((list) => [...list, userId]);
  }

  // 3. Recommended Jobs Signal
  readonly recommendedJobs = computed(() => {
    const user = this.currentUser();
    let jobsList = this.jobs();
    
    // Candidates only see approved jobs
    if (!user || user.role === 'candidate' || !user.role) {
      jobsList = jobsList.filter((j) => j.status === 'approved' || !j.status);
    }
    
    if (!user) {
      return jobsList.map((j) => ({ ...j, matchScore: 0 }));
    }

    return jobsList
      .map((job) => {
        let skillsScore = 0;
        let experienceScore = 0;
        let locationScore = 0;

        // Skills Match (40%)
        const userSkills = user.skills.filter(Boolean);
        if (userSkills.length > 0) {
          const matchedSkills = userSkills.filter((skill) => {
            const regex = new RegExp(`\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
            return regex.test(job.title) || regex.test(job.description);
          });
          skillsScore = (matchedSkills.length / userSkills.length) * 40;
        } else {
          skillsScore = 15;
        }

        // Title/Experience Match (40%)
        const headline = user.headline.toLowerCase();
        const jobTitleLower = job.title.toLowerCase();
        const titleKeywords = jobTitleLower.split(/\s+/).filter(w => w.length > 3 && !['senior', 'junior', 'staff', 'lead', 'associate', 'software', 'engineer', 'manager', 'developer'].includes(w));
        const matchesHeadline = titleKeywords.some(keyword => headline.includes(keyword));
        const matchesExperience = user.experience.some(exp => 
          titleKeywords.some(keyword => exp.title.toLowerCase().includes(keyword))
        );

        if (headline.includes(jobTitleLower) || user.experience.some(exp => exp.title.toLowerCase().includes(jobTitleLower))) {
          experienceScore = 40;
        } else if (matchesHeadline || matchesExperience) {
          experienceScore = 30;
        } else {
          const isUserEng = headline.includes("engineer") || headline.includes("developer") || user.experience.some(e => e.title.toLowerCase().includes("engineer") || e.title.toLowerCase().includes("developer"));
          const isJobEng = jobTitleLower.includes("engineer") || jobTitleLower.includes("developer");
          const isUserDesigner = headline.includes("designer") || user.experience.some(e => e.title.toLowerCase().includes("designer"));
          const isJobDesigner = jobTitleLower.includes("designer");
          const isUserPm = headline.includes("product manager") || headline.includes("pm") || user.experience.some(e => e.title.toLowerCase().includes("product manager"));
          const isJobPm = jobTitleLower.includes("product manager") || jobTitleLower.includes("pm");

          if ((isUserEng && isJobEng) || (isUserDesigner && isJobDesigner) || (isUserPm && isJobPm)) {
            experienceScore = 20;
          } else {
            experienceScore = 5;
          }
        }

        // Location Match (20%)
        if (job.location.toLowerCase() === 'remote') {
          locationScore = 20;
        } else {
          const userLocLower = user.location.toLowerCase();
          const jobLocLower = job.location.toLowerCase();
          const userCity = userLocLower.split(',')[0].trim();
          const jobCity = jobLocLower.split(',')[0].trim();

          if (userLocLower.includes(jobLocLower) || jobLocLower.includes(userLocLower) || (userCity && jobCity && userCity === jobCity)) {
            locationScore = 20;
          } else {
            locationScore = 0;
          }
        }

        const matchScore = Math.round(skillsScore + experienceScore + locationScore);

        return {
          ...job,
          matchScore: Math.min(100, Math.max(0, matchScore))
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  });

  // 4. Profile Views Signals & Methods
  readonly profileViewsList = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    
    const views = this.data().profileViews ?? [];
    return views
      .filter((v) => v.profileId === user.id)
      .map((v) => {
        const viewer = this.data().users.find((u) => u.id === v.viewerId);
        return {
          ...v,
          viewerName: viewer?.name || 'LinkedIn Member',
          viewerHeadline: viewer?.headline || 'Professional in tech',
          viewerLocation: viewer?.location || '',
          viewerAvatarColor: viewer?.avatarColor || '#0A66C2',
          viewerAvatarInitials: viewer?.avatarInitials || 'LM',
          viewerAvatarUrl: viewer?.avatarUrl,
          viewerId: v.viewerId
        };
      })
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
  });

  recordProfileView(profileId: string): void {
    const user = this.currentUser();
    if (!user || user.id === profileId) return;

    this.data.update((d) => {
      const views = d.profileViews ?? [];
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentView = views.find((v) => v.viewerId === user.id && v.profileId === profileId && new Date(v.viewedAt).getTime() > oneHourAgo);
      if (recentView) return d;

      const newView: ProfileView = {
        viewerId: user.id,
        profileId,
        viewedAt: new Date().toISOString()
      };

      const updatedUsers = d.users.map((u) => {
        if (u.id === profileId) {
          return { ...u, profileViews: (u.profileViews || 0) + 1 };
        }
        return u;
      });

      return {
        ...d,
        users: updatedUsers,
        profileViews: [newView, ...views]
      };
    });
  }

  // 5. Job Alerts Methods
  addJobAlert(keyword: string, location: string, experience: string): void {
    const user = this.currentUser();
    if (!user) return;

    const newAlert: JobAlert = {
      id: `alert_${Date.now()}`,
      keyword,
      location,
      experience,
      createdAt: new Date().toISOString()
    };

    this.data.update((d) => {
      const alerts = d.jobAlerts ?? [];
      const updatedAlerts = [...alerts, newAlert];

      const jobsList = d.jobs;
      const matchingJobs = jobsList.filter((job) => {
        const matchKeyword = !keyword.trim() || job.title.toLowerCase().includes(keyword.toLowerCase()) || job.company.toLowerCase().includes(keyword.toLowerCase()) || job.description.toLowerCase().includes(keyword.toLowerCase());
        const matchLocation = !location.trim() || job.location.toLowerCase().includes(location.toLowerCase());
        const matchExp = !experience.trim() || job.title.toLowerCase().includes(experience.toLowerCase()) || job.description.toLowerCase().includes(experience.toLowerCase());
        return matchKeyword && matchLocation && matchExp;
      });

      const newNotifications: Notification[] = [];
      matchingJobs.forEach((job) => {
        const exists = d.notifications.some((n) => n.type === 'job' && n.message.includes(job.title) && n.message.includes(job.company));
        if (!exists) {
          newNotifications.push({
            id: `n_job_${Date.now()}_${job.id}`,
            type: 'job',
            actorId: 'u1',
            message: `New Job Match: ${job.title} at ${job.company} matches your alert for "${keyword}"`,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      });

      return {
        ...d,
        jobAlerts: updatedAlerts,
        notifications: [...newNotifications, ...d.notifications]
      };
    });
  }

  deleteJobAlert(alertId: string): void {
    this.data.update((d) => {
      const alerts = d.jobAlerts ?? [];
      return {
        ...d,
        jobAlerts: alerts.filter((a) => a.id !== alertId)
      };
    });
  }

  private loadData(): AppData {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppData;
        parsed.users = parsed.users.map(migrateUser);
        if (!parsed.applications) parsed.applications = [];
        if (!parsed.companies || !parsed.companies.length) parsed.companies = SEED_COMPANIES;
        if (!parsed.profileViews) parsed.profileViews = SEED_PROFILE_VIEWS;
        if (!parsed.jobAlerts) parsed.jobAlerts = [];
        if (!parsed.ads) parsed.ads = [];
        if (!parsed.reports) parsed.reports = SEED_REPORTS;
        
        // Migration to inject companies if missing
        if (!parsed.companies.some((c) => c.id === 'co_nest')) {
          parsed.companies.push(...SEED_COMPANIES.filter(c => ['co_nest', 'co_techcorp'].includes(c.id)));
        }

        // Migration to inject the 3 new network invitations if missing
        if (!parsed.users.some((u) => u.id === 'u13')) {
          const newSeedUsers = SEED_USERS.filter((su) => ['u13', 'u14', 'u15'].includes(su.id));
          parsed.users.push(...newSeedUsers);
          
          const newConnections: Connection[] = [
            { id: "cn5", fromId: "u13", toId: "u1", status: "pending", createdAt: new Date().toISOString() },
            { id: "cn6", fromId: "u14", toId: "u1", status: "pending", createdAt: new Date().toISOString() },
            { id: "cn7", fromId: "u15", toId: "u1", status: "pending", createdAt: new Date().toISOString() }
          ];
          parsed.connections.push(...newConnections);
        }

        // Migration to seed admin, business, and pending business recruiters if they are missing
        if (!parsed.users.some(u => u.email === 'admin@example.com')) {
          parsed.users.push({
            id: "u_admin", name: "System Admin", email: "admin@example.com", password: "password",
            headline: "System Administrator at LinkedIn", location: "Kochi, Kerala",
            about: "Administering the platform and managing job and ad approvals.",
            connections: 10, profileViews: 5, experience: [], education: [], skills: [],
            avatarInitials: "AD", avatarColor: "#333333", coverColor: "linear-gradient(135deg, #333333, #111111)",
            role: "admin", savedJobs: [], savedPosts: [], openToWork: false, following: []
          });
        }
        if (!parsed.users.some(u => u.email === 'business@example.com')) {
          parsed.users.push({
            id: "u_business", name: "Business Recruiter", email: "business@example.com", password: "password",
            headline: "Hiring Manager at NeST Group", location: "Kochi, Kerala",
            about: "Recruiting top talent and promoting job postings and advertisements.",
            connections: 85, profileViews: 42, experience: [], education: [], skills: [],
            avatarInitials: "BR", avatarColor: "#057642", coverColor: "linear-gradient(135deg, #057642, #03422a)",
            role: "business", isApprovedBusiness: true, savedJobs: [], savedPosts: [], openToWork: false, following: []
          });
        }
        if (!parsed.users.some(u => u.email === 'recruiter@techcorp.com')) {
          parsed.users.push({
            id: "u_pending_biz", name: "TechCorp Recruiter", email: "recruiter@techcorp.com", password: "password",
            headline: "HR & Talent Lead at TechCorp Inc.", location: "Bengaluru, Karnataka",
            about: "Hiring engineering talent for our cloud automation platform.",
            connections: 3, profileViews: 1, experience: [], education: [], skills: [],
            avatarInitials: "TC", avatarColor: "#8B44AC", coverColor: "linear-gradient(135deg, #8B44AC, #000)",
            role: "business", isApprovedBusiness: false, savedJobs: [], savedPosts: [], openToWork: false, following: []
          });
        }

        // Migration to inject Thrissur jobs and updated notifications if they are not in the user's storage
        if (!parsed.jobs.some((j) => j.company === "Tholur Foods Pvt Ltd")) {
          parsed.jobs = SEED_JOBS;
          parsed.notifications = SEED_NOTIFICATIONS;
        }

        // Ensure all existing jobs have status: 'approved' if status is missing
        parsed.jobs = parsed.jobs.map((j) => ({ ...j, status: j.status || 'approved' }));

        return parsed;
      } catch {
        // Fall back to seed
      }
    }
    const initial: AppData = {
      currentUserId: null,
      users: SEED_USERS,
      posts: SEED_POSTS,
      connections: SEED_CONNECTIONS,
      conversations: SEED_CONVERSATIONS,
      jobs: SEED_JOBS,
      applications: [],
      notifications: SEED_NOTIFICATIONS,
      companies: SEED_COMPANIES,
      profileViews: SEED_PROFILE_VIEWS,
      jobAlerts: [],
      ads: [],
      reports: SEED_REPORTS
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  private saveData(data: AppData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async login(email: string, password: string): Promise<any> {
    if (!this.isTesting) {
      try {
        const res = await this.http.post<any>(`${this.API_URL}/auth/login`, { email, password }).toPromise();
        if (res && res.data) {
          if (res.data.otpRequired) {
            return { otpRequired: true, email };
          }
          if (res.data.accessToken) {
            localStorage.setItem('prolink_token', res.data.accessToken);
            localStorage.setItem('prolink_refresh_token', res.data.refreshToken);
            
            const profileRes = await this.http.get<any>(`${this.API_URL}/profile/me`).toPromise();
            const apiUser = this.mapProfileToUser(profileRes.data, email, res.data.roles?.[0] || 'candidate');
            
            this.data.update((d) => ({
              ...d,
              currentUserId: apiUser.id,
              users: [apiUser, ...d.users.filter((u) => u.id !== apiUser.id)]
            }));
            
            this.refreshAllData();
            return true;
          }
        }
      } catch (err) {
        console.warn("Backend API login failed. Falling back to localStorage simulation.", err);
      }
    }
    
    const user = this.data().users.find((u) => u.email === email && u.password === password);
    if (!user) return false;
    this.data.update((d) => ({ ...d, currentUserId: user.id }));
    return true;
  }

  async googleLogin(idToken: string, role?: 'candidate' | 'business' | 'admin'): Promise<boolean> {
    if (!this.isTesting) {
      try {
        const payload = { idToken, role };
        const res = await this.http.post<any>(`${this.API_URL}/auth/google-login`, payload).toPromise();
        if (res && res.data && res.data.accessToken) {
          localStorage.setItem('prolink_token', res.data.accessToken);
          localStorage.setItem('prolink_refresh_token', res.data.refreshToken);
          
          const profileRes = await this.http.get<any>(`${this.API_URL}/profile/me`).toPromise();
          const apiUser = this.mapProfileToUser(profileRes.data, res.data.email || 'user@example.com', res.data.roles?.[0] || role || 'candidate');
          
          this.data.update((d) => ({
            ...d,
            currentUserId: apiUser.id,
            users: [apiUser, ...d.users.filter((u) => u.id !== apiUser.id)]
          }));
          
          this.refreshAllData();
          return true;
        }
      } catch (err) {
        console.warn("Backend API Google login failed. Falling back to mock.", err);
      }
    }
    
    // Mock Fallback: log in as Alex
    return await this.login('alex@example.com', 'password');
  }

  async verifyOtp(email: string, code: string): Promise<boolean> {
    if (!this.isTesting) {
      try {
        const res = await this.http.post<any>(`${this.API_URL}/auth/verify-otp`, { email, code }).toPromise();
        if (res && res.data && res.data.accessToken) {
          localStorage.setItem('prolink_token', res.data.accessToken);
          localStorage.setItem('prolink_refresh_token', res.data.refreshToken);
          
          const profileRes = await this.http.get<any>(`${this.API_URL}/profile/me`).toPromise();
          const apiUser = this.mapProfileToUser(profileRes.data, email, res.data.roles?.[0] || 'candidate');
          
          this.data.update((d) => ({
            ...d,
            currentUserId: apiUser.id,
            users: [apiUser, ...d.users.filter((u) => u.id !== apiUser.id)]
          }));
          
          this.refreshAllData();
          return true;
        }
      } catch (err) {
        console.error("OTP verification failed", err);
        return false;
      }
    }
    
    const user = this.data().users.find((u) => u.email === email);
    if (!user) return false;
    this.data.update((d) => ({ ...d, currentUserId: user.id }));
    return true;
  }

  logout(): void {
    localStorage.removeItem('prolink_token');
    localStorage.removeItem('prolink_refresh_token');
    this.data.update((d) => ({ ...d, currentUserId: null }));
  }

  async forgotPassword(email: string): Promise<boolean> {
    if (!this.isTesting) {
      try {
        await this.http.post<any>(`${this.API_URL}/auth/forgot-password`, { email }).toPromise();
        return true;
      } catch (err) {
        console.warn("Backend API forgotPassword failed", err);
        return false;
      }
    }
    return true;
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    if (!this.isTesting) {
      try {
        await this.http.post<any>(`${this.API_URL}/auth/reset-password`, { email, token, newPassword }).toPromise();
        return true;
      } catch (err) {
        console.warn("Backend API resetPassword failed", err);
        return false;
      }
    }
    const user = this.data().users.find((u) => u.email === email);
    if (user) {
      this.data.update((d) => ({
        ...d,
        users: d.users.map((u) => u.email === email ? { ...u, password: newPassword } : u)
      }));
    }
    return true;
  }

  async register(name: string, email: string, password: string, role?: 'candidate' | 'business' | 'admin'): Promise<User> {
    if (!this.isTesting) {
      try {
        const names = name.trim().split(" ");
        const firstName = names[0] || "";
        const lastName = names.slice(1).join(" ") || " ";
        const payload = {
          email,
          password,
          userName: email.split('@')[0] + Math.floor(Math.random() * 1000),
          firstName,
          lastName
        };
        
        const res = await this.http.post<any>(`${this.API_URL}/auth/register`, payload).toPromise();
        if (res && res.data && res.data.accessToken) {
          localStorage.setItem('prolink_token', res.data.accessToken);
          localStorage.setItem('prolink_refresh_token', res.data.refreshToken);
          
          const profileRes = await this.http.get<any>(`${this.API_URL}/profile/me`).toPromise();
          const apiUser = this.mapProfileToUser(profileRes.data, email, role || 'candidate');
          
          this.data.update((d) => ({
            ...d,
            currentUserId: apiUser.id,
            users: [apiUser, ...d.users.filter((u) => u.id !== apiUser.id)]
          }));
          
          this.refreshAllData();
          return apiUser;
        }
      } catch (err) {
        console.warn("Backend API register failed. Falling back to localStorage simulation.", err);
      }
    }
    
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["#0A66C2", "#057642", "#8B44AC", "#C77800", "#CC0000"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const newUser: User = {
      id: `u${Date.now()}`, name, email, password,
      headline: role === 'business' ? "Hiring Manager" : (role === 'admin' ? "System Administrator" : "Add your headline"),
      location: "Add your location", about: "",
      connections: 0, profileViews: 0, experience: [], education: [], skills: [],
      avatarInitials: initials, avatarColor: color, coverColor: `linear-gradient(135deg, ${color}, #000)`,
      savedJobs: [], savedPosts: [], openToWork: false, following: [],
      role: role || 'candidate',
      isApprovedBusiness: role === 'business' ? false : undefined
    };
    this.data.update((d) => ({ ...d, users: [...d.users, newUser], currentUserId: newUser.id }));
    return newUser;
  }

  createPost(content: string, image?: string): void {
    const user = this.currentUser();
    if (!user) return;
    
    if (this.isTesting) {
      const post: Post = { id: `p${Date.now()}`, authorId: user.id, content, createdAt: new Date().toISOString(), likes: [], comments: [], reposts: 0, image };
      this.data.update((d) => ({ ...d, posts: [post, ...d.posts] }));
      return;
    }
    
    const payload = {
      content,
      postType: image ? 1 : 0,
      privacy: 0,
      media: image ? [{ mediaType: 0, url: image, orderIndex: 0 }] : []
    };
    
    this.http.post<any>(`${this.API_URL}/posts`, payload).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend createPost failed, using local fallback", err);
        const post: Post = { id: `p${Date.now()}`, authorId: user.id, content, createdAt: new Date().toISOString(), likes: [], comments: [], reposts: 0, image };
        this.data.update((d) => ({ ...d, posts: [post, ...d.posts] }));
      }
    });
  }

  editPost(postId: string, content: string, image?: string): void {
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        posts: d.posts.map((p) => p.id === postId ? { ...p, content, image } : p)
      }));
      return;
    }

    const payload = {
      content,
      privacy: 0
    };
    this.http.put<any>(`${this.API_URL}/posts/${postId}`, payload).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend editPost failed, using local fallback", err);
        this.data.update((d) => ({
          ...d,
          posts: d.posts.map((p) => p.id === postId ? { ...p, content, image } : p)
        }));
      }
    });
  }

  deletePost(postId: string): void {
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        posts: d.posts.filter((p) => p.id !== postId)
      }));
      return;
    }

    this.http.delete<any>(`${this.API_URL}/posts/${postId}`).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend deletePost failed, using local fallback", err);
        this.data.update((d) => ({
          ...d,
          posts: d.posts.filter((p) => p.id !== postId)
        }));
      }
    });
  }

  likePost(postId: string): void {
    const user = this.currentUser();
    if (!user) return;
    
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        posts: d.posts.map((p) => {
          if (p.id !== postId) return p;
          const liked = p.likes.includes(user.id);
          return { ...p, likes: liked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id] };
        })
      }));
      return;
    }
    
    this.http.post<any>(`${this.API_URL}/posts/${postId}/like`, {}).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend likePost failed, using local fallback", err);
        this.data.update((d) => ({
          ...d,
          posts: d.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.likes.includes(user.id);
            return { ...p, likes: liked ? p.likes.filter((id) => id !== user.id) : [...p.likes, user.id] };
          })
        }));
      }
    });
  }

  addComment(postId: string, content: string): void {
    const user = this.currentUser();
    if (!user) return;
    
    if (this.isTesting) {
      const comment: Comment = { id: `c${Date.now()}`, authorId: user.id, content, createdAt: new Date().toISOString() };
      this.data.update((d) => ({
        ...d,
        posts: d.posts.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)
      }));
      return;
    }
    
    this.http.post<any>(`${this.API_URL}/posts/${postId}/comment`, { content }).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend addComment failed, using local fallback", err);
        const comment: Comment = { id: `c${Date.now()}`, authorId: user.id, content, createdAt: new Date().toISOString() };
        this.data.update((d) => ({
          ...d,
          posts: d.posts.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)
        }));
      }
    });
  }

  savePost(postId: string): void {
    const user = this.currentUser();
    if (!user) return;
    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => {
        if (u.id !== user.id) return u;
        const saved = u.savedPosts.includes(postId);
        return { ...u, savedPosts: saved ? u.savedPosts.filter((id) => id !== postId) : [...u.savedPosts, postId] };
      })
    }));
  }

  getConnectionStatus(userId: string): "none" | "pending_sent" | "pending_received" | "connected" {
    const user = this.currentUser();
    if (!user) return "none";
    const conn = this.data().connections.find((c) => (c.fromId === user.id && c.toId === userId) || (c.fromId === userId && c.toId === user.id));
    if (!conn) return "none";
    if (conn.status === "accepted") return "connected";
    if (conn.fromId === user.id) return "pending_sent";
    return "pending_received";
  }

  sendConnectionRequest(toId: string): void {
    const user = this.currentUser();
    if (!user) return;
    if (this.isTesting) {
      const conn: Connection = { id: `cn${Date.now()}`, fromId: user.id, toId, status: "pending", createdAt: new Date().toISOString() };
      this.data.update((d) => ({ ...d, connections: [...d.connections, conn] }));
      return;
    }
    this.http.post<any>(`${this.API_URL}/connections/request`, { receiverId: toId }).subscribe({
      next: () => {
        this.refreshConnections();
      }
    });
  }

  acceptConnection(requestId: string): void {
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        connections: d.connections.map((c) => c.id === requestId ? { ...c, status: "accepted" as const } : c)
      }));
      return;
    }
    this.http.put<any>(`${this.API_URL}/connections/accept/${requestId}`, {}).subscribe({
      next: () => {
        this.refreshConnections();
      }
    });
  }

  ignoreConnection(requestId: string): void {
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        connections: d.connections.filter((c) => c.id !== requestId)
      }));
      return;
    }
    this.http.put<any>(`${this.API_URL}/connections/reject/${requestId}`, {}).subscribe({
      next: () => {
        this.refreshConnections();
      }
    });
  }

  withdrawConnection(toId: string): void {
    const user = this.currentUser();
    if (!user) return;
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        connections: d.connections.filter((c) => !(c.fromId === user.id && c.toId === toId && c.status === "pending"))
      }));
      return;
    }
    const conn = this.data().connections.find(c => c.fromId === user.id && c.toId === toId && c.status === 'pending');
    if (!conn) return;
    this.http.delete<any>(`${this.API_URL}/connections/withdraw/${conn.id}`).subscribe({
      next: () => {
        this.refreshConnections();
      }
    });
  }

  removeConnection(userId: string): void {
    const user = this.currentUser();
    if (!user) return;
    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        connections: d.connections.filter((c) => !((c.fromId === user.id && c.toId === userId) || (c.fromId === userId && c.toId === user.id)))
      }));
      return;
    }
    const conn = this.data().connections.find(c => c.status === 'accepted' && ((c.fromId === user.id && c.toId === userId) || (c.fromId === userId && c.toId === user.id)));
    if (!conn) return;
    this.http.delete<any>(`${this.API_URL}/connections/${conn.id}`).subscribe({
      next: () => {
        this.refreshConnections();
      }
    });
  }

  followUser(userId: string): void {
    const user = this.currentUser();
    if (!user) return;
    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => {
        if (u.id !== user.id) return u;
        const following = u.following.includes(userId);
        return { ...u, following: following ? u.following.filter((id) => id !== userId) : [...u.following, userId] };
      })
    }));
  }

  sendMessage(conversationId: string | null, toUserId: string, content: string): void {
    const user = this.currentUser();
    if (!user) return;

    if (this.isTesting) {
      const msg = { id: `m${Date.now()}`, senderId: user.id, content, createdAt: new Date().toISOString(), isRead: true };
      this.data.update((d) => {
        if (conversationId) {
          return {
            ...d,
            conversations: d.conversations.map((conv) => conv.id === conversationId ? { ...conv, messages: [...conv.messages, msg] } : conv)
          };
        } else {
          const existing = d.conversations.find((c) => c.participantIds.includes(user.id) && c.participantIds.includes(toUserId));
          if (existing) {
            return {
              ...d,
              conversations: d.conversations.map((conv) => conv.id === existing.id ? { ...conv, messages: [...conv.messages, msg] } : conv)
            };
          } else {
            const newConv: Conversation = { id: `conv${Date.now()}`, participantIds: [user.id, toUserId], messages: [msg], unreadCount: 0 };
            return { ...d, conversations: [...d.conversations, newConv] };
          }
        }
      });
      return;
    }

    const performSend = (convId: string) => {
      this.http.post<any>(`${this.API_URL}/messages/${convId}`, { content }).subscribe({
        next: () => this.refreshConversations(),
        error: (err) => console.error("Error sending message:", err)
      });
    };

    if (conversationId) {
      performSend(conversationId);
    } else {
      const existing = this.data().conversations.find((c) => c.participantIds.includes(user.id) && c.participantIds.includes(toUserId));
      if (existing) {
        performSend(existing.id);
      } else {
        this.http.post<any>(`${this.API_URL}/messages/conversations`, {
          type: 0,
          name: "",
          participantIds: [toUserId]
        }).subscribe({
          next: (res) => {
            const newConv = res.data || res;
            performSend(newConv.id);
          },
          error: (err) => console.error("Error creating conversation:", err)
        });
      }
    }
  }

  markConversationRead(conversationId: string): void {
    const user = this.currentUser();
    if (!user) return;

    this.data.update((d) => ({
      ...d,
      conversations: d.conversations.map((c) => 
        c.id === conversationId 
          ? { 
              ...c, 
              unreadCount: 0, 
              messages: c.messages.map(m => m.senderId !== user.id ? { ...m, isRead: true } : m) 
            } 
          : c
      )
    }));

    if (this.isTesting) return;

    const conv = this.data().conversations.find(c => c.id === conversationId);
    if (conv) {
      const unreadMessages = conv.messages.filter(m => m.senderId !== user.id && !m.isRead);
      unreadMessages.forEach(m => {
        this.http.put<any>(`${this.API_URL}/messages/read/${m.id}`, {}).subscribe({
          error: (err) => console.error("Error marking message as read:", err)
        });
      });
    }
  }

  applyToJob(jobId: string): void {
    const user = this.currentUser();
    if (!user) return;
    
    if (this.isTesting) {
      this.data.update((d) => {
        const alreadyApplied = d.applications.some((a) => a.jobId === jobId && a.userId === user.id);
        if (alreadyApplied) return d;
        const app: Application = { id: `app${Date.now()}`, jobId, userId: user.id, appliedAt: new Date().toISOString(), status: "applied" };
        return {
          ...d,
          applications: [...d.applications, app],
          jobs: d.jobs.map((j) => j.id === jobId ? { ...j, applied: true, applicantsCount: (j.applicantsCount || 0) + 1 } : j)
        };
      });
      return;
    }
    
    this.http.post<any>(`${this.API_URL}/jobs/${jobId}/apply`, { resumeUrl: "resume.pdf", coverLetter: "Cover letter" }).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend applyToJob failed, using local fallback", err);
        this.data.update((d) => {
          const alreadyApplied = d.applications.some((a) => a.jobId === jobId && a.userId === user.id);
          if (alreadyApplied) return d;
          const app: Application = { id: `app${Date.now()}`, jobId, userId: user.id, appliedAt: new Date().toISOString(), status: "applied" };
          return {
            ...d,
            applications: [...d.applications, app],
            jobs: d.jobs.map((j) => j.id === jobId ? { ...j, applied: true, applicantsCount: (j.applicantsCount || 0) + 1 } : j)
          };
        });
      }
    });
  }

  saveJob(jobId: string): void {
    const user = this.currentUser();
    if (!user) return;
    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => {
        if (u.id !== user.id) return u;
        const saved = u.savedJobs.includes(jobId);
        return { ...u, savedJobs: saved ? u.savedJobs.filter((id) => id !== jobId) : [...u.savedJobs, jobId] };
      })
    }));
  }

  withdrawApplication(jobId: string): void {
    const user = this.currentUser();
    if (!user) return;

    if (this.isTesting) {
      this.data.update((d) => ({
        ...d,
        applications: d.applications.filter((a) => !(a.jobId === jobId && a.userId === user.id)),
        jobs: d.jobs.map((j) => j.id === jobId ? { ...j, applied: false, applicantsCount: Math.max(0, (j.applicantsCount || 0) - 1) } : j)
      }));
      return;
    }

    this.http.delete<any>(`${this.API_URL}/jobs/${jobId}/apply`).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend withdrawApplication failed, using local fallback", err);
        this.data.update((d) => ({
          ...d,
          applications: d.applications.filter((a) => !(a.jobId === jobId && a.userId === user.id)),
          jobs: d.jobs.map((j) => j.id === jobId ? { ...j, applied: false, applicantsCount: Math.max(0, (j.applicantsCount || 0) - 1) } : j)
        }));
      }
    });
  }

  markNotificationRead(notificationId: string): void {
    this.data.update((d) => ({
      ...d,
      notifications: d.notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n)
    }));
  }

  markAllNotificationsRead(): void {
    this.data.update((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true }))
    }));
  }

  updateProfile(updates: Partial<User>): void {
    const user = this.currentUser();
    if (!user) return;
    
    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => u.id === user.id ? { ...u, ...updates } : u)
    }));

    if (this.isTesting) return;

    const names = updates.name ? updates.name.trim().split(" ") : null;
    const firstName = names ? names[0] : undefined;
    const lastName = names ? names.slice(1).join(" ") : undefined;

    const payload = {
      firstName,
      lastName,
      headline: updates.headline,
      bio: updates.about,
      location: updates.location,
      openToWork: updates.openToWork,
      autoApplyEnabled: updates.autoApplyEnabled,
      autoApplyKeyword: updates.autoApplyKeyword,
      autoApplyLocation: updates.autoApplyLocation,
      autoApplyJobType: updates.autoApplyJobType
    };

    this.http.put<any>(`${this.API_URL}/profile`, payload).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Failed to update profile on backend", err);
      }
    });
  }

  toggleOpenToWork(): void {
    const user = this.currentUser();
    if (!user) return;
    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => u.id === user.id ? { ...u, openToWork: !u.openToWork } : u)
    }));
  }

  followCompany(companyId: string): void {
    const user = this.currentUser();
    if (!user) return;
    this.data.update((d) => ({
      ...d,
      companies: d.companies.map((c) => {
        if (c.id !== companyId) return c;
        const following = c.employeeIds.includes(user.id + "_follow");
        return {
          ...c,
          followers: following ? c.followers - 1 : c.followers + 1,
          employeeIds: following ? c.employeeIds.filter(id => id !== user.id + "_follow") : [...c.employeeIds, user.id + "_follow"]
        };
      })
    }));
  }

  postJobByBusiness(jobData: Omit<Job, 'id' | 'postedById' | 'status' | 'applied' | 'postedAt'>): void {
    const user = this.currentUser();
    if (!user || user.role !== 'business') return;
    
    if (this.isTesting) {
      const newJob: Job = {
        ...jobData,
        id: `j_${Date.now()}`,
        postedById: user.id,
        status: 'pending',
        applied: false,
        postedAt: new Date().toISOString()
      };
      this.data.update((d) => ({
        ...d,
        jobs: [newJob, ...d.jobs]
      }));
      return;
    }
    
    const payload = {
      companyId: jobData.companyId,
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      jobType: jobData.type === 'Full-time' ? 0 : 1, // 0 for Full-time, 1 for Part-time
      experienceLevel: 0,
      salaryMin: jobData.salary ? parseInt(jobData.salary.split('-')[0].replace(/\D/g, '')) || 400000 : 400000,
      salaryMax: jobData.salary ? parseInt(jobData.salary.split('-')[1]?.replace(/\D/g, '')) || 600000 : 600000,
      isRemote: jobData.workplaceType === 'Remote',
      isActive: true
    };
    
    this.http.post<any>(`${this.API_URL}/jobs`, payload).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Backend postJobByBusiness failed, using local fallback", err);
        const newJob: Job = {
          ...jobData,
          id: `j_${Date.now()}`,
          postedById: user.id,
          status: 'pending',
          applied: false,
          postedAt: new Date().toISOString()
        };
        this.data.update((d) => ({
          ...d,
          jobs: [newJob, ...d.jobs]
        }));
      }
    });
  }

  requestAd(adData: Omit<Ad, 'id' | 'postedById' | 'status' | 'type'>): string {
    const user = this.currentUser();
    if (!user || user.role !== 'business') return '';
    
    const adId = `ad_${Date.now()}`;
    const newAd: Ad = {
      ...adData,
      id: adId,
      postedById: user.id,
      status: 'pending',
      type: 'custom',
      paymentStatus: 'pending'
    };
    
    this.data.update((d) => {
      const adsList = d.ads ?? [];
      return {
        ...d,
        ads: [newAd, ...adsList]
      };
    });
    return adId;
  }

  approveJob(jobId: string): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;
    
    this.data.update((d) => ({
      ...d,
      jobs: d.jobs.map((j) => j.id === jobId ? { ...j, status: 'approved' as const } : j)
    }));
  }

  rejectJob(jobId: string): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;
    
    this.data.update((d) => ({
      ...d,
      jobs: d.jobs.map((j) => j.id === jobId ? { ...j, status: 'rejected' as const } : j)
    }));
  }

  approveAd(adId: string): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;
    
    this.data.update((d) => {
      const adsList = d.ads ?? [];
      return {
        ...d,
        ads: adsList.map((a) => a.id === adId ? { ...a, status: 'approved' as const } : a)
      };
    });
  }

  rejectAd(adId: string): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;
    
    this.data.update((d) => {
      const adsList = d.ads ?? [];
      return {
        ...d,
        ads: adsList.map((a) => a.id === adId ? { ...a, status: 'rejected' as const } : a)
      };
    });
  }

  verifyBusiness(userId: string, action: 'approve' | 'reject'): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;

    this.data.update((d) => ({
      ...d,
      users: d.users.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          isApprovedBusiness: action === 'approve'
        };
      })
    }));
  }

  reportUserOrPost(reporterId: string, reportedUserId: string, postId: string | undefined, reason: string, details?: string): void {
    const newReport: UserReport = {
      id: `rep_${Date.now()}`,
      reporterId,
      reportedUserId,
      postId,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.update((d) => ({
      ...d,
      reports: [newReport, ...(d.reports ?? [])]
    }));
  }

  resolveReport(reportId: string, action: 'dismiss' | 'delete_post' | 'block_user'): void {
    const user = this.currentUser();
    if (!user || user.role !== 'admin') return;

    this.data.update((d) => {
      const reports = d.reports ?? [];
      const report = reports.find(r => r.id === reportId);
      if (!report) return d;

      let posts = d.posts;
      let users = d.users;

      if (action === 'delete_post' && report.postId) {
        posts = posts.filter(p => p.id !== report.postId);
      } else if (action === 'block_user') {
        users = users.filter(u => u.id !== report.reportedUserId);
        posts = posts.filter(p => p.authorId !== report.reportedUserId);
      }

      return {
        ...d,
        posts,
        users,
        reports: reports.map(r => r.id === reportId ? { ...r, status: 'resolved' as const } : r)
      };
    });
  }

  payForAd(adId: string, paymentDetails: { cardNumber: string, cardLast4: string, amount: number }): void {
    if (this.isTesting) {
      this.data.update((d) => {
        const adsList = d.ads ?? [];
        return {
          ...d,
          ads: adsList.map((a) => {
            if (a.id !== adId) return a;
            return {
              ...a,
              paymentStatus: 'paid' as const,
              paymentAmount: paymentDetails.amount,
              transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}-${a.logoText}`,
              cardLast4: paymentDetails.cardLast4
            };
          })
        };
      });
      return;
    }

    const orderPayload = {
      amount: paymentDetails.amount,
      currency: "INR"
    };
    
    this.http.post<any>(`${this.API_URL}/billing/order`, orderPayload).subscribe({
      next: (orderRes) => {
        if (orderRes && orderRes.data) {
          const verifyPayload = {
            orderId: orderRes.data.id,
            paymentId: "pay_simulated_" + Math.floor(100000 + Math.random() * 900000),
            signature: "sig_simulated",
            amount: paymentDetails.amount,
            currency: "INR",
            description: `Paid for Ad Campaign ${adId}`
          };
          this.http.post<any>(`${this.API_URL}/billing/verify`, verifyPayload).subscribe({
            next: () => {
              this.refreshAllData();
            },
            error: () => {}
          });
        }
      },
      error: (err) => {
        console.warn("Backend billing failed, using local fallback", err);
      }
    });

    this.data.update((d) => {
      const adsList = d.ads ?? [];
      return {
        ...d,
        ads: adsList.map((a) => {
          if (a.id !== adId) return a;
          return {
            ...a,
            paymentStatus: 'paid' as const,
            paymentAmount: paymentDetails.amount,
            transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}-${a.logoText}`,
            cardLast4: paymentDetails.cardLast4
          };
        })
      };
    });
  }

  updateCompanyDetails(companyId: string, companyData: Partial<Company>): void {
    const user = this.currentUser();
    if (!user || user.role !== 'business') return;

    if (this.isTesting) {
      this.data.update((d) => {
        const companies = d.companies.map((c) => {
          if (c.id !== companyId) return c;
          return { ...c, ...companyData };
        });
        const targetCompany = companies.find(c => c.id === companyId);
        const companyName = targetCompany ? targetCompany.name : "Our company";
        const content = `🏢 ${companyName} has updated their profile details:\n\n"${companyData.tagline || targetCompany?.tagline || ''}"\n\nCheck out our updated page for open positions and company insights!`;
        const newPost: Post = {
          id: `p_co_${Date.now()}`,
          authorId: user.id,
          content,
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          reposts: 0
        };
        return {
          ...d,
          companies,
          posts: [newPost, ...d.posts]
        };
      });
      return;
    }

    const payload = {
      name: companyData.name,
      logoUrl: companyData.logoUrl || "",
      industry: companyData.industry,
      size: companyData.size,
      website: companyData.website,
      description: companyData.about,
      headquarters: companyData.headquarters
    };

    this.http.put<any>(`${this.API_URL}/companies/${companyId}`, payload).subscribe({
      next: () => {
        const companyName = companyData.name || "Our company";
        const content = `🏢 ${companyName} has updated their profile details:\n\n"${companyData.tagline || ''}"\n\nCheck out our updated page for open positions and company insights!`;
        const postPayload = {
          content,
          postType: 0,
          privacy: 0,
          media: []
        };
        this.http.post<any>(`${this.API_URL}/posts`, postPayload).subscribe({
          next: () => this.refreshAllData(),
          error: () => this.refreshAllData()
        });
      },
      error: (err) => {
        console.warn("Failed to update company on backend, fallback locally", err);
        this.data.update((d) => {
          const companies = d.companies.map((c) => {
            if (c.id !== companyId) return c;
            return {
              ...c,
              ...companyData
            };
          });

          const targetCompany = companies.find(c => c.id === companyId);
          const companyName = targetCompany ? targetCompany.name : "Our company";
          const content = `🏢 ${companyName} has updated their profile details:\n\n"${companyData.tagline || targetCompany?.tagline}"\n\nCheck out our updated page for open positions and company insights!`;
          
          const newPost: Post = {
            id: `p_co_${Date.now()}`,
            authorId: user.id,
            content,
            createdAt: new Date().toISOString(),
            likes: [],
            comments: [],
            reposts: 0
          };

          return {
            ...d,
            companies,
            posts: [newPost, ...d.posts]
          };
        });
      }
    });
  }

  createCompany(companyData: Partial<Company>): void {
    const user = this.currentUser();
    if (!user) return;

    if (this.isTesting) {
      const newCo: Company = {
        id: `co_${Date.now()}`,
        name: companyData.name || "New Company",
        tagline: companyData.tagline || "",
        about: companyData.about || "",
        industry: companyData.industry || "",
        size: companyData.size || "",
        headquarters: companyData.headquarters || "",
        website: companyData.website || "",
        logo: companyData.logo || "C",
        logoColor: companyData.logoColor || "#0A66C2",
        coverColor: companyData.coverColor || "linear-gradient(135deg, #0A66C2, #004182)",
        followers: 0,
        employeeIds: [user.id]
      };
      this.data.update((d) => ({
        ...d,
        companies: [...d.companies, newCo]
      }));
      return;
    }

    const payload = {
      name: companyData.name,
      logoUrl: companyData.logoUrl || "",
      industry: companyData.industry || "",
      size: companyData.size || "",
      website: companyData.website || "",
      description: companyData.about || "",
      headquarters: companyData.headquarters || ""
    };

    this.http.post<any>(`${this.API_URL}/companies`, payload).subscribe({
      next: () => {
        this.refreshAllData();
      },
      error: (err) => {
        console.warn("Failed to create company on backend, fallback locally", err);
        const newCo: Company = {
          id: `co_${Date.now()}`,
          name: companyData.name || "New Company",
          tagline: companyData.tagline || "",
          about: companyData.about || "",
          industry: companyData.industry || "",
          size: companyData.size || "",
          headquarters: companyData.headquarters || "",
          website: companyData.website || "",
          logo: companyData.logo || "C",
          logoColor: companyData.logoColor || "#0A66C2",
          coverColor: companyData.coverColor || "linear-gradient(135deg, #0A66C2, #004182)",
          followers: 0,
          employeeIds: [user.id]
        };
        this.data.update((d) => ({
          ...d,
          companies: [...d.companies, newCo]
        }));
      }
    });
  }

  createCompanyPost(companyId: string, content: string, image?: string): void {
    // Companies can post to feed via createPost
    this.createPost(content, image);
  }

  getApplicationsForJob(jobId: string): Promise<any[]> {
    if (!this.isTesting) {
      return this.http.get<any>(`${this.API_URL}/jobs/${jobId}/applications`).toPromise().then(res => {
        if (res && res.data) {
          return res.data.items || res.data || [];
        }
        return [];
      }).catch(err => {
        console.warn("Failed to get applications from backend", err);
        return this.getLocalApplicationsForJob(jobId);
      });
    }
    return Promise.resolve(this.getLocalApplicationsForJob(jobId));
  }

  private getLocalApplicationsForJob(jobId: string): any[] {
    const apps = this.data().applications.filter(a => a.jobId === jobId);
    return apps.map(a => {
      const user = this.data().users.find(u => u.id === a.userId);
      const job = this.data().jobs.find(j => j.id === a.jobId);
      return {
        id: a.id,
        jobId: a.jobId,
        jobTitle: job?.title || 'Job Title',
        applicantId: a.userId,
        applicantName: user?.name || 'Applicant Name',
        resumeUrl: 'resume.pdf',
        coverLetter: 'Cover letter content',
        status: a.status === 'offer' ? 3 : (a.status === 'rejected' ? 4 : 0),
        appliedAt: a.appliedAt
      };
    });
  }

  updateApplicationStatus(applicationId: string, status: number): Promise<boolean> {
    if (!this.isTesting) {
      return this.http.put<any>(`${this.API_URL}/jobs/applications/${applicationId}/status`, { status }).toPromise().then(() => {
        this.refreshAllData();
        return true;
      }).catch(err => {
        console.warn("Failed to update status on backend, falling back", err);
        this.updateLocalApplicationStatus(applicationId, status);
        return true;
      });
    }
    this.updateLocalApplicationStatus(applicationId, status);
    return Promise.resolve(true);
  }

  private updateLocalApplicationStatus(applicationId: string, statusNum: number): void {
    const statusMap: Record<number, string> = {
      0: 'applied',
      1: 'viewed',
      2: 'interviewing',
      3: 'offer',
      4: 'rejected'
    };
    const statusStr = statusMap[statusNum] || 'applied';
    
    this.data.update(d => ({
      ...d,
      applications: d.applications.map(a => a.id === applicationId ? { ...a, status: statusStr as any } : a)
    }));
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async payWithRazorpay(adId: string, amount: number, onSuccess: (transactionId: string) => void, onFailure: (error: string) => void): Promise<void> {
    if (this.isTesting) {
      const simulatedTxn = `pay_simulated_${Math.floor(100000 + Math.random() * 900000)}`;
      this.payForAd(adId, { cardNumber: '1111222233334444', cardLast4: '4444', amount });
      onSuccess(simulatedTxn);
      return;
    }

    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      onFailure("Could not load Razorpay SDK.");
      return;
    }

    try {
      const orderRes = await this.http.post<any>(`${this.API_URL}/billing/order`, { amount: amount, currency: "INR" }).toPromise();
      if (!orderRes || !orderRes.data) {
        onFailure("Failed to create order on the server.");
        return;
      }

      const orderData = orderRes.data;
      
      const options = {
        key: "rzp_test_SyQggul1MhJ0jo",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "ProLink Ads",
        description: `Ad campaign promotion for Ad ID: ${adId}`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            const verifyPayload = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: amount,
              currency: "INR",
              description: `Paid for Ad Campaign ${adId}`
            };

            await this.http.post<any>(`${this.API_URL}/billing/verify`, verifyPayload).toPromise();
            
            this.data.update((d) => {
              const adsList = d.ads ?? [];
              return {
                ...d,
                ads: adsList.map((a) => {
                  if (a.id !== adId) return a;
                  return {
                    ...a,
                    paymentStatus: 'paid' as const,
                    paymentAmount: amount,
                    transactionId: response.razorpay_payment_id,
                    cardLast4: '4444'
                  };
                })
              };
            });

            this.refreshAllData();
            onSuccess(response.razorpay_payment_id);
          } catch (err) {
            onFailure("Payment verification failed on the server.");
          }
        },
        prefill: {
          name: this.currentUser()?.name || "User",
          email: this.currentUser()?.email || "user@example.com"
        },
        theme: {
          color: "#0A66C2"
        },
        modal: {
          ondismiss: () => {
            onFailure("Payment cancelled by user.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay order creation failed", err);
      onFailure("Failed to initiate payment transaction.");
    }
  }
}
