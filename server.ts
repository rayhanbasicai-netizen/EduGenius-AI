import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { AI_MODELS, buildSystemInstruction } from './src/constants/aiConfig.ts';
import type {
  ChatMessage,
  Language,
  ModelOptionId,
  OutputFormat,
  QuizDifficulty,
  QuizQuestion,
  StudentLevel,
  StudyDepth,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.');
    (err as Error & { statusCode?: number }).statusCode = 500;
    throw err;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function resolveModel(modelOption?: ModelOptionId): {
  modelId: string;
  thinkingLevel?: ThinkingLevel;
} {
  if (modelOption === 'fast') {
    return { modelId: AI_MODELS.fast.id };
  }
  return {
    modelId: AI_MODELS.quality.id,
    thinkingLevel: ThinkingLevel.MEDIUM,
  };
}

function handleApiError(res: express.Response, error: unknown) {
  console.error('Gemini API Error:', error);
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return res.status(429).json({
      code: 'RATE_LIMIT',
      error: 'Rate limit exceeded. Please wait a moment and try again.',
    });
  }
  if (
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('403') ||
    lower.includes('401') ||
    lower.includes('gemini_api_key')
  ) {
    return res.status(401).json({
      code: 'AUTH_ERROR',
      error: 'API key validation failed on the server.',
    });
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return res.status(404).json({
      code: 'MODEL_NOT_FOUND',
      error: 'Requested AI model was not found.',
    });
  }

  return res.status(500).json({
    code: 'INTERNAL_ERROR',
    error: message || 'Failed to generate AI response.',
  });
}

function stripJsonFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'EduGenius AI' });
  });

  // 1. AI Study Hub Endpoint
  app.post('/api/gemini/study', async (req, res) => {
    try {
      const {
        topic,
        level = 'HSC',
        depth = 'Detailed',
        format = 'Markdown',
        language = 'bn',
        modelOption = 'quality',
        temperature = 0.5,
      } = req.body as {
        topic?: string;
        level?: StudentLevel;
        depth?: StudyDepth;
        format?: OutputFormat;
        language?: Language;
        modelOption?: ModelOptionId;
        temperature?: number;
      };

      if (!topic || !topic.trim()) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Topic is required.' });
      }

      const ai = getGenAIClient();
      const { modelId, thinkingLevel } = resolveModel(modelOption);
      const systemInstruction = buildSystemInstruction({ language, level, temperature });

      const formatInstruction =
        format === 'Bullet Points'
          ? 'Format the entire response using crisp, hierarchical bullet points with bold key terms.'
          : format === 'Code Block'
            ? 'Format the structured summary, formulas, or examples inside clean fenced code blocks alongside concise explanations.'
            : 'Format the response in clean, well-structured Markdown with headings (##, ###), bold highlights, and clear spacing.';

      const depthInstruction =
        depth === 'Summary'
          ? 'Keep the explanation concise and high-yield (around 220-320 words), ideal for quick exam revision.'
          : 'Provide a comprehensive, thorough explanation with clear step-by-step clarity and exam tips.';

      const prompt = `Explain the following topic for a ${level} student:
Topic: "${topic.trim()}"

Mandatory 3-Level Structure (include clear headings for all 3):
1. Concept Definition (মূল ধারণা / সংজ্ঞা)
2. Real-world Analogy (বাস্তব জীবনের উপমা)
3. Practical Example (ব্যবহারিক উদাহরণ ও প্রয়োগ)

${depthInstruction}
${formatInstruction}`;

      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction,
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        },
      });

      const text = response.text?.trim() || '';
      if (!text) {
        return res.status(502).json({ code: 'EMPTY_RESPONSE', error: 'AI returned an empty response.' });
      }

      res.json({ text, model: modelId });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 2. Smart AI Quiz Endpoint
  app.post('/api/gemini/quiz', async (req, res) => {
    try {
      const {
        topic,
        difficulty = 'Medium',
        count = 5,
        level = 'HSC',
        language = 'bn',
        modelOption = 'quality',
        temperature = 0.4,
      } = req.body as {
        topic?: string;
        difficulty?: QuizDifficulty;
        count?: number;
        level?: StudentLevel;
        language?: Language;
        modelOption?: ModelOptionId;
        temperature?: number;
      };

      if (!topic || !topic.trim()) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Quiz topic is required.' });
      }

      const safeCount = Math.min(10, Math.max(5, Number(count) || 5));
      const ai = getGenAIClient();
      const { modelId, thinkingLevel } = resolveModel(modelOption);
      const systemInstruction = buildSystemInstruction({ language, level, temperature });

      const prompt = `Generate exactly ${safeCount} multiple-choice questions on the topic "${topic.trim()}" for a ${level} student at ${difficulty} difficulty.
Return ONLY a valid JSON array matching the schema. Each item must have:
- "question": string
- "options": object with keys "A", "B", "C", "D"
- "correctAnswer": exactly one of "A", "B", "C", or "D"
- "explanation": clear, educational explanation of why the answer is right (and why key distractors are wrong).
Write questions and explanations in ${language === 'bn' ? 'Bengali (বাংলা) with standard English technical terms where appropriate' : 'English'}.`;

      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING },
                  },
                  required: ['A', 'B', 'C', 'D'],
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        },
      });

      const rawText = stripJsonFences(response.text || '');
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        return res.status(422).json({
          code: 'MALFORMED_JSON',
          error: 'Quiz response could not be parsed cleanly.',
        });
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.status(422).json({
          code: 'MALFORMED_JSON',
          error: 'Quiz array was empty or invalid.',
        });
      }

      const validQuestions: QuizQuestion[] = parsed
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((q) => {
          const opts = (q.options as Record<string, string>) || {};
          const rawAns = String(q.correctAnswer || 'A').trim().toUpperCase();
          const correctAnswer = (['A', 'B', 'C', 'D'].includes(rawAns) ? rawAns : 'A') as
            | 'A'
            | 'B'
            | 'C'
            | 'D';
          return {
            question: String(q.question || ''),
            options: {
              A: String(opts.A || ''),
              B: String(opts.B || ''),
              C: String(opts.C || ''),
              D: String(opts.D || ''),
            },
            correctAnswer,
            explanation: String(q.explanation || ''),
          };
        })
        .filter((q) => q.question && q.options.A && q.options.B && q.options.C && q.options.D);

      if (validQuestions.length === 0) {
        return res.status(422).json({
          code: 'MALFORMED_JSON',
          error: 'No valid questions returned.',
        });
      }

      res.json({ questions: validQuestions, model: modelId });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // 3. Interactive Chat Tutor Endpoint (maintains conversation history)
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        level = 'HSC',
        language = 'bn',
        modelOption = 'quality',
        temperature = 0.6,
      } = req.body as {
        messages?: Array<Pick<ChatMessage, 'role' | 'text'>>;
        level?: StudentLevel;
        language?: Language;
        modelOption?: ModelOptionId;
        temperature?: number;
      };

      const cleaned = messages
        .filter((m) => m && m.text && m.text.trim())
        .slice(-20)
        .map((m) => ({
          role: m.role === 'model' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.text.trim() }],
        }));

      if (cleaned.length === 0) {
        return res.status(400).json({ code: 'VALIDATION_ERROR', error: 'Message is required.' });
      }

      // Ensure conversation starts with user turn for Gemini API
      const firstUserIdx = cleaned.findIndex((m) => m.role === 'user');
      const contents = firstUserIdx >= 0 ? cleaned.slice(firstUserIdx) : cleaned;

      const ai = getGenAIClient();
      const { modelId, thinkingLevel } = resolveModel(modelOption);
      const systemInstruction = buildSystemInstruction({ language, level, temperature });

      const response = await ai.models.generateContent({
        model: modelId,
        contents,
        config: {
          systemInstruction,
          ...(thinkingLevel ? { thinkingConfig: { thinkingLevel } } : {}),
        },
      });

      const text = response.text?.trim() || '';
      if (!text) {
        return res.status(502).json({ code: 'EMPTY_RESPONSE', error: 'AI returned an empty reply.' });
      }

      res.json({ text, model: modelId });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Vite dev middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenius AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
