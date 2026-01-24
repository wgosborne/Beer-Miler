/**
 * Format seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert MM:SS string to seconds
 */
export function parseTime(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  if (isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid time format');
  }
  return minutes * 60 + seconds;
}

/**
 * Get ISO date string (YYYY-MM-DD) from a Date object
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get Date object from ISO date string (YYYY-MM-DD)
 */
export function fromISODate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00Z');
}

/**
 * Get start of month (first day at 00:00:00)
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month - 1, 1);
}

/**
 * Get end of month (last day at 23:59:59)
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59);
}

/**
 * Get 3-month rolling window from today
 */
export function get3MonthWindow(): { start: Date; end: Date } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 3, 0, 23, 59, 59);
  return { start, end };
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Check if a date is more than 3 months in the future
 */
export function isOutof3MonthWindow(date: Date): boolean {
  const { end } = get3MonthWindow();
  return date > end;
}

/**
 * Format a date for display (e.g., "Mon, Jan 15, 2026")
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get calendar grid for a given month (all weeks with dates)
 */
export function getCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const grid: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    grid.push(week);
  }

  return grid;
}
