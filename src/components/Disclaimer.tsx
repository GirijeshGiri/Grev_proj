import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const Disclaimer: React.FC = () => {
  return (
    <footer id="grievance-scribe-disclaimer" className="mt-16 border-t border-slate-200 bg-slate-100/70 py-6 px-4 no-print">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
        <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed">
          <p className="font-semibold text-slate-700">
            Civic Technology &amp; Procedural Notice:
          </p>
          <p className="mt-0.5">
            Grievance Scribe provides AI-assisted drafting and organization. Review all generated information before submission. The relevant government authority determines applicable procedures, requirements, and acceptance. Grievance Scribe is an independent civic utility and is not an official government entity, court, or legal counsel.
          </p>
        </div>
      </div>
    </footer>
  );
};
