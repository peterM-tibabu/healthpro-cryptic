import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { encryptDataWithRSA_AES } from '@/lib/encrypt'
import { decryptDataWithRSA_AES } from '@/lib/decrypt'

type LastModified = 'unencrypted' | 'encrypted' | null;

export default function Encryption() {
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [unencryptedText, setUnencryptedText] = useState('')
  const [encryptedText, setEncryptedText] = useState('')
  const [lastModified, setLastModified] = useState<LastModified>(null)
  const [error, setError] = useState('')

  // Load keys from environment variables on mount
  useEffect(() => {
    const envPublicKey = import.meta.env.VITE_PUBLIC_KEY_PEM || ''
    const envPrivateKey = import.meta.env.VITE_PRIVATE_KEY_PEM || ''
    setPublicKey(envPublicKey)
    setPrivateKey(envPrivateKey)
  }, [])

  // Handle encryption when unencrypted text changes
  useEffect(() => {
    if (lastModified === 'unencrypted' && unencryptedText && publicKey) {
      try {
        setError('')
        // Parse the unencrypted text as JSON
        const jsonData = JSON.parse(unencryptedText)
        const encrypted = encryptDataWithRSA_AES(jsonData, publicKey)
        setEncryptedText(encrypted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Encryption failed')
      }
    }
  }, [unencryptedText, publicKey, lastModified])

  // Handle decryption when encrypted text changes
  useEffect(() => {
    if (lastModified === 'encrypted' && encryptedText && privateKey) {
      try {
        setError('')
        const decrypted = decryptDataWithRSA_AES(encryptedText, privateKey)
        setUnencryptedText(JSON.stringify(decrypted, null, 2))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Decryption failed')
      }
    }
  }, [encryptedText, privateKey, lastModified])

  // Re-process when keys change
  useEffect(() => {
    if (lastModified === 'unencrypted' && unencryptedText && publicKey) {
      try {
        setError('')
        const jsonData = JSON.parse(unencryptedText)
        const encrypted = encryptDataWithRSA_AES(jsonData, publicKey)
        setEncryptedText(encrypted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Encryption failed')
      }
    } else if (lastModified === 'encrypted' && encryptedText && privateKey) {
      try {
        setError('')
        const decrypted = decryptDataWithRSA_AES(encryptedText, privateKey)
        setUnencryptedText(JSON.stringify(decrypted, null, 2))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Decryption failed')
      }
    }
  }, [publicKey, privateKey])

  const handleUnencryptedChange = (value: string) => {
    setUnencryptedText(value)
    setLastModified('unencrypted')
  }

  const handleEncryptedChange = (value: string) => {
    setEncryptedText(value)
    setLastModified('encrypted')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Key Inputs */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publicKey">Public Key</Label>
              <Input
                id="publicKey"
                type="text"
                placeholder="Enter RSA public key (PEM format)"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                type="text"
                placeholder="Enter RSA private key (PEM format)"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area with Two Text Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-14rem)]">
        {/* Unencrypted Field */}
        <div className="flex flex-col border-r">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Unencrypted (JSON)</h2>
            <p className="text-sm text-muted-foreground">
              Paste JSON data here to encrypt
            </p>
          </div>
          <div className="flex-1 p-6">
            <Textarea
              placeholder='{"key": "value"}'
              value={unencryptedText}
              onChange={(e) => handleUnencryptedChange(e.target.value)}
              className="h-full resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* Encrypted Field */}
        <div className="flex flex-col">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Encrypted (Base64)</h2>
            <p className="text-sm text-muted-foreground">
              Paste encrypted data here to decrypt
            </p>
          </div>
          <div className="flex-1 p-6">
            <Textarea
              placeholder="Encrypted data will appear here..."
              value={encryptedText}
              onChange={(e) => handleEncryptedChange(e.target.value)}
              className="h-full resize-none font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

