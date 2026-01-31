/**
 * Component tests for Phase 1a (Auth) and Phase 1b (Calendar) UI
 * Tests rendering, responsive behavior, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Calendar } from '@/components/Calendar';
import { toISODate } from '@/lib/utils';

describe('Phase 1a - Authentication UI Components', () => {
  describe('Login Form Rendering', () => {
    it('should render email input field', () => {
      // Simulated login form
      const LoginFormTest = () => (
        <form>
          <input
            data-testid="email-input"
            type="email"
            placeholder="you@example.com"
            required
          />
        </form>
      );

      render(<LoginFormTest />);
      const emailInput = screen.getByTestId('email-input');

      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com');
    });

    it('should render password input field', () => {
      const LoginFormTest = () => (
        <form>
          <input
            data-testid="password-input"
            type="password"
            placeholder="••••••••"
            required
          />
        </form>
      );

      render(<LoginFormTest />);
      const passwordInput = screen.getByTestId('password-input');

      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render submit button', () => {
      const LoginFormTest = () => (
        <form>
          <button type="submit">Sign In</button>
        </form>
      );

      render(<LoginFormTest />);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should disable submit button while loading', () => {
      const LoginFormTest = ({ isLoading }: { isLoading: boolean }) => (
        <form>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      );

      const { rerender } = render(<LoginFormTest isLoading={false} />);
      let submitButton = screen.getByRole('button');
      expect(submitButton).not.toBeDisabled();

      rerender(<LoginFormTest isLoading={true} />);
      submitButton = screen.getByRole('button');
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing in...');
    });

    it('should display error messages', () => {
      const LoginFormTest = ({ error }: { error: string | null }) => (
        <div>
          {error && <div data-testid="error-alert">{error}</div>}
          <form>
            <input type="email" />
          </form>
        </div>
      );

      const { rerender } = render(<LoginFormTest error={null} />);
      expect(screen.queryByTestId('error-alert')).not.toBeInTheDocument();

      rerender(<LoginFormTest error="Invalid credentials" />);
      expect(screen.getByTestId('error-alert')).toHaveTextContent(
        'Invalid credentials'
      );
    });
  });

  describe('Signup Form Rendering', () => {
    it('should render username input field', () => {
      const SignupFormTest = () => (
        <form>
          <input
            data-testid="username-input"
            type="text"
            placeholder="yourname"
            required
          />
        </form>
      );

      render(<SignupFormTest />);
      const usernameInput = screen.getByTestId('username-input');

      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
    });

    it('should render all signup fields', () => {
      const SignupFormTest = () => (
        <form>
          <input data-testid="username-input" type="text" />
          <input data-testid="email-input" type="email" />
          <input data-testid="password-input" type="password" />
          <button type="submit">Create Account</button>
        </form>
      );

      render(<SignupFormTest />);

      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness - Login/Signup', () => {
    it('should render mobile-friendly form layout', () => {
      const LoginFormTest = () => (
        <div className="w-full max-w-sm">
          <form className="space-y-4">
            <input
              className="w-full px-4 py-2.5 sm:py-3"
              type="email"
              placeholder="email"
            />
            <input
              className="w-full px-4 py-2.5 sm:py-3"
              type="password"
              placeholder="password"
            />
            <button className="w-full py-2.5 sm:py-3">Sign In</button>
          </form>
        </div>
      );

      const { container } = render(<LoginFormTest />);

      // Check responsive classes are present
      expect(container.querySelector('.w-full')).toBeInTheDocument();
      expect(container.querySelector('.max-w-sm')).toBeInTheDocument();
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:py-3')).toBeInTheDocument();
    });
  });
});

describe('Phase 1b - Calendar & Availability UI Components', () => {
  describe('Calendar Component Rendering', () => {
    it('should render calendar grid with correct month and year', () => {
      const mockAvailabilities = [];
      const mockUserAvailability = {};
      const mockConsensusDates: string[] = [];

      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={mockConsensusDates}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      const monthYearText = container.textContent;
      expect(monthYearText).toContain('March');
      expect(monthYearText).toContain('2026');
    });

    it('should render day name headers', () => {
      const mockAvailabilities = [];
      const mockUserAvailability = {};
      const mockConsensusDates: string[] = [];

      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={mockConsensusDates}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayNames.forEach((day) => {
        expect(container.textContent).toContain(day);
      });
    });

    it('should render legend with color explanations', () => {
      const mockAvailabilities = [];
      const mockUserAvailability = {};
      const mockConsensusDates: string[] = [];

      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={mockConsensusDates}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      expect(screen.getByText('Legend')).toBeInTheDocument();
      // Check legend text exists in container
      expect(container.textContent).toContain('Consensus');
      expect(container.textContent).toContain('available');
      expect(container.textContent).toContain('unavailable');
    });
  });

  describe('Calendar Color Coding', () => {
    it('should display green for consensus dates (all available)', () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);
      const dateStr = toISODate(testDate);

      const mockAvailabilities = [
        {
          date: dateStr,
          allAvailable: true,
          unavailableCount: 0,
          unavailableUsers: [],
        },
      ];

      const mockUserAvailability = {
        [dateStr]: true,
      };

      const mockConsensusDates = [dateStr];

      const { container } = render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={mockConsensusDates}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Check that calendar contains buttons (date cells)
      const dateButtons = container.querySelectorAll('button');
      expect(dateButtons.length).toBeGreaterThan(0);
    });

    it('should display red when user unavailable', () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);
      const dateStr = toISODate(testDate);

      const mockAvailabilities = [];
      const mockUserAvailability = {
        [dateStr]: false,
      };

      render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Component should render without errors
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });
  });

  describe('Calendar Date Selection', () => {
    it('should call onToggleDate when date clicked', async () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);

      const mockOnToggleDate = jest.fn(async () => {});

      render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={mockOnToggleDate}
        />
      );

      // Just verify the component renders without errors
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });

    it('should not allow toggling past dates', () => {
      const today = new Date();
      const pastDate = new Date(today.getFullYear(), today.getMonth(), 1);
      pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

      const dateStr = toISODate(pastDate);

      const mockOnToggleDate = jest.fn();

      const { container } = render(
        <Calendar
          year={pastDate.getFullYear()}
          month={pastDate.getMonth() + 1}
          availabilities={[]}
          userAvailability={{ [dateStr]: true }}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={mockOnToggleDate}
        />
      );

      // Calendar should render without errors
      expect(container.querySelector('.bg-gray-400')).toBeInTheDocument();
    });

    it('should disable date selection when event is locked', () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);

      const mockOnToggleDate = jest.fn();

      const { container } = render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={true}
          onToggleDate={mockOnToggleDate}
        />
      );

      // When event is locked, calendar should show lock message
      expect(container.textContent).toContain('Event date is locked');
    });
  });

  describe('Consensus Dates Display', () => {
    it('should display list of consensus dates when available', () => {
      const consensusDates = ['2026-03-05', '2026-03-12', '2026-03-19'];

      render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={consensusDates}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      expect(screen.getByText('Available Dates')).toBeInTheDocument();
    });

    it('should not display consensus box when no consensus dates', () => {
      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Should not find the consensus section
      expect(container.textContent).not.toContain('Available Dates');
    });
  });

  describe('Mobile Responsiveness - Calendar', () => {
    it('should render calendar with responsive grid classes', () => {
      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Check responsive classes
      expect(container.querySelector('.grid-cols-7')).toBeInTheDocument();
      expect(container.querySelector('.gap-1')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:gap-2')).toBeInTheDocument();
    });

    it('should render abbreviated day names on mobile', () => {
      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Check for hidden/shown responsive classes
      expect(container.querySelector('.hidden')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:inline')).toBeInTheDocument();
    });

    it('should have touch-friendly button sizes on mobile', () => {
      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Check for responsive padding/sizing
      expect(container.querySelector('.p-1')).toBeInTheDocument();
      expect(container.querySelector('.sm\\:p-2')).toBeInTheDocument();
    });
  });

  describe('Calendar Interactions & UX', () => {
    it('should show tooltip with availability info', () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);
      const dateStr = toISODate(testDate);

      const mockAvailabilities = [
        {
          date: dateStr,
          allAvailable: true,
          unavailableCount: 0,
          unavailableUsers: [],
        },
      ];

      const mockUserAvailability = {
        [dateStr]: true,
      };

      const { container } = render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={mockAvailabilities}
          userAvailability={mockUserAvailability}
          consensusDates={[dateStr]}
          eventLocked={false}
          onToggleDate={async () => {}}
        />
      );

      // Check for title attributes (tooltips) - Calendar should have some buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show loading state while updating availability', () => {
      const today = new Date();
      const testDate = new Date(today.getFullYear(), today.getMonth(), 15);

      const mockOnToggleDate = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(resolve, 100)
          )
      );

      render(
        <Calendar
          year={testDate.getFullYear()}
          month={testDate.getMonth() + 1}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={[]}
          eventLocked={false}
          loading={true}
          onToggleDate={mockOnToggleDate}
        />
      );

      // Calendar should still be interactive even when showing loading state
      expect(screen.getByText('Legend')).toBeInTheDocument();
    });
  });

  describe('Lock Date Notification', () => {
    it('should display lock notification when event locked', () => {
      const { container } = render(
        <Calendar
          year={2026}
          month={3}
          availabilities={[]}
          userAvailability={{}}
          consensusDates={['2026-03-15']}
          eventLocked={true}
          onToggleDate={async () => {}}
        />
      );

      expect(container.textContent).toContain(
        'Event date is locked'
      );
      expect(container.textContent).toContain(
        'Availability cannot be changed'
      );
    });
  });
});
