import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/bets/[id] - Delete a pending bet
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'You must be logged in to delete bets',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Get event ID
    const eventId = process.env.EVENT_ID;
    if (!eventId) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Event ID not configured',
            statusCode: 500,
          },
        },
        { status: 500 }
      );
    }

    // 3. Check event exists and results not finalized
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Event not found',
            statusCode: 404,
          },
        },
        { status: 404 }
      );
    }

    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Results already finalized; cannot delete bets',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 4. Get the bet
    const bet = await prisma.bet.findUnique({
      where: { id: params.id },
    });

    if (!bet) {
      return NextResponse.json(
        {
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: 'Bet not found',
            statusCode: 404,
          },
        },
        { status: 404 }
      );
    }

    // 5. Check user owns this bet
    if (bet.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'You can only delete your own bets',
            statusCode: 403,
          },
        },
        { status: 403 }
      );
    }

    // 6. Delete bet
    await prisma.bet.delete({ where: { id: params.id } });

    console.log(`[Bets API] User ${session.user.id} deleted bet ${params.id}`);

    // 7. Return success (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Bets API] Error deleting bet:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}
