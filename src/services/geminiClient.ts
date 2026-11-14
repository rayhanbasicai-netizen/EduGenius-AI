import { TRANSLATIONS } from '../i18n/translations.ts';
import type {
  AppSettings,
  ChatMessage,
  Language,
  OutputFormat,
  QuizDifficulty,
  QuizQuestion,
  StudentLevel,
  StudyDepth,
} from '../types/index.ts';

export class ApiRequestError extends Error {
  code: string;
  constructor(message: string, code = 'GENERIC') {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
  }
}

function localizeError(code: string | undefined, fallback: string, language: Language): string {
  const errDict = TRANSLATIONS[language].errors;
  if (code === 'RATE_LIMIT') return errDict.rateLimit;
  if (code === 'AUTH_ERROR') return errDict.auth;
  if (code === 'NETWORK_ERROR') return errDict.network;
  if (code === 'MALFORMED_JSON') return TRANSLATIONS[language].quiz.malformedError;
  return fallback || errDict.generic;
}

async function postJson<T>(url: string, body: unknown, language: Language): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(TRANSLATIONS[language].errors.network, 'NETWORK_ERROR');
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await response.json()) as Record<string, unknown>;
  } catch {
    if (!response.ok) {
      throw new ApiRequestError(TRANSLATIONS[language].errors.generic, 'GENERIC');
    }
  }

  if (!response.ok) {
    const code = typeof data.code === 'string' ? data.code : 'GENERIC';
    const rawMsg = typeof data.error === 'string' ? data.error : '';
    throw new ApiRequestError(localizeError(code, rawMsg, language), code);
  }

  return data as T;
}

export async function generateStudyExplanation(params: {
  topic: string;
  level: StudentLevel;
  depth: StudyDepth;
  format: OutputFormat;
  settings: AppSettings;
}): Promise<{ text: string; model: string }> {
  return postJson<{ text: string; model: string }>(
    '/api/gemini/study',
    {
      topic: params.topic,
      level: params.level,
      depth: params.depth,
      format: params.format,
      language: params.settings.language,
      modelOption: params.settings.modelOption,
      temperature: params.settings.temperature,
    },
    params.settings.language
  );
}

export async function generateQuizQuestions(params: {
  topic: string;
  difficulty: QuizDifficulty;
  count: number;
  level: StudentLevel;
  settings: AppSettings;
}): Promise<{ questions: QuizQuestion[]; model: string }> {
  return postJson<{ questions: QuizQuestion[]; model: string }>(
    '/api/gemini/quiz',
    {
      topic: params.topic,
      difficulty: params.difficulty,
      count: params.count,
      level: params.level,
      language: params.settings.language,
      modelOption: params.settings.modelOption,
      temperature: params.settings.temperature,
    },
    params.settings.language
  );
}

export async function sendChatMessage(params: {
  messages: Array<Pick<ChatMessage, 'role' | 'text'>>;
  level: StudentLevel;
  settings: AppSettings;
}): Promise<{ text: string; model: string }> {
  return postJson<{ text: string; model: string }>(
    '/api/gemini/chat',
    {
      messages: params.messages,
      level: params.level,
      language: params.settings.language,
      modelOption: params.settings.modelOption,
      temperature: params.settings.temperature,
    },
    params.settings.language
  );
}
