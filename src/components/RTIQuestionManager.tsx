import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, RotateCcw, HelpCircle, FileQuestion, Sparkles } from 'lucide-react';

interface RTIQuestionManagerProps {
  questions: string[];
  onChangeQuestions: (newQuestions: string[]) => void;
  onRegenerate: () => void;
}

export const RTIQuestionManager: React.FC<RTIQuestionManagerProps> = ({
  questions,
  onChangeQuestions,
  onRegenerate,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(questions[index]);
  };

  const saveEdit = (index: number) => {
    if (editText.trim()) {
      const updated = [...questions];
      updated[index] = editText.trim();
      onChangeQuestions(updated);
    }
    setEditingIndex(null);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    onChangeQuestions(updated);
  };

  const addQuestion = () => {
    if (newQuestionText.trim()) {
      onChangeQuestions([...questions, newQuestionText.trim()]);
      setNewQuestionText('');
      setShowAddForm(false);
    }
  };

  const applyTemplate = (template: string) => {
    setNewQuestionText(template);
    setShowAddForm(true);
  };

  const templates = [
    'Please provide the current status of the matter as available on official record.',
    'Please provide a certified copy of the sanction order / work order issued for this work.',
    'Please provide the date-wise movement of the file and action taken report from receipt to date.',
    'Please provide the total expenditure incurred and payment clearance details on record.',
    'Please provide the applicable time limit prescribed under departmental service charter for resolution.',
  ];

  return (
    <div id="card-rti-questions-manager" className="bg-white rounded-2xl border border-blue-200/90 shadow-xs p-5 sm:p-6 bg-blue-50/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-4 h-4 text-blue-600" />
              RTI Section 6(1) Information Questions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {questions.length} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formulated as verifiable administrative record requests rather than subjective grievances.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            id="btn-add-rti-question"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
          <button
            type="button"
            id="btn-regenerate-rti-questions"
            onClick={onRegenerate}
            title="Restore original questions"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Formulations */}
      <div className="mb-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1 mb-1.5">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Standard RTI Record Formulations (Click to insert):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="text-[11px] text-left px-2 py-1 rounded bg-white hover:bg-blue-100/70 border border-blue-200/80 text-blue-900 transition-colors cursor-pointer"
            >
              + &ldquo;{tpl.slice(0, 45)}...&rdquo;
            </button>
          ))}
        </div>
      </div>

      {/* Add question box */}
      {showAddForm && (
        <div className="mb-4 p-3.5 rounded-xl bg-white border-2 border-blue-400 shadow-xs">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            New Record Inquiry Formulation:
          </label>
          <textarea
            rows={2}
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Please provide a certified copy of..."
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-500 mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addQuestion}
              disabled={!newQuestionText.trim()}
              className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            >
              Append Question
            </button>
          </div>
        </div>
      )}

      {/* List of Questions */}
      <div className="space-y-2.5">
        {questions.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 italic">
            No RTI questions currently drafted. Click &ldquo;Add Question&rdquo; to insert one.
          </div>
        ) : (
          questions.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
              <div
                key={idx}
                id={`rti-question-item-${idx}`}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-2xs group"
              >
                {isEditing ? (
                  <div>
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full text-xs sm:text-sm p-2 rounded-lg border border-blue-400 focus:outline-hidden mb-2"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="px-2.5 py-1 text-xs rounded text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(idx)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                        {q}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => startEdit(idx)}
                        title="Edit question"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(idx)}
                        title="Delete question"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
