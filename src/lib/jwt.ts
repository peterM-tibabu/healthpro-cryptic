/**
 * Decode JWT payload to extract expiration time
 */
export function getTokenExpiration(token: string): number | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]!));
        const exp = payload.exp;

        if (typeof exp !== "number") return null;

        // Calculate maxAge in seconds (exp is in seconds since epoch)
        const currentTime = Math.floor(Date.now() / 1000);
        const maxAge = exp - currentTime;

        return maxAge > 0 ? maxAge : null;
    } catch (error) {
        return null;
    }
}

/**
 * Decode JWT token to extract full payload
 */
export function decodeJWT(token: string): object | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]!));
        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Encode object to JWT format (header.payload.signature)
 * Note: This creates a mock JWT without actual signature verification
 */
export function encodeJWT(payload: object): string {
    try {
        // Standard JWT header
        const header = {
            alg: "HS256",
            typ: "JWT"
        };

        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        
        // Mock signature (in real JWT this would be cryptographically signed)
        const signature = "mock-signature";

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    } catch (error) {
        throw new Error("Failed to encode JWT");
    }
}

