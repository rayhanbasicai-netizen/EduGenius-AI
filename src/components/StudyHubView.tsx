import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { STUDENT_LEVELS } from '../constants/aiConfig.ts';
import { LEVEL_LABELS, TRANSLATIONS } from '../i18n/translations.ts';
import { generateStudyExplanation } from '../services/geminiClient.ts';
import type {
  AppSettings,
  OutputFormat,
  StudentLevel,
  StudyDepth,
} from '../types/index.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';

interface StudyHubViewProps {
  settings: AppSettings;
  preselectedLevel?: StudentLevel;
  onShowToast: (msg: string) => void;
}

export function StudyHubView({
  settings,
  preselectedLevel,
  onShowToast,
}: StudyHubViewProps) {
  const t = TRANSLATIONS[settings.language];
  const levelLabels = LEVEL_LABELS[settings.language];

  const [level, setLevel] = useState<StudentLevel>(preselectedLevel || settings.defaultLevel);
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<StudyDepth>('Detailed');
  const [format, setFormat] = useState<OutputFormat>('Markdown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (preselectedLevel) {
      setLevel(preselectedLevel);
    }
  }, [preselectedLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setValidationError(t.study.topicEmptyError);
      return;
    }
    setValidationError(null);
    setLoading(true);

    try {
      const data = await generateStudyExplanation({
        topic: topic.trim(),
        level,
        depth,
        format,
        settings,
      });
      setResult(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      onShowToast(t.study.copiedToast);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast(t.errors.generic);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const safeTitle = topic
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/gi, '-')
      .slice(0, 40) || 'study-notes';
    const header = `# ${topic.trim()} (${level})\n\n`;
    const blob = new Blob([header + result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
          {t.study.title}
        </h1>
        <p className="text-slate-600 mt-2 max-w-3xl text-sm sm:text-base leading-relaxed">
          {t.study.subtitle}
        </p>
      </div>

      {/* Two-Zone Layout: Control Deck + Output Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Form Panel */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5"
        >
          {/* Level Dropdown */}
          <div>
            <label
              htmlFor="study-level"
              className="block text-sm font-semibold text-[#1E1B4B] mb-2"
            >
              {t.study.levelLabel}
            </label>
            <select
              id="study-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as StudentLevel)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-[#4338CA]"
            >
              {STUDENT_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {levelLabels[lvl]}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Textarea */}
          <div>
            <label
              htmlFor="study-topic"
              className="block text-sm font-semibold text-[#1E1B4B] mb-2"
            >
              {t.study.topicLabel}
            </label>
            <textarea
              id="study-topic"
              rows={4}
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={t.study.topicPlaceholder}
              className={`w-full rounded-xl border px-3.5 py-3 text-sm text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4338CA] transition-colors ${
                validationError
                  ? 'border-red-500 bg-red-50/40'
                  : 'border-slate-300 bg-white'
              }`}
            />
            {validationError && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}

            {/* Quick Example Fill Buttons */}
            <div className="mt-2.5">
              <p className="text-xs text-slate-500 mb-1.5">{t.study.quickExamplesLabel}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.study.quickExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setTopic(example);
                      setValidationError(null);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-[#4338CA] border border-slate-200/80 transition-colors cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Depth Radio Pills */}
          <div>
            <span className="block text-sm font-semibold text-[#1E1B4B] mb-2">
              {t.study.depthLabel}
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl" role="radiogroup">
              {(['Summary', 'Detailed'] as StudyDepth[]).map((d) => {
                const active = depth === d;
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDepth(d)}
                    className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-[#4338CA] shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-[#1E1B4B]'
                    }`}
                  >
                    {t.study.depths[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output Format Dropdown */}
          <div>
            <label
              htmlFor="study-format"
              className="block text-sm font-semibold text-[#1E1B4B] mb-2"
            >
              {t.study.formatLabel}
            </label>
            <select
              id="study-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as OutputFormat)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4338CA] focus:border-[#4338CA]"
            >
              {(['Markdown', 'Bullet Points', 'Code Block'] as OutputFormat[]).map((fmt) => (
                <option key={fmt} value={fmt}>
                  {t.study.formats[fmt]}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t.study.generatingBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>{t.study.generateBtn}</span>
              </>
            )}
          </button>
        </form>

        {/* Output Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[420px] flex flex-col">
          {/* Output Header Bar */}
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-[#1E1B4B]">
                {t.study.outputTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.study.threeLevelBadge}</p>
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#4338CA] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  <span>{t.study.copyBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-indigo-50 border border-indigo-200 text-[#4338CA] hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.study.downloadBtn}</span>
                </button>
              </div>
            )}
          </div>

          {/* Output Body */}
          <div className="p-6 sm:p-7 flex-1">
            {loading && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center py-12">
                <Loader2 className="w-9 h-9 text-[#7C3AED] animate-spin mb-3" aria-hidden="true" />
                <p className="text-sm font-medium text-[#1E1B4B]">{t.study.generatingBtn}</p>
                <p className="text-xs text-slate-500 mt-1">{t.study.threeLevelBadge}</p>
              </div>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && !result && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4338CA] flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="font-display text-base font-semibold text-[#1E1B4B]">
                  {t.study.emptyOutputTitle}
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 max-w-md leading-relaxed">
                  {t.study.emptyOutputDesc}
                </p>
              </div>
            )}

            {!loading && !error && result && <MarkdownRenderer content={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
