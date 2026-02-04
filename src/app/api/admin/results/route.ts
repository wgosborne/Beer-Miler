import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminResultsSchema } from '@/lib/validation';
import { generateScoringPreview, findClosestGuesses } from '@/lib/scoring';
import { z } from 'zod';

/**
 * POST /api/admin/results - Enter final time and vomit outcome, generate preview
 * Admin only. Returns preview of winners before finalization.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'You must be logged in',
            statusCode: 401,
          },
        },
        { status: 401 }
      );
    }

    // 2. Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHORIZATION_ERROR',
            message: 'Only admins can enter results',
            statusCode: 403,
          },
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await req.json();
    const validatedData = AdminResultsSchema.parse(body);

    // 4. Get event ID
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

    // 5. Get event
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

    // 6. Check results not already finalized
    if (event.resultsFinalized) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'Results already finalized',
            statusCode: 409,
          },
        },
        { status: 409 }
      );
    }

    // 8. Store results temporarily (not finalized yet)
    // Update event with final values
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        finalTimeSeconds: validatedData.finalTimeSeconds,
        vomitOutcome: validatedData.vomitOutcome,
      },
    });

    // 9. Generate preview of winners
    const preview = await generateScoringPreview(
      eventId,
      validatedData.finalTimeSeconds,
      validatedData.vomitOutcome
    );

    console.log(
      `[Admin Results] User ${session.user.id} entered results: ${validatedData.finalTimeSeconds}s, vomit=${validatedData.vomitOutcome}`
    );

    // 10. Return preview (not finalized yet)
    return NextResponse.json({
      eventId: event.id,
      finalTimeSeconds: validatedData.finalTimeSeconds,
      vomitOutcome: validatedData.vomitOutcome,
      preview,
      message: 'Preview ready. Review winners above. Call finalize endpoint to commit.',
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.flatten().fieldErrors,
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    console.error('[Admin Results] Error entering results:', error);
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
