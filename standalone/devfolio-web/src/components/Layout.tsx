import React from 'react';
import { Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import { Profile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  profile: Profile;
}

export const Layout: React.FC<LayoutProps> = ({ children, profile }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">
                {profile.name.charAt(0)}
              </div>
              <span className="font-bold text-lg tracking-tight text-white">{profile.name}</span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#about" className="hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">About</a>
                <a href="#projects" className="hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Projects</a>
                <a href="#skills" className="hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Skills</a>
                <a href="#education" className="hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Education</a>
                <a href="#contact" className="hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium">Contact</a>
              </div>
            </div>

            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-slate-900 inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">About</a>
              <a href="#projects" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Projects</a>
              <a href="#skills" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Skills</a>
              <a href="#education" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Education</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contact</a>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-white">{profile.name}</span>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            {profile.socials.map((social) => (
              <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">{social.platform}</span>
                {social.iconName === 'github' && <Github size={24} />}
                {social.iconName === 'linkedin' && <Linkedin size={24} />}
                {social.iconName === 'twitter' && <Twitter size={24} />}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};