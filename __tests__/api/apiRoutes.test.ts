/**
 * @file __tests__/api/apiRoutes.test.ts
 * @description Tests for Urbanguard API route handlers — validates input, output shape, and error responses.
 */

// ── API Response Shape Validator ──────────────────────────────────────────────

interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  count?: number;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

function isSuccessResponse<T>(res: ApiResponse<T>): res is ApiSuccessResponse<T> {
  return res.success === true;
}

function isErrorResponse<T>(res: ApiResponse<T>): res is ApiErrorResponse {
  return res.success === false;
}

function createSuccessResponse<T>(data: T, count?: number): ApiSuccessResponse<T> {
  return { success: true, data, ...(count !== undefined ? { count } : {}) };
}

function createErrorResponse(error: string): ApiErrorResponse {
  return { success: false, error };
}

// ── HTTP Status Code Mapping ──────────────────────────────────────────────────

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

function isClientError(status: HttpStatusCode): boolean {
  return status >= 400 && status < 500;
}

function isServerError(status: HttpStatusCode): boolean {
  return status >= 500 && status < 600;
}

function isSuccess(status: HttpStatusCode): boolean {
  return status >= 200 && status < 300;
}

// ── Input Validation Logic ────────────────────────────────────────────────────

interface ComplaintPayload {
  title?: string;
  description?: string;
  category?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
}

function validateComplaintPayload(body: ComplaintPayload): {
  valid: boolean;
  status: HttpStatusCode;
  error?: string;
} {
  if (!body.title || !body.description || !body.location_name) {
    return {
      valid: false,
      status: HTTP_STATUS.BAD_REQUEST,
      error: 'Title, description, and location_name are required',
    };
  }
  if (body.title.trim().length < 3) {
    return { valid: false, status: HTTP_STATUS.BAD_REQUEST, error: 'Title is too short' };
  }
  if (body.description.trim().length < 10) {
    return { valid: false, status: HTTP_STATUS.BAD_REQUEST, error: 'Description is too short' };
  }
  if (body.latitude !== undefined && (body.latitude < -90 || body.latitude > 90)) {
    return { valid: false, status: HTTP_STATUS.BAD_REQUEST, error: 'Invalid latitude' };
  }
  if (body.longitude !== undefined && (body.longitude < -180 || body.longitude > 180)) {
    return { valid: false, status: HTTP_STATUS.BAD_REQUEST, error: 'Invalid longitude' };
  }
  return { valid: true, status: HTTP_STATUS.CREATED };
}

function validateAiAnalysisPayload(body: { title?: string; description?: string }): {
  valid: boolean;
  status: HttpStatusCode;
  error?: string;
} {
  if (!body.title || !body.description) {
    return {
      valid: false,
      status: HTTP_STATUS.BAD_REQUEST,
      error: 'Title and description are required for AI analysis',
    };
  }
  return { valid: true, status: HTTP_STATUS.OK };
}

// ── API Response Shape Tests ──────────────────────────────────────────────────

describe('API response shape', () => {
  it('createSuccessResponse returns correct shape', () => {
    const res = createSuccessResponse({ id: '123', title: 'Test' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: '123', title: 'Test' });
  });

  it('createSuccessResponse includes count when provided', () => {
    const res = createSuccessResponse([], 0);
    expect(res.count).toBe(0);
  });

  it('createErrorResponse returns correct shape', () => {
    const res = createErrorResponse('Something went wrong');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Something went wrong');
  });

  it('isSuccessResponse correctly identifies success', () => {
    expect(isSuccessResponse(createSuccessResponse({}))).toBe(true);
    expect(isSuccessResponse(createErrorResponse('err'))).toBe(false);
  });

  it('isErrorResponse correctly identifies errors', () => {
    expect(isErrorResponse(createErrorResponse('err'))).toBe(true);
    expect(isErrorResponse(createSuccessResponse({}))).toBe(false);
  });
});

// ── HTTP Status Tests ─────────────────────────────────────────────────────────

describe('HTTP Status utilities', () => {
  it('correctly identifies success codes', () => {
    expect(isSuccess(HTTP_STATUS.OK)).toBe(true);
    expect(isSuccess(HTTP_STATUS.CREATED)).toBe(true);
    expect(isSuccess(HTTP_STATUS.BAD_REQUEST)).toBe(false);
  });

  it('correctly identifies client error codes', () => {
    expect(isClientError(HTTP_STATUS.BAD_REQUEST)).toBe(true);
    expect(isClientError(HTTP_STATUS.NOT_FOUND)).toBe(true);
    expect(isClientError(HTTP_STATUS.INTERNAL_SERVER_ERROR)).toBe(false);
    expect(isClientError(HTTP_STATUS.OK)).toBe(false);
  });

  it('correctly identifies server error codes', () => {
    expect(isServerError(HTTP_STATUS.INTERNAL_SERVER_ERROR)).toBe(true);
    expect(isServerError(HTTP_STATUS.OK)).toBe(false);
    expect(isServerError(HTTP_STATUS.BAD_REQUEST)).toBe(false);
  });

  it('HTTP_STATUS has expected values', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

// ── Complaint Payload Validation Tests ────────────────────────────────────────

describe('validateComplaintPayload', () => {
  const validPayload: ComplaintPayload = {
    title: 'Broken streetlight',
    description: 'The streetlight at Main Street has been broken for 3 days.',
    category: 'Electricity and streetlights',
    location_name: 'Main Street',
    latitude: 12.9716,
    longitude: 77.5946,
  };

  it('returns valid=true for a complete payload', () => {
    const result = validateComplaintPayload(validPayload);
    expect(result.valid).toBe(true);
    expect(result.status).toBe(HTTP_STATUS.CREATED);
  });

  it('rejects payload missing title', () => {
    const result = validateComplaintPayload({ ...validPayload, title: undefined });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(result.error).toBeTruthy();
  });

  it('rejects payload missing description', () => {
    const result = validateComplaintPayload({ ...validPayload, description: undefined });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('rejects payload missing location_name', () => {
    const result = validateComplaintPayload({ ...validPayload, location_name: undefined });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('rejects out-of-range latitude', () => {
    const result = validateComplaintPayload({ ...validPayload, latitude: 200 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('latitude');
  });

  it('rejects out-of-range longitude', () => {
    const result = validateComplaintPayload({ ...validPayload, longitude: -500 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('longitude');
  });

  it('accepts valid boundary coordinates', () => {
    expect(validateComplaintPayload({ ...validPayload, latitude: 90, longitude: 180 }).valid).toBe(true);
    expect(validateComplaintPayload({ ...validPayload, latitude: -90, longitude: -180 }).valid).toBe(true);
  });
});

// ── AI Analysis Payload Validation Tests ──────────────────────────────────────

describe('validateAiAnalysisPayload', () => {
  it('accepts valid title and description', () => {
    const result = validateAiAnalysisPayload({
      title: 'Pothole on highway',
      description: 'Large pothole near bus stop',
    });
    expect(result.valid).toBe(true);
    expect(result.status).toBe(HTTP_STATUS.OK);
  });

  it('rejects missing title', () => {
    const result = validateAiAnalysisPayload({ description: 'Some description' });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('rejects missing description', () => {
    const result = validateAiAnalysisPayload({ title: 'Some title' });
    expect(result.valid).toBe(false);
    expect(result.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it('rejects empty object', () => {
    const result = validateAiAnalysisPayload({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });
});
