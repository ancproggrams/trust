
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auditService } from '@/lib/services/audit-service';

export class SecurityMiddleware {
  /**
   * Rate limiting storage (in production, use Redis)
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  /**
   * Rate limiting middleware
   */
  public static async rateLimit(
    request: NextRequest,
    options: { maxRequests: number; windowMs: number; keyGenerator?: (req: NextRequest) => string }
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = options.keyGenerator 
      ? options.keyGenerator(request)
      : request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    // Clean old entries
    for (const [k, v] of this.rateLimitStore.entries()) {
      if (v.resetTime < now) {
        this.rateLimitStore.delete(k);
      }
    }

    const current = this.rateLimitStore.get(key);
    
    if (!current || current.resetTime < now) {
      // First request in window or window has reset
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return {
        allowed: true,
        remaining: options.maxRequests - 1,
        resetTime: now + options.windowMs
      };
    }

    if (current.count >= options.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime
      };
    }

    current.count++;
    return {
      allowed: true,
      remaining: options.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  /**
   * CSRF protection
   */
  public static async validateCSRF(request: NextRequest): Promise<boolean> {
    if (request.method === 'GET' || request.method === 'HEAD') {
      return true; // CSRF not applicable for safe methods
    }

    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.headers.get('authorization');
    
    // In production, implement proper CSRF token validation
    // For now, we'll check that requests include proper headers
    return !!(csrfToken || sessionToken);
  }

  /**
   * Input validation middleware
   */
  public static async validateInput(
    data: any,
    rules: Record<string, (value: any) => boolean | string>
  ): Promise<{ valid: boolean; errors: Record<string, string> }> {
    const errors: Record<string, string> = {};

    for (const [field, validator] of Object.entries(rules)) {
      const value = data[field];
      const result = validator(value);
      
      if (result !== true) {
        errors[field] = typeof result === 'string' ? result : `Invalid ${field}`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Audit logging for security events
   */
  public static async logSecurityEvent(
    request: NextRequest,
    event: string,
    details: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await auditService.logAction({
        userId,
        action: 'SECURITY_EVENT' as any,
        entity: 'Security',
        entityId: event,
        newValues: {
          event,
          details,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        context: `Security event: ${event}`,
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Suspicious activity detection
   */
  public static async detectSuspiciousActivity(
    request: NextRequest,
    userId?: string
  ): Promise<{ suspicious: boolean; reason?: string; severity: 'low' | 'medium' | 'high' }> {
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot|crawler|spider/i,
      /curl|wget|python|postman/i,
      /sqlmap|nmap|masscan/i,
    ];

    const isSuspiciousUserAgent = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspiciousUserAgent) {
      await this.logSecurityEvent(request, 'SUSPICIOUS_USER_AGENT', { userAgent, ip }, userId);
      return {
        suspicious: true,
        reason: 'Suspicious user agent detected',
        severity: 'medium'
      };
    }

    // Check for too many requests from same IP
    const key = `requests:${ip}`;
    const requestCount = this.rateLimitStore.get(key)?.count || 0;
    
    if (requestCount > 100) { // More than 100 requests in window
      await this.logSecurityEvent(request, 'HIGH_REQUEST_VOLUME', { ip, count: requestCount }, userId);
      return {
        suspicious: true,
        reason: 'High request volume from IP',
        severity: 'high'
      };
    }

    return { suspicious: false, severity: 'low' };
  }

  /**
   * Sanitize input data
   */
  public static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocols
        .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
        .trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Security headers
   */
  public static addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    return response;
  }
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (value: any) => value !== undefined && value !== null && value !== '',
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email format',
  phone: (value: string) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')) || 'Invalid phone format',
  kvkNumber: (value: string) => /^\d{8}$/.test(value) || 'KVK number must be 8 digits',
  vatNumber: (value: string) => /^[A-Z]{2}\d{9}B\d{2}$/.test(value) || 'Invalid VAT number format',
  iban: (value: string) => {
    const iban = value.replace(/\s/g, '').toUpperCase();
    return /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/.test(iban) || 'Invalid IBAN format';
  },
  postalCode: (value: string) => /^\d{4}\s?[A-Z]{2}$/i.test(value) || 'Invalid postal code format',
  minLength: (min: number) => (value: string) => value.length >= min || `Minimum ${min} characters required`,
  maxLength: (max: number) => (value: string) => value.length <= max || `Maximum ${max} characters allowed`,
  alphanumeric: (value: string) => /^[a-zA-Z0-9\s]+$/.test(value) || 'Only letters, numbers and spaces allowed',
  noSpecialChars: (value: string) => /^[a-zA-Z0-9\s\.\-_]+$/.test(value) || 'Special characters not allowed',
};

/**
 * Secure API route wrapper
 */
export function secureRoute(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: {
    permissions?: string[];
    rateLimit?: { maxRequests: number; windowMs: number };
    requireAuth?: boolean;
    validateCSRF?: boolean;
    sanitizeInput?: boolean;
  } = {}
) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const rateLimitResult = await SecurityMiddleware.rateLimit(request, options.rateLimit);
        
        if (!rateLimitResult.allowed) {
          const response = NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
          response.headers.set('X-RateLimit-Remaining', '0');
          response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
          return SecurityMiddleware.addSecurityHeaders(response);
        }
      }

      // CSRF validation
      if (options.validateCSRF) {
        const isValidCSRF = await SecurityMiddleware.validateCSRF(request);
        if (!isValidCSRF) {
          return SecurityMiddleware.addSecurityHeaders(
            NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 })
          );
        }
      }

      // Authentication check
      if (options.requireAuth !== false) {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
          return SecurityMiddleware.addSecurityHeaders(
            NextResponse.json({ error: 'Authentication required' }, { status: 401 })
          );
        }
      }

