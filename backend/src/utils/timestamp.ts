/**
 * Get current timestamp in ISO format for database storage
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format date for SQLite (YYYY-MM-DD HH:MM:SS)
 */
export function formatDateForDB(date: Date = new Date()): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}
