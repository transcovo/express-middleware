// Type definitions for express-middleware 3.3.0
// Project: express-middleware
// Definitions by: Chauffeur Privé
// TypeScript Version: 3.0.1

import { RequestHandler } from 'express';
import { Logger } from 'chpr-logger'

declare module ExpressMiddleware {
  interface Translator {
    translate(object: Object, locale?: string, timezone?: string): Promise<void>
  }

  interface LanguageConfig {
    languages: string[],
    defaultLanguage?: string
  }

  export function i18n(translator: Translator): RequestHandler
  export function language(config: LanguageConfig): RequestHandler
  export function requestId(): RequestHandler
  export function childLogger(logger: Logger): RequestHandler
}

export = ExpressMiddleware;
