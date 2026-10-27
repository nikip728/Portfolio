import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { getAppData } from './services/storage';
import { AppData } from './types';
import { ExternalLink, Github, ArrowRight, Code, Award, Mail, Briefcase } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      const appData = await getAppData();
      setData(appData);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // PUBLIC VIEW
  return (
    <Layout profile={data.profile}>
      {/* Hero Section using data */}
      <section id="about" className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[128px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-sm font-medium mb-2">
                Available for hire
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                Designing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Future</span> Experiences
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                {data.profile.bio}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#projects" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-full transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                  View Work <ArrowRight size={18} />
                </a>
                <a href="#contact" className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-full transition-all border border-slate-700">
                  Contact Me
                </a>
              </div>
            </div>
            <div className="flex-shrink-0">
              {data.profile.avatarUrl && (
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full p-2 border-2 border-slate-800 bg-slate-900/50 backdrop-blur">
                  <img
                    src={data.profile.avatarUrl}
                    alt={data.profile.name}
                    className="w-full h-full rounded-full object-cover transition-all duration-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Skills Marquee / Section */}
      <section id="skills" className="py-20 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Tech Stack & Tools</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {data.profile.skills.map((skill) => (
              <div key={skill} className="px-6 py-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-medium hover:border-indigo-500/50 hover:text-indigo-400 transition-colors cursor-default">
                {skill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Projects</h2>
              <p className="text-slate-400 max-w-xl">
                A selection of projects that demonstrate my passion for building high-quality web applications.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {data.projects.map((project) => (
              <div key={project.id} className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full">
                {project.imageUrl && (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                  <p className="text-slate-400 mb-6 line-clamp-4 flex-1">
                    {project.description}
                  </p>
                  <div className="flex gap-4 mt-auto">
                    {project.demoUrl && project.demoUrl !== "#" && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-white hover:text-indigo-400 transition-colors">
                        <ExternalLink size={16} /> Live Demo
                      </a>
                    )}
                    {project.repoUrl && project.repoUrl !== "#" && (
                      <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                        <Github size={16} /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Briefcase size={24} /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Work Experience</h2>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto md:mx-0">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative pl-8 border-l-2 border-slate-800 pb-8 last:pb-0 last:border-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <span className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">{exp.period}</span>
                </div>
                <div className="text-lg text-slate-300 font-medium mb-4">{exp.company}</div>
                <p className="text-slate-400 leading-relaxed text-base">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Certificates Grid */}
      <section id="education" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Education */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Award size={24} /></div>
                <h2 className="text-2xl font-bold text-white">Education</h2>
              </div>
              <div className="space-y-8 border-l-2 border-slate-800 ml-3 pl-8 relative">
                {data.education.map((edu) => (
                  <div key={edu.id} className="relative">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                    <h3 className="text-lg font-bold text-white">{edu.institution}</h3>
                    <p className="text-indigo-400 font-medium mb-1">{edu.degree}</p>
                    <p className="text-sm text-slate-500 mb-2">{edu.year}</p>
                    {edu.description && <p className="text-slate-400 text-sm leading-relaxed">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Certs (reusing similar layout) */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Code size={24} /></div>
                <h2 className="text-2xl font-bold text-white">Certificates</h2>
              </div>
              <div className="space-y-4">
                {data.certificates.map((cert) => (
                  <div key={cert.id} className="bg-slate-950 p-6 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-colors group">
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">{cert.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-slate-400 text-sm">{cert.issuer}</span>
                      <span className="text-slate-600 text-sm">{cert.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Let's Work Together</h2>
          <p className="text-xl text-slate-400 mb-10">
            I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          <a
            href={`mailto:${data.profile.email}`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 hover:bg-slate-200 font-bold rounded-full transition-colors text-lg"
          >
            <Mail size={20} />
            Say Hello
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default App;