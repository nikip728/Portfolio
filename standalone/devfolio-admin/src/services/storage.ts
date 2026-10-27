import { AppData, Project, Education, Certificate, Profile, Experience } from '../types';
import { INITIAL_DATA } from '../constants';
import { supabase } from '../supabase';

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

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

export const saveAppData = async (data: AppData): Promise<AppData> => {
  try {
    // 1. Profile
    const { data: profile } = await supabase.from('profiles').select('id').single();
    const profilePayload = {
      name: data.profile.name,
      title: data.profile.title,
      bio: data.profile.bio,
      email: data.profile.email,
      avatar_url: data.profile.avatarUrl,
      skills: data.profile.skills,
      socials: data.profile.socials
    };

    if (profile) {
      await supabase.from('profiles').update(profilePayload).eq('id', profile.id);
    } else {
      await supabase.from('profiles').insert(profilePayload);
    }

    // Helper for Lists
    const handleList = async (table: string, items: any[], mapper: (item: any, idx: number) => any) => {
      // Get existing IDs to detect deletions
      const { data: dbItems } = await supabase.from(table).select('id');
      const existingIds = new Set(dbItems?.map((x: any) => x.id) || []);
      const incomingIds = new Set(items.filter((x: any) => isUUID(x.id)).map((x: any) => x.id));

      // Delete removed items
      const toDelete = [...existingIds].filter(id => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await supabase.from(table).delete().in('id', toDelete);
      }

      // Update existing and Insert new
      // We process sequentially to respect order if we rely on loop index
      for (const [index, item] of items.entries()) {
        const payload = mapper(item, index);
        if (isUUID(item.id)) {
          await supabase.from(table).update(payload).eq('id', item.id);
        } else {
          await supabase.from(table).insert(payload);
        }
      }
    };

    // Projects
    await handleList('projects', data.projects, (p, idx) => ({
      title: p.title,
      description: p.description,
      tags: p.tags,
      image_url: p.imageUrl,
      demo_url: p.demoUrl,
      repo_url: p.repoUrl,
      relevance_order: idx
    }));

    // Experience
    await handleList('experience', data.experience, (e, idx) => ({
      role: e.role,
      company: e.company,
      period: e.period,
      description: e.description,
      relevance_order: idx
    }));

    // Education
    await handleList('education', data.education, (ed, idx) => ({
      degree: ed.degree,
      institution: ed.institution,
      year: ed.year,
      description: ed.description,
      relevance_order: idx
    }));

    // Certificates
    await handleList('certificates', data.certificates, (c, idx) => ({
      name: c.name,
      issuer: c.issuer,
      date: c.date,
      url: c.url,
      relevance_order: idx
    }));

    // Return fresh data with new IDs
    return await getAppData();

  } catch (error) {
    console.error('Error saving data to Supabase:', error);
    throw error;
  }
};

export const resetAppData = async (): Promise<void> => {
  // Dangerous: Delete everything?
  // Implementation plan said "test saving", not necessarily implementing full Reset.
  // But to be safe, I'll log a warning.
  console.warn("Reset not implemented for Supabase backend yet.");
};