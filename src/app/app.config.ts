import { APP_INITIALIZER, ApplicationConfig, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { VersionService } from './services/version.service';
import { firstValueFrom } from 'rxjs';
import {
  BuildAwareNamespacedStorageService
} from './services/build-aware-namespaced-storage.service';
import { NamespaceAwareStorageService } from './models';

function initializeApp(): () => Promise<void> {
  const versionService = inject(VersionService);
  const storageService: NamespaceAwareStorageService = inject(BuildAwareNamespacedStorageService);
  return () => firstValueFrom(versionService.fetchVersionInfo())
    .then(versionInfo => {
      console.log(+Date.now(), 'initializeApp', versionInfo);
      storageService.removeAllOtherNameSpaceAwareItems();
    });
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
