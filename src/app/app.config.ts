import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { VocabSeedService } from './shared/services/vocab-seed.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    {
      provide: 'APP_INITIALIZER',
      useFactory: (seedService: VocabSeedService) => () => seedService.initializeDatabase(),
      deps: [VocabSeedService],
      multi: true,
    },
  ],
};