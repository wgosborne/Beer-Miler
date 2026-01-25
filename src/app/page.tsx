'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Annie's Beer Mile</h1>
          {session && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {session.user?.username}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {session ? (
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Welcome to Annie's Beer Mile betting app! This is your dashboard.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Your Info</h3>
                  <p className="text-sm text-gray-600">Email: {session.user?.email}</p>
                  <p className="text-sm text-gray-600">Username: {session.user?.username}</p>
                  <p className="text-sm text-gray-600">
                    Role: {session.user?.role === 'admin' ? 'Admin' : 'User'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Status</h3>
                  <p className="text-sm text-gray-600">Phase 1a: Authentication</p>
                  <p className="text-sm text-gray-600">You are successfully logged in</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3">Coming Soon</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>- Calendar and Availability (Phase 1b)</li>
                  <li>- Betting System (Phase 1c)</li>
                  <li>- Results and Leaderboard (Phase 2)</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-lg text-gray-600 mb-6">You are not signed in. Please login or create an account.</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/login"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
