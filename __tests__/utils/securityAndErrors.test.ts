import { sanitizeString, validateLatitude, validateLongitude, validateEmail, sanitizeImageUrl } from '@/lib/security/sanitize';
import { AppError, ValidationError, NotFoundError, RateLimitError, UnauthorizedError } from '@/lib/errors/AppError';

describe('Security & Sanitization Suite', () => {
  it('strips script tags and malicious attributes', () => {
    const malicious = '<script>alert("xss")</script>Pothole on 5th street';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toContain('Pothole on 5th street');
  });

  it('escapes html entities', () => {
    const input = 'Issue with <b>bold</b> & "quotes"';
    const output = sanitizeString(input);
    expect(output).toContain('&amp;');
    expect(output).toContain('&quot;');
    expect(output).not.toContain('<b>');
  });

  it('strips javascript: protocol', () => {
    const link = 'javascript:evil() Click me';
    const clean = sanitizeString(link);
    expect(clean.toLowerCase()).not.toContain('javascript:');
  });

  it('handles non-string input safely', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(12345)).toBe('');
  });

  it('enforces maxLength', () => {
    const long = 'a'.repeat(50);
    const result = sanitizeString(long, 10);
    expect(result.length).toBe(10);
  });

  it('validates latitude bounds correctly', () => {
    expect(validateLatitude(12.9716)).toBe(12.9716);
    expect(validateLatitude(100)).toBe(12.9716); // Out of bounds -> fallback
    expect(validateLatitude(-95)).toBe(12.9716);
    expect(validateLatitude('13.05')).toBe(13.05);
  });

  it('validates longitude bounds correctly', () => {
    expect(validateLongitude(77.5946)).toBe(77.5946);
    expect(validateLongitude(200)).toBe(77.5946); // Out of bounds -> fallback
    expect(validateLongitude(-190)).toBe(77.5946);
    expect(validateLongitude('77.60')).toBe(77.6);
  });

  it('validates email addresses', () => {
    expect(validateEmail('citizen@urbanguard.org')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail(null)).toBe(false);
  });

  it('sanitizes image URLs to only allow https and data:image', () => {
    expect(sanitizeImageUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    expect(sanitizeImageUrl('data:image/png;base64,xxxx')).toContain('data:image/png');
    expect(sanitizeImageUrl('http://insecure.com/photo.jpg')).toBeUndefined();
    expect(sanitizeImageUrl('javascript:alert(1)')).toBeUndefined();
  });
});

describe('Custom Error Classes Suite', () => {
  it('instantiates AppError with correct defaults', () => {
    const err = new AppError('Something went wrong');
    expect(err.message).toBe('Something went wrong');
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.isOperational).toBe(true);
  });

  it('instantiates ValidationError with 400 status', () => {
    const valErr = new ValidationError('Invalid title');
    expect(valErr.statusCode).toBe(400);
    expect(valErr.code).toBe('VALIDATION_ERROR');
  });

  it('instantiates NotFoundError with 404 status', () => {
    const notFound = new NotFoundError('Complaint');
    expect(notFound.statusCode).toBe(404);
    expect(notFound.message).toBe('Complaint not found');
  });

  it('instantiates RateLimitError with 429 status', () => {
    const rateErr = new RateLimitError();
    expect(rateErr.statusCode).toBe(429);
  });

  it('instantiates UnauthorizedError with 401 status', () => {
    const authErr = new UnauthorizedError();
    expect(authErr.statusCode).toBe(401);
  });
});
