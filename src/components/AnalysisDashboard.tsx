import React, { useState } from 'react';
import { AIAnalysisResponse, CitizenDetails, RequestType, SavedRequest } from '../types';
import { FactExtractionCard } from './FactExtractionCard';
import { MissingInfoCard } from './MissingInfoCard';
import { RTIQuestionManager } from './RTIQuestionManager';
import { ApplicationPreview } from './ApplicationPreview';
import { RequestValidationCard } from './RequestValidationCard';
import { OfficialChannelCard } from './OfficialChannelCard';
import { SaveRequestModal } from './SaveRequestModal';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  RefreshCw,
  BookmarkPlus,
  Compass,
} from 'lucide-react';

interface AnalysisDashboardProps {
  analysis: AIAnalysisResponse;
  originalProblem: string;
  location?: string;
  duration?: string;
  previousComplaintNo?: string;
  onUpdateAnalysis: (updated: Partial<AIAnalysisResponse>) => void;
  onRestart: () => void;
  onSaveSuccess: (req: SavedRequest) => void;
  isSaved?: boolean;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  originalProblem,
  location,
  duration,
  previousComplaintNo,
  onUpdateAnalysis,
  onRestart,
  onSaveSuccess,
  isSaved = false,
}) => {
  const [activeViewTab, setActiveViewTab] = useState<'analysis' | 'preview'>('analysis');
  const [addedDetails, setAddedDetails] = useState<Record<string, string>>({});
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [citizenDetails, setCitizenDetails] = useState<CitizenDetails>({
    name: '',
    address: '',
    phoneEmail: '',
    date: new Date().toLocaleDateString('en-GB'),
    place: '',
    authorityName: '',
    authorityAddress: '',
    paymentMethod: 'Court Fee Stamp / Indian Postal Order / Online Portal',
  });

  const handleAddInformation = (itemKey: string, value: string) => {
    const updatedDetails = { ...addedDetails, [itemKey]: value };
    setAddedDetails(updatedDetails);

    // Also update facts
    const updatedFacts = [...analysis.facts, { field: itemKey, value: value, source: 'user_provided' as const }];

    // If authority was provided, update citizenDetails
    if (itemKey.toLowerCase().includes('authority') || itemKey.toLowerCase().includes('office')) {
      setCitizenDetails((prev) => ({ ...prev, authorityName: value }));
    }

    // Recalculate validation status: if key details added, upgrade readiness
    const updatedValidation = {
      ...analysis.validation,
      status: 'ready' as const,
      details_missing: analysis.validation.details_missing.filter(
        (m) => !m.toLowerCase().includes(itemKey.toLowerCase())
      ),
      readiness_message:
        'New information successfully integrated. Request is fact-grounded and ready for formal submission.',
    };

    onUpdateAnalysis({
      facts: updatedFacts,
      validation: updatedValidation,
    });
  };

  const handleUpdateQuestions = (newQuestions: string[]) => {
    onUpdateAnalysis({ rti_questions: newQuestions });

    // Sync RTI Draft with updated questions
    if (analysis.rti_draft) {
      const qBlock = newQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      const updatedDraft = analysis.rti_draft.replace(
        /(I request the following information under the RTI Act, 2005:[\s\S]*?)(I state that I am a citizen)/,
        `I request the following information under the RTI Act, 2005:\n\n${qBlock}\n\n$2`
      );
      onUpdateAnalysis({
        rti_questions: newQuestions,
        rti_draft: updatedDraft,
      });
    }
  };

  const handleRegenerateQuestions = () => {
    const baseProblemFact =
      analysis.facts.find(
        (f) =>
          f.field.toLowerCase().includes('problem') ||
          f.field.toLowerCase().includes('issue') ||
          f.field.toLowerCase().includes('subject')
      )?.value || originalProblem;

    const resetQuestions = [
      `Please provide the certified copy of the sanction order and total budget allocated for the works relating to: ${baseProblemFact.slice(0, 100) || 'the subject matter'}.`,
      `Please provide the current status of work execution and date-wise progress report as available on official record.`,
      `Please provide the name of the contractor/agency awarded this work and the stipulated date of completion.`,
      `Please provide the itemized expenditure incurred to date and copies of clearance vouchers as on record.`,
    ];
    handleUpdateQuestions(resetQuestions);
  };

  const badgeConfig: Record<
    RequestType,
    { label: string; bg: string; text: string; border: string; desc: string }
  > = {
    RTI: {
      label: 'RTI Application (Right to Information)',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-300',
      desc: 'Information-seeking request for existing official records, expenditures, and file movements under Section 6(1) of RTI Act 2005.',
    },
    GRIEVANCE: {
      label: 'Grievance Petition (Civic Redressal)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-300',
      desc: 'Action-seeking request demanding repair, maintenance, enforcement, or administrative correction of a real-world civic problem.',
    },
    MIXED: {
      label: 'Mixed Intent (Dual Component Request)',
      bg: 'bg-amber-50',
      text: 'text-amber-950',
      border: 'border-amber-300',
      desc: 'Contains both demand for physical corrective action and demand for official financial/administrative records. Must be pursued via dual targeted filings.',
    },
  };

  const currentBadge = badgeConfig[analysis.request_type] || badgeConfig.GRIEVANCE;

  // Determine if location exists
  const hasLocation = Boolean(
    location || analysis.facts.some((f) => f.field.toLowerCase().includes('location') && f.value !== 'Not provided')
  );

  const missingCount = analysis.missing_information.length - Object.keys(addedDetails).length;

  return (
    <div id="analysis-dashboard-root" className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Bar Navigation between Analysis vs Document Preview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 no-print">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
            Navigation Pipeline Output
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Issue Analysis &amp; Channel Navigator</span>
          </h2>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              id="tab-btn-analysis"
              onClick={() => setActiveViewTab('analysis')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeViewTab === 'analysis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 text-indigo-600" />
              <span>Analysis &amp; Validation</span>
            </button>
            <button
              type="button"
              id="tab-btn-preview"
              onClick={() => setActiveViewTab('preview')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeViewTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Draft &amp; Export</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 text-emerald-600" />
            <span>{isSaved ? 'Saved to Tracker ✓' : 'Save to Tracker'}</span>
          </button>
        </div>
      </div>

      {/* Main Request Classification Hero Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${currentBadge.border} ${currentBadge.bg} mb-8 shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Classified Request Type:
              </span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border bg-white ${currentBadge.text} ${currentBadge.border}`}>
                {analysis.request_type}
              </span>
              {analysis.confidence && (
                <span className="text-[11px] font-semibold text-slate-500 bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                  Confidence: {analysis.confidence}
                </span>
              )}
            </div>
            <h3 className={`text-xl sm:text-2xl font-black ${currentBadge.text} tracking-tight`}>
              {currentBadge.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-3xl leading-relaxed">
              {currentBadge.desc}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {activeViewTab === 'analysis' ? (
              <button
                type="button"
                id="btn-goto-preview"
                onClick={() => setActiveViewTab('preview')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <span>View Final Application</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-goto-analysis"
                onClick={() => setActiveViewTab('analysis')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Review Facts &amp; Validation</span>
              </button>
            )}
          </div>
        </div>

        {/* Why this classification card */}
        <div className="mt-4 pt-4 border-t border-slate-200/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Why this classification was assigned:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-white/80 p-3.5 rounded-xl border border-slate-200/70">
            {analysis.reason}
          </p>
        </div>
      </div>

      {/* TAB 1: AI ANALYSIS & FACTS */}
      {activeViewTab === 'analysis' && (
        <div className="space-y-6">
          {/* Request Readiness & Administrative Validation Card */}
          <RequestValidationCard
            validation={analysis.validation}
            hasLocation={hasLocation}
            missingCount={missingCount > 0 ? missingCount : 0}
          />

          {/* Fact Extraction Card */}
          <FactExtractionCard facts={analysis.facts} />

          {/* Missing Information Detection Card */}
          <MissingInfoCard
            missingItems={analysis.missing_information}
            onAddInformation={handleAddInformation}
            addedDetails={addedDetails}
          />

          {/* RTI Question Management (if RTI or MIXED) */}
          {(analysis.request_type === 'RTI' || analysis.request_type === 'MIXED') && (
            <RTIQuestionManager
              questions={analysis.rti_questions}
              onChangeQuestions={handleUpdateQuestions}
              onRegenerate={handleRegenerateQuestions}
            />
          )}

          {/* Official Channel Discovery Card */}
          <OfficialChannelCard
            channel={analysis.recommended_channel.official_portal}
            alternateChannels={analysis.recommended_channel.alternate_portals}
            requestType={analysis.request_type}
            onSaveRequest={() => setIsSaveModalOpen(true)}
            isSaved={isSaved}
          />

          {/* Warnings and Procedural Guidance */}
          {analysis.warnings && analysis.warnings.length > 0 && (
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Procedural Advisory &amp; Statutory Notes
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {analysis.warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Navigation CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Start over with a different problem
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Save to My Requests
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <span>Proceed to Application Draft</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATION PREVIEW & DOCUMENT DRAFT */}
      {activeViewTab === 'preview' && (
        <div className="space-y-8">
          <ApplicationPreview
            requestType={analysis.request_type}
            grievanceDraft={analysis.grievance_draft}
            rtiDraft={analysis.rti_draft}
            onUpdateGrievanceDraft={(txt) => onUpdateAnalysis({ grievance_draft: txt })}
            onUpdateRtiDraft={(txt) => onUpdateAnalysis({ rti_draft: txt })}
            citizenDetails={citizenDetails}
            onUpdateCitizenDetails={(det) => setCitizenDetails((prev) => ({ ...prev, ...det }))}
            questions={analysis.rti_questions}
          />

          {/* Submission and Official Channel Guidance on Preview Tab */}
          <OfficialChannelCard
            channel={analysis.recommended_channel.official_portal}
            alternateChannels={analysis.recommended_channel.alternate_portals}
            requestType={analysis.request_type}
            onSaveRequest={() => setIsSaveModalOpen(true)}
            isSaved={isSaved}
          />
        </div>
      )}

      {/* Save to My Requests Modal */}
      <SaveRequestModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        analysis={analysis}
        originalProblem={originalProblem}
        location={location}
        duration={duration}
        previousComplaintNo={previousComplaintNo}
        onSaveSuccess={(req) => {
          onSaveSuccess(req);
        }}
      />
    </div>
  );
};
