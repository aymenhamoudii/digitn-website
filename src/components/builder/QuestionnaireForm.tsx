'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [customInput, setCustomInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastQuestion = currentStep === questions.length - 1;
  const currentAnswer = answers[currentQuestion?.id];

  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setCustomInput('');
  };

  const handleMultiSelect = (value: string) => {
    setAnswers(prev => {
      const current = (prev[currentQuestion.id] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [currentQuestion.id]: current.filter(v => v !== value) };
      }
      return { ...prev, [currentQuestion.id]: [...current, value] };
    });
  };

  const handleNext = () => {
    const ans = answers[currentQuestion.id];

    // Validation
    if (!ans || (Array.isArray(ans) && ans.length === 0)) {
      toast.error('Please select an option');
      return;
    }

    // If "other" is selected and custom input is empty
    if (ans === 'other' && !customInput.trim()) {
      toast.error('Please specify your custom answer');
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
      setCustomInput('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setCustomInput('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Format answers
    let formattedAnswers = '';
    questions.forEach((q, idx) => {
      if (idx > currentStep) return; // Only include answered questions

      const ans = answers[q.id];
      let answerText = '';

      if (Array.isArray(ans)) {
        answerText = ans.map(a => a === 'other' ? customInput : a).join(', ');
      } else {
        answerText = ans === 'other' ? customInput : (ans as string);
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

  if (!currentQuestion) {
    return null;
  }

  const isAnswered = currentAnswer && (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-sm text-[var(--text-secondary)]">
            {Math.round(((currentStep + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[var(--card-bg)] p-8 rounded-xl border border-[var(--border)] min-h-[400px] flex flex-col">
        <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-6">
          {currentQuestion.text}
        </h2>

        <div className="space-y-3 flex-1">
          {currentQuestion.options.map(opt => (
            <label
              key={opt.value}
              className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all
                ${(currentQuestion.type === 'single'
                  ? currentAnswer === opt.value
                  : Array.isArray(currentAnswer) && currentAnswer.includes(opt.value))
                  ? 'border-[var(--accent)] bg-[var(--bg-secondary)] shadow-sm'
                  : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'
                }
              `}
            >
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                  name={currentQuestion.id}
                  value={opt.value}
                  className="w-4 h-4 text-[var(--accent)] bg-transparent border-[var(--border)] focus:ring-[var(--accent)]"
                  checked={currentQuestion.type === 'single'
                    ? currentAnswer === opt.value
                    : Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)
                  }
                  onChange={() => currentQuestion.type === 'single'
                    ? handleSingleSelect(opt.value)
                    : handleMultiSelect(opt.value)
                  }
                />
              </div>
              <div className="ml-3 text-sm">
                <span className="text-[var(--text-primary)]">{opt.label}</span>
              </div>
            </label>
          ))}

          {/* Always show "Something else" option */}
          <label
            className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all
              ${(currentQuestion.type === 'single'
                ? currentAnswer === 'other'
                : Array.isArray(currentAnswer) && currentAnswer.includes('other'))
                ? 'border-[var(--accent)] bg-[var(--bg-secondary)] shadow-sm'
                : 'border-[var(--border)] hover:border-[var(--text-tertiary)] bg-[var(--bg-primary)]'
              }
            `}
          >
            <div className="flex items-start">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                  name={currentQuestion.id}
                  value="other"
                  className="w-4 h-4 text-[var(--accent)]"
                  checked={currentQuestion.type === 'single'
                    ? currentAnswer === 'other'
                    : Array.isArray(currentAnswer) && currentAnswer.includes('other')
                  }
                  onChange={() => currentQuestion.type === 'single'
                    ? handleSingleSelect('other')
                    : handleMultiSelect('other')
                  }
                />
              </div>
              <div className="ml-3 text-sm flex-1">
                <span className="text-[var(--text-primary)]">Something else</span>
              </div>
            </div>

            {(currentQuestion.type === 'single'
              ? currentAnswer === 'other'
              : Array.isArray(currentAnswer) && currentAnswer.includes('other')) && (
              <input
                type="text"
                placeholder="Please specify..."
                className="mt-3 w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                autoFocus
              />
            )}
          </label>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--border)]">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiArrowLeft /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[#c26549] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Starting Build...' : isLastQuestion ? 'Start Building' : 'Next'}
            <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}