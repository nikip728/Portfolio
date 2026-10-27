import React from 'react';
import { Menu, X } from 'lucide-react';
import { Profile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  profile: Profile;
  isAdmin?: boolean; // Kept for compatibility if passed, but ignored or assumed true logic-wise
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
                <span className="text-indigo-400 font-semibold px-3 py-1 bg-indigo-500/10 rounded-full text-sm">
                  Admin Mode
                </span>
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
              <span className="text-indigo-400 block px-3 py-2 rounded-md text-base font-medium">
                Admin Mode
              </span>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};