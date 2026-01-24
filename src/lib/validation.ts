import { z } from 'zod';

// Auth Schemas
export const SignupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Availability Schemas
export const AvailabilityUpdateSchema = z.object({
  updates: z.array(
    z.object({
      date: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
      isAvailable: z.boolean(),
    })
  ),
});

// Bet Schemas
export const TimeOverUnderBetSchema = z.object({
  betType: z.literal('time_over_under'),
  thresholdSeconds: z.number().min(0).max(1200, 'Time must be between 0 and 1200 seconds'),
  direction: z.enum(['over', 'under']),
});

export const ExactTimeGuessBetSchema = z.object({
  betType: z.literal('exact_time_guess'),
  guessedTimeSeconds: z.number().min(0).max(1200, 'Time must be between 0 and 1200 seconds'),
});

export const VomitPropBetSchema = z.object({
  betType: z.literal('vomit_prop'),
  prediction: z.enum(['yes', 'no']),
});

export const BetSchema = z.discriminatedUnion('betType', [
  TimeOverUnderBetSchema,
  ExactTimeGuessBetSchema,
  VomitPropBetSchema,
]);

// Admin Schemas
export const LockDateSchema = z.object({
  scheduledDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date format'),
});

export const AdminResultsSchema = z.object({
  finalTimeSeconds: z.number().min(0).max(1200, 'Time must be between 0 and 1200 seconds'),
  vomitOutcome: z.boolean(),
});

export const FinalizeResultsSchema = z.object({
  confirm: z.boolean(),
});

export const ResetResultsSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

// Type exports
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type AvailabilityUpdate = z.infer<typeof AvailabilityUpdateSchema>;
export type BetInput = z.infer<typeof BetSchema>;
export type LockDateInput = z.infer<typeof LockDateSchema>;
export type AdminResultsInput = z.infer<typeof AdminResultsSchema>;
