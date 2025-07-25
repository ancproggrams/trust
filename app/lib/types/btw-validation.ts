
export interface BTWValidationResult {
  btwNumber: string;
  isValid: boolean;
  companyName?: string;
  address?: {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  validatedAt: Date;
  source: 'API' | 'CACHE' | 'FALLBACK';
  error?: string;
  warnings?: string[];
}

export interface BTWValidationState {
  isValidating: boolean;
  hasValidated: boolean;
  result?: BTWValidationResult;
  error?: string;
}

export interface BTWApiResponse {
  success: boolean;
  data?: BTWValidationResult;
  error?: string;
  code?: string;
}

export interface BTWCacheEntry {
  result: BTWValidationResult;
  timestamp: number;
  ttl: number;
}

export interface BTWApiStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  errors: number;
  lastRequest?: Date;
}
