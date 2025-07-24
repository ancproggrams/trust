
/**
 * OpenKvK API Service for validating business information
 * Documentation: https://overheid.io/documentatie/openkvk
 */

// Extended types for KvK API responses
export interface KvKCompanyData {
  kvkNumber: string;
  name: string;
  tradeName?: string;
  legalForm?: string;
  businessStatus?: string;
  // Address information
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  // Contact information
  website?: string;
  // Business details
  sbiCodes?: Array<{
    code: string;
    description: string;
    indication: string;
  }>;
  // Establishment info
  establishmentDate?: string;
  employeeCount?: string;
}

export interface KvKValidationResult {
  isValid: boolean;
  companyData?: KvKCompanyData;
  error?: string;
  source: 'openkvk' | 'cache' | 'fallback';
  validatedAt: Date;
}

export interface KvKApiError {
  code: string;
  message: string;
  status?: number;
}

class KvKApiService {
  private readonly baseUrl = 'https://api.overheid.io/openkvk';
  private readonly rateLimit = {
    requests: 0,
    resetTime: Date.now() + 60000, // Reset every minute
    maxRequests: 100 // Max requests per minute
  };
  
  // In-memory cache for validated KvK numbers (15 min TTL)
  private cache = new Map<string, { data: KvKValidationResult; expires: number }>();
  private readonly cacheTtl = 15 * 60 * 1000; // 15 minutes

  /**
   * Validate KvK number format
   */
  private isValidKvKFormat(kvkNumber: string): boolean {
    // Remove any spaces or dashes
    const cleaned = kvkNumber.replace(/[\s-]/g, '');
    
    // KvK number should be 8 digits
    return /^\d{8}$/.test(cleaned);
  }

  /**
   * Clean and format KvK number
   */
  private cleanKvKNumber(kvkNumber: string): string {
    return kvkNumber.replace(/[\s-]/g, '').padStart(8, '0');
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.requests = 0;
      this.rateLimit.resetTime = now + 60000;
    }
    
