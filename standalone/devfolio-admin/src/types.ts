export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  iconName: string; 
}

export interface Profile {
  name: string;
  title: string;
  bio: string;
  email: string;
  avatarUrl: string;
  skills: string[];
  socials: SocialLink[];
}

export interface AppData {
  profile: Profile;
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
}