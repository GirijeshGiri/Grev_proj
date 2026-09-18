import React from 'react';
import {
  ArrowRight,
  HelpCircle,
  Shield,
  Sparkles,
  Zap,
  Split,
  FileCheck2,
  Globe2,
  Mic,
  FileSearch,
  BellRing,
  Users,
} from 'lucide-react';
import { PipelineStepsVisual } from './PipelineStepsVisual';
import { DEMO_EXAMPLES } from '../data/demoExamples';
import { DemoExample } from '../types';

interface LandingHeroProps {
  onStartAnalysis: () => void;
  onOpenHowItWorks: () => void;
  onSelectDemo: (demo: DemoExample) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartAnalysis,
  onOpenHowItWorks,
  onSelectDemo,
}) => {
  const featuredDemo = DEMO_EXAMPLES[0]; // Featured Mixed Demo

  return (
    <div id="landing-page-hero" className="py-8 sm:py-14">
      {/* Top Tagline Pill */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800 shadow-2xs">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI-Powered Citizen Request Navigator</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center max-w-4xl mx-auto px-4 mb-8">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-5">
          Turn Your Problem Into the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-700 to-slate-900">
            Right Government Request.
          </span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto mb-7">
          Explain your issue in simple language. Grievance Scribe helps you understand what type of request may fit, organizes your facts, identifies missing information, prepares an editable request, and guides you toward the appropriate official channel.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="hero-btn-analyze"
            onClick={onStartAnalysis}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <span>Analyze My Issue</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
          <button
            type="button"
            id="hero-btn-how-it-works"
            onClick={onOpenHowItWorks}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* Section 38: Featured Demo Scenario Card */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <div className="rounded-2xl border-2 border-indigo-300/80 bg-gradient-to-br from-indigo-50/70 via-white to-amber-50/50 p-5 sm:p-7 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white uppercase tracking-wider">
                Featured Scenario
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                Mixed RTI + Grievance
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectDemo(featuredDemo)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer self-start sm:self-auto"
            >
              <span>Load Full Scenario Test</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-slate-800 text-sm sm:text-base font-serif italic mb-4 leading-relaxed bg-white/80 p-3.5 rounded-xl border border-indigo-100">
            &ldquo;{featuredDemo.input.problem}&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">Grievance Part:</span>
              <span className="text-slate-600">Demands physical road repair by municipal PWD engineers.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">RTI Query Part:</span>
              <span className="text-slate-600">Demands budget allocation files &amp; contractor tender records.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-white/90 border border-slate-200">
              <span className="font-bold text-slate-900 block mb-0.5">Navigation Outcome:</span>
              <span className="text-slate-600">Splits into dual filings for Municipal Ward and Section 6(1) PIO.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Step Visual Flow */}
      <div className="max-w-6xl mx-auto px-4 mb-14">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            The 6-Step Citizen Request Journey
          </h3>
          <span className="text-xs font-semibold text-indigo-600">Structured Civic Protocol</span>
        </div>
        <PipelineStepsVisual />
      </div>

      {/* Other 1-Click Interactive Demos */}
      <div className="max-w-5xl mx-auto px-4 mb-16">
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">
            Interactive Citizen Problem Scenarios
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Click any scenario to see how classification, fact extraction, and official portal discovery work:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_EXAMPLES.map((demo) => {
            const badgeColor =
              demo.badge === 'RTI'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : demo.badge === 'GRIEVANCE'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200';

            return (
              <div
                key={demo.id}
                id={`demo-card-${demo.id}`}
                onClick={() => onSelectDemo(demo)}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${badgeColor}`}>
                      {demo.badge}
                    </span>
                    <span className="text-xs text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Test Issue →
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                    {demo.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 italic">
                    &ldquo;{demo.input.problem}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Location: {demo.input.location || 'Not provided'}</span>
                  <span className="font-semibold text-slate-700">{demo.input.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature 21: Future Capabilities & Roadmap Preview */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 uppercase tracking-wider">
              Roadmap Preview
            </span>
            <span className="text-xs font-bold text-slate-500">
              Future Enterprise &amp; Citizen Capabilities
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
            Planned Platform Enhancements
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            Designed for scale across Indian states, local civic wards, and advocacy organizations:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Globe2 className="w-4 h-4 text-indigo-600" />
                <span>Multilingual Support</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Native Hindi, Tamil, Telugu, Marathi, Bengali, and Kannada input and output generation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>Voice-to-Request Input</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Allow citizens with limited typing skills or literacy to explain issues by speaking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <FileSearch className="w-4 h-4 text-amber-600" />
                <span>Document Understanding</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Upload photos of broken roads, disputed electricity bills, or past rejection receipts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <BellRing className="w-4 h-4 text-blue-600" />
                <span>Smart Follow-up Reminders</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Automatic timeline triggers when statutory 30-day RTI deadlines expire to prompt First Appeals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Community &amp; NGO Dashboard</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Batch tracking for resident welfare associations (RWAs) and civic rights organizations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
                <Zap className="w-4 h-4 text-rose-600" />
                <span>Direct API Submission</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Pending formal government API partnerships and authorized portal gateway credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
