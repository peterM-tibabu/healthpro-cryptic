import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { decodeJWT, encodeJWT, getTokenExpiration } from '@/lib/jwt'

type LastModified = 'token' | 'decoded' | null;

export default function JWTDecoder() {
  const [tokenString, setTokenString] = useState('')
  const [decodedToken, setDecodedToken] = useState('')
  const [lastModified, setLastModified] = useState<LastModified>(null)
  const [error, setError] = useState('')
  const [expirationInfo, setExpirationInfo] = useState<string>('')

  // Handle decoding when token string changes
  useEffect(() => {
    if (lastModified === 'token' && tokenString) {
      try {
        setError('')
        const decoded = decodeJWT(tokenString)
        if (decoded) {
          setDecodedToken(JSON.stringify(decoded, null, 2))
          
          // Get expiration info
          const maxAge = getTokenExpiration(tokenString)
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
        } else {
          setError('Invalid JWT token format')
          setDecodedToken('')
          setExpirationInfo('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to decode token')
        setDecodedToken('')
        setExpirationInfo('')
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
  }

  const handleDecodedChange = (value: string) => {
    setDecodedToken(value)
    setLastModified('decoded')
  }

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
          <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded">
            {expirationInfo}
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

