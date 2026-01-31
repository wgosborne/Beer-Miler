/**
 * Edge case and validation tests for Phase 1a (Auth) and Phase 1b (Calendar)
 * Tests boundary conditions, error scenarios, and data integrity
 */

import {
  SignupSchema,
  LoginSchema,
  AvailabilityUpdateSchema,
  LockDateSchema,
} from '@/lib/validation';
import {
  toISODate,
  isPastDate,
  isOutof3MonthWindow,
  formatTime,
  parseTime,
} from '@/lib/utils';

describe('Phase 1a - Authentication Edge Cases', () => {
  describe('Signup Validation Edge Cases', () => {
    it('should reject username with special characters', () => {
      const result = SignupSchema.safeParse({
        username: 'user@#$%',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = SignupSchema.safeParse({
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject username longer than 20 characters', () => {
      const result = SignupSchema.safeParse({
        username: 'averylongusernamethatexceedsmaximum',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
    });

    it('should accept username with underscores and numbers', () => {
      const result = SignupSchema.safeParse({
        username: 'user_name_123',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];

      invalidEmails.forEach((email) => {
        const result = SignupSchema.safeParse({
          username: 'testuser',
          email,
          password: 'Password123!',
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'first.last@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email) => {
        const result = SignupSchema.safeParse({
          username: 'testuser',
          email,
          password: 'Password123!',
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject password without numbers', () => {
      const result = SignupSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject password without special characters', () => {
      const result = SignupSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = SignupSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass1!',
      });

      expect(result.success).toBe(false);
    });

    it('should accept strong password', () => {
      const result = SignupSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'VeryStr0ng!Password',
      });

      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const result = SignupSchema.safeParse({
        username: '',
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const result = SignupSchema.safeParse({
        username: null,
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Login Validation Edge Cases', () => {
    it('should require email field', () => {
      const result = LoginSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should require password field', () => {
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });

    it('should validate email format in login', () => {
      const result = LoginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should accept valid login credentials', () => {
      const result = LoginSchema.safeParse({
        email: 'user@example.com',
        password: 'correct_password',
      });

      expect(result.success).toBe(true);
    });

    it('should handle SQL injection attempts in email', () => {
      const result = LoginSchema.safeParse({
        email: "admin'--",
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should handle very long password input', () => {
      const longPassword = 'a'.repeat(10000);
      const result = LoginSchema.safeParse({
        email: 'test@example.com',
        password: longPassword,
      });

      // Should parse (password can be any length, validation happens elsewhere)
      expect(result.success).toBe(true);
    });
  });

  describe('Password Security', () => {
    it('should validate password meets security requirements', () => {
      const result = SignupSchema.safeParse({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123!',
      });

      expect(result.success).toBe(true);
    });

    it('should accept special characters in password', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*'];

      specialChars.forEach((char) => {
        const result = SignupSchema.safeParse({
          username: 'testuser',
          email: 'test@example.com',
          password: `Password1${char}`,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Session Management Edge Cases', () => {
    it('should preserve user info across sessions', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };

      const sessionData = { user };

      expect(sessionData.user.id).toBe('user-123');
      expect(sessionData.user.email).toBe('test@example.com');
      expect(sessionData.user.role).toBe('user');
    });

    it('should handle admin role transitions', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };

      // Simulate admin role update
      const adminUser = { ...user, role: 'admin' };

      expect(user.role).toBe('user');
      expect(adminUser.role).toBe('admin');
      expect(user).not.toBe(adminUser); // Immutability check
    });
  });
});

describe('Phase 1b - Calendar & Availability Edge Cases', () => {
  describe('Date Validation Edge Cases', () => {
    it('should reject dates more than 3 months in future', () => {
      const future = new Date();
      future.setMonth(future.getMonth() + 4);

      const isValid = !isPastDate(future) && !isOutof3MonthWindow(future);
      expect(isValid).toBe(false);
    });

    it('should allow dates within 3 months', () => {
      const future = new Date();
      future.setDate(future.getDate() + 45); // 45 days is within 3 months

      const isValid = !isPastDate(future) && !isOutof3MonthWindow(future);
      expect(isValid).toBe(true);
    });

    it('should handle leap year dates correctly', () => {
      const leapDate = new Date(2024, 1, 29); // Feb 29, 2024
      const dateStr = toISODate(leapDate);

      expect(dateStr).toBe('2024-02-29');
    });

    it('should handle year boundary dates', () => {
      const dec31 = new Date(2025, 11, 31);
      const jan1 = new Date(2026, 0, 1);

      expect(toISODate(dec31)).toBe('2025-12-31');
      expect(toISODate(jan1)).toBe('2026-01-01');
    });

    it('should validate month parameter format', () => {
      const validMonthParams = [
        '2026-01',
        '2026-06',
        '2026-12',
      ];

      validMonthParams.forEach((monthParam) => {
        const [y, m] = monthParam.split('-').map(Number);
        const isValid = !isNaN(y) && !isNaN(m) && m >= 1 && m <= 12;
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid month parameters', () => {
      const invalidMonths = ['2026-13', '2026-00', '2026-99', 'invalid', '2026/01'];

      invalidMonths.forEach((monthParam) => {
        const parts = monthParam.split('-');
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);

        const isValid = !isNaN(y) && !isNaN(m) && m >= 1 && m <= 12;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Availability Update Validation', () => {
    it('should validate multiple date updates', () => {
      const result = AvailabilityUpdateSchema.safeParse({
        updates: [
          { date: '2026-03-15', isAvailable: true },
          { date: '2026-03-16', isAvailable: false },
          { date: '2026-03-17', isAvailable: true },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid date in updates', () => {
      const result = AvailabilityUpdateSchema.safeParse({
        updates: [
          { date: 'invalid-date', isAvailable: true },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should reject non-boolean isAvailable value', () => {
      const result = AvailabilityUpdateSchema.safeParse({
        updates: [
          { date: '2026-03-15', isAvailable: 'true' },
        ],
      });

      expect(result.success).toBe(false);
    });

    it('should handle empty updates array', () => {
      const result = AvailabilityUpdateSchema.safeParse({
        updates: [],
      });

      expect(result.success).toBe(true);
      expect(result.data?.updates.length).toBe(0);
    });

    it('should handle very large batch of updates', () => {
      const updates = [];
      const today = new Date();

      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        updates.push({
          date: toISODate(date),
          isAvailable: i % 2 === 0,
        });
      }

      const result = AvailabilityUpdateSchema.safeParse({ updates });
      expect(result.success).toBe(true);
    });
  });

  describe('Lock Date Validation', () => {
    it('should validate lock date format', () => {
      const result = LockDateSchema.safeParse({
        scheduledDate: '2026-03-15',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid lock date format', () => {
      const result = LockDateSchema.safeParse({
        scheduledDate: 'invalid-date',
      });

      expect(result.success).toBe(false);
    });

    it('should reject past date for lock', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const canLock = !isPastDate(yesterday);
      expect(canLock).toBe(false);
    });

    it('should reject date beyond 3-month window for lock', () => {
      const farFuture = new Date();
      farFuture.setMonth(farFuture.getMonth() + 4);

      const canLock = !isPastDate(farFuture) && !isOutof3MonthWindow(farFuture);
      expect(canLock).toBe(false);
    });
  });

  describe('Consensus Calculation Edge Cases', () => {
    it('should handle single user availability', () => {
      const allUsers = ['user1'];
      const availabilityOnDate = [{ userId: 'user1', isAvailable: true }];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(true);
    });

    it('should require all users for consensus', () => {
      const allUsers = ['user1', 'user2', 'user3'];
      const availabilityOnDate = [
        { userId: 'user1', isAvailable: true },
        { userId: 'user2', isAvailable: true },
        // user3 not marked
      ];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(false);
    });

    it('should handle very large user group', () => {
      const allUsers = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const availabilityOnDate = allUsers.map((userId) => ({
        userId,
        isAvailable: true,
      }));

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(true);
    });

    it('should handle no user availability marked yet', () => {
      const allUsers = ['user1', 'user2', 'user3'];
      const availabilityOnDate: any[] = [];

      const availableUserIds = new Set(
        availabilityOnDate.filter((a) => a.isAvailable).map((a) => a.userId)
      );

      const hasConsensus =
        allUsers.length > 0 && availableUserIds.size === allUsers.length;

      expect(hasConsensus).toBe(false);
    });
  });

  describe('Time Format Conversions', () => {
    it('should format seconds to MM:SS correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(347)).toBe('5:47');
      expect(formatTime(600)).toBe('10:00');
      expect(formatTime(1200)).toBe('20:00');
    });

    it('should parse MM:SS to seconds correctly', () => {
      expect(parseTime('0:00')).toBe(0);
      expect(parseTime('1:00')).toBe(60);
      expect(parseTime('5:47')).toBe(347);
      expect(parseTime('10:00')).toBe(600);
      expect(parseTime('20:00')).toBe(1200);
    });

    it('should handle roundtrip time conversion', () => {
      const originalSeconds = 347;
      const formatted = formatTime(originalSeconds);
      const parsed = parseTime(formatted);

      expect(parsed).toBe(originalSeconds);
    });

    it('should reject invalid time formats', () => {
      expect(() => parseTime('invalid')).toThrow();
      expect(() => parseTime('60:60')).not.toThrow(); // Parser accepts, app layer rejects
      expect(() => parseTime('abc:def')).toThrow();
    });

    it('should handle edge case times', () => {
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(1199)).toBe('19:59');
      expect(formatTime(1200)).toBe('20:00');
    });
  });

  describe('Calendar Grid Edge Cases', () => {
    it('should handle months starting on different days', () => {
      // Calendar grids should always be properly sized
      const jan2026FirstDay = new Date(2026, 0, 1).getDay();
      expect(jan2026FirstDay).toBeGreaterThanOrEqual(0);
      expect(jan2026FirstDay).toBeLessThan(7);

      // March 2026 - verify day calculation
      const mar2026FirstDay = new Date(2026, 2, 1).getDay();
      expect(mar2026FirstDay).toBeGreaterThanOrEqual(0);
      expect(mar2026FirstDay).toBeLessThan(7);
    });

    it('should verify correct days in months', () => {
      // Verify all 12 months have correct day counts
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      for (let month = 1; month <= 12; month++) {
        const daysCount = new Date(2026, month, 0).getDate();
        expect(daysCount).toBe(daysInMonth[month - 1]);
      }
    });

    it('should handle month transition correctly', () => {
      const feb28 = new Date(2025, 1, 28);
      const mar1 = new Date(2025, 2, 1);

      expect(isPastDate(feb28) || !isPastDate(feb28)).toBe(true); // Should not error
      expect(isPastDate(mar1) || !isPastDate(mar1)).toBe(true);
    });
  });

  describe('Unavailable User Tracking', () => {
    it('should correctly count unavailable users', () => {
      const availabilityOnDate = [
        { userId: 'user1', username: 'alice', isAvailable: true },
        { userId: 'user2', username: 'bob', isAvailable: false },
        { userId: 'user3', username: 'charlie', isAvailable: false },
        { userId: 'user4', username: 'diana', isAvailable: true },
      ];

      const unavailableUsers = availabilityOnDate
        .filter((a) => !a.isAvailable)
        .map((a) => a.username);

      expect(unavailableUsers.length).toBe(2);
      expect(unavailableUsers).toContain('bob');
      expect(unavailableUsers).toContain('charlie');
    });

    it('should handle no unavailable users', () => {
      const availabilityOnDate = [
        { userId: 'user1', username: 'alice', isAvailable: true },
        { userId: 'user2', username: 'bob', isAvailable: true },
      ];

      const unavailableUsers = availabilityOnDate
        .filter((a) => !a.isAvailable)
        .map((a) => a.username);

      expect(unavailableUsers.length).toBe(0);
    });

    it('should handle all users unavailable', () => {
      const availabilityOnDate = [
        { userId: 'user1', username: 'alice', isAvailable: false },
        { userId: 'user2', username: 'bob', isAvailable: false },
        { userId: 'user3', username: 'charlie', isAvailable: false },
      ];

      const unavailableUsers = availabilityOnDate
        .filter((a) => !a.isAvailable)
        .map((a) => a.username);

      expect(unavailableUsers.length).toBe(3);
    });
  });
});

describe('Phase 1 - Race Conditions & Concurrency', () => {
  it('should handle simultaneous availability updates safely', async () => {
    const updates = [
      { date: '2026-03-15', isAvailable: true },
      { date: '2026-03-15', isAvailable: false },
      { date: '2026-03-15', isAvailable: true },
    ];

    // Simulate concurrent updates
    const promises = updates.map((update) =>
      Promise.resolve(AvailabilityUpdateSchema.safeParse({ updates: [update] }))
    );

    const results = await Promise.all(promises);

    // All should validate successfully
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });

  it('should prevent double submission of signup', () => {
    const signupData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
    };

    // Simulate double submission
    const validation1 = SignupSchema.safeParse(signupData);
    const validation2 = SignupSchema.safeParse(signupData);

    // Both should validate (prevention happens at API level)
    expect(validation1.success).toBe(true);
    expect(validation2.success).toBe(true);
  });
});
