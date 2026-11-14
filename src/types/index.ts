export type Language = 'bn' | 'en';

export type NavPage = 'home' | 'study' | 'quiz' | 'chat' | 'settings';

export type StudentLevel =
  | 'Class 6-8'
  | 'SSC'
  | 'HSC'
  | 'University'
  | 'Admission'
  | 'Job Exams'
  | 'IELTS';

export type StudyDepth = 'Summary' | 'Detailed';

export type OutputFormat = 'Markdown' | 'Bullet Points' | 'Code Block';

export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ModelOptionId = 'fast' | 'quality';

export interface AppSettings {
  language: Language;
  modelOption: ModelOptionId;
  temperature: number;
  defaultLevel: StudentLevel;
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
