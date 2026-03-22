'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Option {
  value: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: Option[];
  allowCustom?: boolean;
}

export default function QuestionnaireForm({
  projectId,
  questions
}: {
  projectId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, value: string) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter(v => v !== value) };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
  };

  const onSubmit = async () => {
    // Basic validation: ensure all questions are answered
    for (const q of questions) {
      const ans = answers[q.id];
      if (!ans || (Array.isArray(ans) && ans.length === 0)) {
         toast.error(`Please answer: ${q.text}`);
         return;
      }
    }

    setIsSubmitting(true);

    // Format answers
    let formattedAnswers = '';
    questions.forEach(q => {
      const ans = answers[q.id];
      let answerText = '';
      if (Array.isArray(ans)) {
         answerText = ans.join(', ');
      } else {
         answerText = ans as string;
         if (ans === 'custom') {
             answerText = customInputs[q.id] || 'Other';
         }
      }
      formattedAnswers += `Q: ${q.text}\nA: ${answerText}\n\n`;
    });

    try {
      const res = await fetch('/api/builder/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          answers: formattedAnswers.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start build');
      }

      router.push(`/app/builder/terminal/${projectId}`);
    } catch (err: any) {
      toast.error(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-serif text-[var(--text-primary)] mb-2">Let's clarify a few details</h1>
        <p className="text-[var(--text-secondary)]">
          Your description was great, but DIGITN AI needs a bit more context to build exactly what you want.
        </p>
      </div>

      <div className="space-y-10">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="font-medium text-[var(--text-primary)] mb-4 text-lg">
              <span className="text-[var(--accent)] mr-2">{index + 1}.</span> {q.text}
            </h3>

            <div className="space-y-3">
              {q.options.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${(q.type === 'single' ? answers[q.id] === opt.value : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.value))
                      ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'
                    }
                  `}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={q.id}
                      value={opt.value}
                      className="w-4 h-4 text-[var(--accent)] bg-transparent border-[var(--border)] focus:ring-[var(--accent)]"
                      checked={q.type === 'single'
                        ? answers[q.id] === opt.value
                        : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt.value)
                      }
                      onChange={() => q.type === 'single'
                        ? handleSingleSelect(q.id, opt.value)
                        : handleMultiSelect(q.id, opt.value)
                      }
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <span className="text-[var(--text-primary)]">{opt.label}</span>
                  </div>
                </label>
              ))}

              {q.allowCustom && (
                 <label className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors
                    ${(q.type === 'single' ? answers[q.id] === 'custom' : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes('custom'))
                      ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
                      : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'}
                 `}>
                    <div className="flex items-center h-5 mt-0.5">
                    <input
                      type={q.type === 'single' ? 'radio' : 'checkbox'}
                      name={q.id}
                      value="custom"
                      className="w-4 h-4 text-[var(--accent)]"
                      checked={q.type === 'single'
                        ? answers[q.id] === 'custom'
                        : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes('custom')}
                      onChange={() => q.type === 'single'
                        ? handleSingleSelect(q.id, 'custom')
                        : handleMultiSelect(q.id, 'custom')}
                    />
                  </div>
                  <div className="ml-3 text-sm w-full">
                    <span className="text-[var(--text-primary)] block mb-2">Something else</span>
                    {(q.type === 'single' ? answers[q.id] === 'custom' : Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes('custom')) && (
                        <input
                          type="text"
                          placeholder="Please specify..."
                          className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                          value={customInputs[q.id] || ''}
                          onChange={(e) => setCustomInputs(prev => ({...prev, [q.id]: e.target.value}))}
                        />
                    )}
                  </div>
                 </label>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[#c26549] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Starting Build...' : 'Start Building'} <FiArrowRight />
        </button>
      </div>
    </div>
  );
}