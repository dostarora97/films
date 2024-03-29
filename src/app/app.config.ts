import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { VersionService } from './services/version.service';
import { firstValueFrom } from 'rxjs';

function initializeApp(): () => Promise<any> {
  const versionService = inject(VersionService);
  return () => firstValueFrom(versionService.fetchVersionInfo())
    .then(value => console.log(value));
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAnimationsAsync('noop'),
    VersionService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [VersionService],
      multi: true
    }
  ]
};
