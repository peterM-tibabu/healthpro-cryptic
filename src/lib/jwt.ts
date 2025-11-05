/**
 * HealthPro ERP Token Utilities
 *
 * Essential JWT token encoding and decoding utilities for JavaScript clients
 * All required functions in a single file
 */

/**
 * Base64 URL decode (JWT standard)
 */
export function base64UrlDecode(str: string): string {
  // Replace URL-safe characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');

  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }

  return atob(str);
}

/**
 * Base64 URL encode (JWT standard)
 */
export function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Decode JWT token payload without verification
 * @param token - JWT token string (can be encrypted or plain)
 * @returns Decoded payload or null if invalid
 */
export function decodeTokenPayload(token: string): any | null {
  try {
    // Handle encrypted tokens - try to extract JWT from encrypted wrapper
    let jwtToken = token;

    // If token doesn't look like JWT (no dots), it might be encrypted
    if (!token.includes('.')) {
      console.warn('Token appears to be encrypted. Decryption not implemented in frontend.');
      return null;
    }

    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token payload:', error);
    return null;
  }
}

/**
 * Decode JWT token header
 * @param token - JWT token string
 * @returns Decoded header or null if invalid
 */
export function decodeTokenHeader(token: string): any | null {
  try {
    if (!token.includes('.')) {
      console.warn('Token appears to be encrypted. Cannot decode header.');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const header = JSON.parse(base64UrlDecode(parts[0]));
    return header;
  } catch (error) {
    console.error('Error decoding token header:', error);
    return null;
  }
}

/**
 * Get token expiration date
 * @param token - JWT token string
 * @returns Date object or null if invalid
 */
export function getTokenExpiryDate(token: string): Date | null {
  const payload = decodeTokenPayload(token);
  return payload && payload.exp ? new Date(payload.exp * 1000) : null;
}

/**
 * Check if token is expired
 * @param token - JWT token string
 * @param bufferMinutes - Buffer time in minutes (default: 5)
 * @returns True if expired
 */
export function isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  const bufferSeconds = bufferMinutes * 60;

  return payload.exp <= (now + bufferSeconds);
}

/**
 * Get time remaining until token expires
 * @param token - JWT token string
 * @returns milliseconds until expiration, or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string): number {
  const payload = decodeTokenPayload(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Date.now();
  const expiryTime = payload.exp * 1000;

  return Math.max(0, expiryTime - now);
}

/**
 * Create JWT header for encoding (testing purposes)
 */
export function createJWTHeader(): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  return base64UrlEncode(JSON.stringify(header));
}

/**
 * Generate random ID for testing
 */
export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

interface AccessScope {
  level: string;
  organization: string;
  region: string | null;
  facilities: string[];
  supplier_id: string | null;
  practitioner_id: string | null;
  org_company_id: string | null;
  region_company_id: string | null;
}

interface TokenPayload {
  user_id?: string;
  role_profile?: string;
  access_scope?: AccessScope;
  token_type?: string;
  session_id?: string;
  [key: string]: any;
}

/**
 * Create a mock JWT token (for testing purposes only)
 * WARNING: This creates unsigned tokens for testing only!
 * @param payload - Token payload
 * @returns Unsigned JWT token (for testing only)
 */
export function createMockToken(payload: TokenPayload): string {
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = {
    iss: 'HealthPro ERP Backend',
    sub: payload.user_id || 'test-user',
    iat: now,
    exp: now + (payload.token_type === 'refresh' ? 24 * 60 * 60 : 30 * 60), // 24h for refresh, 30min for access
    jti: generateRandomId(),
    session_id: payload.session_id || generateRandomId(),
    user_id: payload.user_id || 'test-user@example.com',
    role_profile: payload.role_profile || 'Healthcare Provider',
    access_scope: payload.access_scope || {
      level: 'facility',
      organization: 'ORG-001',
      region: null,
      facilities: ['FAC-001'],
      supplier_id: null,
      practitioner_id: null,
      org_company_id: null,
      region_company_id: null
    },
    token_type: payload.token_type || 'access',
    ...payload
  };

  const header = createJWTHeader();
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  // Return unsigned token (signature would be added by backend)
  return `${header}.${encodedPayload}.UNSIGNED_TOKEN_FOR_TESTING_ONLY`;
}

