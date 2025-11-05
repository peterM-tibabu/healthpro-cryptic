import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  decodeJWT,
  encodeJWT,
  getTokenExpiration,
  getTokenSummary,
  decodeTokenHeader,
  isTokenExpired,
  getUserFromToken
} from '@/lib/jwt'
import { useAppContext } from '@/contexts/AppContext'
import { Info } from 'lucide-react'

type LastModified = 'token' | 'decoded' | null;

export default function JWTDecoder() {
  const { jwtState, updateJWTState } = useAppContext()
  const [tokenString, setTokenString] = useState(jwtState.token || '')
  const [decodedToken, setDecodedToken] = useState(jwtState.decodedPayload || '')
  const [lastModified, setLastModified] = useState<LastModified>(
    jwtState.token ? 'token' : null
  )
  const [error, setError] = useState('')
  const [expirationInfo, setExpirationInfo] = useState<string>('')
  const [tokenInfo, setTokenInfo] = useState<string>('')

  // Handle decoding when token string changes
  useEffect(() => {
    if (lastModified === 'token' && tokenString) {
      try {
        setError('')
        const decoded = decodeJWT(tokenString)
        if (decoded) {
          setDecodedToken(JSON.stringify(decoded, null, 2))

          // Get token summary
          const summary = getTokenSummary(tokenString)
          if (summary) {
            const expired = isTokenExpired(tokenString)
            if (expired) {
              setExpirationInfo('Token has expired')
            } else {
              setExpirationInfo(`Token expires in ${summary.expiresIn}`)
            }

            // Build detailed token info
            const header = decodeTokenHeader(tokenString)
            const userInfo = getUserFromToken(tokenString)

            let info = `Type: ${summary.type}\n`
            if (header) {
              info += `Algorithm: ${header.alg}\n`
            }
            if (userInfo) {
              info += `User: ${userInfo.userId}\n`
              info += `Role: ${userInfo.roleProfile}\n`
              info += `Session: ${userInfo.sessionId}\n`
            }
            info += `Expires: ${summary.expiresAt}\n`
            info += `Status: ${summary.valid ? 'Valid' : 'Expired'}`

            setTokenInfo(info)
          } else {
            setExpirationInfo('')
            setTokenInfo('')
          }
        } else {
          setError('Invalid JWT token format')
          setDecodedToken('')
          setExpirationInfo('')
          setTokenInfo('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to decode token')
        setDecodedToken('')
        setExpirationInfo('')
        setTokenInfo('')
      }
    }
  }, [tokenString, lastModified])

  // Handle encoding when decoded token changes
  useEffect(() => {
    if (lastModified === 'decoded' && decodedToken) {
      try {
        setError('')
        const jsonData = JSON.parse(decodedToken)
        const encoded = encodeJWT(jsonData)
        setTokenString(encoded)
        
        // Get expiration info
        const maxAge = getTokenExpiration(encoded)
        if (maxAge !== null) {
          const minutes = Math.floor(maxAge / 60)
          const seconds = maxAge % 60
          if (maxAge > 0) {
            setExpirationInfo(`Token expires in ${minutes}m ${seconds}s`)
          } else {
            setExpirationInfo('Token has expired')
          }
        } else {
          setExpirationInfo('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to encode token')
        setExpirationInfo('')
      }
    }
  }, [decodedToken, lastModified])

  const handleTokenChange = (value: string) => {
    setTokenString(value)
    setLastModified('token')
    updateJWTState({ token: value })
  }

  const handleDecodedChange = (value: string) => {
    setDecodedToken(value)
    setLastModified('decoded')
    updateJWTState({ decodedPayload: value })
  }

  // Update context when decoding/encoding results change
  useEffect(() => {
    if (lastModified === 'token' && decodedToken) {
      updateJWTState({ decodedPayload: decodedToken })
    } else if (lastModified === 'decoded' && tokenString) {
      updateJWTState({ token: tokenString })
    }
  }, [decodedToken, tokenString, lastModified])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">JWT Token Decoder</h1>
          <p className="text-muted-foreground">
            Decode JWT tokens to view their payload or encode JSON data into JWT format
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
            {error}
          </div>
        )}

        {expirationInfo && (
          <div className={`border px-4 py-3 rounded ${
            expirationInfo.includes('expired')
              ? 'bg-destructive/10 border-destructive text-destructive'
              : 'bg-primary/10 border-primary text-primary'
          }`}>
            {expirationInfo}
          </div>
        )}

        {tokenInfo && (
          <div className="bg-muted/50 border border-muted px-4 py-3 rounded">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Token Information</p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                  {tokenInfo}
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
          {/* Token String Input */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="token" className="text-lg font-semibold">
              JWT Token String
            </Label>
            <Textarea
              id="token"
              placeholder="Paste your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              value={tokenString}
              onChange={(e) => handleTokenChange(e.target.value)}
              className="flex-1 font-mono text-sm resize-none"
            />
          </div>

          {/* Decoded Token Display */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="decoded" className="text-lg font-semibold">
              Decoded Payload (JSON)
            </Label>
            <Textarea
              id="decoded"
              placeholder="Decoded JWT payload will appear here as JSON"
              value={decodedToken}
              onChange={(e) => handleDecodedChange(e.target.value)}
              className="flex-1 font-mono text-sm resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

