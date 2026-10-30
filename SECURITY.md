# Security Policy — Urbanguard

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Reporting a Vulnerability

If you discover a security vulnerability in **Urbanguard**, please follow responsible disclosure:

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Email the security team at: **security@urbanguard.example.com**
3. Include:
   - A description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if available)

We will acknowledge your report within **48 hours** and provide a fix within **7 days** for critical issues.

## Security Features

Urbanguard implements the following security measures:

### HTTP Security Headers
- `Strict-Transport-Security` (HSTS) — enforces HTTPS
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `Content-Security-Policy` — restricts resource loading origins
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — limits browser API access

### Authentication & Data
- Row-Level Security (RLS) enforced at the Supabase database level
- No sensitive credentials stored in the client bundle
- Environment variables used for all secrets (`.env.local`, never committed)
- Input validation on all API endpoints (title, description, category required)
- SQL injection protection via parameterized Supabase queries

### API Security
- All API routes validate required fields before processing
- Rate limiting recommended via Vercel Edge Config or Supabase policies
- CORS controlled by Next.js defaults (same-origin)

## Dependency Security

Run the following to audit dependencies:

```bash
npm audit
npm audit fix
```

We actively monitor and update dependencies for known CVEs.
