import { Injectable, inject, signal } from '@angular/core';
import { VocabDbService } from './vocab-db.service';
import { SpacedRepetitionService } from './spaced-repetition.service';
import { VocabEntry } from '../models/vocab-entry.model';
import { ReviewLog } from '../models/review-log.model';

@Injectable({ providedIn: 'root' })
export class ReviewSessionService {
  private db = inject(VocabDbService);
  private srs = inject(SpacedRepetitionService);

  dueWords = signal<VocabEntry[]>([]);
  currentIndex = signal(0);
  sessionStats = signal({
    total: 0,
    correct: 0,
    incorrect: 0,
  });

  async loadDueWords(): Promise<void> {
    const words = await this.db.getDueWords(Date.now());
    this.dueWords.set(words);
    this.currentIndex.set(0);
    this.sessionStats.set({
      total: words.length,
      correct: 0,
      incorrect: 0,
    });
  }

  async loadAllWords(): Promise<void> {
    const words = await this.db.getAllVocab();
    this.dueWords.set(words);
    this.currentIndex.set(0);
    this.sessionStats.set({
      total: words.length,
      correct: 0,
      incorrect: 0,
    });
  }

  getCurrentWord(): VocabEntry | null {
    const words = this.dueWords();
    const index = this.currentIndex();
    return index < words.length ? words[index] : null;
  }

  async gradeWord(entry: VocabEntry, grade: 0 | 1 | 2 | 3, quizMode: 'recognition' | 'recall' | 'typing'): Promise<void> {
    // Update SRS parameters
    const updated = this.srs.calculateNextReview(entry, grade);
    await this.db.updateVocab(updated);

    // Log the review
    const log: ReviewLog = {
      vocabId: entry.id!,
      grade,
      reviewedAt: Date.now(),
      quizMode,
    };
    await this.db.addReviewLog(log);

    // Update stats
    const stats = this.sessionStats();
    if (grade >= 2) {
      stats.correct++;
    } else {
      stats.incorrect++;
    }
    this.sessionStats.set({ ...stats });

    // Move to next word
    this.currentIndex.update((i) => i + 1);
  }

  isSessionComplete(): boolean {
    return this.currentIndex() >= this.dueWords().length;
  }

  getProgress(): number {
    const total = this.dueWords().length;
    if (total === 0) return 0;
    return Math.round((this.currentIndex() / total) * 100);
  }

  resetSession(): void {
    this.dueWords.set([]);
    this.currentIndex.set(0);
    this.sessionStats.set({
      total: 0,
      correct: 0,
      incorrect: 0,
    });
  }
}