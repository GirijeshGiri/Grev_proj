import React from 'react';
import { X, HelpCircle, ArrowRight, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              How Grievance Scribe Works
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Understanding the critical difference between an RTI and a Grievance
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Real World Example */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              The Real-World Dilemma:
            </h4>
            <p className="italic text-slate-800 text-xs sm:text-sm mb-3">
              &ldquo;My street road has been damaged for six months. Nobody is repairing it. I also want to know how much money was allocated for the repair and which contractor got the work.&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block mb-1">GRIEVANCE INTENT:</span>
                Demanding physical repair and resurfacing of the damaged street.
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-950">
                <span className="font-bold block mb-1">RTI INTENT:</span>
                Demanding records of sanctioned funds, contractor identity, and tenders.
              </div>
            </div>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-sm mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>RTI (Right to Information)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-blue-950">
                <li>• Governed by <strong>RTI Act, 2005</strong>.</li>
                <li>• Addressed to <strong>Public Information Officer (PIO)</strong>.</li>
                <li>• Statutorily for <strong>existing records, files &amp; accounts</strong> only.</li>
                <li>• Statutory fee: Rs. 10/- (State rules vary).</li>
                <li>• <em>Cannot</em> demand physical work or asking &ldquo;Why&rdquo;.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Grievance (Public Grievance)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-950">
                <li>• Handled by <strong>CPGRAMS / Municipal Grievance cells</strong>.</li>
                <li>• Addressed to <strong>Competent Executive / Ward Officer</strong>.</li>
                <li>• Statutorily for <strong>action, repair, &amp; service delivery</strong>.</li>
                <li>• Free to lodge on public portals.</li>
                <li>• <em>Cannot</em> be used as a substitute for RTI queries.</li>
              </ul>
            </div>
          </div>

          {/* Why Separation is Vital */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-950">
                <span className="font-bold block mb-1">Why combining them leads to rejection:</span>
                If you ask a Public Information Officer to repair a road, they will legitimately reject your RTI because PIOs have no legal authority to perform civil works. Conversely, civic grievance portals will close tickets asking for audited ledger copies. Grievance Scribe splits mixed submissions so each component succeeds.
              </div>
            </div>
          </div>

          {/* Footer Close */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Got it, Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
