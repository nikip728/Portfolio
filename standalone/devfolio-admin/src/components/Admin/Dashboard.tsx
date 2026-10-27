import React, { useState } from 'react';
import { AppData, Project, Education, Experience, Certificate, Profile } from '../../types';
import { saveAppData, resetAppData } from '../../services/storage';
import { Plus, Trash2, Save, RotateCcw, Image, Link as LinkIcon, Edit2, Check, Briefcase } from 'lucide-react';
import { GeminiGenerator } from './GeminiGenerator';

interface DashboardProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
}

type Tab = 'profile' | 'projects' | 'experience' | 'education' | 'certificates';

export const Dashboard: React.FC<DashboardProps> = ({ data, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [tempData, setTempData] = useState<AppData>(data);
  const [isSaved, setIsSaved] = useState(false);

  // General change handler
  const handleSave = async () => {
    try {
      const savedData = await saveAppData(tempData);
      onUpdate(savedData);
      setTempData(savedData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save data. See console for details.");
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data to default? This cannot be undone.")) {
      resetAppData();
    }
  };

  // --- Profile Helpers ---
  const updateProfile = (field: keyof Profile, value: any) => {
    setTempData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const updateSocial = (index: number, field: string, value: string) => {
    const newSocials = [...tempData.profile.socials];
    newSocials[index] = { ...newSocials[index], [field]: value };
    updateProfile('socials', newSocials);
  };

  // --- Project Helpers ---
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      description: '',
      tags: [],
      imageUrl: 'https://picsum.photos/800/600',
    };
    setTempData(prev => ({ ...prev, projects: [newProject, ...prev.projects] }));
  };

  const removeProject = (id: string) => {
    setTempData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setTempData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // --- Experience Helpers ---
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      role: 'New Role',
      company: 'Company Name',
      period: 'Year - Year',
      description: ''
    };
    setTempData(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
  };

  const removeExperience = (id: string) => {
    setTempData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setTempData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // --- Education Helpers ---
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: 'New Degree',
      institution: 'Institution',
      year: 'Year',
      description: ''
    };
    setTempData(prev => ({ ...prev, education: [newEdu, ...prev.education] }));
  };

  const removeEducation = (id: string) => {
    setTempData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setTempData(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // --- Certificate Helpers ---
  const addCertificate = () => {
    const newCert: Certificate = {
      id: Date.now().toString(),
      name: 'New Certificate',
      issuer: 'Issuer',
      date: 'Year',
      url: '#'
    };
    setTempData(prev => ({ ...prev, certificates: [newCert, ...prev.certificates] }));
  };

  const removeCertificate = (id: string) => {
    setTempData(prev => ({ ...prev, certificates: prev.certificates.filter(c => c.id !== id) }));
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: any) => {
    setTempData(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Manage your portfolio content</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <RotateCcw size={18} /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all"
          >
            {isSaved ? <Check size={18} /> : <Save size={18} />}
            {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex flex-col gap-2">
          {(['profile', 'projects', 'experience', 'education', 'certificates'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-lg font-medium transition-colors capitalize ${activeTab === tab
                ? 'bg-slate-800 text-white border-l-4 border-indigo-500'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-6">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Full Name</label>
                  <input
                    type="text"
                    value={tempData.profile.name}
                    onChange={(e) => updateProfile('name', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Job Title</label>
                  <input
                    type="text"
                    value={tempData.profile.title}
                    onChange={(e) => updateProfile('title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Bio</label>
                  <textarea
                    value={tempData.profile.bio}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Avatar URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempData.profile.avatarUrl}
                      onChange={(e) => updateProfile('avatarUrl', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 shrink-0">
                      <img src={tempData.profile.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-400">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={tempData.profile.skills.join(", ")}
                    onChange={(e) => updateProfile('skills', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mt-8 mb-2">Social Links</h3>
              <div className="grid grid-cols-1 gap-4">
                {tempData.profile.socials.map((social, idx) => (
                  <div key={social.platform} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-slate-400">{social.platform}</span>
                    <input
                      type="text"
                      value={social.url}
                      onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Projects</h2>
                <button onClick={addProject} className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={16} /> Add Project
                </button>
              </div>

              {tempData.projects.map((project) => (
                <div key={project.id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative group">
                  <button
                    onClick={() => removeProject(project.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-1"
                    title="Remove Project"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Title</label>
                        <input
                          value={project.title}
                          onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Tags (comma separated)</label>
                        <input
                          value={project.tags.join(", ")}
                          onChange={(e) => updateProject(project.id, 'tags', e.target.value.split(',').map(s => s.trim()))}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Image URL</label>
                        <div className="flex gap-2">
                          <input
                            value={project.imageUrl}
                            onChange={(e) => updateProject(project.id, 'imageUrl', e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                          />
                          <a href={project.imageUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">
                            <Image size={16} />
                          </a>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Demo URL</label>
                          <input
                            value={project.demoUrl || ''}
                            onChange={(e) => updateProject(project.id, 'demoUrl', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Repo URL</label>
                          <input
                            value={project.repoUrl || ''}
                            onChange={(e) => updateProject(project.id, 'repoUrl', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <label className="block text-xs text-slate-500">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                        className="flex-1 w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 min-h-[140px]"
                      />
                      {/* Gemini Integration */}
                      <GeminiGenerator
                        currentTitle={project.title}
                        currentTags={project.tags.join(', ')}
                        onGenerate={(desc) => updateProject(project.id, 'description', desc)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Work Experience</h2>
                <button onClick={addExperience} className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={16} /> Add Role
                </button>
              </div>

              {tempData.experience.map((exp) => (
                <div key={exp.id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative">
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-1"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Role/Title</label>
                        <input
                          value={exp.role}
                          onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Company</label>
                        <input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Period (e.g. 2023 - Present)</label>
                      <input
                        value={exp.period}
                        onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === 'education' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Education</h2>
                <button onClick={addEducation} className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={16} /> Add Education
                </button>
              </div>

              {tempData.education.map((edu) => (
                <div key={edu.id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-1"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Degree</label>
                        <input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Institution</label>
                        <input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Years</label>
                      <input
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description (Optional)</label>
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICATES TAB */}
          {activeTab === 'certificates' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Certificates</h2>
                <button onClick={addCertificate} className="flex items-center gap-1 text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors">
                  <Plus size={16} /> Add Certificate
                </button>
              </div>

              {tempData.certificates.map((cert) => (
                <div key={cert.id} className="bg-slate-950 rounded-xl border border-slate-800 p-5 relative">
                  <button
                    onClick={() => removeCertificate(cert.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 p-1"
                    title="Remove"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Certificate Name</label>
                        <input
                          value={cert.name}
                          onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Issuer</label>
                        <input
                          value={cert.issuer}
                          onChange={(e) => updateCertificate(cert.id, 'issuer', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Date</label>
                        <input
                          value={cert.date}
                          onChange={(e) => updateCertificate(cert.id, 'date', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">URL</label>
                        <div className="flex gap-2">
                          <input
                            value={cert.url}
                            onChange={(e) => updateCertificate(cert.id, 'url', e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200"
                          />
                          <a href={cert.url} target="_blank" rel="noreferrer" className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white">
                            <LinkIcon size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};