'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  const isAuthPage = pathname?.startsWith('/auth');
  const isCalendarPage = pathname === '/calendar';
  const isDashboard = pathname === '/';

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-primary-100 shadow-sm">
      <div className="w-full px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-base sm:text-lg font-bold text-primary-700 hover:text-primary-600 transition-colors"
          >
            <span className="text-lg">🍺</span>
            <span className="hidden sm:inline">Beer Mile</span>
            <span className="sm:hidden">BM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            {session && (
              <>
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    isDashboard
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/calendar"
                  className={`text-sm font-medium transition-colors ${
                    isCalendarPage
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  Calendar
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {session.user?.username}
                  </p>
                  {session.user?.role === 'admin' && (
                    <p className="text-xs text-primary-600 font-semibold">Admin</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && session && (
          <nav className="sm:hidden mt-3 pt-3 border-t border-primary-100 space-y-2">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isDashboard
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/calendar"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isCalendarPage
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Calendar
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
