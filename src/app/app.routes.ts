import { Routes } from '@angular/router';
import { ReviewDashboardComponent } from './features/review-dashboard/review-dashboard.component';
import { FlashcardComponent } from './features/flashcard/flashcard.component';
import { VocabImportComponent } from './features/vocab-import/vocab-import.component';

export const routes: Routes = [
  {
    path: '',
    component: ReviewDashboardComponent,
  },
  {
    path: 'flashcard',
    component: FlashcardComponent,
  },
  {
    path: 'import',
    component: VocabImportComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];