import React from 'react';
import { CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { ExtractedFact } from '../types';

interface FactExtractionCardProps {
  facts: ExtractedFact[];
}

export const FactExtractionCard: React.FC<FactExtractionCardProps> = ({ facts }) => {
  return (
    <div id="card-extracted-facts" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Extracted Facts
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified User Facts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict No-Hallucination Policy: Contains exclusively details provided in your input.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 text-slate-700 font-semibold">
            <tr>
              <th scope="col" className="px-4 py-3 w-1/3">
                Attribute / Field
              </th>
              <th scope="col" className="px-4 py-3">
                Extracted Substance
              </th>
              <th scope="col" className="px-4 py-3 w-28 text-right hidden sm:table-cell">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {facts && facts.length > 0 ? (
              facts.map((fact, index) => (
                <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800 align-top">
                    {fact.field}
                  </td>
                  <td className="px-4 py-3 text-slate-700 leading-relaxed align-top">
                    {fact.value || <span className="text-slate-400 italic">Not provided</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500 align-top hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      citizen
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-400 italic">
                  No explicit facts identified.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
