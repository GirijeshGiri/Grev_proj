import React from 'react';
import { Scale, PlusCircle, HelpCircle, Bookmark, Compass, Home } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'input' | 'dashboard' | 'my-requests' | 'how-it-works';
  onNavigate: (tab: 'home' | 'input' | 'my-requests' | 'how-it-works') => void;
  onStartNew: () => void;
  savedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onStartNew,
  savedCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-none">
                Grievance Scribe
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                Citizen Request Navigator
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              AI-Powered Citizen Complaint &amp; RTI Assistant
            </p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            id="nav-btn-home"
            onClick={() => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'home'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            type="button"
            id="nav-btn-create"
            onClick={() => onNavigate('input')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'input' || currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>Create Request</span>
          </button>

          <button
            type="button"
            id="nav-btn-my-requests"
            onClick={() => onNavigate('my-requests')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative ${
              currentTab === 'my-requests'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>My Requests</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {savedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-btn-how-it-works"
            onClick={() => onNavigate('how-it-works')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'how-it-works'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">How It Works</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            id="nav-btn-new-issue"
            onClick={onStartNew}
            className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">New Issue</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
