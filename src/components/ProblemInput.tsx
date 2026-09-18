import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Hash, ArrowRight, Loader2, FileText, AlertCircle, ShieldCheck } from 'lucide-react';
import { CitizenInput, DemoExample } from '../types';
import { DEMO_EXAMPLES } from '../data/demoExamples';

interface ProblemInputProps {
  input: CitizenInput;
  onChange: (updated: Partial<CitizenInput>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onSelectDemo: (demo: DemoExample) => void;
  error?: string | null;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  onSelectDemo,
  error,
}) => {
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.problem.trim()) return;
    onSubmit();
  };

  return (
    <div id="problem-input-container" className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200/60 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Stage 01: Citizen Problem Intake</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explain Your Issue
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Describe the situation in your own words. No legal terminology, sections, or formal departmental knowledge required.
        </p>
      </div>

      {/* Quick Demo Selector Chips */}
      <div className="mb-6 p-4 rounded-xl bg-slate-100/90 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Quick Example Scenarios (Click to auto-populate)
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Demonstrates RTI vs. Grievance vs. Mixed
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_EXAMPLES.map((demo) => (
            <button
              key={demo.id}
              id={`btn-load-demo-${demo.id}`}
              type="button"
              onClick={() => onSelectDemo(demo)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition-colors shadow-2xs cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${
                demo.badge === 'RTI' ? 'bg-blue-500' : demo.badge === 'GRIEVANCE' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span className="font-bold">{demo.badge}:</span>
              <span className="truncate max-w-[200px] sm:max-w-xs">{demo.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Analysis Notice</p>
            <p className="text-xs mt-0.5 text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          {/* Main Problem Area */}
          <div className="mb-5">
            <label
              htmlFor="problem-text-area"
              className="block text-sm font-bold text-slate-900 mb-2 flex items-center justify-between"
            >
              <span>Describe your problem in your own words *</span>
              <span className="text-xs font-normal text-slate-500">
                {input.problem.length} characters
              </span>
            </label>
            <textarea
              id="problem-text-area"
              rows={5}
              value={input.problem}
              onChange={(e) => onChange({ problem: e.target.value })}
              placeholder="Describe your problem in your own words... (e.g. The road near ABC School has been damaged for six months. I complained earlier but it has still not been repaired. I also want to know how much money was allocated for this road repair and which contractor received the work.)"
              className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 resize-y leading-relaxed text-slate-900 bg-white"
              required
            />
          </div>

          {/* Optional Supporting Fields Toggle */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                Supporting Context Fields (Helps fact extraction)
              </span>
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {showOptionalFields ? 'Hide extra fields' : 'Show extra fields'}
              </button>
            </div>

            {showOptionalFields && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {/* Location */}
                <div>
                  <label
                    htmlFor="input-location"
                    className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    id="input-location"
                    value={input.location || ''}
                    onChange={(e) => onChange({ location: e.target.value })}
                    placeholder="e.g. Near ABC School, Ward 4"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="input-duration"
                    className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date / Duration
                  </label>
                  <input
                    type="text"
                    id="input-duration"
                    value={input.duration || ''}
                    onChange={(e) => onChange({ duration: e.target.value })}
                    placeholder="e.g. Six months, 2 weeks"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                {/* Previous Complaint No */}
                <div>
                  <label
                    htmlFor="input-previous-complaint"
                    className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
                  >
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    Previous Reference No.
                  </label>
                  <input
                    type="text"
                    id="input-previous-complaint"
                    value={input.previousComplaintNo || ''}
                    onChange={(e) => onChange({ previousComplaintNo: e.target.value })}
                    placeholder="e.g. GRV/2026/0892 or CPGRAMS ID"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict Fact Grounding: Scribe will never invent missing facts or dates.</span>
          </div>

          <button
            type="submit"
            id="btn-analyze-issue"
            disabled={isLoading || !input.problem.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <span>Navigating &amp; Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze My Issue</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
