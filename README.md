# Cryption

Minimal web app to help with decrypting/encrypting payloads for healthpro.

## What is this?

Two tools in one app:
- **RSA-AES Encryption**: Encrypt/decrypt JSON data using hybrid RSA-AES encryption
- **JWT Decoder**: Decode JWT tokens to view payload and expiration time

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3010

## Usage

### RSA-AES Encryption
1. Enter public/private keys (or configure in `.env`)
2. Paste JSON in "Unencrypted" field → auto-encrypts
3. Or paste encrypted data in "Encrypted" field → auto-decrypts

### JWT Decoder
1. Paste JWT token → auto-decodes to JSON
2. Or paste/edit JSON → auto-encodes to JWT
3. View token expiration time

