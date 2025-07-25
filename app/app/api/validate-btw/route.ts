
import { NextRequest, NextResponse } from 'next/server';
import { btwApiService, type BTWValidationResult } from '@/lib/services/btw-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/validate-btw?btw=NL123456789B01
 * Validate a single BTW number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const btwNumber = searchParams.get('btw');

    // Input validation
    if (!btwNumber) {
      return NextResponse.json(
        { 
          error: 'BTW nummer is vereist',
          code: 'MISSING_BTW_NUMBER'
        },
        { status: 400 }
      );
    }

    if (btwNumber.length > 30) {
      return NextResponse.json(
        { 
          error: 'BTW nummer te lang',
          code: 'INVALID_BTW_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate BTW number
    const validationResult: BTWValidationResult = await btwApiService.validateBTWNumber(btwNumber);

    // Return validation result
    return NextResponse.json({
      success: true,
      data: validationResult
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      }
    });

  } catch (error: any) {
    console.error('BTW validation API error:', error);

    // Handle different error types
    const statusCode = error?.status || 500;
    const errorCode = error?.code || 'INTERNAL_ERROR';
    const errorMessage = error?.message || 'Interne serverfout bij BTW validatie';

    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        success: false
      },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/validate-btw
 * Validate multiple BTW numbers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { btwNumbers } = body;

    // Input validation
    if (!btwNumbers || !Array.isArray(btwNumbers)) {
      return NextResponse.json(
        { 
          error: 'Array van BTW nummers is vereist',
          code: 'INVALID_REQUEST_FORMAT'
        },
        { status: 400 }
      );
    }

    if (btwNumbers.length === 0) {
      return NextResponse.json(
        { 
          error: 'Minimaal één BTW nummer is vereist',
          code: 'EMPTY_BTW_LIST'
        },
        { status: 400 }
      );
    }

    if (btwNumbers.length > 5) {
      return NextResponse.json(
        { 
          error: 'Maximaal 5 BTW nummers per verzoek toegestaan',
          code: 'TOO_MANY_BTW_NUMBERS'
        },
        { status: 400 }
      );
    }

    // Validate all numbers are strings and reasonable length
    const invalidNumbers = btwNumbers.filter(btw => 
      typeof btw !== 'string' || btw.length > 30 || btw.length === 0
    );

    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        { 
          error: 'Ongeldige BTW nummers gedetecteerd',
          code: 'INVALID_BTW_FORMAT',
          invalidNumbers
        },
        { status: 400 }
      );
    }

    // Validate multiple BTW numbers
    const validationResults = await btwApiService.validateMultipleBTWNumbers(btwNumbers);

    // Convert Map to Object for JSON response
    const resultsObject: Record<string, BTWValidationResult> = {};
    validationResults.forEach((result, btwNumber) => {
      resultsObject[btwNumber] = result;
    });

    return NextResponse.json({
      success: true,
      data: resultsObject,
      stats: btwApiService.getCacheStats()
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      }
    });

  } catch (error: any) {
    console.error('Bulk BTW validation API error:', error);

    const statusCode = error?.status || 500;
    const errorCode = error?.code || 'INTERNAL_ERROR';
    const errorMessage = error?.message || 'Interne serverfout bij bulk BTW validatie';

    return NextResponse.json(
      { 
        error: errorMessage,
        code: errorCode,
        success: false
      },
      { status: statusCode }
    );
  }
}
