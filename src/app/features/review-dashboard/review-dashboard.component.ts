import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewSessionService } from '../../shared/services/review-session.service';
import { QuizGeneratorService } from '../../shared/services/quiz-generator.service';
import { VocabDbService } from '../../shared/services/vocab-db.service';
import { VocabEntry } from '../../shared/models/vocab-entry.model';
import { QuizQuestion } from '../../shared/services/quiz-generator.service';

@Component({
  selector: 'app-review-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-dashboard.component.html',
  styleUrl: './review-dashboard.component.css',
})
export class ReviewDashboardComponent implements OnInit {
  private reviewSession = inject(ReviewSessionService);
  private quizGenerator = inject(QuizGeneratorService);
  private db = inject(VocabDbService);

  currentWord: VocabEntry | null = null;
  quizQuestion: QuizQuestion | null = null;
  allWords: VocabEntry[] = [];
  quizMode: 'recognition' | 'typing' | 'recall' = 'recognition';
  selectedAnswer: VocabEntry | null = null;
  typingAnswer: string = '';
  showResult: boolean = false;
  isCorrect: boolean = false;
  sessionStarted: boolean = false;
  sessionComplete: boolean = false;
  Math = Math;

  dueWords = this.reviewSession.dueWords;
  currentIndex = this.reviewSession.currentIndex;
  sessionStats = this.reviewSession.sessionStats;

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData(): Promise<void> {
    this.allWords = await this.db.getAllVocab();
  }

  async startSession(): Promise<void> {
    await this.reviewSession.loadDueWords();
    this.sessionStarted = true;
    this.loadNextQuestion();
  }

  async startPracticeSession(): Promise<void> {
    await this.reviewSession.loadAllWords();
    this.sessionStarted = true;
    this.loadNextQuestion();
  }

  async loadNextQuestion(): Promise<void> {
    this.currentWord = this.reviewSession.getCurrentWord();

    if (!this.currentWord) {
      this.sessionComplete = true;
      return;
    }

    this.selectedAnswer = null;
    this.typingAnswer = '';
    this.showResult = false;

    if (this.quizMode === 'recognition') {
      this.quizQuestion = await this.quizGenerator.generateRecognitionQuiz(
        this.currentWord,
        this.allWords
      );
    } else if (this.quizMode === 'typing') {
      this.quizQuestion = this.quizGenerator.generateTypingQuiz(this.currentWord);
    } else {
      this.quizQuestion = this.quizGenerator.generateRecallQuiz(this.currentWord);
    }
  }

  async submitAnswer(): Promise<void> {
    if (!this.currentWord) return;

    let grade: 0 | 1 | 2 | 3 = 0;

    if (this.quizMode === 'recognition') {
      if (!this.selectedAnswer) return;
      this.isCorrect = this.quizGenerator.checkRecognitionAnswer(
        this.selectedAnswer,
        this.currentWord
      );
      grade = this.isCorrect ? 3 : 0;
    } else if (this.quizMode === 'typing') {
      const result = this.quizGenerator.checkTypingAnswer(
        this.typingAnswer,
        this.currentWord.term
      );
      this.isCorrect = result.correct;
      grade = result.grade;
    } else {
      // Recall mode - user self-reports
      this.isCorrect = true;
      grade = 3;
    }

    this.showResult = true;

    // Grade the word after a delay
    setTimeout(async () => {
      await this.reviewSession.gradeWord(this.currentWord!, grade, this.quizMode);
      await this.loadNextQuestion();
    }, 1500);
  }

  changeQuizMode(mode: string): void {
    if (mode === 'recognition' || mode === 'typing' || mode === 'recall') {
      this.quizMode = mode;
      if (this.sessionStarted && this.currentWord) {
        this.loadNextQuestion();
      }
    }
  }

  resetSession(): void {
    this.reviewSession.resetSession();
    this.sessionStarted = false;
    this.sessionComplete = false;
    this.currentWord = null;
    this.quizQuestion = null;
  }

  getProgress(): number {
    return this.reviewSession.getProgress();
  }
}