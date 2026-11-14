import type { AppSettings, ModelOptionId, StudentLevel } from '../types/index.ts';

/**
 * Single source of truth for Gemini model IDs.
 * Update model IDs here to switch models across the entire application.
 */
export const AI_MODELS: Record<
  ModelOptionId,
  {
    id: string;
    labelEn: string;
    labelBn: string;
    descriptionEn: string;
    descriptionBn: string;
  }
> = {
  fast: {
    id: 'gemini-3.1-flash-lite',
    labelEn: 'Fast (Gemini 3.1 Flash Lite)',
    labelBn: 'দ্রুত (Gemini 3.1 Flash Lite)',
    descriptionEn: 'Low-latency responses ideal for quick flashcards, quizzes, and instant chat.',
    descriptionBn: 'দ্রুত ফ্ল্যাশকার্ড, কুইজ এবং তাৎক্ষণিক চ্যাটের জন্য কম ল্যাটেন্সি মডেল।',
  },
  quality: {
    id: 'gemini-4-hydrogen',
    labelEn: 'High Quality (Gemini 4 Hydrogen)',
    labelBn: 'উচ্চ মানের (Gemini 4 Hydrogen)',
    descriptionEn: 'Balanced reasoning depth for detailed HSC, Admission, and IELTS explanations.',
    descriptionBn: 'এইচএসসি, এডমিশন ও আইইএলটিএস-এর গভীর বিশ্লেষণের জন্য উন্নত মডেল।',
  },
};

export const STUDENT_LEVELS: StudentLevel[] = [
  'Class 6-8',
  'SSC',
  'HSC',
  'University',
  'Admission',
  'Job Exams',
  'IELTS',
];

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'bn',
  modelOption: 'quality',
  temperature: 0.5,
  defaultLevel: 'HSC',
};

export const SETTINGS_STORAGE_KEY = 'edugenius_ai_settings_v1';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_learning_studio_1794628757066.jpg';

export const BASE_SYSTEM_PROMPT = `You are EduGenius AI, an elite educational mentor and adaptive tutor.
1. Target: Bengali and English-speaking students (SSC, HSC, University, IELTS, Job exams).
2. Tone: Highly encouraging, clear, structured, and pedagogically sound.
3. Behavior:
- For explanations: Break down complex topics into 3 levels: Concept Definition, Real-world Analogy, and Practical Example.
- For quizzes: Always return strict structured output with Question, Options (A, B, C, D), Correct Answer, and In-depth Explanation.
- Avoid hallucination; if unsure, politely clarify.
Maintain proper Bengali-English typography.`;

export function buildSystemInstruction(params: {
  language: 'bn' | 'en';
  level: StudentLevel;
  temperature?: number;
}): string {
  const languageDirective =
    params.language === 'bn'
      ? 'Primary UI & Response Language: Bengali (বাংলা). Explain concepts naturally in standard academic Bengali while keeping essential technical terms or English grammar examples in English where helpful.'
      : 'Primary UI & Response Language: English. Explain concepts in clear, encouraging academic English suitable for Bangladeshi learners.';

  const creativityHint =
    typeof params.temperature === 'number'
      ? params.temperature <= 0.4
        ? 'Style preference: Be highly concise, deterministic, and strictly exam-focused.'
        : params.temperature >= 0.7
          ? 'Style preference: Use rich, memorable analogies and creative real-life Bangladeshi examples.'
          : 'Style preference: Balance factual precision with engaging, relatable analogies.'
      : '';

  return `${BASE_SYSTEM_PROMPT}\n\n${languageDirective}\nStudent Academic Level: ${params.level}\n${creativityHint}`.trim();
}
