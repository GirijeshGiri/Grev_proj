import React, { useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Eye,
  Trash2,
  Edit2,
  Calendar,
  Hash,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { RequestStatus, RequestType, SavedRequest } from '../types';

interface MyRequestsPageProps {
  savedRequests: SavedRequest[];
  onUpdateRequest: (updated: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onViewRequest: (request: SavedRequest) => void;
  onCreateNew: () => void;
  onLoadSample: () => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({
  savedRequests,
  onUpdateRequest,
  onDeleteRequest,
  onViewRequest,
  onCreateNew,
  onLoadSample,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<RequestStatus>('Submitted');
  const [editRefNumber, setEditRefNumber] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const handleStartEdit = (req: SavedRequest) => {
    setEditingRequestId(req.id);
    setEditStatus(req.status);
    setEditRefNumber(req.reference_number || '');
    setEditNotes(req.notes || '');
  };

  const handleSaveEdit = (original: SavedRequest) => {
    const updated: SavedRequest = {
      ...original,
      status: editStatus,
      reference_number: editRefNumber.trim(),
      notes: editNotes.trim(),
      last_checked: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
      next_action_guidance:
        editStatus === 'Closed' || editStatus === 'Action Taken'
          ? 'Matter resolved on record. Archive if no further escalation needed.'
          : 'Check the official government tracking portal periodically for updates.',
    };

    onUpdateRequest(updated);
    setEditingRequestId(null);
  };

  // Filter requests
  const filtered = savedRequests.filter((req) => {
    // Type/Category filter
    if (filterType === 'RTI' && req.request_type !== 'RTI') return false;
    if (filterType === 'GRIEVANCE' && req.request_type !== 'GRIEVANCE') return false;
    if (filterType === 'MIXED' && req.request_type !== 'MIXED') return false;
    if (filterType === 'Active' && (req.status === 'Closed' || req.status === 'Action Taken')) return false;
    if (filterType === 'Closed' && req.status !== 'Closed' && req.status !== 'Action Taken') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchRef = (req.reference_number || '').toLowerCase().includes(q);
      const matchPortal = req.official_channel.name.toLowerCase().includes(q);
      const matchProblem = req.problem.toLowerCase().includes(q);
      return matchTitle || matchRef || matchPortal || matchProblem;
    }

    return true;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Under Process':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Action Taken':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'User Updated':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeBadge = (type: RequestType) => {
    switch (type) {
      case 'RTI':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'GRIEVANCE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'MIXED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div id="page-my-requests" className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Citizen Requests Tracker
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track official reference numbers, statuses, and follow-up timelines across government portals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create New Request</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['All', 'Active', 'RTI', 'GRIEVANCE', 'MIXED', 'Closed'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setFilterType(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === filter
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
              {filter === 'All' && ` (${savedRequests.length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, ID, portal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No saved requests found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            When you analyze a civic issue and generate an application draft, you can save your government registration number and track progress here.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Start New Analysis
            </button>
            <button
              type="button"
              onClick={onLoadSample}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
            >
              Load Sample Tracked Request
            </button>
          </div>
        </div>
      ) : (
        /* List of Saved Requests */
        <div className="space-y-4">
          {filtered.map((req) => {
            const isEditing = editingRequestId === req.id;

            return (
              <div
                key={req.id}
                id={`saved-req-${req.id}`}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs p-5 sm:p-6 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left content: Title, Type, Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${getTypeBadge(req.request_type)}`}>
                        {req.request_type}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getStatusBadge(req.status)}`}>
                        Status: {req.status}
                      </span>
                      {req.reference_number && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {req.reference_number}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {req.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.official_channel.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Submitted: {req.submission_date || 'Draft'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Last Checked: {req.last_checked}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 italic">
                        &ldquo;{req.notes}&rdquo;
                      </p>
                    )}

                    {/* Next Action Guidance Block (Feature 14 & 20) */}
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-indigo-950 block">Next Action Guidance:</span>
                        <span className="text-indigo-900 leading-relaxed">
                          {req.next_action_guidance || 'Check the official portal for status updates.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Action Buttons */}
                  <div className="shrink-0 flex flex-wrap lg:flex-col items-end gap-2 pt-2 lg:pt-0">
                    <a
                      href={req.official_channel.tracking_url || req.official_channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <span>Check Official Status</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onViewRequest(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Draft</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Update Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRequest(req.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete saved request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Edit Form if active */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/80 p-4 rounded-xl space-y-3 text-xs">
                    <span className="font-bold text-slate-900 block">
                      Update Registration Number &amp; Current Status:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Official Reference Number:
                        </label>
                        <input
                          type="text"
                          value={editRefNumber}
                          onChange={(e) => setEditRefNumber(e.target.value)}
                          placeholder="e.g. GRV-2026-10492"
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Updated Status:
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Under Process">Under Process</option>
                          <option value="Action Taken">Action Taken</option>
                          <option value="Closed">Closed</option>
                          <option value="User Updated">User Updated</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Follow-up Notes / Portal Remarks:
                      </label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Officer noted site inspection scheduled for Friday."
                        className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingRequestId(null)}
                        className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(req)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                      >
                        Save Updates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
