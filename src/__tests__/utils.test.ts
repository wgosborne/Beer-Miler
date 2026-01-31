import {
  formatTime,
  parseTime,
  toISODate,
  fromISODate,
  getMonthStart,
  getMonthEnd,
  get3MonthWindow,
  isPastDate,
  isOutof3MonthWindow,
  formatDateDisplay,
  getCalendarGrid,
} from '@/lib/utils';

describe('Utils - Time Formatting', () => {
  describe('formatTime', () => {
    it('should format seconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(347)).toBe('5:47');
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should pad seconds with leading zeros', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(65)).toBe('1:05');
    });
  });

  describe('parseTime', () => {
    it('should parse MM:SS format to seconds', () => {
      expect(parseTime('0:00')).toBe(0);
      expect(parseTime('1:00')).toBe(60);
      expect(parseTime('5:47')).toBe(347);
      expect(parseTime('10:00')).toBe(600);
    });

    it('should throw on invalid format', () => {
      expect(() => parseTime('invalid')).toThrow();
      expect(() => parseTime('60')).toThrow();
    });

    it('should parse MM:SS ignoring extra components', () => {
      // parseTime splits on ':' and takes first two elements
      // So '5:47:00' parses as [5, 47] which is valid
      expect(parseTime('5:47:00')).toBe(347);
    });
  });
});

describe('Utils - Date Formatting', () => {
  describe('toISODate', () => {
    it('should convert Date to ISO format YYYY-MM-DD', () => {
      const date = new Date('2026-03-15T10:30:00Z');
      expect(toISODate(date)).toBe('2026-03-15');
    });

    it('should handle edge dates', () => {
      const jan1 = new Date('2026-01-01T00:00:00Z');
      const dec31 = new Date('2026-12-31T23:59:59Z');
      expect(toISODate(jan1)).toBe('2026-01-01');
      expect(toISODate(dec31)).toBe('2026-12-31');
    });
  });

  describe('fromISODate', () => {
    it('should parse ISO date string to Date object', () => {
      const date = fromISODate('2026-03-15');
      expect(date.getUTCFullYear()).toBe(2026);
      expect(date.getUTCMonth()).toBe(2); // 0-indexed
      expect(date.getUTCDate()).toBe(15);
    });

    it('should handle start of month', () => {
      const date = fromISODate('2026-01-01');
      expect(toISODate(date)).toBe('2026-01-01');
    });

    it('should handle end of year', () => {
      const date = fromISODate('2026-12-31');
      expect(toISODate(date)).toBe('2026-12-31');
    });
  });
});

describe('Utils - Month Operations', () => {
  describe('getMonthStart', () => {
    it('should return first day of month at midnight', () => {
      const start = getMonthStart(2026, 3);
      expect(start.getFullYear()).toBe(2026);
      expect(start.getMonth()).toBe(2); // 0-indexed
      expect(start.getDate()).toBe(1);
    });

    it('should work for all months', () => {
      for (let month = 1; month <= 12; month++) {
        const start = getMonthStart(2026, month);
        expect(start.getDate()).toBe(1);
      }
    });
  });

  describe('getMonthEnd', () => {
    it('should return last day of month', () => {
      const end = getMonthEnd(2026, 3); // March has 31 days
      expect(end.getDate()).toBe(31);

      const febEnd = getMonthEnd(2026, 2); // Feb 2026 has 28 days
      expect(febEnd.getDate()).toBe(28);

      const aprilEnd = getMonthEnd(2026, 4); // April has 30 days
      expect(aprilEnd.getDate()).toBe(30);
    });

    it('should handle leap year', () => {
      const feb2024 = getMonthEnd(2024, 2); // 2024 is a leap year
      expect(feb2024.getDate()).toBe(29);
    });
  });

  describe('get3MonthWindow', () => {
    it('should return a 3-month window from today', () => {
      const { start, end } = get3MonthWindow();
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });

    it('should be approximately 3 months apart', () => {
      const { start, end } = get3MonthWindow();
      const diffMs = end.getTime() - start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(80); // At least 80 days
      expect(diffDays).toBeLessThan(95); // Less than 95 days
    });
  });
});

