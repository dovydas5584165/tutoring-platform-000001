/**
 * Lesson-request limits (slot counts, notice, calendar hours). Shared by the browser and the API routes, so no server imports here.
 */

export const MIN_SLOTS = 5;
export const MAX_SLOTS = 30;
export const LESSON_MINUTES = 45;
export const MIN_NOTICE_HOURS = 2;   // a slot must start at least this far in the future
export const MAX_DAYS_AHEAD = 35;
export const FIRST_HOUR = 8;         // calendar rows: 8:00 ...
export const LAST_HOUR = 21;         // ... 21:00
