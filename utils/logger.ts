export const logger = {
  log: (message: string, data?: unknown) => {
    if (__DEV__) console.log(`[LOG] ${message}`, data);
  },
  error: (message: string, error?: unknown) => {
    if (__DEV__) console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: unknown) => {
    if (__DEV__) console.warn(`[WARN] ${message}`, data);
  }
}
