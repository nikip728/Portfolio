import { AppData, Project, Education, Certificate, Profile, Experience } from '../types';
import { INITIAL_DATA } from '../constants';
import { supabase } from '../supabase';

export const getAppData = async (): Promise<AppData> => {
  try {
    const [
      { data: profile, error: profileError },
      { data: projects, error: projectsError },
      { data: experience, error: experienceError },
      { data: education, error: educationError },
      { data: certificates, error: certificatesError }
    ] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('projects').select('*').order('relevance_order', { ascending: true }),
      supabase.from('experience').select('*').order('relevance_order', { ascending: true }),
      supabase.from('education').select('*').order('relevance_order', { ascending: true }),
      supabase.from('certificates').select('*').order('relevance_order', { ascending: true })
    ]);

    if (profileError || !profile) {
      console.warn('Profile missing or error, falling back to INITIAL_DATA', profileError);
      return INITIAL_DATA;
    }

    return {
      profile: {
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        skills: profile.skills || [],
        socials: profile.socials || []
      },
      projects: (projects || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tags: p.tags || [],
        imageUrl: p.image_url,
        demoUrl: p.demo_url,
        repoUrl: p.repo_url
      })),
      experience: (experience || []).map((e: any) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        period: e.period,
        description: e.description
      })),
      education: (education || []).map((ed: any) => ({
        id: ed.id,
        degree: ed.degree,
        institution: ed.institution,
        year: ed.year,
        description: ed.description
      })),
      certificates: (certificates || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        date: c.date,
        url: c.url
      }))
    };
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    return INITIAL_DATA;
  }
};

// No-op for web app
export const saveAppData = async (data: AppData): Promise<void> => {
  console.warn('saveAppData is not supported in the web app directly.');
};

export const resetAppData = (): void => {
  localStorage.removeItem('portfolio_data_v1');
  window.location.reload();
};