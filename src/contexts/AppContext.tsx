import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface EncryptionState {
  text: string
  key: string
  privateKey: string
  algorithm: string
  mode: string
  result: string
}

interface JWTState {
  token: string
  decodedHeader: string
  decodedPayload: string
}

interface AppContextType {
  encryptionState: EncryptionState
  jwtState: JWTState
  privateKey: string
  updateEncryptionState: (state: Partial<EncryptionState>) => void
  updateJWTState: (state: Partial<JWTState>) => void
  clearEncryptionState: () => void
  clearJWTState: () => void
}

const defaultEncryptionState: EncryptionState = {
  text: '',
  key: '',
  privateKey: '',
  algorithm: 'AES',
  mode: 'encrypt',
  result: '',
}

const defaultJWTState: JWTState = {
  token: '',
  decodedHeader: '',
  decodedPayload: '',
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // Private key stored only in memory (not persisted)
  const [privateKey, setPrivateKey] = useState<string>('')

  const [encryptionState, setEncryptionState] = useState<EncryptionState>(() => {
    const saved = localStorage.getItem('encryptionState')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure privateKey is never loaded from localStorage
      return { ...parsed, privateKey: '' }
    }
    return defaultEncryptionState
  })

  const [jwtState, setJWTState] = useState<JWTState>(() => {
    const saved = localStorage.getItem('jwtState')
    return saved ? JSON.parse(saved) : defaultJWTState
  })

  // Persist encryption state to localStorage (excluding private key)
  useEffect(() => {
    const { privateKey: _, ...stateToSave } = encryptionState
    localStorage.setItem('encryptionState', JSON.stringify(stateToSave))
  }, [encryptionState])

  // Persist JWT state to localStorage
  useEffect(() => {
    localStorage.setItem('jwtState', JSON.stringify(jwtState))
  }, [jwtState])

  const updateEncryptionState = (state: Partial<EncryptionState>) => {
    // Handle private key separately - store only in memory
    if ('privateKey' in state && state.privateKey !== undefined) {
      setPrivateKey(state.privateKey)
      const { privateKey: _, ...restState } = state
      setEncryptionState((prev) => ({ ...prev, ...restState, privateKey: '' }))
    } else {
      setEncryptionState((prev) => ({ ...prev, ...state }))
    }
  }

  const updateJWTState = (state: Partial<JWTState>) => {
    setJWTState((prev) => ({ ...prev, ...state }))
  }

  const clearEncryptionState = () => {
    setEncryptionState(defaultEncryptionState)
    setPrivateKey('')
    localStorage.removeItem('encryptionState')
  }

  const clearJWTState = () => {
    setJWTState(defaultJWTState)
    localStorage.removeItem('jwtState')
  }

  return (
    <AppContext.Provider
      value={{
        encryptionState,
        jwtState,
        privateKey,
        updateEncryptionState,
        updateJWTState,
        clearEncryptionState,
        clearJWTState,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