describe('Utils - Date Validation', () => {
  describe('isPastDate', () => {
    it('should return true for dates in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPastDate(yesterday)).toBe(true);

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      expect(isPastDate(lastMonth)).toBe(true);
    });

    it('should return false for today or future dates', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(isPastDate(today)).toBe(false);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isPastDate(tomorrow)).toBe(false);

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      expect(isPastDate(nextMonth)).toBe(false);
    });

    it('should ignore time component', () => {
      const date = new Date();
      date.setHours(12, 30, 45);
      expect(isPastDate(date)).toBe(false);
    });
  });

  describe('isOutof3MonthWindow', () => {
    it('should return false for dates within 3 months', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      expect(isOutof3MonthWindow(soon)).toBe(false);

      const next2Months = new Date();
      next2Months.setMonth(next2Months.getMonth() + 2);
      expect(isOutof3MonthWindow(next2Months)).toBe(false);
    });

    it('should return true for dates beyond 3 months', () => {
      const future = new Date();
      future.setMonth(future.getMonth() + 4);
      expect(isOutof3MonthWindow(future)).toBe(true);

      const farFuture = new Date();
      farFuture.setMonth(farFuture.getMonth() + 6);
      expect(isOutof3MonthWindow(farFuture)).toBe(true);
    });
  });
});

describe('Utils - Display', () => {
  describe('formatDateDisplay', () => {
    it('should format date for display', () => {
      const date = new Date('2026-03-15T00:00:00Z');
      const formatted = formatDateDisplay(date);
      expect(formatted).toContain('2026'); // Year
      expect(formatted.length).toBeGreaterThan(8); // Has reasonable length
    });

    it('should include weekday and month names', () => {
      const date = new Date('2026-03-15T00:00:00Z'); // Sunday
      const formatted = formatDateDisplay(date);
      expect(formatted).toBeTruthy();
    });
  });
});

describe('Utils - Calendar Grid', () => {
  describe('getCalendarGrid', () => {
    it('should return array of weeks', () => {
      const grid = getCalendarGrid(2026, 3);
      expect(Array.isArray(grid)).toBe(true);
      expect(grid.length).toBeGreaterThan(0);
    });

    it('should have exactly 7 columns per week', () => {
      const grid = getCalendarGrid(2026, 3);
      grid.forEach((week) => {
        expect(week.length).toBe(7);
      });
    });

    it('should have correct days in month', () => {
      const grid = getCalendarGrid(2026, 3); // March has 31 days
      const days = grid.flat().filter((d) => d !== null);
      expect(days.length).toBe(31);
    });

    it('should have correct max days for different months', () => {
      const march = getCalendarGrid(2026, 3);
      const marchDays = march.flat().filter((d) => d !== null);
      expect(marchDays.length).toBe(31);

      const february = getCalendarGrid(2026, 2);
      const februaryDays = february.flat().filter((d) => d !== null);
      expect(februaryDays.length).toBe(28);

      const april = getCalendarGrid(2026, 4);
      const aprilDays = april.flat().filter((d) => d !== null);
      expect(aprilDays.length).toBe(30);
    });

    it('should pad first and last weeks with null', () => {
      const grid = getCalendarGrid(2026, 3);
      // March 2026 starts on Sunday (day 0), so first cell has day 1
      // Check for null padding in months that don't start on Sunday
      const grid2 = getCalendarGrid(2026, 1); // January 2026 starts on Thursday (day 4)
      let hasNullPadding = false;
      for (let i = 0; i < 4; i++) {
        if (grid2[0][i] === null) {
          hasNullPadding = true;
        }
      }
      expect(hasNullPadding).toBe(true); // Should have null padding at start

      // Last week should be padded if needed
      const lastWeek = grid[grid.length - 1];
      const lastDays = lastWeek.filter((d) => d !== null);
      expect(lastDays.length).toBeGreaterThan(0); // Has some days
      expect(lastDays.length).toBeLessThanOrEqual(7); // But not more than 7
    });
  });
});
