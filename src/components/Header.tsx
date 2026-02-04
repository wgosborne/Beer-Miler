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
  const isBettingPage = pathname === '/betting';
  const isResultsPage = pathname === '/results';

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/10 backdrop-blur-sm">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between">
          {/* Logo / Home Link */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-white hover:text-white/80 transition-colors duration-200"
          >
            <span className="text-sm sm:text-base">BEER MILE 2026</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-8">
            {session && (
              <>
                <Link
                  href="/calendar"
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                    isCalendarPage
                      ? 'text-purple-400'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Calendar
                </Link>
                <Link
                  href="/betting"
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                    isBettingPage
                      ? 'text-pink-400'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Betting
                </Link>
                <Link
                  href="/results"
                  className={`text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
                    isResultsPage
                      ? 'text-emerald-400'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Results
                </Link>
              </>
            )}
          </nav>

          {/* Right Side: User Info (Desktop only) + Logout Button + Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop User Info and Logout */}
            {session ? (
              <>
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {session.user?.username}
                  </p>
                  {session.user?.role === 'admin' && (
                    <p className="text-xs text-purple-300 font-bold uppercase tracking-wide">Admin</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wide bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/30 hover:border-red-500/50 transition-all duration-200"
                >
                  Logout
                </button>
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="sm:hidden p-2 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-600/20 transition-all duration-200"
                  aria-label="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wide text-white/70 hover:text-white transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wide bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg shadow-purple-500/30"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Toggle menu"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && session && (
          <nav className="sm:hidden mt-4 pt-4 border-t border-white/10 space-y-2">
            <Link
              href="/calendar"
              className={`block px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                isCalendarPage
                  ? 'bg-white/10 text-purple-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Calendar
            </Link>
            <Link
              href="/betting"
              className={`block px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                isBettingPage
                  ? 'bg-white/10 text-pink-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Betting
            </Link>
            <Link
              href="/results"
              className={`block px-3 py-3 rounded-lg text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                isResultsPage
                  ? 'bg-white/10 text-emerald-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Results
            </Link>
            {session.user?.role === 'admin' && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <p className="px-3 py-2 text-xs text-purple-300 font-bold uppercase tracking-wide">Admin Badge</p>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
