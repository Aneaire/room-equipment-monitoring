'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Fingerprint, Monitor, Shield, Eye, EyeOff, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SignInPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [authMethod, setAuthMethod] = useState<'credentials' | 'biometric'>('biometric') // Default to biometric
  const router = useRouter()
  const { toast } = useToast()

  // Auto-switch to credentials if username is entered (for admin login)
  useEffect(() => {
    if (username.trim()) {
      setAuthMethod('credentials')
    } else {
      setAuthMethod('biometric')
    }
  }, [username])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
        toast({
          title: 'Authentication Failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
        })
      } else {
        // Get user info from the session to determine role
        const session = await signIn('credentials', {
          username,
          password,
          redirect: false,
        })
        
        toast({
          title: 'Login Successful',
          description: 'Welcome to TabeTalá Laboratory Management System',
        })
        // Redirect based on username (temporary until we fix the session issue)
        setTimeout(() => {
          if (username === 'admin') {
            router.push('/admin')
          } else if (['rocampo', 'agarcia', 'mreyes', 'lsantos', 'rtan'].includes(username)) {
            router.push('/faculty')
          } else {
            router.push('/custodian')
          }
        }, 1000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBiometricLogin = async (biometricId: string) => {
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('biometric', {
        biometricId,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid biometric ID')
        toast({
          title: 'Authentication Failed',
          description: 'Please check your biometric ID and try again.',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Login Successful',
          description: 'Welcome to TabeTalá Laboratory Management System',
        })
        // For biometric login, redirect to dashboard first, then role-based redirect will happen
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Monitor className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TabeTalá</h1>
          <p className="text-sm text-gray-600">Laboratory Management System</p>
        </div>

        {/* Authentication Method Toggle */}
        <div className="flex space-x-2 bg-white p-1 rounded-lg shadow">
          <button
            type="button"
            onClick={() => setAuthMethod('credentials')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              authMethod === 'credentials'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Credentials</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('biometric')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              authMethod === 'biometric'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Fingerprint className="h-4 w-4" />
            <span>Biometric</span>
          </button>
        </div>

        {/* Credentials Login */}
        {authMethod === 'credentials' && (
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access the laboratory management system
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCredentialsLogin}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a 
                      href="/auth/forgot-password" 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Biometric Login */}
        {authMethod === 'biometric' && (
          <Card>
            <CardHeader>
              <CardTitle>Biometric Authentication</CardTitle>
              <CardDescription>
                Enter your biometric ID to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="biometric-id">Biometric ID</Label>
                  <Input
                    id="biometric-id"
                    placeholder="e.g., BIO001, BIO123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                    pattern="BIO\d{3}"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Format: BIO followed by 3 digits
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                      <Fingerprint className={`h-12 w-12 text-blue-600 ${isLoading ? 'animate-pulse' : ''}`} />
                    </div>
                    {isLoading && (
                      <div className="absolute -inset-2 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <p className="text-center text-sm text-gray-600">
                    {isLoading ? 'Authenticating...' : 'Enter your biometric ID above'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleBiometricLogin(username)} 
                className="w-full" 
                disabled={isLoading || !username.trim()}
              >
                {isLoading ? 'Authenticating...' : 'Authenticate with Biometric ID'}
              </Button>
            </CardFooter>
          </Card>
        )}

        

        {/* Demo Credentials */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div><strong>Admin:</strong> admin / admin123 (Credentials)</div>
            <div><strong>Faculty:</strong> Use Biometric ID (BIO002, BIO003, BIO004, BIO011)</div>
            <div><strong>Custodian:</strong> Use Biometric ID (BIO005, BIO006, BIO012)</div>
            <div className="pt-2 border-t border-gray-300">
              <div><strong>Note:</strong> Teachers use biometric authentication only</div>
              <div><strong>Admin:</strong> Manages user creation and system settings</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}