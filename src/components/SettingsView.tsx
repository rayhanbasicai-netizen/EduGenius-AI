import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  AI_MODELS,
  DEFAULT_SETTINGS,
  STUDENT_LEVELS,
} from '../constants/aiConfig.ts';
import { LEVEL_LABELS, TRANSLATIONS } from '../i18n/translations.ts';
import type {
  AppSettings,
  Language,
  ModelOptionId,
  StudentLevel,
} from '../types/index.ts';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (next: AppSettings) => void;
  onShowToast: (msg: string) => void;
}

export function SettingsView({
  settings,
  onSaveSettings,
  onShowToast,
}: SettingsViewProps) {
  const [draft, setDraft] = useState<AppSettings>(settings);

  const t = TRANSLATIONS[draft.language];
  const levelLabels = LEVEL_LABELS[draft.language];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(draft);
    onShowToast(TRANSLATIONS[draft.language].settings.savedToast);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    onShowToast(TRANSLATIONS[DEFAULT_SETTINGS.language].settings.resetToast);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B]">
          {t.settings.title}
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
          {t.settings.subtitle}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-7"
      >
        {/* Server-Side Integration Status Info */}
        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[#1E1B4B]">
              {t.settings.serviceNoteTitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
              {t.settings.serviceNoteDesc}
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div>
          <span className="block text-sm font-semibold text-[#1E1B4B] mb-2.5">
            {t.settings.languageLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
            {(['bn', 'en'] as Language[]).map((lang) => {
              const active = draft.language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDraft((prev) => ({ ...prev, language: lang }))}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'border-[#4338CA] bg-indigo-50/70 text-[#4338CA] font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span>
                    {lang === 'bn' ? t.settings.languageBn : t.settings.languageEn}
                  </span>
                  {active && <Check className="w-4 h-4 text-[#4338CA]" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Academic Level */}
        <div>
          <label
            htmlFor="settings-level"
            className="block text-sm font-semibold text-[#1E1B4B] mb-2"
          >
            {t.settings.defaultLevelLabel}
          </label>
          <select
            id="settings-level"
            value={draft.defaultLevel}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                defaultLevel: e.target.value as StudentLevel,
              }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
          >
            {STUDENT_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {levelLabels[lvl]}
              </option>
            ))}
          </select>
        </div>

        {/* AI Model Selector */}
        <div>
          <span className="block text-sm font-semibold text-[#1E1B4B] mb-2.5">
            {t.settings.modelLabel}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
            {(['fast', 'quality'] as ModelOptionId[]).map((modelKey) => {
              const model = AI_MODELS[modelKey];
              const active = draft.modelOption === modelKey;
              return (
                <button
                  key={modelKey}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, modelOption: modelKey }))
                  }
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'border-[#4338CA] bg-indigo-50/60'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1E1B4B]">
                      {draft.language === 'bn' ? model.labelBn : model.labelEn}
                    </p>
                    {active && <Check className="w-4 h-4 text-[#4338CA] shrink-0" aria-hidden="true" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {draft.language === 'bn' ? model.descriptionBn : model.descriptionEn}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-2">{model.id}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature / Creativity Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="settings-temp"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E1B4B]"
            >
              <Sliders className="w-4 h-4 text-[#7C3AED]" aria-hidden="true" />
              <span>{t.settings.temperatureLabel}</span>
            </label>
            <span className="text-sm font-mono font-semibold text-[#4338CA] tabular-nums">
              {draft.temperature.toFixed(1)}
            </span>
          </div>

          <input
            id="settings-temp"
            type="range"
            min="0.2"
            max="0.9"
            step="0.1"
            value={draft.temperature}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                temperature: Number(e.target.value),
              }))
            }
            className="w-full accent-[#4338CA] cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
            <span>{t.settings.tempPrecise}</span>
            <span>{t.settings.tempBalanced}</span>
            <span>{t.settings.tempCreative}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>{t.settings.resetBtn}</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] text-white text-sm font-semibold shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>{t.settings.saveBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
