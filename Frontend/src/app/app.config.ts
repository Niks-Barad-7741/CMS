import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { QuillModule } from 'ngx-quill';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { apiResponseInterceptor } from './core/interceptors/api-response.interceptor';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([jwtInterceptor, apiResponseInterceptor])),
    importProvidersFrom(QuillModule.forRoot())
  ]
};
