/**
 * @file src/lib/security/sanitize.ts
 * @description Enterprise-grade input sanitization, XSS mitigation, and payload validation
 * for municipal civic data intake and REST API endpoints.
 */

export interface ValidationResult<T> {
  isValid: boolean;
  sanitized?: T;
  errors: string[];
}

/**
 * Strips dangerous HTML tags, inline scripts, iframe/object tags, and javascript: protocols.
 * Escapes characters that could lead to Cross-Site Scripting (XSS).
 *
 * @param input Raw user string input
 * @param maxLength Optional max allowed character length
 * @returns Clean, XSS-safe string
 */
export function sanitizeString(input: unknown, maxLength = 2000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Strip control characters (ASCII 0-31 except standard whitespace)
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Remove javascript: and data:uri script vectors
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/vbscript\s*:/gi, '');
  clean = clean.replace(/data\s*:\s*text\/html/gi, '');

  // 4. Strip html tags: <script>, <style>, <iframe>, <object>, <embed>, <applet>
  clean = clean.replace(/<\/?(script|style|iframe|object|embed|applet|form|button|input|meta|link)[^>]*>/gi, '');

  // 5. Escape residual dangerous html characters (<, >, ", ', `)
  clean = clean
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;');

  // 6. Enforce maximum length
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }

  return clean;
}

/**
 * Validates and normalizes geographic latitude (-90 to 90).
 */
export function validateLatitude(lat: unknown, fallback = 12.9716): number {
  const num = typeof lat === 'number' ? lat : parseFloat(String(lat));
  if (isNaN(num) || num < -90 || num > 90) {
    return fallback;
  }
  return Number(num.toFixed(6));
}

/**
 * Validates and normalizes geographic longitude (-180 to 180).
 */
export function validateLongitude(lng: unknown, fallback = 77.5946): number {
  const num = typeof lng === 'number' ? lng : parseFloat(String(lng));
  if (isNaN(num) || num < -180 || num > 180) {
    return fallback;
  }
  return Number(num.toFixed(6));
}

/**
 * Validates email structure with standard RFC pattern.
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') {return false;}
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email.trim());
}

/**
 * Validates an image URL to ensure safe protocols (https only).
 */
export function sanitizeImageUrl(url: unknown): string | undefined {
  if (typeof url !== 'string' || !url.trim()) {return undefined;}
  const clean = url.trim();

  // Allow only https: or trusted data:image URIs
  if (clean.startsWith('https://') || clean.startsWith('data:image/')) {
    return clean.slice(0, 500);
  }

  return undefined;
}
