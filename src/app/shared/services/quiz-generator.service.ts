import { Injectable, inject } from '@angular/core';
import { VocabDbService } from './vocab-db.service';
import { VocabEntry } from '../models/vocab-entry.model';

export interface QuizQuestion {
  word: VocabEntry;
  mode: 'recognition' | 'recall' | 'typing';
  options?: VocabEntry[]; // For recognition mode
  userAnswer?: string; // For typing mode
}

@Injectable({ providedIn: 'root' })
export class QuizGeneratorService {
  private db = inject(VocabDbService);

  /**
   * Generate a recognition quiz (multiple choice)
   */
  async generateRecognitionQuiz(word: VocabEntry, allWords: VocabEntry[]): Promise<QuizQuestion> {
    // Get 3 random wrong answers
    const wrongAnswers = allWords
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle
    const options = [word, ...wrongAnswers].sort(() => Math.random() - 0.5);

    return {
      word,
      mode: 'recognition',
      options,
    };
  }

  /**
   * Check recognition answer
   */
  checkRecognitionAnswer(selectedWord: VocabEntry, correctWord: VocabEntry): boolean {
    return selectedWord.id === correctWord.id;
  }

  /**
   * Generate a typing quiz
   */
  generateTypingQuiz(word: VocabEntry): QuizQuestion {
    return {
      word,
      mode: 'typing',
    };
  }

  /**
   * Check typing answer using Levenshtein distance
   * Allows for minor spelling mistakes
   */
  checkTypingAnswer(userAnswer: string, correctAnswer: string): { correct: boolean; grade: 0 | 1 | 2 | 3 } {
    const normalized = userAnswer.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase().trim();

    if (normalized === correct) {
      return { correct: true, grade: 3 };
    }

    const distance = this.levenshteinDistance(normalized, correct);
    const maxDistance = Math.ceil(correct.length * 0.2); // Allow 20% character difference

    if (distance <= maxDistance) {
      return { correct: true, grade: 2 }; // Partial credit for minor mistakes
    }

    return { correct: false, grade: 0 };
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate a recall quiz (self-report)
   */
  generateRecallQuiz(word: VocabEntry): QuizQuestion {
    return {
      word,
      mode: 'recall',
    };
  }
}