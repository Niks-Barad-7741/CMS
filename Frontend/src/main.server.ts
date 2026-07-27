if (process.env['NODE_ENV'] !== 'production') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
}

import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, config, context);

export default bootstrap;
