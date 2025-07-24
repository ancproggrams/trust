
import { NextRequest, NextResponse } from 'next/server';
import { kvkApiService, type KvKValidationResult } from '@/lib/services/kvk-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/validate-kvk?kvk=12345678
 * Validate a single KvK number
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const kvkNumber = searchParams.get('kvk');

    // Input validation
    if (!kvkNumber) {
      return NextResponse.json(
        { 
          error: 'KvK nummer is vereist',
          code: 'MISSING_KVK_NUMBER'
        },
        { status: 400 }
      );
    }

    if (kvkNumber.length > 20) {
      return NextResponse.json(
        { 
          error: 'KvK nummer te lang',
          code: 'INVALID_KVK_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate KvK number
    const validationResult: KvKValidationResult = await kvkApiService.validateKvKNumber(kvkNumber);

    // Return validation result
    return NextResponse.json({
      success: true,
      data: validationResult
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });

  } catch (error: any) {
    console.error('KvK validation API error:', error);

    // Handle different error types
    const statusCode = error?.status || 500;
    const errorCode = error?.code || 'INTERNAL_ERROR';
    const errorMessage = error?.message || 'Interne serverfout bij KvK validatie';

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
 * POST /api/validate-kvk
 * Validate multiple KvK numbers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kvkNumbers } = body;

    // Input validation
    if (!kvkNumbers || !Array.isArray(kvkNumbers)) {
      return NextResponse.json(
        { 
          error: 'Array van KvK nummers is vereist',
          code: 'INVALID_REQUEST_FORMAT'
        },
        { status: 400 }
      );
    }

    if (kvkNumbers.length === 0) {
      return NextResponse.json(
        { 
          error: 'Minimaal één KvK nummer is vereist',
          code: 'EMPTY_KVK_LIST'
        },
        { status: 400 }
      );
    }

    if (kvkNumbers.length > 10) {
      return NextResponse.json(
        { 
          error: 'Maximaal 10 KvK nummers per verzoek toegestaan',
          code: 'TOO_MANY_KVK_NUMBERS'
        },
        { status: 400 }
      );
    }

    // Validate all numbers are strings and reasonable length
    const invalidNumbers = kvkNumbers.filter(kvk => 
      typeof kvk !== 'string' || kvk.length > 20 || kvk.length === 0
    );

    if (invalidNumbers.length > 0) {
      return NextResponse.json(
        { 
          error: 'Ongeldige KvK nummers gedetecteerd',
          code: 'INVALID_KVK_FORMAT',
          invalidNumbers
        },
        { status: 400 }
      );
    }

    // Validate multiple KvK numbers
    const validationResults = await kvkApiService.validateMultipleKvKNumbers(kvkNumbers);

    // Convert Map to Object for JSON response
    const resultsObject: Record<string, KvKValidationResult> = {};
    validationResults.forEach((result, kvkNumber) => {
      resultsObject[kvkNumber] = result;
    });

    return NextResponse.json({
      success: true,
      data: resultsObject,
      stats: kvkApiService.getCacheStats()
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      }
    });

  } catch (error: any) {
    console.error('Bulk KvK validation API error:', error);

    const statusCode = error?.status || 500;
    const errorCode = error?.code || 'INTERNAL_ERROR';
    const errorMessage = error?.message || 'Interne serverfout bij bulk KvK validatie';

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
