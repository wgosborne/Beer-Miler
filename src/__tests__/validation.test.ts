import {
  SignupSchema,
  LoginSchema,
  AvailabilityUpdateSchema,
  LockDateSchema,
  TimeOverUnderBetSchema,
  ExactTimeGuessBetSchema,
  VomitPropBetSchema,
  BetSchema,
} from '@/lib/validation';

describe('Validation - Authentication', () => {
  describe('SignupSchema', () => {
    it('should validate correct signup data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject username with < 3 characters', () => {
      const data = {
        username: 'ab',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject username with > 20 characters', () => {
      const data = {
        username: 'a'.repeat(21),
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject username with invalid characters', () => {
      const data = {
        username: 'test-user',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow username with alphanumeric and underscore', () => {
      const data = {
        username: 'test_user123',
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password with < 8 characters', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass12!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password!',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      };
      const result = SignupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ',', '.', '?', '"', ':', '{', '}', '|', '<', '>'];
      specialChars.forEach((char) => {
        const data = {
          username: 'testuser',
          email: 'test@example.com',
          password: `Password123${char}`,
        };
        const result = SignupSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('LoginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      const result = LoginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'Password123!',
      };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow any non-empty password', () => {
      const data = {
        email: 'test@example.com',
        password: 'anything',
      };
      const result = LoginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});

describe('Validation - Availability', () => {
  describe('AvailabilityUpdateSchema', () => {
    it('should validate correct availability updates', () => {
      const validData = {
        updates: [
          { date: '2026-03-15', isAvailable: false },
          { date: '2026-03-16', isAvailable: true },
        ],
      };
      const result = AvailabilityUpdateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const data = {
        updates: [{ date: '15/03/2026', isAvailable: false }],
      };
      const result = AvailabilityUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean isAvailable', () => {
      const data = {
        updates: [{ date: '2026-03-15', isAvailable: 'false' }],
      };
      const result = AvailabilityUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept empty updates array', () => {
      const data = { updates: [] };
      const result = AvailabilityUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject missing updates field', () => {
      const data = {};
      const result = AvailabilityUpdateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('LockDateSchema', () => {
    it('should validate correct date format', () => {
      const data = { scheduledDate: '2026-03-15' };
      const result = LockDateSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const data = { scheduledDate: '15/03/2026' };
      const result = LockDateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject non-date string', () => {
      const data = { scheduledDate: 'invalid' };
      const result = LockDateSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation - Bets', () => {
  describe('TimeOverUnderBetSchema', () => {
    it('should validate correct over/under bet', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: 360,
        direction: 'over',
      };
      const result = TimeOverUnderBetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept "under" direction', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: 360,
        direction: 'under',
      };
      const result = TimeOverUnderBetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid direction', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: 360,
        direction: 'invalid',
      };
      const result = TimeOverUnderBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject negative threshold', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: -10,
        direction: 'over',
      };
      const result = TimeOverUnderBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject threshold > 1200', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: 1201,
        direction: 'over',
      };
      const result = TimeOverUnderBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should accept threshold 0 and 1200', () => {
      expect(TimeOverUnderBetSchema.safeParse({
        betType: 'time_over_under',
        thresholdSeconds: 0,
        direction: 'over',
      }).success).toBe(true);

      expect(TimeOverUnderBetSchema.safeParse({
        betType: 'time_over_under',
        thresholdSeconds: 1200,
        direction: 'under',
      }).success).toBe(true);
    });
  });

  describe('ExactTimeGuessBetSchema', () => {
    it('should validate correct exact time guess', () => {
      const data = {
        betType: 'exact_time_guess',
        guessedTimeSeconds: 347,
      };
      const result = ExactTimeGuessBetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject negative time', () => {
      const data = {
        betType: 'exact_time_guess',
        guessedTimeSeconds: -100,
      };
      const result = ExactTimeGuessBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject time > 1200', () => {
      const data = {
        betType: 'exact_time_guess',
        guessedTimeSeconds: 1201,
      };
      const result = ExactTimeGuessBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('VomitPropBetSchema', () => {
    it('should validate "yes" prediction', () => {
      const data = {
        betType: 'vomit_prop',
        prediction: 'yes',
      };
      const result = VomitPropBetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate "no" prediction', () => {
      const data = {
        betType: 'vomit_prop',
        prediction: 'no',
      };
      const result = VomitPropBetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid prediction', () => {
      const data = {
        betType: 'vomit_prop',
        prediction: 'maybe',
      };
      const result = VomitPropBetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('BetSchema (discriminated union)', () => {
    it('should validate time_over_under bet', () => {
      const data = {
        betType: 'time_over_under',
        thresholdSeconds: 360,
        direction: 'over',
      };
      const result = BetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate exact_time_guess bet', () => {
      const data = {
        betType: 'exact_time_guess',
        guessedTimeSeconds: 347,
      };
      const result = BetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate vomit_prop bet', () => {
      const data = {
        betType: 'vomit_prop',
        prediction: 'yes',
      };
      const result = BetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject unknown bet type', () => {
      const data = {
        betType: 'unknown_bet',
      };
      const result = BetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
