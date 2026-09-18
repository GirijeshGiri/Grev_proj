import React, { useState } from 'react';
import { Copy, Check, Printer, Download, Edit3, Eye, FileText, AlertCircle, Sparkles, Building, UserCheck } from 'lucide-react';
import { RequestType, CitizenDetails } from '../types';

interface ApplicationPreviewProps {
  requestType: RequestType;
  grievanceDraft: string | null;
  rtiDraft: string | null;
  onUpdateGrievanceDraft: (text: string) => void;
  onUpdateRtiDraft: (text: string) => void;
  citizenDetails: CitizenDetails;
  onUpdateCitizenDetails: (details: Partial<CitizenDetails>) => void;
  questions: string[];
}

export const ApplicationPreview: React.FC<ApplicationPreviewProps> = ({
  requestType,
  grievanceDraft,
  rtiDraft,
  onUpdateGrievanceDraft,
  onUpdateRtiDraft,
  citizenDetails,
  onUpdateCitizenDetails,
  questions,
}) => {
  const [activeTab, setActiveTab] = useState<'grievance' | 'rti'>(
    requestType === 'RTI' ? 'rti' : 'grievance'
  );
  const [isEditingGrievance, setIsEditingGrievance] = useState(false);
  const [isEditingRti, setIsEditingRti] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute live synthesized RTI draft incorporating user's citizenDetails if provided
  const getRenderedRti = (): string => {
    if (!rtiDraft) return '';
    let content = rtiDraft;
    
    // Replace placeholder tokens if filled
    if (citizenDetails.authorityName) {
      content = content.replace(/\[Name of public authority \/ office[^\]]*\]/g, citizenDetails.authorityName);
    }
    if (citizenDetails.authorityAddress) {
      content = content.replace(/\[Full address\]/g, citizenDetails.authorityAddress);
    }
    if (citizenDetails.name) {
      content = content.replace(/Name:\s*_{3,}/g, `Name: ${citizenDetails.name}`);
    }
    if (citizenDetails.address) {
      content = content.replace(/Address:\s*_{3,}/g, `Address: ${citizenDetails.address}`);
    }
    if (citizenDetails.phoneEmail) {
      content = content.replace(/Phone\/Email:\s*_{3,}/g, `Phone/Email: ${citizenDetails.phoneEmail}`);
    }
    if (citizenDetails.date || citizenDetails.place) {
      const dStr = citizenDetails.date || '__________';
      const pStr = citizenDetails.place || '__________';
      content = content.replace(/Date:\s*_{3,}\s*Place:\s*_{3,}/g, `Date: ${dStr}   Place: ${pStr}`);
    }
    if (citizenDetails.paymentMethod) {
      content = content.replace(/\[payment method\/reference, as applicable\]/g, citizenDetails.paymentMethod);
    }
    return content;
  };

  // Compute live synthesized Grievance draft
  const getRenderedGrievance = (): string => {
    if (!grievanceDraft) return '';
    let content = grievanceDraft;
    
    if (citizenDetails.authorityName) {
      content = content.replace(/\[Authority not specified[^\]]*\]/g, citizenDetails.authorityName);
    }
    if (citizenDetails.name) {
      content = content.replace(/Name:\s*_{3,}/g, `Name: ${citizenDetails.name}`);
    }
    if (citizenDetails.address) {
      content = content.replace(/Address:\s*_{3,}/g, `Address: ${citizenDetails.address}`);
    }
    if (citizenDetails.phoneEmail) {
      content = content.replace(/Phone\/Email:\s*_{3,}/g, `Phone/Email: ${citizenDetails.phoneEmail}`);
    }
    if (citizenDetails.date || citizenDetails.place) {
      const dStr = citizenDetails.date || '__________';
      const pStr = citizenDetails.place || '__________';
      content = content.replace(/Date:\s*_{3,}\s*Place:\s*_{3,}/g, `Date: ${dStr}   Place: ${pStr}`);
    }
    return content;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = (text: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="application-preview-container" className="space-y-6">
      {/* Citizen Personalization Quick Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs no-print">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Citizen &amp; Authority Details (Appears on Document)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Optional live filler</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Your Full Name:</label>
            <input
              type="text"
              value={citizenDetails.name}
              onChange={(e) => onUpdateCitizenDetails({ name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone/Email:</label>
            <input
              type="text"
              value={citizenDetails.phoneEmail}
              onChange={(e) => onUpdateCitizenDetails({ phoneEmail: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Postal Address:</label>
            <input
              type="text"
              value={citizenDetails.address}
              onChange={(e) => onUpdateCitizenDetails({ address: e.target.value })}
              placeholder="e.g. Flat 302, Green Enclave, City"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Public Authority / Office:</label>
            <input
              type="text"
              value={citizenDetails.authorityName}
              onChange={(e) => onUpdateCitizenDetails({ authorityName: e.target.value })}
              placeholder="e.g. Executive Engineer, PWD Ward 14"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Mixed Request Guidance Banner */}
      {requestType === 'MIXED' && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 text-xs sm:text-sm no-print">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Mixed Request — Two Separate Applications Required
              </p>
              <p className="mt-1 leading-relaxed text-amber-900">
                This request contains both a request for corrective action and a request for information. In administrative practice, government portals reject combined submissions:
              </p>
              <ul className="list-disc ml-5 mt-1 space-y-0.5 text-xs text-amber-950 font-medium">
                <li>Submit the <strong>Grievance Component</strong> to the Municipal / Civic Grievance Cell or portal (e.g. CPGRAMS).</li>
                <li>Submit the <strong>RTI Component</strong> to the Public Information Officer (PIO) with the statutory Rs. 10/- application fee.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tabs for Mixed or single view */}
      {requestType === 'MIXED' && (
        <div className="flex border-b border-slate-200 no-print">
          <button
            type="button"
            onClick={() => setActiveTab('grievance')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'grievance'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Grievance Component (Corrective Action)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rti')}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'rti'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. RTI Component (Information Request)
          </button>
        </div>
      )}

      {/* RENDER ACTIVE DOCUMENT */}
      {((requestType === 'GRIEVANCE') || (requestType === 'MIXED' && activeTab === 'grievance')) && (
        <div id="preview-grievance-document" className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden print-page">
          {/* Action Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Formal Grievance Petition
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                For administrative portals or direct submission
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingGrievance(!isEditingGrievance)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditingGrievance ? 'View Document' : 'Edit Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(getRenderedGrievance(), 'grievance')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                {copiedKey === 'grievance' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTxt(getRenderedGrievance(), 'formal-grievance-petition.txt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Document Content View */}
          <div className="p-6 sm:p-10 text-slate-900 font-serif-doc bg-white min-h-[500px]">
            {isEditingGrievance ? (
              <textarea
                rows={18}
                value={grievanceDraft || ''}
                onChange={(e) => onUpdateGrievanceDraft(e.target.value)}
                className="w-full p-4 font-mono-code text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500 leading-relaxed text-slate-800 bg-slate-50/50"
              />
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base selection:bg-amber-100">
                {getRenderedGrievance()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* RTI DOCUMENT */}
      {((requestType === 'RTI') || (requestType === 'MIXED' && activeTab === 'rti')) && (
        <div id="preview-rti-document" className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden print-page">
          {/* Action Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                Standard RTI Application — Section 6(1)
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Under Right to Information Act, 2005
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingRti(!isEditingRti)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditingRti ? 'View Document' : 'Edit Text'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(getRenderedRti(), 'rti')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                {copiedKey === 'rti' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownloadTxt(getRenderedRti(), 'standard-rti-application.txt')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>

          {/* Legal Notice Note */}
          <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 text-xs text-blue-900 no-print flex items-center justify-between">
            <span>
              ℹ️ Standard Section 6(1) structure. Applicable state rules may prescribe additional forms or fee payment modes (IPO, Court Fee, Online Portal).
            </span>
          </div>

          {/* Document Content View */}
          <div className="p-6 sm:p-10 text-slate-900 font-serif-doc bg-white min-h-[500px]">
            {isEditingRti ? (
              <textarea
                rows={18}
                value={rtiDraft || ''}
                onChange={(e) => onUpdateRtiDraft(e.target.value)}
                className="w-full p-4 font-mono-code text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:border-indigo-500 leading-relaxed text-slate-800 bg-slate-50/50"
              />
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base selection:bg-blue-100">
                {getRenderedRti()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
