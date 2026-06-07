export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  headline: string;
  location: string;
  about: string;
  connections: number;
  profileViews: number;
  experience: Experience[];
  education: Education[];
  skills: string[];
  avatarInitials: string;
  avatarColor: string;
  coverColor: string;
  avatarUrl?: string;
  coverUrl?: string;
  savedJobs: string[];
  savedPosts: string[];
  openToWork: boolean;
  autoApplyEnabled?: boolean;
  autoApplyKeyword?: string;
  autoApplyLocation?: string;
  autoApplyJobType?: string;
  following: string[];
  role?: 'candidate' | 'business' | 'admin';
  isApprovedBusiness?: boolean;
  pronouns?: string;
  showSchoolInIntro?: boolean;
  industry?: string;
  phone?: string;
  phoneType?: string;
  address?: string;
  birthdayMonth?: string;
  birthdayDay?: string;
  birthdayVisibility?: string;
  websites?: { url: string; label: string }[];
  instantMessaging?: { handle: string; platform: string }[];
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  reposts: number;
  image?: string;
  isJobUpdate?: boolean;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  status: "pending" | "accepted";
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  unreadCount: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
  easyApply: boolean;
  applied: boolean;
  logo: string;
  workplaceType?: string;
  applicantsCount?: number;
  insightMessage?: string;
  missingQualifications?: string[];
  aboutDescription?: string;
  postedById?: string;
  status?: 'pending' | 'approved' | 'rejected';
  logoUrl?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  appliedAt: string;
  status: "applied" | "viewed" | "interviewing" | "rejected" | "offer";
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  about: string;
  industry: string;
  size: string;
  headquarters: string;
  website: string;
  logo: string;
  logoColor: string;
  coverColor: string;
  followers: number;
  employeeIds: string[];
  logoUrl?: string;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "connection" | "view" | "job";
  actorId: string;
  message: string;
  createdAt: string;
  read: boolean;
  postId?: string;
  companyLogos?: string[];
  isJobOpportunity?: boolean;
}

export interface ProfileView {
  viewerId: string;
  profileId: string;
  viewedAt: string;
}

export interface JobAlert {
  id: string;
  keyword: string;
  location: string;
  experience: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  companyName: string;
  description: string;
  logoText: string;
  logoColor?: string;
  coverColor?: string;
  ctaText?: string;
  ctaUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  postedById: string;
  type: 'sbi' | 'striker' | 'custom';
  paymentStatus?: 'pending' | 'paid';
  paymentAmount?: number;
  transactionId?: string;
  cardLast4?: string;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  postId?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface AppData {
  currentUserId: string | null;
  users: User[];
  posts: Post[];
  connections: Connection[];
  conversations: Conversation[];
  jobs: Job[];
  applications: Application[];
  notifications: Notification[];
  companies: Company[];
  profileViews?: ProfileView[];
  jobAlerts?: JobAlert[];
  ads?: Ad[];
  reports?: UserReport[];
}
