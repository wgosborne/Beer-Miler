'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function SignupPage() {
  const router = useRouter();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [showForm, setShowForm] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Carousel auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCarouselIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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
        router.push('/betting');
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
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Carousel Slides */}
      <div className="absolute inset-0">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentCarouselIndex === index - 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={`/images/annie/annie-${index}.jpg`}
              alt={`Annie Beer Mile - Photo ${index}`}
              fill
              className="object-cover"
              priority={index === 1}
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay (subtle) */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      {/* Carousel Indicators - Positioned absolutely */}
      <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 flex justify-center gap-2 z-30">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => setCurrentCarouselIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentCarouselIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white bg-opacity-40 hover:bg-opacity-70'
            }`}
            aria-label={`Go to photo ${index + 1}`}
          />
        ))}
      </div>

      {/* Overlay Content - Absolutely positioned */}
      <div className="absolute inset-0 z-40 flex flex-col">
        {!showForm ? (
          // Button View - Positioned at bottom
          <div className="absolute bottom-0 left-0 right-0 w-full flex flex-col items-center px-4 pb-6 sm:pb-8">
            {/* Title and Subtitle - Centered */}
            <div className="text-center mb-4 sm:mb-5">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 1), 0 0 40px rgba(168, 85, 247, 0.9), 0 0 60px rgba(168, 85, 247, 0.7), 0 0 80px rgba(168, 85, 247, 0.5)' }}>
                Beer Mile 2026
              </h1>
              <p className="text-sm sm:text-base neon-glow-text mt-1 italic font-light">
                We know Annie eats muffins... but does she toss cookies?
              </p>
            </div>

            {/* Action Buttons - Narrower and more rounded */}
            <div className="space-y-2 flex flex-col w-1/2">
              <Link
                href="/auth/login"
                className="py-3 sm:py-4 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full text-sm sm:text-base shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-blue-700 transition-all text-center transform hover:scale-105 duration-200 whitespace-nowrap"
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="py-3 sm:py-4 px-8 border-2 border-purple-400 text-purple-300 font-semibold rounded-full text-sm sm:text-base hover:bg-purple-900 hover:bg-opacity-20 transition-all text-center transform hover:scale-105 duration-200 whitespace-nowrap"
              >
                Sign Up
              </button>
            </div>

            {/* Demo Credentials - Minimal line */}
            <p className="text-center mt-3 sm:mt-4 text-xs text-gray-300 drop-shadow">
              Demo: <code className="text-purple-300">admin@beer-mile.test</code> / <code className="text-purple-300">admin123</code>
            </p>
          </div>
        ) : (
          // Form View - Centered modal overlay
          <div className="absolute bottom-0 left-0 right-0 w-full flex justify-center pb-6 sm:pb-8 px-4">
            <div className="w-full max-w-sm max-h-96 overflow-y-auto">
              {/* Form Container */}
              <div className="bg-black bg-opacity-90 border border-purple-500 border-opacity-40 rounded-lg p-5 sm:p-6 backdrop-blur-sm shadow-2xl relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowForm(false);
                    setApiError('');
                    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                    setErrors({});
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors text-xl font-light"
                  aria-label="Close form"
                >
                  ×
                </button>

                {/* Form Header */}
                <div className="mb-4">
                  <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                    Create Account
                  </h2>
                  <p className="text-xs text-gray-400">
                    Join the platform to place bets
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-3" onSubmit={handleSubmit}>
                  {/* API Error */}
                  {apiError && (
                    <div className="p-2 bg-red-900 bg-opacity-60 border border-red-700 rounded text-xs text-red-200">
                      {apiError}
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
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
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                    />
                    {errors.username && (
                      <p className="mt-0.5 text-xs text-red-400">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
                      Email
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
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                    />
                    {errors.email && (
                      <p className="mt-0.5 text-xs text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
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
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                    />
                    {errors.password && (
                      <p className="mt-0.5 text-xs text-red-400">{errors.password}</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-400">
                      Min 8 chars, number + special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-300 mb-1 uppercase tracking-wide">
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
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-800 disabled:text-gray-600 transition-colors"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-0.5 text-xs text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded text-xs sm:text-sm hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mt-4"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-400">
                    Already have an account?{' '}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
