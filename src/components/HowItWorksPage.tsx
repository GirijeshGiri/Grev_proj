import React from 'react';
import {
  HelpCircle,
  FileQuestion,
  AlertCircle,
  Split,
  ShieldCheck,
  FileCheck2,
  Compass,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

interface HowItWorksPageProps {
  onStartAnalysis: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onStartAnalysis }) => {
  return (
    <div id="page-how-it-works" className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider inline-block mb-3">
          Citizen Civic Guide
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          How Grievance Scribe Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          From an everyday civic problem to an official, fact-grounded government submission.
          Learn how our 6-step pipeline navigates RTI vs. Grievance rules.
        </p>
      </div>

      {/* The 6-Step Workflow */}
      <div className="mb-14">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-6 text-center">
          The 6-Step Citizen Request Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Explain in Your Words</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your problem without worrying about legal jargon, sections, or administrative terminology.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI Understands &amp; Extracts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts the core problem, location, duration, and previous reference. Strictly preserves your factual claims without inventing names or dates.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Intelligent Classification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Determines whether you need a <strong>Grievance</strong> (action), an <strong>RTI</strong> (official records), or a <strong>Mixed</strong> request.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Validate &amp; Detect Missing Info</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Flags missing ward names, street landmarks, or prior token IDs before submission, preventing rejection by government desks.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              05
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Structured Application Drafts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Produces Section 6(1) RTI applications or standard Grievance petitions ready for printing, PDF export, or one-click copying.
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm mb-4">
              06
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Official Channel &amp; Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Points you to verified portals (CPGRAMS, RTI Online, State Municipalities) and logs your reference number for follow-up tracking.
            </p>
          </div>
        </div>
      </div>

      {/* RTI vs Grievance Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-12">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
          RTI vs. Public Grievance: What Is The Difference?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          One of the biggest causes of citizen rejection is submitting the wrong request type to the wrong government authority.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grievance Column */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                GRIEVANCE (Action Seeking)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Purpose: Remedial Action</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Fixing potholes, road damage, non-functional streetlights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Restoring delayed pensions, water supply, or sanitation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Submitted to: Municipal Ward, State CM Helpline, or CPGRAMS</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-500">Cannot legally compel the release of certified contractor tenders</span>
              </li>
            </ul>
          </div>

          {/* RTI Column */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                RTI (Information Seeking)
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Purpose: Official Records</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>How much budget was allocated and spent for a road</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Which contractor received the tender and completion timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Submitted to: Public Information Officer (PIO) with Rs. 10 statutory fee</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="text-slate-500">PIO cannot order road repair or perform civil works</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why Mixed Requests Need Scribing */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 leading-relaxed">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
            <Split className="w-4 h-4" />
            <span>Why Mixed Requests Fail in Single Government Portals</span>
          </div>
          If you file an RTI saying <em>&ldquo;Repair my road immediately and tell me the contractor's name&rdquo;</em>, the PIO may reject the application stating that RTI does not redress grievances. Similarly, if you submit to a grievance cell asking for budget files, it gets forwarded without statutory disclosure deadlines. Grievance Scribe splits these into dual targeted filings.
        </div>
      </div>

      {/* Fact Grounding & Anti-Hallucination Guarantee */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Strict Fact-Grounding &amp; Non-Fabrication Standard
            </h3>
            <p className="text-xs text-slate-500">
              Responsible AI engineering for legal and administrative accuracy.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Grievance Scribe is strictly instructed never to fabricate names, dates, amounts, rupee figures, ward numbers, or official departments. If a detail was not provided in your problem description, it will be marked as &ldquo;Not provided&rdquo; or flagged in the Missing Information checklist. The citizen always maintains full review and editing control over every draft.
        </p>
      </div>

      {/* CTA Bottom Banner */}
      <div className="text-center py-6">
        <button
          type="button"
          onClick={onStartAnalysis}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          <span>Start Analyzing Your Problem</span>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </div>
  );
};
