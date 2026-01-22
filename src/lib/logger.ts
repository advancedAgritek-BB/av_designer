/**
 * Logger Utility - Structured logging that only logs in development
 *
 * Provides consistent logging format across the application with
 * environment-aware behavior (only logs debug/info/warn in development).
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug(message: string, data?: unknown): void {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data ?? '');
    }
  },

  info(message: string, data?: unknown): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  },

  warn(message: string, data?: unknown): void {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
  },

  error(message: string, error?: unknown): void {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, error ?? '');
  },
};
