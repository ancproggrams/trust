
import * as xml2js from 'xml2js';
import { BTWValidationResult, BTWCacheEntry, BTWApiStats } from '@/lib/types/btw-validation';

class BTWApiService {
  private cache = new Map<string, BTWCacheEntry>();
  private readonly cacheTimeout = 1000 * 60 * 30; // 30 minutes
  private readonly maxCacheSize = 1000;
  private readonly apiUrl = 'https://www.btw-nummer-controle.nl/Api/Validate.asmx';
  private readonly rateLimitMs = 500; // 500ms between requests
  private lastRequestTime = 0;
  private stats: BTWApiStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    apiCalls: 0,
    errors: 0
  };

  /**
   * Clean BTW number for validation
   */
  private cleanBTWNumber(btwNumber: string): string {
    return btwNumber
      .replace(/[\s\-\.]/g, '')
      .toUpperCase()
      .trim();
  }

  /**
   * Validate BTW number format
   */
  private isValidBTWFormat(btwNumber: string): boolean {
    const cleaned = this.cleanBTWNumber(btwNumber);
    
    // EU VAT number patterns
    const patterns: Record<string, RegExp> = {
      NL: /^NL\d{9}B\d{2}$/,
      DE: /^DE\d{9}$/,
      FR: /^FR[A-Z0-9]{2}\d{9}$/,
      BE: /^BE\d{10}$/,
      AT: /^ATU\d{8}$/,
      DK: /^DK\d{8}$/,
      ES: /^ES[A-Z]\d{7}[A-Z]$/,
      FI: /^FI\d{8}$/,
      GB: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
      IT: /^IT\d{11}$/,
      LU: /^LU\d{8}$/,
      PT: /^PT\d{9}$/,
      SE: /^SE\d{12}$/
    };

    const countryCode = cleaned.substring(0, 2);
    const pattern = patterns[countryCode];
    
    return pattern ? pattern.test(cleaned) : false;
  }

  /**
   * Get cached result if available and not expired
   */
  private getCachedResult(btwNumber: string): BTWValidationResult | null {
    const cacheKey = this.cleanBTWNumber(btwNumber);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    this.stats.cacheHits++;
    return {
      ...entry.result,
      source: 'CACHE' as const
    };
  }

  /**
   * Cache validation result
   */
  private setCachedResult(btwNumber: string, result: BTWValidationResult): void {
    const cacheKey = this.cleanBTWNumber(btwNumber);
    
    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, {
      result: { ...result, source: 'CACHE' as const },
      timestamp: Date.now(),
      ttl: this.cacheTimeout
    });
  }

  /**
   * Rate limiting helper
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitMs) {
      const waitTime = this.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Create SOAP envelope for BTW validation
   */
  private createSoapEnvelope(btwNumber: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ValidateVat xmlns="http://www.btw-nummer-controle.nl/">
      <VatNumber>${this.cleanBTWNumber(btwNumber)}</VatNumber>
    </ValidateVat>
  </soap:Body>
</soap:Envelope>`;
  }

  /**
   * Parse SOAP response
   */
  private async parseSoapResponse(soapResponse: string): Promise<BTWValidationResult> {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(soapResponse);
      
      const body = result?.['soap:Envelope']?.['soap:Body'];
      const validateResponse = body?.['ValidateVatResponse']?.['ValidateVatResult'];
      
      if (!validateResponse) {
        throw new Error('Invalid SOAP response structure');
      }

      const isValid = validateResponse.Valid === 'true' || validateResponse.Valid === true;
      const companyName = validateResponse.Name || undefined;
      const address = validateResponse.Address ? {
        street: validateResponse.Address.Line1 || undefined,
        postalCode: validateResponse.Address.PostalCode || undefined,
        city: validateResponse.Address.City || undefined,
        country: validateResponse.Address.Country || undefined
      } : undefined;

      return {
        btwNumber: validateResponse.VatNumber || '',
        isValid,
        companyName,
        address,
        status: isValid ? 'ACTIVE' : 'INACTIVE',
        validatedAt: new Date(),
        source: 'API'
      };

    } catch (error: any) {
      throw new Error(`Failed to parse SOAP response: ${error.message}`);
    }
  }

  /**
   * Create fallback result for demo/offline scenarios
   */
  private createFallbackResult(btwNumber: string): BTWValidationResult {
    const cleaned = this.cleanBTWNumber(btwNumber);
    
    // Demo BTW numbers with mock data
    const mockData: Record<string, Partial<BTWValidationResult>> = {
      'NL123456789B01': {
        isValid: true,
        companyName: 'Demo Bedrijf B.V.',
        address: {
          street: 'Voorbeeldstraat 123',
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'Netherlands'
        },
        status: 'ACTIVE'
      },
      'NL987654321B01': {
        isValid: true,
        companyName: 'Test Company Nederland B.V.',
        address: {
          street: 'Testweg 456',
          postalCode: '5678CD',
          city: 'Rotterdam',
          country: 'Netherlands'
        },
        status: 'ACTIVE'
      },
      'DE123456789': {
        isValid: true,
        companyName: 'Demo GmbH',
        address: {
          street: 'Beispielstraße 789',
          postalCode: '12345',
          city: 'Berlin',
          country: 'Germany'
        },
        status: 'ACTIVE'
      }
    };

    const mockInfo = mockData[cleaned];
    const isValidFormat = this.isValidBTWFormat(cleaned);

    return {
      btwNumber: cleaned,
      isValid: mockInfo?.isValid ?? isValidFormat,
      companyName: mockInfo?.companyName,
      address: mockInfo?.address,
      status: mockInfo?.status ?? (isValidFormat ? 'UNKNOWN' : 'INACTIVE'),
      validatedAt: new Date(),
      source: 'FALLBACK',
      warnings: ['This is demo data - not from official BTW API']
    };
  }

  /**
   * Validate BTW number via API
   */
  async validateBTWNumber(btwNumber: string): Promise<BTWValidationResult> {
    try {
      this.stats.totalRequests++;
      this.stats.lastRequest = new Date();

      // Input validation
      if (!btwNumber?.trim()) {
        throw new Error('BTW nummer is vereist');
      }

      const cleaned = this.cleanBTWNumber(btwNumber);

      // Format validation
      if (!this.isValidBTWFormat(cleaned)) {
        return {
          btwNumber: cleaned,
          isValid: false,
          status: 'INACTIVE',
          validatedAt: new Date(),
          source: 'API',
          error: 'Ongeldige BTW nummer format'
        };
      }

      // Check cache first
      const cachedResult = this.getCachedResult(cleaned);
      if (cachedResult) {
        return cachedResult;
      }

      this.stats.cacheMisses++;

      // Rate limiting
      await this.waitForRateLimit();

      // Make SOAP API call
      const soapEnvelope = this.createSoapEnvelope(cleaned);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://www.btw-nummer-controle.nl/ValidateVat'
        },
        body: soapEnvelope
      });

      this.stats.apiCalls++;

      if (!response.ok) {
        // If API fails, return fallback result
        console.warn(`BTW API returned ${response.status}, using fallback`);
        return this.createFallbackResult(cleaned);
      }

      const soapResponse = await response.text();
      const result = await this.parseSoapResponse(soapResponse);

      // Cache successful result
      this.setCachedResult(cleaned, result);

      return result;

    } catch (error: any) {
      console.error('BTW validation error:', error);
      this.stats.errors++;

      // Return fallback result on error
      const fallbackResult = this.createFallbackResult(btwNumber);
      fallbackResult.error = error.message;
      
      return fallbackResult;
    }
  }

  /**
   * Validate multiple BTW numbers
   */
  async validateMultipleBTWNumbers(btwNumbers: string[]): Promise<Map<string, BTWValidationResult>> {
    const results = new Map<string, BTWValidationResult>();
    
    // Process sequentially to respect rate limits
    for (const btwNumber of btwNumbers) {
      try {
        const result = await this.validateBTWNumber(btwNumber);
        results.set(this.cleanBTWNumber(btwNumber), result);
      } catch (error: any) {
        console.error(`Error validating BTW ${btwNumber}:`, error);
        
        const errorResult: BTWValidationResult = {
          btwNumber: this.cleanBTWNumber(btwNumber),
          isValid: false,
          status: 'INACTIVE',
          validatedAt: new Date(),
          source: 'API',
          error: error.message || 'Onbekende validatie fout'
        };
        
        results.set(this.cleanBTWNumber(btwNumber), errorResult);
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): BTWApiStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.info('BTW validation cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const btwApiService = new BTWApiService();
export type { BTWValidationResult };
