import { Injectable } from '@angular/core';
import { VocabEntry } from '../models/vocab-entry.model';

@Injectable({ providedIn: 'root' })
export class SpacedRepetitionService {
  /**
   * Calculate next review date using SM-2 algorithm
   * @param entry Current vocab entry
   * @param grade User's grade (0-3, where 0=fail, 3=perfect)
   * @returns Updated vocab entry with new SRS parameters
   */
  calculateNextReview(entry: VocabEntry, grade: 0 | 1 | 2 | 3): VocabEntry {
    let { easeFactor, intervalDays, srsLevel } = entry;

    if (grade < 2) {
      // Failed - reset to beginning
      srsLevel = 0;
      intervalDays = 1;
    } else {
      // Passed
      if (srsLevel === 0) {
        intervalDays = 1;
      } else if (srsLevel === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }

      srsLevel += 1;

      // Update ease factor based on grade
      // Formula: EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
      // Simplified for grades 0-3: EF + (0.1 - (3-grade)*(0.08+(3-grade)*0.02))
      easeFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (3 - grade) * (0.08 + (3 - grade) * 0.02))
      );
    }

    const nextReviewAt = Date.now() + intervalDays * 86400000; // Convert days to milliseconds

    return {
      ...entry,
      srsLevel,
      intervalDays,
      easeFactor,
      nextReviewAt,
    };
  }

  /**
   * Get SRS level description
   */
  getSrsLevelDescription(level: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'New',
      1: '1 day',
      2: '6 days',
      3: '16 days',
      4: '35 days',
      5: '90+ days',
    };
    return descriptions[level] || 'Unknown';
  }

  /**
   * Calculate days until next review
   */
  getDaysUntilReview(nextReviewAt: number): number {
    const now = Date.now();
    const daysMs = nextReviewAt - now;
    return Math.ceil(daysMs / 86400000);
  }

  /**
   * Check if a word is due for review
   */
  isDue(entry: VocabEntry): boolean {
    return entry.nextReviewAt <= Date.now();
  }
}