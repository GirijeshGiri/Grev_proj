import React from 'react';
import { ExternalLink, BookmarkPlus, CheckCircle2, Building2, ShieldAlert, ArrowRight, Info, Check } from 'lucide-react';
import { OfficialChannel, RequestType } from '../types';

interface OfficialChannelCardProps {
  channel: OfficialChannel;
  alternateChannels?: OfficialChannel[];
  requestType: RequestType;
  onSaveRequest: () => void;
  isSaved?: boolean;
}

export const OfficialChannelCard: React.FC<OfficialChannelCardProps> = ({
  channel,
  alternateChannels,
  requestType,
  onSaveRequest,
  isSaved = false,
}) => {
  return (
    <div id="card-official-channel-discovery" className="bg-white rounded-2xl border border-slate-300 shadow-xs p-5 sm:p-6 no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
              Official Channel Discovery
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Jurisdiction: {channel.jurisdiction}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Where to Submit Your {requestType} Request
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-save-request-trigger"
            onClick={onSaveRequest}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Saved to My Requests</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-indigo-600" />
                <span>Save to Track</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recommended Primary Portal Box */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 bg-indigo-50/20 mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <h4 className="text-base font-bold text-slate-900">
                {channel.name}
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {channel.purpose}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Capabilities:</span>
              {channel.supports.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium capitalize">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95"
            >
              <span>Open Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className="text-[11px] text-slate-400">
              Redirects to official government service
            </span>
          </div>
        </div>

        {/* Portal Instructions */}
        <div className="mt-3 pt-3 border-t border-indigo-100 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">Filing Instructions: </span>
          {channel.instructions}
        </div>
      </div>

      {/* Alternate Channels if available */}
      {alternateChannels && alternateChannels.length > 0 && (
        <div className="mb-5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Alternate or Supporting Government Channels:
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {alternateChannels.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">
                    {alt.name}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {alt.jurisdiction} • {alt.purpose.slice(0, 50)}...
                  </span>
                </div>
                <a
                  href={alt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                  title="Visit Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission Guidance Checklist (Feature 12) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Submission Guidance &amp; Next Action Protocol
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3 text-xs">
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>AI analysis completed</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Facts reviewed</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Missing info evaluated</span>
          </div>
          <div className="p-2 rounded bg-white border border-slate-200 text-slate-700 flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Draft reviewed &amp; verified</span>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-600">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Official Government Portal Notice:</strong> Grievance Scribe does not automatically submit on your behalf. Copy the generated application text from the preview tab, open the official portal above, and lodge your submission directly. Save your reference number to track progress in <em>My Requests</em>.
          </p>
        </div>
      </div>
    </div>
  );
};
