import React from 'react';
import {
  MessageSquare,
  Cpu,
  FileSpreadsheet,
  ShieldCheck,
  FileCheck,
  Compass,
} from 'lucide-react';

interface PipelineStepsVisualProps {
  currentStage?: number; // 1 to 6
}

export const PipelineStepsVisual: React.FC<PipelineStepsVisualProps> = ({ currentStage = 0 }) => {
  const steps = [
    {
      num: '1',
      title: 'Explain',
      desc: 'Citizen explains the issue in natural, everyday words.',
      icon: MessageSquare,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      num: '2',
      title: 'Classify',
      desc: 'Categorizes into RTI, Grievance, or Mixed request.',
      icon: Cpu,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      num: '3',
      title: 'Extract',
      desc: 'Extracts core issue, location, duration & prior reference.',
      icon: FileSpreadsheet,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      num: '4',
      title: 'Validate',
      desc: 'Flags missing details and guarantees zero fact fabrication.',
      icon: ShieldCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      num: '5',
      title: 'Structure',
      desc: 'Creates Section 6(1) questions and formal grievance draft.',
      icon: FileCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      num: '6',
      title: 'Navigate & Track',
      desc: 'Finds verified official portal & tracks reference numbers.',
      icon: Compass,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div id="pipeline-steps-container" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStage === idx + 1;
          const isPassed = currentStage > idx + 1;

          return (
            <div
              key={step.num}
              id={`pipeline-step-${step.num}`}
              className={`p-4 rounded-2xl border transition-all duration-150 bg-white ${
                isActive
                  ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : isPassed
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${step.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  0{step.num}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1">
                {step.title}
                {isPassed && <span className="text-emerald-600 text-xs font-bold">✓</span>}
              </h4>
              <p className="text-[11px] text-slate-600 leading-snug">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
