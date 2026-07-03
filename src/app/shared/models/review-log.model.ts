export interface ReviewLog {
  id?: number;
  vocabId: number;
  grade: 0 | 1 | 2 | 3;
  reviewedAt: number;
  quizMode: 'recognition' | 'recall' | 'typing';
}