    return this.rateLimit.requests < this.rateLimit.maxRequests;
  }

  /**
   * Get cached validation result
   */
  private getCachedResult(kvkNumber: string): KvKValidationResult | null {
    const cached = this.cache.get(kvkNumber);
    
    if (cached && Date.now() < cached.expires) {
      return {
        ...cached.data,
        source: 'cache'
      };
    }
    
    // Remove expired cache entry
    if (cached) {
      this.cache.delete(kvkNumber);
    }
    
    return null;
  }

  /**
   * Cache validation result
   */
  private setCachedResult(kvkNumber: string, result: KvKValidationResult): void {
    this.cache.set(kvkNumber, {
      data: result,
      expires: Date.now() + this.cacheTtl
    });
  }

  /**
   * Make API request to OpenKvK
   */
  private async makeApiRequest(kvkNumber: string): Promise<any> {
    if (!this.checkRateLimit()) {
      throw {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'API rate limit exceeded. Please try again later.',
        status: 429
      } as KvKApiError;
    }

    this.rateLimit.requests++;

    try {
      const response = await fetch(`${this.baseUrl}/${kvkNumber}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ZZP-Trust/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw {
            code: 'COMPANY_NOT_FOUND',
            message: 'Bedrijf niet gevonden in KvK register',
            status: 404
          } as KvKApiError;
        }
        
        if (response.status === 429) {
          throw {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Te veel verzoeken. Probeer het later opnieuw.',
            status: 429
          } as KvKApiError;
        }

        throw {
          code: 'API_ERROR',
          message: `API error: ${response.status} ${response.statusText}`,
          status: response.status
        } as KvKApiError;
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          code: 'TIMEOUT',
          message: 'API request timeout. Please try again.',
          status: 408
        } as KvKApiError;
      }
      
      if (error.code) {
        throw error; // Already a KvKApiError
      }

      throw {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred while validating KvK number',
        status: 500
      } as KvKApiError;
    }
  }

  /**
   * Transform API response to our format
   */
  private transformApiResponse(apiData: any): KvKCompanyData {
    return {
      kvkNumber: apiData.kvkNumber || apiData.kvk_number || '',
      name: apiData.name || apiData.company_name || apiData.handelsnaam || '',
      tradeName: apiData.tradeName || apiData.trade_name || apiData.handelsnaam,
      legalForm: apiData.legalForm || apiData.legal_form || apiData.rechtsvorm,
      businessStatus: apiData.businessStatus || apiData.business_status || apiData.status,
      address: {
        street: apiData.address?.street || apiData.adres?.straat || apiData.straatnaam,
        houseNumber: apiData.address?.houseNumber || apiData.adres?.huisnummer || apiData.huisnummer,
        postalCode: apiData.address?.postalCode || apiData.adres?.postcode || apiData.postcode,
        city: apiData.address?.city || apiData.adres?.plaats || apiData.plaats,
        country: apiData.address?.country || apiData.adres?.land || 'Nederland'
      },
      website: apiData.website || apiData.website_url,
      sbiCodes: apiData.sbiCodes || apiData.sbi_codes || [],
      establishmentDate: apiData.establishmentDate || apiData.establishment_date || apiData.oprichtingsdatum,
      employeeCount: apiData.employeeCount || apiData.employee_count || apiData.werknemers
    };
  }

  /**
   * Create fallback validation result
   */
  private createFallbackResult(kvkNumber: string, error: string): KvKValidationResult {
    return {
      isValid: false,
      error,
      source: 'fallback',
      validatedAt: new Date()
    };
  }

  /**
   * Main validation method
   */
  async validateKvKNumber(kvkNumber: string): Promise<KvKValidationResult> {
    try {
      // Input validation
      if (!kvkNumber || typeof kvkNumber !== 'string') {
        return this.createFallbackResult(kvkNumber, 'Ongeldig KvK nummer formaat');
      }

      const cleanedKvK = this.cleanKvKNumber(kvkNumber);

      // Format validation
      if (!this.isValidKvKFormat(cleanedKvK)) {
        return this.createFallbackResult(cleanedKvK, 'KvK nummer moet 8 cijfers bevatten');
      }

      // Check cache first
      const cachedResult = this.getCachedResult(cleanedKvK);
      if (cachedResult) {
        return cachedResult;
      }

      // Make API request
      const apiData = await this.makeApiRequest(cleanedKvK);
      
      // Transform and validate response
      const companyData = this.transformApiResponse(apiData);
      
      if (!companyData.name) {
        const result = this.createFallbackResult(cleanedKvK, 'Incomplete bedrijfsinformatie ontvangen');
        this.setCachedResult(cleanedKvK, result);
        return result;
      }

      const result: KvKValidationResult = {
        isValid: true,
        companyData,
        source: 'openkvk',
        validatedAt: new Date()
      };

      // Cache the result
      this.setCachedResult(cleanedKvK, result);
      
      return result;

    } catch (error: any) {
      console.error('KvK validation error:', error);
      
      const errorMessage = error?.message || 'Onbekende fout bij KvK validatie';
      const fallbackResult = this.createFallbackResult(kvkNumber, errorMessage);
      
      // Cache failed results for a shorter time to allow retries
      if (error.code !== 'RATE_LIMIT_EXCEEDED') {
        this.setCachedResult(kvkNumber, fallbackResult);
      }
      
      return fallbackResult;
    }
  }

  /**
   * Batch validate multiple KvK numbers
   */
  async validateMultipleKvKNumbers(kvkNumbers: string[]): Promise<Map<string, KvKValidationResult>> {
    const results = new Map<string, KvKValidationResult>();
    
    // Process in batches to respect rate limits
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < kvkNumbers.length; i += batchSize) {
      batches.push(kvkNumbers.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (kvkNumber) => {
        const result = await this.validateKvKNumber(kvkNumber);
        results.set(kvkNumber, result);
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      rateLimit: {
        requests: this.rateLimit.requests,
        remaining: this.rateLimit.maxRequests - this.rateLimit.requests,
        resetTime: new Date(this.rateLimit.resetTime)
      }
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const kvkApiService = new KvKApiService();

// Export types and service
export default kvkApiService;
