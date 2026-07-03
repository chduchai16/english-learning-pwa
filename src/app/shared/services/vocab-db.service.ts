import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { VocabEntry } from '../models/vocab-entry.model';
import { ReviewLog } from '../models/review-log.model';

@Injectable({ providedIn: 'root' })
export class VocabDbService extends Dexie {
  vocab!: Table<VocabEntry, number>;
  reviewLogs!: Table<ReviewLog, number>;

  constructor() {
    super('EnglishLearnDB');
    this.version(1).stores({
      vocab: '++id, term, level, srsLevel, nextReviewAt',
      reviewLogs: '++id, vocabId, reviewedAt, grade',
    });
  }

  async getDueWords(now: number): Promise<VocabEntry[]> {
    return this.vocab.where('nextReviewAt').belowOrEqual(now).toArray();
  }

  async getAllVocab(): Promise<VocabEntry[]> {
    return this.vocab.toArray();
  }

  async getVocabByLevel(level: string): Promise<VocabEntry[]> {
    return this.vocab.where('level').equals(level).toArray();
  }

  async addVocab(entry: VocabEntry): Promise<number> {
    return this.vocab.add(entry);
  }

  async updateVocab(entry: VocabEntry): Promise<number> {
    return this.vocab.put(entry);
  }

  async deleteVocab(id: number): Promise<void> {
    return this.vocab.delete(id);
  }

  async addReviewLog(log: ReviewLog): Promise<number> {
    return this.reviewLogs.add(log);
  }

  async getReviewLogs(vocabId: number): Promise<ReviewLog[]> {
    return this.reviewLogs.where('vocabId').equals(vocabId).toArray();
  }

  async clearAllData(): Promise<void> {
    await this.vocab.clear();
    await this.reviewLogs.clear();
  }
}