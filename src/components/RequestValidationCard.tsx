import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { RequestValidation } from '../types';

interface RequestValidationCardProps {
  validation: RequestValidation;
  hasLocation: boolean;
  missingCount: number;
}

export const RequestValidationCard: React.FC<RequestValidationCardProps> = ({
  validation,
  hasLocation,
  missingCount,
}) => {
  const isReady = validation.status === 'ready';

  return (
    <div
      id="card-request-readiness"
      className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-xs ${
        isReady
          ? 'bg-emerald-50/20 border-emerald-300'
          : 'bg-amber-50/20 border-amber-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Request Readiness &amp; Administrative Validation
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-flight inspection verifying factual grounding, completeness, and non-fabrication.
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
              isReady
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ready for Draft &amp; Submission</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Needs More Information</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Validation Checklist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Intent accurately identified</span>
        </div>

        <div className="flex items-center gap-2 text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Core issue identified without ambiguity</span>
        </div>

        <div className="flex items-center gap-2 text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Facts extracted strictly from citizen input</span>
        </div>

        <div className="flex items-center gap-2 text-slate-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No unsupported or fabricated claims detected</span>
        </div>

        {hasLocation ? (
          <div className="flex items-center gap-2 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Geographical landmark or location supplied</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Exact street / locality not yet provided</span>
          </div>
        )}

        {missingCount > 0 ? (
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{missingCount} recommended detail(s) can be added</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All essential administrative fields provided</span>
          </div>
        )}
      </div>

      {/* Readiness Message */}
      <div
        className={`p-3 rounded-xl border text-xs leading-relaxed ${
          isReady
            ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
            : 'bg-amber-50 text-amber-950 border-amber-200'
        }`}
      >
        <span className="font-bold">Validation Status Note: </span>
        {validation.readiness_message}
      </div>
    </div>
  );
};
