import { Injectable, inject } from '@angular/core';
import { VocabDbService } from './vocab-db.service';
import { VocabEntry } from '../models/vocab-entry.model';

@Injectable({ providedIn: 'root' })
export class VocabSeedService {
  private db = inject(VocabDbService);

  async initializeDatabase(): Promise<void> {
    // Check if database is already populated
    const count = await this.db.vocab.count();
    if (count > 0) {
      console.log('Database already initialized with', count, 'vocab entries');
      return;
    }

    try {
      const response = await fetch('/assets/seed/vocab-general.json');
      const seedData: VocabEntry[] = await response.json();

      // Initialize each entry with SRS parameters
      const initializedData = seedData.map((entry) => ({
        ...entry,
        srsLevel: 0,
        easeFactor: 2.5,
        intervalDays: 1,
        nextReviewAt: Date.now(), // All new words are due immediately
      }));

      // Bulk insert
      await this.db.vocab.bulkAdd(initializedData);
      console.log('Database initialized with', initializedData.length, 'vocab entries');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async addCustomVocab(entries: VocabEntry[]): Promise<void> {
    const initializedData = entries.map((entry) => ({
      ...entry,
      srsLevel: entry.srsLevel || 0,
      easeFactor: entry.easeFactor || 2.5,
      intervalDays: entry.intervalDays || 1,
      nextReviewAt: entry.nextReviewAt || Date.now(),
    }));

    await this.db.vocab.bulkAdd(initializedData);
  }
}