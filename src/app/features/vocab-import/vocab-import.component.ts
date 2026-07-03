import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VocabDbService } from '../../shared/services/vocab-db.service';
import { VocabEntry } from '../../shared/models/vocab-entry.model';

declare const require: any;
const read = require('read-excel-file').default;

@Component({
  selector: 'app-vocab-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vocab-import.component.html',
  styleUrl: './vocab-import.component.css',
})
export class VocabImportComponent {
  private db = inject(VocabDbService);

  selectedFile: File | null = null;
  isLoading: boolean = false;
  importMessage: string = '';
  importSuccess: boolean = false;
  importedCount: number = 0;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.importMessage = '';
    }
  }

  async importVocab(): Promise<void> {
    if (!this.selectedFile) {
      this.importMessage = 'Please select a file first';
      this.importSuccess = false;
      return;
    }

    this.isLoading = true;
    this.importMessage = 'Processing file...';

    try {
      const rows = await read(this.selectedFile);

      // Skip header row and process data
      const vocabEntries: VocabEntry[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as any[];
        if (row && row.length >= 2) {
          const entry: VocabEntry = {
            term: row[0]?.toString().trim() || '',
            meaning: row[1]?.toString().trim() || '',
            example: row[2]?.toString().trim() || '',
            phonetic: row[3]?.toString().trim() || '',
            level: (row[4]?.toString().trim() || 'A1') as any,
            srsLevel: 0,
            easeFactor: 2.5,
            intervalDays: 1,
            nextReviewAt: Date.now(),
          };

          if (entry.term && entry.meaning) {
            vocabEntries.push(entry);
          }
        }
      }

      if (vocabEntries.length === 0) {
        this.importMessage = 'No valid vocabulary entries found in the file';
        this.importSuccess = false;
      } else {
        // Bulk insert
        await this.db.vocab.bulkAdd(vocabEntries);
        this.importedCount = vocabEntries.length;
        this.importMessage = `Successfully imported ${vocabEntries.length} vocabulary entries!`;
        this.importSuccess = true;
        this.selectedFile = null;
      }
    } catch (error) {
      console.error('Import error:', error);
      this.importMessage = `Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.importSuccess = false;
    } finally {
      this.isLoading = false;
    }
  }

  downloadTemplate(): void {
    const template = `Term,Meaning,Example,Phonetic,Level
hello,a polite expression used when meeting someone,Hello how are you?,/həˈloʊ/,A1
goodbye,a polite expression used when leaving someone,Goodbye see you tomorrow!,/ɡʊdˈbaɪ/,A1
thank you,an expression of gratitude,Thank you for your help.,/θæŋk juː/,A1`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vocab-template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }
}