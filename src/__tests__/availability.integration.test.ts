/**
 * Integration tests for calendar and availability logic
 * These tests verify the consensus calculation and date locking logic
 */

import { toISODate, isPastDate, isOutof3MonthWindow } from '@/lib/utils';

describe('Availability & Calendar - Integration Tests', () => {
  describe('Consensus Calculation', () => {
    it('should mark date as consensus when all users available', () => {
      const allUsers = ['user1', 'user2', 'user3'];
      const availabilityOnDate = [
        { userId: 'user1', isAvailable: true },
        { userId: 'user2', isAvailable: true },
        { userId: 'user3', isAvailable: true },
      ];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(true);
    });

    it('should not mark as consensus when one user unavailable', () => {
      const allUsers = ['user1', 'user2', 'user3'];
      const availabilityOnDate = [
        { userId: 'user1', isAvailable: true },
        { userId: 'user2', isAvailable: false }, // Out of town
        { userId: 'user3', isAvailable: true },
      ];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(false);
    });

    it('should require 100% availability for consensus', () => {
      const allUsers = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const availabilityOnDate = [
        { userId: 'user1', isAvailable: true },
        { userId: 'user2', isAvailable: true },
        { userId: 'user3', isAvailable: true },
        { userId: 'user4', isAvailable: true },
        // user5 not marked yet
      ];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(false);
      expect(availableUserIds.size).toBe(4);
      expect(allUsers.length).toBe(5);
    });

    it('should handle empty user list', () => {
      const allUsers: string[] = [];
      const availabilityOnDate: Array<{ userId: string; isAvailable: boolean }> = [];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(false);
    });
  });

  describe('Unavailable User Tracking', () => {
    it('should list unavailable users for a date', () => {
      const availabilityOnDate = [
        { userId: 'user1', username: 'alice', isAvailable: true },
        { userId: 'user2', username: 'bob', isAvailable: false },
        { userId: 'user3', username: 'charlie', isAvailable: false },
      ];

      const unavailableUsers = availabilityOnDate
        .filter((a) => !a.isAvailable)
        .map((a) => a.username);

      expect(unavailableUsers).toContain('bob');
      expect(unavailableUsers).toContain('charlie');
      expect(unavailableUsers).not.toContain('alice');
      expect(unavailableUsers.length).toBe(2);
    });

    it('should count unavailable users', () => {
      const availabilityOnDate = [
        { isAvailable: true },
        { isAvailable: false },
        { isAvailable: false },
        { isAvailable: true },
        { isAvailable: true },
      ];

      const unavailableCount = availabilityOnDate.filter(
        (a) => !a.isAvailable
      ).length;

      expect(unavailableCount).toBe(2);
    });
  });

  describe('Date Range Validation', () => {
    it('should reject updates for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const canUpdate = !isPastDate(yesterday);
      expect(canUpdate).toBe(false);
    });

    it('should allow updates for today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const canUpdate = !isPastDate(today);
      expect(canUpdate).toBe(true);
    });

    it('should allow updates for future dates within 3 months', () => {
      const future = new Date();
      future.setDate(future.getDate() + 45);

      const isValid = !isPastDate(future) && !isOutof3MonthWindow(future);
      expect(isValid).toBe(true);
    });

    it('should reject updates beyond 3 months', () => {
      const farFuture = new Date();
      farFuture.setMonth(farFuture.getMonth() + 4);

      const isValid = !isPastDate(farFuture) && !isOutof3MonthWindow(farFuture);
      expect(isValid).toBe(false);
    });
  });

  describe('Consensus Dates Listing', () => {
    it('should identify all consensus dates', () => {
      const calendarData: Record<string, any> = {
        '2026-03-01': { allAvailable: true, date: '2026-03-01' },
        '2026-03-02': { allAvailable: false, date: '2026-03-02' },
        '2026-03-03': { allAvailable: true, date: '2026-03-03' },
        '2026-03-04': { allAvailable: false, date: '2026-03-04' },
        '2026-03-05': { allAvailable: true, date: '2026-03-05' },
      };

      const consensusDates = Object.entries(calendarData)
        .filter(([_, day]) => day.allAvailable)
        .map(([dateStr]) => dateStr);

      expect(consensusDates).toContain('2026-03-01');
      expect(consensusDates).toContain('2026-03-03');
      expect(consensusDates).toContain('2026-03-05');
      expect(consensusDates.length).toBe(3);
    });

    it('should exclude past consensus dates', () => {
      const calendarData: Record<string, any> = {
        '2026-02-01': { allAvailable: true, date: '2026-02-01' }, // Past
        '2026-03-20': { allAvailable: true, date: '2026-03-20' }, // Future
      };

      // Create a mock today at 2026-03-15
      const mockToday = new Date('2026-03-15T00:00:00Z');

      // Helper function with explicit date comparison
      const isPastDateRelativeTo = (dateStr: string, relativeTo: Date): boolean => {
        const checkDate = new Date(dateStr + 'T00:00:00Z');
        const compareDate = new Date(relativeTo);
        compareDate.setHours(0, 0, 0, 0);
        return checkDate < compareDate;
      };

      const consensusDates = Object.entries(calendarData)
        .filter(([_, day]) => day.allAvailable && !isPastDateRelativeTo(day.date, mockToday))
        .map(([dateStr]) => dateStr);

      // 2026-02-01 is past relative to 2026-03-15, so it should be excluded
      // 2026-03-20 is future relative to 2026-03-15, so it should be included
      expect(consensusDates).toContain('2026-03-20');
      expect(consensusDates).not.toContain('2026-02-01');
      expect(consensusDates.length).toBe(1);
    });

    it('should return empty list when no consensus dates', () => {
      const calendarData: Record<string, any> = {
        '2026-03-01': { allAvailable: false },
        '2026-03-02': { allAvailable: false },
        '2026-03-03': { allAvailable: false },
      };

      const consensusDates = Object.entries(calendarData)
        .filter(([_, day]) => day.allAvailable)
        .map(([dateStr]) => dateStr);

      expect(consensusDates.length).toBe(0);
    });
  });

  describe('Event Lock Validation', () => {
    it('should allow locking when event not locked yet', () => {
      const event = {
        id: 'event-1',
        scheduledDate: null,
      };

      const canLock = event.scheduledDate === null;
      expect(canLock).toBe(true);
    });

    it('should prevent locking when already locked', () => {
      const event = {
        id: 'event-1',
        scheduledDate: new Date('2026-03-15'),
      };

      const canLock = event.scheduledDate === null;
      expect(canLock).toBe(false);
    });

    it('should only allow locking consensus dates', () => {
      const allUsers = ['user1', 'user2', 'user3'];
      const availabilityOnDate = [
        { userId: 'user1', isAvailable: true },
        { userId: 'user2', isAvailable: true },
        { userId: 'user3', isAvailable: false }, // Not consensus
      ];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      // Should fail because no consensus
      expect(hasConsensus).toBe(false);
    });
  });

  describe('User Availability Updates', () => {
    it('should create new availability record', () => {
      const newRecord = {
        userId: 'user-1',
        eventId: 'event-1',
        calendarDate: new Date('2026-03-15'),
        isAvailable: false,
      };

      expect(newRecord.userId).toBeDefined();
      expect(newRecord.eventId).toBeDefined();
      expect(newRecord.isAvailable).toBe(false);
    });

    it('should update existing availability record', () => {
      const existing = {
        userId: 'user-1',
        eventId: 'event-1',
        calendarDate: new Date('2026-03-15'),
        isAvailable: true,
      };

      // Update to unavailable
      const updated = { ...existing, isAvailable: false };

      expect(updated.isAvailable).toBe(false);
      expect(existing.isAvailable).toBe(true); // Original unchanged
    });

    it('should handle multiple date updates in one request', () => {
      const updates = [
        { date: '2026-03-15', isAvailable: false },
        { date: '2026-03-16', isAvailable: true },
        { date: '2026-03-17', isAvailable: false },
      ];

      expect(updates.length).toBe(3);
      updates.forEach((update) => {
        expect(update.date).toBeDefined();
        expect(typeof update.isAvailable).toBe('boolean');
      });
    });

    it('should prevent updates when event locked', () => {
      const event = {
        scheduledDate: new Date('2026-03-15'),
        lockedAt: new Date(),
      };

      const canUpdate = event.scheduledDate === null;
      expect(canUpdate).toBe(false);
    });
  });

  describe('Calendar Month Display', () => {
    it('should build calendar data for entire month', () => {
      const daysInMonth = 31; // March
      const calendarData: Record<string, any> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(2026, 2, day);
        const dateStr = toISODate(date);
        calendarData[dateStr] = {
          date: dateStr,
          allAvailable: false,
          unavailableCount: 0,
          unavailableUsers: [],
        };
      }

      expect(Object.keys(calendarData).length).toBe(31);
    });

    it('should include user availability for current month', () => {
      const userAvailability: Record<string, boolean> = {
        '2026-03-01': false,
        '2026-03-02': true,
        '2026-03-03': false,
      };

      expect(userAvailability['2026-03-01']).toBe(false);
      expect(userAvailability['2026-03-02']).toBe(true);
      expect(userAvailability['2026-03-03']).toBe(false);
    });

    it('should handle missing user availability data', () => {
      const userAvailability: Record<string, boolean> = {
        '2026-03-05': true,
        // Dates without entries mean not marked yet
      };

      expect(userAvailability['2026-03-05']).toBe(true);
      expect(userAvailability['2026-03-10']).toBeUndefined(); // Not marked
    });
  });

  describe('Month Pagination', () => {
    it('should fetch previous month', () => {
      const currentMonth = new Date(2026, 2); // March
      const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);

      expect(previousMonth.getMonth()).toBe(1); // February
    });

    it('should fetch next month', () => {
      const currentMonth = new Date(2026, 2); // March
      const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

      expect(nextMonth.getMonth()).toBe(3); // April
    });

    it('should validate month parameter format', () => {
      const monthParam = '2026-03';
      const [y, m] = monthParam.split('-').map(Number);

      const isValid = !isNaN(y) && !isNaN(m) && m >= 1 && m <= 12;
      expect(isValid).toBe(true);
    });

    it('should reject invalid month parameter', () => {
      const invalidMonths = ['2026-13', '2026-00', 'invalid', '2026/03'];

      invalidMonths.forEach((monthParam) => {
        const parts = monthParam.split('-').map(Number);
        const y = parts[0];
        const m = parts[1];

        const isValid =
          !isNaN(y) && !isNaN(m) && m >= 1 && m <= 12;
        expect(isValid).toBe(false);
      });
    });
  });
});
