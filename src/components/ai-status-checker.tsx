'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Settings,
} from 'lucide-react'

interface AIStatus {
  available: boolean
  models: string[]
  message: string
}

export function AIStatusChecker() {
  const [status, setStatus] = useState<AIStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to check AI status:', error)
      setStatus({
        available: false,
        models: [],
        message: 'Failed to check AI status',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Checking AI Status...
          </CardTitle>
          <CardDescription>
            Verifying Ollama availability and model access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            AI Status Unknown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to check AI status right now.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.available ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Local AI Status
          </CardTitle>
          <CardDescription>
            {status.available
              ? 'Ollama is running and ready for AI features'
              : 'Ollama is not running or not accessible'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={status.available ? 'default' : 'destructive'}>
              {status.available ? 'Available' : 'Not Available'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={checkAIStatus}
              disabled={loading}
            >
              <Loader2
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {status.available && status.models.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Available Models:</h4>
              <div className="flex flex-wrap gap-2">
                {status.models.map((model) => (
                  <Badge key={model} variant="secondary">
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!status.available && (
            <Alert className="border-red-200/60 bg-red-50/50 text-red-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-red-700">
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          {!status.available && (
            <div className="space-y-2">
              <Button
                onClick={() => setShowSetup(!showSetup)}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showSetup ? 'Hide' : 'Show'} Setup Instructions
              </Button>

              {showSetup && (
                <Card className="border-border/60 bg-muted/20">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Setup Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Install Ollama</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Download and install Ollama from{' '}
                        <a
                          href="https://ollama.ai/download"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          https://ollama.ai/download
                        </a>
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">2. Start Ollama</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ollama should start automatically after installation. If
                        not, run:
                      </p>
                      <code className="block bg-background p-2 rounded text-sm">
                        ollama serve
                      </code>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">3. Install a Model</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Install a model (this will happen automatically when you
                        first use AI features):
                      </p>
                      <code className="block bg-background p-2 rounded text-sm">
                        ollama pull llama2:7b
                      </code>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">4. Test the Setup</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Once Ollama is running, refresh this page to check the
                        status.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={checkAIStatus}
                        className="w-full"
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Check Status Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {status.available && (
            <Alert className="border-green-200/60 bg-green-50/50 text-green-900">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-sm text-green-700">
                AI features are ready! You can now use transaction
                categorization, bulk categorization, and other AI-powered
                features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
