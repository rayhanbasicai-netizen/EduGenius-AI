import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  CheckCircle2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { STUDENT_LEVELS } from '../constants/aiConfig.ts';
import { LEVEL_LABELS, TRANSLATIONS } from '../i18n/translations.ts';
import { generateQuizQuestions } from '../services/geminiClient.ts';
import type {
  AppSettings,
  QuizDifficulty,
  QuizQuestion,
  StudentLevel,
} from '../types/index.ts';

interface QuizViewProps {
  settings: AppSettings;
  preselectedLevel?: StudentLevel;
}

type OptionKey = 'A' | 'B' | 'C' | 'D';

export function QuizView({ settings, preselectedLevel }: QuizViewProps) {
  const t = TRANSLATIONS[settings.language];
  const levelLabels = LEVEL_LABELS[settings.language];

  // Setup state
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<StudentLevel>(preselectedLevel || settings.defaultLevel);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('Medium');
  const [count, setCount] = useState<number>(5);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generation & player state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (preselectedLevel) {
      setLevel(preselectedLevel);
    }
  }, [preselectedLevel]);

  const startGeneration = async () => {
    setError(null);
    if (!topic.trim()) {
      setValidationError(t.quiz.topicEmptyError);
      return;
    }
    setValidationError(null);
    setLoading(true);

    try {
      const data = await generateQuizQuestions({
        topic: topic.trim(),
        difficulty,
        count,
        level,
        settings,
      });
      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsFinished(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.quiz.malformedError);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void startGeneration();
  };

  const handleSelectOption = (optionKey: OptionKey) => {
    if (selectedAnswers[currentIndex]) return; // Locked once selected
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionKey,
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReattempt = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsFinished(false);
  };

  const handleNewQuiz = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);
    setError(null);
  };

  const score = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // View 1: Setup Screen
  if (questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            {t.quiz.title}
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
            {t.quiz.subtitle}
          </p>
        </div>

        <form
          onSubmit={handleSetupSubmit}
          noValidate
          className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
        >
          {/* Academic Level */}
          <div>
            <label
              htmlFor="quiz-level"
              className="block text-sm font-semibold text-[#1E1B4B] mb-2"
            >
              {t.study.levelLabel}
            </label>
            <select
              id="quiz-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as StudentLevel)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
            >
              {STUDENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {levelLabels[lvl]}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Input */}
          <div>
            <label
              htmlFor="quiz-topic"
              className="block text-sm font-semibold text-[#1E1B4B] mb-2"
            >
              {t.quiz.topicLabel}
            </label>
            <input
              id="quiz-topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={t.quiz.topicPlaceholder}
              className={`w-full rounded-xl border px-3.5 py-3 text-sm text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4338CA] ${
                validationError ? 'border-red-500 bg-red-50/40' : 'border-slate-300 bg-white'
              }`}
            />
            {validationError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="block text-sm font-semibold text-[#1E1B4B] mb-2">
                {t.quiz.difficultyLabel}
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl" role="radiogroup">
                {(['Easy', 'Medium', 'Hard'] as QuizDifficulty[]).map((diff) => {
                  const active = difficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-white text-[#4338CA] shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-[#1E1B4B]'
                      }`}
                    >
                      {t.quiz.difficulties[diff]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="quiz-count"
                className="block text-sm font-semibold text-[#1E1B4B] mb-2"
              >
                {t.quiz.countLabel}
              </label>
              <select
                id="quiz-count"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1E1B4B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
              >
                {[5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => void startGeneration()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.quiz.retryBtn}</span>
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t.quiz.generatingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{t.quiz.generateBtn}</span>
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // View 2: Final Score Screen
  if (isFinished) {
    const motivationText =
      percentage >= 80
        ? t.quiz.motivation.high
        : percentage >= 50
          ? t.quiz.motivation.mid
          : t.quiz.motivation.low;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        <div className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
            {t.quiz.resultTitle}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {topic} · {levelLabels[level]} · {t.quiz.difficulties[difficulty]}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4">
              <p className="text-xs text-slate-500">{t.quiz.scoreLabel}</p>
              <p className="font-display text-2xl font-bold text-[#1E1B4B] tabular-nums mt-1">
                {score} / {questions.length}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200 p-4">
              <p className="text-xs text-slate-500">{t.quiz.accuracyLabel}</p>
              <p className="font-display text-2xl font-bold text-[#10B981] tabular-nums mt-1">
                {percentage}%
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm sm:text-base text-slate-700 max-w-lg mx-auto leading-relaxed">
            {motivationText}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReattempt}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1E1B4B] font-semibold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{t.quiz.reattemptBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleNewQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] text-white font-semibold text-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>{t.quiz.newQuizBtn}</span>
            </button>
          </div>
        </div>

        {/* Review All Questions */}
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-[#1E1B4B]">
            {t.quiz.reviewTitle}
          </h2>
          {questions.map((q, idx) => {
            const chosen = selectedAnswers[idx];
            const isCorrect = chosen === q.correctAnswer;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-[#1E1B4B] text-sm sm:text-base">
                    <span className="tabular-nums mr-2">{idx + 1}.</span>
                    {q.question}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                      isCorrect ? 'text-[#10B981]' : 'text-red-600'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{isCorrect ? t.quiz.correctLabel : t.quiz.wrongLabel}</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  <strong className="text-[#10B981]">
                    {q.correctAnswer}: {q.options[q.correctAnswer]}
                  </strong>
                  {!isCorrect && chosen && (
                    <span className="text-red-600 ml-3">
                      ({chosen}: {q.options[chosen]})
                    </span>
                  )}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200/70 leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // View 3: Active Question Player
  const currentQ = questions[currentIndex];
  const chosenOption = selectedAnswers[currentIndex];
  const isAnswered = Boolean(chosenOption);
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Top Progress Header */}
      <div className="mb-6 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#1E1B4B] tabular-nums">
            {t.quiz.questionProgress} {currentIndex + 1} {t.quiz.of} {questions.length}
          </span>
          <span className="text-xs text-slate-500">
            {topic} · {t.quiz.difficulties[difficulty]}
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#4338CA] to-[#7C3AED] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-display text-lg sm:text-xl font-bold text-[#1E1B4B] leading-snug">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as OptionKey[]).map((key) => {
            const isSelected = chosenOption === key;
            const isCorrectOption = currentQ.correctAnswer === key;

            let optionStyle =
              'border-slate-200 bg-white hover:border-[#4338CA] hover:bg-indigo-50/40 text-[#1E1B4B]';
            let statusTag: React.ReactNode = null;

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle = 'border-[#10B981] bg-emerald-50 text-emerald-950';
                statusTag = (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669] shrink-0">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>{t.quiz.correctLabel}</span>
                  </span>
                );
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-red-500 bg-red-50 text-red-950';
                statusTag = (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 shrink-0">
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    <span>{t.quiz.wrongLabel}</span>
                  </span>
                );
              } else {
                optionStyle = 'border-slate-200 bg-slate-50/60 text-slate-400';
              }
            }

            return (
              <button
                key={key}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(key)}
                className={`w-full text-left rounded-xl border p-4 transition-all flex items-center justify-between gap-3 ${optionStyle} ${
                  isAnswered ? 'cursor-default' : 'cursor-pointer'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]`}
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-[#1E1B4B] font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {key}
                  </span>
                  <span className="text-sm sm:text-base leading-relaxed">
                    {currentQ.options[key]}
                  </span>
                </div>
                {statusTag}
              </button>
            );
          })}
        </div>

        {/* In-Depth Explanation + Next Button */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-200 space-y-5">
            <div className="rounded-xl bg-violet-50/60 border border-violet-200/80 p-4 sm:p-5">
              <p className="text-xs font-semibold text-[#7C3AED] mb-1.5">
                {t.quiz.explanationTitle}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] text-white font-semibold text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
              >
                <span>
                  {currentIndex + 1 < questions.length
                    ? t.quiz.nextBtn
                    : t.quiz.finishBtn}
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
