'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import {
  TransactionApiResponse,
  BulkCategorizeRequest,
  BulkCategorizeResponse,
  CategorizationResult,
} from '@/types/api'

interface BulkCategorizeModalProps {
  uncategorizedCount: number
  className?: string
}

export function BulkCategorizeModal({
  uncategorizedCount,
  className = '',
}: BulkCategorizeModalProps) {
  const [open, setOpen] = useState(false)

  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<CategorizationResult[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch transactions query
  const { data: transactions = [] } = useQuery<TransactionApiResponse[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      return response.json()
    },
  })

  // Filter uncategorized transactions
  const uncategorizedTransactions = transactions.filter(
    (t: TransactionApiResponse) => !t.category || t.category === 'Other'
  )

  // Bulk categorize mutation
  const bulkCategorizeMutation = useMutation<
    BulkCategorizeResponse,
    Error,
    BulkCategorizeRequest
  >({
    mutationFn: async (data: BulkCategorizeRequest) => {
      const response = await fetch('/api/transactions/bulk-categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to categorize transactions')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setResults(data.results)
      setProgress(100)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })

      toast({
        title: 'Categorization complete',
        description: `Successfully categorized ${data.results.length} transactions.`,
      })

      setTimeout(() => {
        setOpen(false)
        setProgress(0)
        setResults([])
      }, 2000)
    },
    onError: (error) => {
      console.error('Bulk categorization error:', error)
      toast({
        title: 'Error',
        description: 'Failed to categorize transactions. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleBulkCategorize = async () => {
    if (uncategorizedTransactions.length === 0) {
      toast({
        title: 'No uncategorized transactions',
        description: 'All transactions are already categorized.',
      })
      return
    }

    setProgress(0)
    setResults([])

    setProgress(25)

    bulkCategorizeMutation.mutate({
      transactionIds: uncategorizedTransactions.map((t) => t.id),
    })

    setProgress(75)
  }

  // Use mutation loading state
  const loading = bulkCategorizeMutation.isPending

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': 'bg-green-50/60 text-green-700 border border-green-200/60',
      Transportation: 'bg-blue-50/60 text-blue-700 border border-blue-200/60',
      Shopping: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      Entertainment: 'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
      Healthcare: 'bg-red-50/60 text-red-700 border border-red-200/60',
      Utilities: 'bg-cyan-50/60 text-cyan-700 border border-cyan-200/60',
      Housing: 'bg-lime-50/60 text-lime-700 border border-lime-200/60',
      Education: 'bg-pink-50/60 text-pink-700 border border-pink-200/60',
      Travel: 'bg-orange-50/60 text-orange-700 border border-orange-200/60',
      Insurance: 'bg-indigo-50/60 text-indigo-700 border border-indigo-200/60',
      Investment: 'bg-emerald-50/60 text-emerald-700 border border-emerald-200/60',
      Salary: 'bg-green-50/60 text-green-700 border border-green-200/60',
      Freelance: 'bg-blue-50/60 text-blue-700 border border-blue-200/60',
      Gifts: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      Subscriptions: 'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
      Services: 'bg-teal-50/60 text-teal-700 border border-teal-200/60',
      Technology: 'bg-indigo-50/60 text-indigo-700 border border-indigo-200/60',
      Business: 'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
      'Personal Care': 'bg-pink-50/60 text-pink-700 border border-pink-200/60',
      Fitness: 'bg-green-50/60 text-green-700 border border-green-200/60',
      Pets: 'bg-orange-50/60 text-orange-700 border border-orange-200/60',
      Charity: 'bg-red-50/60 text-red-700 border border-red-200/60',
      Legal: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      Taxes: 'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
    }
    return colors[category] || 'bg-muted/30 text-muted-foreground border border-border/60'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`text-xs ${className}`}>
          Auto-Categorize ({uncategorizedCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Auto-Categorize Transactions</DialogTitle>
          <DialogDescription>
            Use AI to automatically categorize {uncategorizedCount}{' '}
            uncategorized transactions. This will analyze transaction
            descriptions and assign appropriate categories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Categorizing transactions...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Categorization Results</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.slice(0, 10).map((result, index) => {
                  const categoryName = result.suggestedCategory
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            result.confidence > 0.7
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                          }`}
                        />
                        <span className="text-sm text-gray-600">
                          {result.reason.includes('"')
                            ? result.reason.split('"')[1]
                            : 'Transaction'}
                        </span>
                      </div>
                      <Badge className={getCategoryColor(categoryName)}>
                        {categoryName}
                      </Badge>
                    </div>
                  )
                })}
                {results.length > 10 && (
                  <div className="text-sm text-gray-500 text-center">
                    ... and {results.length - 10} more transactions
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Ready to categorize
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Start Categorization" to begin the AI-powered process.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkCategorize}
            disabled={loading || uncategorizedCount === 0}
          >
            {loading ? (
              'Categorizing...'
            ) : (
              'Start Categorization'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
