'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Fingerprint, Eye, Copy, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function MockBiometricsPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [manualBiometricId, setManualBiometricId] = useState('')
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const { toast } = useToast()

  // Generate a random biometric ID
  const generateBiometricId = (): string => {
    const randomNum = Math.floor(Math.random() * 999) + 1
    return `BIO${randomNum.toString().padStart(3, '0')}`
  }

  // Simulate biometric scanning
  const startBiometricScan = async () => {
    setIsScanning(true)
    setScanResult(null)
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const generatedId = generateBiometricId()
    setScanResult(generatedId)
    setIsScanning(false)
    
    // Add to history
    setScanHistory(prev => [generatedId, ...prev.slice(0, 9)])
    
    toast({
      title: 'Biometric Scan Complete',
      description: `Generated biometric ID: ${generatedId}`,
    })
  }

  // Copy biometric ID to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: 'Copied to clipboard',
        description: `Biometric ID ${text} has been copied`,
      })
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      })
    }
  }

  // Use manual biometric ID
  const useManualBiometricId = async () => {
    if (!manualBiometricId.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a biometric ID',
        variant: 'destructive',
      })
      return
    }
    
    const biometricId = manualBiometricId.trim()
    
    try {
      // Test the biometric ID against the database
      const response = await fetch(`/api/biometric?biometricId=${biometricId}`)
      const data = await response.json()
      
      if (data.success) {
        setScanResult(biometricId)
        setScanHistory(prev => [biometricId, ...prev.slice(0, 9)])
        
        toast({
          title: 'User Found',
          description: `Biometric ID belongs to: ${data.user.fullName} (${data.user.role})`,
        })
      } else {
        setScanResult(biometricId)
        setScanHistory(prev => [biometricId, ...prev.slice(0, 9)])
        
        toast({
          title: 'Biometric ID Set',
          description: `Using biometric ID: ${biometricId} (No matching user found)`,
          variant: 'destructive',
        })
      }
    } catch {
      setScanResult(biometricId)
      setScanHistory(prev => [biometricId, ...prev.slice(0, 9)])
      
      toast({
        title: 'Biometric ID Set',
        description: `Using biometric ID: ${biometricId} (Unable to verify user)`,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Mock Biometric Scanner</h1>
          <p className="text-gray-600">
            Test biometric authentication by generating mock biometric IDs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biometric Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-blue-600" />
                <span>Biometric Scanner</span>
              </CardTitle>
              <CardDescription>
                Simulate biometric scanning to generate test biometric IDs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scanner Interface */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                    <Fingerprint className={`h-16 w-16 text-blue-600 ${isScanning ? 'animate-pulse' : ''}`} />
                  </div>
                  {isScanning && (
                    <div className="absolute -inset-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                <p className="text-center text-sm text-gray-600">
                  {isScanning ? 'Scanning fingerprint...' : 'Place your finger on the scanner'}
                </p>
                
                <Button 
                  onClick={startBiometricScan} 
                  disabled={isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    'Start Biometric Scan'
                  )}
                </Button>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-600">Scan Successful</span>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Biometric ID:</p>
                        <p className="font-mono text-lg font-bold text-green-800">{scanResult}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(scanResult)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(scanResult)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Biometric ID
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>Manual Biometric ID</span>
              </CardTitle>
              <CardDescription>
                Enter a specific biometric ID for testing purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-biometric">Biometric ID</Label>
                <Input
                  id="manual-biometric"
                  placeholder="e.g., BIO001, BIO123, BIO999"
                  value={manualBiometricId}
                  onChange={(e) => setManualBiometricId(e.target.value.toUpperCase())}
                  pattern="BIO\d{3}"
                />
                <p className="text-xs text-gray-500">
                  Format: BIO followed by 3 digits (e.g., BIO001)
                </p>
              </div>
              
              <Button
                onClick={useManualBiometricId}
                disabled={!manualBiometricId.trim()}
                className="w-full"
              >
                Use Manual Biometric ID
              </Button>

              {/* Common Biometric IDs */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Common Test IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {['BIO001', 'BIO002', 'BIO003', 'BIO005', 'BIO010', 'BIO011', 'BIO012'].map((id) => (
                    <Badge
                      key={id}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        setManualBiometricId(id)
                        setScanResult(id)
                        setScanHistory(prev => [id, ...prev.slice(0, 9)])
                      }}
                    >
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span>Recent Scans</span>
              </CardTitle>
              <CardDescription>
                Last {scanHistory.length} biometric scans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scanHistory.map((id, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono">{id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This is a mock biometric scanner for testing purposes. Use the generated biometric IDs 
            to test the authentication system. The format follows the pattern BIO### where ### is a 
            3-digit number (e.g., BIO001, BIO123).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}