'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || 'Failed to create account');
        return;
      }

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/');
      } else {
        router.push('/auth/login?signup=success');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="text-5xl mb-4">🍺</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-1">
            Beer Mile
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create your account to join the betting app
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* API Error */}
          {apiError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">{apiError}</p>
            </div>
          )}

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="john_doe"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
            {errors.username && (
              <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Min 8 chars, must include a number and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base placeholder-gray-400"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base mt-6"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
