import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VocabDbService } from '../../shared/services/vocab-db.service';
import { VocabEntry } from '../../shared/models/vocab-entry.model';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flashcard.component.html',
  styleUrl: './flashcard.component.css',
})
export class FlashcardComponent implements OnInit {
  private db = inject(VocabDbService);

  cards: VocabEntry[] = [];
  currentIndex: number = 0;
  isFlipped: boolean = false;
  filterLevel: string = '';

  ngOnInit(): void {
    this.loadCards();
  }

  async loadCards(): Promise<void> {
    if (this.filterLevel) {
      this.cards = await this.db.getVocabByLevel(this.filterLevel);
    } else {
      this.cards = await this.db.getAllVocab();
    }
    this.currentIndex = 0;
    this.isFlipped = false;
  }

  getCurrentCard(): VocabEntry | null {
    return this.cards[this.currentIndex] || null;
  }

  toggleFlip(): void {
    this.isFlipped = !this.isFlipped;
  }

  nextCard(): void {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  setFilterLevel(level: string): void {
    this.filterLevel = level;
    this.loadCards();
  }

  getProgress(): number {
    if (this.cards.length === 0) return 0;
    return Math.round(((this.currentIndex + 1) / this.cards.length) * 100);
  }
}