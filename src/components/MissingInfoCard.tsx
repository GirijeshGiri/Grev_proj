import React, { useState } from 'react';
import { AlertTriangle, Plus, Check, HelpCircle } from 'lucide-react';

interface MissingInfoCardProps {
  missingItems: string[];
  onAddInformation: (itemKey: string, value: string) => void;
  addedDetails: Record<string, string>;
}

export const MissingInfoCard: React.FC<MissingInfoCardProps> = ({
  missingItems,
  onAddInformation,
  addedDetails,
}) => {
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const handleStartAdd = (item: string) => {
    setActiveInput(item);
    setTempValue(addedDetails[item] || '');
  };

  const handleSave = (item: string) => {
    if (tempValue.trim()) {
      onAddInformation(item, tempValue.trim());
    }
    setActiveInput(null);
    setTempValue('');
  };

  if (!missingItems || missingItems.length === 0) {
    return (
      <div id="card-missing-info-empty" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>All primary context fields are provided.</span>
        </div>
      </div>
    );
  }

  return (
    <div id="card-missing-info" className="bg-white rounded-2xl border border-amber-200/90 shadow-xs p-5 sm:p-6 bg-amber-50/10">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Missing Information Detected
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {missingItems.length} Identified
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Government authorities often reject petitions lacking these specifics. Click to supply any missing items without re-typing your complaint.
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {missingItems.map((item, idx) => {
          const isAdded = Boolean(addedDetails[item]);
          const isEditing = activeInput === item;

          return (
            <div
              key={idx}
              id={`missing-item-${idx}`}
              className={`p-3 rounded-xl border transition-all ${
                isAdded
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : 'border-amber-200/80 bg-white hover:border-amber-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isAdded ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                      ✓
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                      !
                    </span>
                  )}
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                      {item}
                    </span>
                    {isAdded && (
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        Added: &ldquo;{addedDetails[item]}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Button / Action */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        placeholder={`Enter ${item.toLowerCase()}...`}
                        className="px-2.5 py-1 text-xs rounded border border-indigo-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(item);
                          if (e.key === 'Escape') setActiveInput(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSave(item)}
                        className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveInput(null)}
                        className="px-2 py-1 text-xs rounded bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartAdd(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                          : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/60'
                      }`}
                    >
                      {isAdded ? (
                        <span>Edit Added Detail</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add This Detail</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