interface UserInfo {
  userId: string;
  roleProfile?: string;
  accessScope?: Partial<AccessScope>;
  sessionId?: string;
}

/**
 * Create mock access token for testing
 * @param userInfo - User information
 * @returns Mock access token
 */
export function createMockAccessToken(userInfo: UserInfo): string {
  return createMockToken({
    user_id: userInfo.userId,
    role_profile: userInfo.roleProfile || 'Healthcare Provider',
    access_scope: {
      level: 'facility',
      organization: 'ORG-001',
      region: null,
      facilities: ['FAC-001'],
      supplier_id: null,
      practitioner_id: null,
      org_company_id: null,
      region_company_id: null,
      ...userInfo.accessScope
    },
    token_type: 'access'
  });
}

/**
 * Create mock refresh token for testing
 * @param userInfo - User information
 * @returns Mock refresh token
 */
export function createMockRefreshToken(userInfo: UserInfo): string {
  return createMockToken({
    user_id: userInfo.userId,
    role_profile: userInfo.roleProfile || 'Healthcare Provider',
    session_id: userInfo.sessionId || generateRandomId(),
    token_type: 'refresh'
  });
}

interface LoginResponse {
  data?: {
    user?: {
      regulator?: any;
    };
  };
}

/**
 * Check if user has Compliance User role from login response
 * @param loginResponse - Complete login response
 * @returns True if user has Compliance User role
 */
export function hasComplianceUserRole(loginResponse: LoginResponse): boolean {
  return loginResponse?.data?.user?.regulator !== undefined;
}

interface UserFromToken {
  userId: string;
  sessionId: string;
  roleProfile: string;
  accessScope: AccessScope;
  tokenType: string;
  expiresAt: Date;
  issuedAt: Date;
}

/**
 * Extract user information from token
 * @param token - JWT token string
 * @returns User information or null if invalid
 */
export function getUserFromToken(token: string): UserFromToken | null {
  const payload = decodeTokenPayload(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.user_id,
    sessionId: payload.session_id,
    roleProfile: payload.role_profile,
    accessScope: payload.access_scope,
    tokenType: payload.token_type || 'access',
    expiresAt: new Date(payload.exp * 1000),
    issuedAt: new Date(payload.iat * 1000)
  };
}

interface TokenSummary {
  valid: boolean;
  expired: boolean;
  type: string;
  userId: string;
  expiresIn: string;
  roleProfile: string;
  expiresAt: string;
}

/**
 * Get token summary for debugging
 * @param token - JWT token string
 * @returns Token summary or null if invalid
 */
export function getTokenSummary(token: string): TokenSummary | null {
  const payload = decodeTokenPayload(token);
  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp <= now;
  const timeRemaining = Math.max(0, (payload.exp * 1000) - Date.now());
  const expiresIn = timeRemaining > 0
    ? `${Math.floor(timeRemaining / 1000 / 60)} minutes`
    : 'expired';

  return {
    valid: !isExpired,
    expired: isExpired,
    type: payload.token_type || 'access',
    userId: payload.user_id,
    expiresIn,
    roleProfile: payload.role_profile,
    expiresAt: new Date(payload.exp * 1000).toISOString()
  };
}

// Legacy function names for backward compatibility
/**
 * Decode JWT token to extract full payload
 * @deprecated Use decodeTokenPayload instead
 */
export function decodeJWT(token: string): any | null {
  return decodeTokenPayload(token);
}

/**
 * Encode object to JWT format (header.payload.signature)
 * Note: This creates a mock JWT without actual signature verification
 * @deprecated Use createMockToken instead
 */
export function encodeJWT(payload: any): string {
  return createMockToken(payload);
}

/**
 * Decode JWT payload to extract expiration time
 * @deprecated Use getTokenTimeRemaining instead
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const timeRemaining = getTokenTimeRemaining(token);
    if (timeRemaining === 0) return null;
    return Math.floor(timeRemaining / 1000); // Convert to seconds
  } catch (error) {
    return null;
  }
}