      // Permission check
      if (options.permissions && options.permissions.length > 0) {
        const { requirePermissions } = await import('./permission-middleware');
        const permissionResult = await requirePermissions(request, options.permissions);
        
        if (!permissionResult.authorized) {
          await SecurityMiddleware.logSecurityEvent(
            request,
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            { permissions: options.permissions, error: permissionResult.error },
            permissionResult.userId
          );
          
          return SecurityMiddleware.addSecurityHeaders(
            NextResponse.json({ error: permissionResult.error }, { status: 403 })
          );
        }
      }

      // Suspicious activity detection
      const session = await getServerSession(authOptions);
      const suspiciousActivity = await SecurityMiddleware.detectSuspiciousActivity(
        request,
        session?.user?.id
      );

      if (suspiciousActivity.suspicious && suspiciousActivity.severity === 'high') {
        return SecurityMiddleware.addSecurityHeaders(
          NextResponse.json({ error: 'Request blocked for security reasons' }, { status: 403 })
        );
      }

      // Input sanitization
      if (options.sanitizeInput && (request.method === 'POST' || request.method === 'PUT')) {
        try {
          const body = await request.json();
          const sanitizedBody = SecurityMiddleware.sanitizeInput(body);
          
          // Create new request with sanitized body
          const sanitizedRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitizedBody),
          });
          
          const response = await handler(sanitizedRequest, context);
          return SecurityMiddleware.addSecurityHeaders(response);
        } catch (error) {
          // If body parsing fails, continue with original request
          const response = await handler(request, context);
          return SecurityMiddleware.addSecurityHeaders(response);
        }
      }

      // Call the actual handler
      const response = await handler(request, context);
      return SecurityMiddleware.addSecurityHeaders(response);

    } catch (error) {
      console.error('Secure route error:', error);
      await SecurityMiddleware.logSecurityEvent(
        request,
        'ROUTE_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
      
      return SecurityMiddleware.addSecurityHeaders(
        NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      );
    }
  };
}
