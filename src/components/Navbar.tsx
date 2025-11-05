import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { path: '/', label: 'RSA-AES Encryption' },
    { path: '/jwt', label: 'JWT Decoder' },
  ]

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-16 space-x-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">🔐 Cryption</span>
          </div>
          <div className="flex space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

