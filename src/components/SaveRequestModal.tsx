import React, { useState } from 'react';
import { X, BookmarkCheck, ExternalLink, Calendar, Hash, FileText } from 'lucide-react';
import { AIAnalysisResponse, OfficialChannel, RequestStatus, SavedRequest } from '../types';

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIAnalysisResponse;
  originalProblem: string;
  location?: string;
  duration?: string;
  previousComplaintNo?: string;
  onSaveSuccess: (request: SavedRequest) => void;
}

export const SaveRequestModal: React.FC<SaveRequestModalProps> = ({
  isOpen,
  onClose,
  analysis,
  originalProblem,
  location,
  duration,
  previousComplaintNo,
  onSaveSuccess,
}) => {
  if (!isOpen) return null;

  const defaultTitle = originalProblem.slice(0, 60) + (originalProblem.length > 60 ? '...' : '');

  const [title, setTitle] = useState(defaultTitle);
  const [referenceNumber, setReferenceNumber] = useState(previousComplaintNo || '');
  const [status, setStatus] = useState<RequestStatus>('Submitted');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newSavedRequest: SavedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim() || defaultTitle,
      request_type: analysis.request_type,
      problem: originalProblem,
      location,
      duration,
      previousComplaintNo,
      facts: analysis.facts,
      missing_information: analysis.missing_information,
      rti_questions: analysis.rti_questions,
      grievance_draft: analysis.grievance_draft,
      rti_draft: analysis.rti_draft,
      official_channel: analysis.recommended_channel.official_portal,
      reference_number: referenceNumber.trim(),
      submission_date: submissionDate,
      status,
      last_checked: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
      next_action_guidance:
        status === 'Submitted' || status === 'Under Process'
          ? 'Check the official government tracking portal after 15 to 30 days for updates or file movement.'
          : 'Request marked as resolved or updated.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Also persist to backend API
    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSavedRequest),
      });
    } catch (err) {
      console.warn('Backend persistence error, client local storage will still save:', err);
    }

    onSaveSuccess(newSavedRequest);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Save to My Requests Tracker
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Keep your reference number, status, and official portal handy
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Request Title / Short Label
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>Reference / Token ID</span>
              </label>
              <input
                type="text"
                placeholder="e.g. GRV-2026-98124"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Can be updated later once submitted
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Submission Date</span>
              </label>
              <input
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Current Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as RequestStatus)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="Draft">Draft (Not yet lodged)</option>
              <option value="Submitted">Submitted (Waiting initial acknowledgment)</option>
              <option value="Under Process">Under Process (Forwarded to officer)</option>
              <option value="Action Taken">Action Taken (Site inspection / work order)</option>
              <option value="Closed">Closed (Completed / Answered)</option>
              <option value="User Updated">User Updated (Appealed / Clarification given)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Personal Notes / Follow-up Reminders
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Junior Engineer promised site inspection by next Tuesday."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Target Official Channel: </span>
            {analysis.recommended_channel.official_portal.name}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save to Tracker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
