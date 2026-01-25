import { NextRequest, NextResponse } from 'next/server';
import { signOut } from 'next-auth/react';
import type { ApiResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // NextAuth logout is handled client-side via signOut()
    // This endpoint can be used for cleanup if needed
    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    );
  }
}
