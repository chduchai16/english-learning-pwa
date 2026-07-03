export interface VocabEntry {
  id?: number;
  term: string;
  meaning: string;
  example?: string;
  phonetic?: string;
  audioUrl?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  srsLevel: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: number;
}