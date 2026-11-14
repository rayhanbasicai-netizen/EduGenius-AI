import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  GraduationCap,
  HelpCircle,
  Languages,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { HERO_IMAGE_PATH } from '../constants/aiConfig.ts';
import { TRANSLATIONS } from '../i18n/translations.ts';
import type { Language, NavPage, StudentLevel } from '../types/index.ts';

interface HomeViewProps {
  language: Language;
  onNavigate: (page: NavPage, preselectLevel?: StudentLevel) => void;
}

export function HomeView({ language, onNavigate }: HomeViewProps) {
  const t = TRANSLATIONS[language];
  const [imgFailed, setImgFailed] = useState(false);

  const featureIcons = [BookOpen, HelpCircle, MessageSquareText, Languages];

  const audienceIcons = [GraduationCap, Target, Users];

  return (
    <div className="flex flex-col">
      {/* Interactive Hero Section */}
      <section className="hero-animated-bg text-white relative overflow-hidden">
        {/* Subtle atmospheric radial glow */}
        <div
          className="pointer-events-none absolute -top-28 -right-28 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm font-medium text-violet-200 tracking-wide">
                {t.hero.kicker}
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.18] text-white text-balance">
                {t.hero.headline}
              </h1>

              <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed max-w-xl">
                {t.hero.subheadline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('study')}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#4338CA] to-[#7C3AED] hover:from-[#3730A3] hover:to-[#6D28D9] text-white font-semibold text-base shadow-lg shadow-indigo-950/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-base border border-white/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <span>{t.hero.ctaSecondary}</span>
                </button>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#16133A] shadow-2xl aspect-[4/3]">
                {!imgFailed ? (
                  <img
                    src={HERO_IMAGE_PATH}
                    alt={t.hero.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4C1D95] text-center">
                    <BrainCircuit className="w-16 h-16 text-violet-300 mb-4" aria-hidden="true" />
                    <p className="font-display text-xl font-semibold text-white">EduGenius AI</p>
                    <p className="text-sm text-indigo-200 mt-1">{t.hero.floatCard1Desc}</p>
                  </div>
                )}

                {/* Subtle bottom scrim for readability */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E1B4B]/70 via-transparent to-transparent"
                  aria-hidden="true"
                />
              </div>

              {/* Floating AI-themed Element 1 */}
              <div className="hidden sm:flex float-slow absolute -bottom-5 -left-4 lg:-left-6 bg-white text-[#1E1B4B] rounded-2xl p-4 shadow-xl border border-slate-200/80 items-start gap-3 max-w-xs">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4338CA] to-[#7C3AED] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1E1B4B]">{t.hero.floatCard1Title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{t.hero.floatCard1Desc}</p>
                </div>
              </div>

              {/* Floating AI-themed Element 2 */}
              <div className="hidden sm:flex float-delayed absolute -top-4 -right-3 lg:-right-5 bg-[#1E1B4B]/95 backdrop-blur-sm text-white rounded-2xl px-4 py-3 shadow-xl border border-white/15 items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#10B981] flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{t.hero.floatCard2Title}</p>
                  <p className="text-xs text-indigo-200 font-mono">F = ma · {t.hero.floatCard2Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (4 Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B] text-balance">
            {t.features.title}
          </h2>
          <p className="text-slate-600 mt-2.5 text-base leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((item, idx) => {
            const Icon = featureIcons[idx];
            const targetPage = item.id as NavPage;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(targetPage)}
                className="group text-left bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4338CA]"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#4338CA] group-hover:bg-gradient-to-br group-hover:from-[#4338CA] group-hover:to-[#7C3AED] group-hover:text-white flex items-center justify-center transition-colors mb-5">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1E1B4B] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4338CA] group-hover:text-[#7C3AED] transition-colors">
                  <span>{item.action}</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target Audience Section (3 Cards) + Adjacent Stats Section */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E1B4B] text-balance">
              {t.audience.title}
            </h2>
            <p className="text-slate-600 mt-2.5 text-base leading-relaxed">
              {t.audience.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.audience.cards.map((card, idx) => {
              const Icon = audienceIcons[idx];
              return (
                <div
                  key={card.title}
                  className="bg-[#F8FAFC] rounded-2xl p-6 sm:p-7 border border-slate-200/90 flex flex-col justify-between hover:border-violet-200 transition-colors"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-violet-100 text-[#7C3AED] flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#1E1B4B] mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {card.points}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => onNavigate(card.targetPage, card.targetLevel)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4338CA] hover:text-[#7C3AED] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                    >
                      <span>{card.action}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Strip (Placed directly adjacent to Audience proof) */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#2E276F] to-[#4338CA] text-white p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <p className="text-sm font-medium text-violet-200">{t.company}</p>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                  {t.stats.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
                {t.stats.items.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-sm text-indigo-200 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
