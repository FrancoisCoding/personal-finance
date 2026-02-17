'use client'

import { useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import {
  TransactionApiResponse,
  BulkCategorizeRequest,
  BulkCategorizeResponse,
  CategorizationResult,
} from '@/types/api'
import { useCategories } from '@/hooks/use-finance-data'
import { formatCurrency } from '@/lib/utils'

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
  const [reviewResults, setReviewResults] = useState<CategorizationResult[]>([])
  const [reviewSelections, setReviewSelections] = useState<
    Record<string, string>
  >({})
  const [isApplyingReview, setIsApplyingReview] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()

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
      const applied = data.applied ?? []
      const review = data.review ?? []
      setResults(applied)
      setReviewResults(review)
      setReviewSelections(
        review.reduce<Record<string, string>>((acc, item) => {
          acc[item.transactionId] = item.suggestedCategory
          return acc
        }, {})
      )
      setProgress(100)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })

      toast({
        title: 'Categorization complete',
        description: `Categorized ${applied.length} transactions${
          review.length > 0 ? ` · ${review.length} need review` : ''
        }.`,
      })

      if (review.length === 0) {
        setTimeout(() => {
          setOpen(false)
          setProgress(0)
          setResults([])
        }, 2000)
      }
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
  const hasReview = reviewResults.length > 0
  const transactionLookup = useMemo(
    () =>
      new Map(transactions.map((transaction) => [transaction.id, transaction])),
    [transactions]
  )
  const reviewItems = useMemo(
    () =>
      reviewResults.map((result) => ({
        result,
        transaction: transactionLookup.get(result.transactionId),
      })),
    [reviewResults, transactionLookup]
  )

  const handleApplyReview = async () => {
    if (reviewResults.length === 0) {
      setOpen(false)
      setProgress(0)
      setResults([])
      return
    }

    setIsApplyingReview(true)
    try {
      await Promise.all(
        reviewResults.map((result) =>
          fetch(`/api/transactions/${result.transactionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: reviewSelections[result.transactionId],
            }),
          }).then((response) => {
            if (!response.ok) {
              throw new Error('Failed to update transaction')
            }
            return response.json()
          })
        )
      )
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast({
        title: 'Review applied',
        description: 'Low-confidence suggestions were applied.',
      })
      setOpen(false)
      setProgress(0)
      setResults([])
      setReviewResults([])
    } catch (error) {
      console.error('Review apply error:', error)
      toast({
        title: 'Unable to apply review',
        description: 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsApplyingReview(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining':
        'bg-green-50/60 text-green-700 border border-green-200/60',
      Transportation: 'bg-blue-50/60 text-blue-700 border border-blue-200/60',
      Shopping: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      Entertainment:
        'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
      Healthcare: 'bg-red-50/60 text-red-700 border border-red-200/60',
      Utilities: 'bg-cyan-50/60 text-cyan-700 border border-cyan-200/60',
      Housing: 'bg-lime-50/60 text-lime-700 border border-lime-200/60',
      Education: 'bg-pink-50/60 text-pink-700 border border-pink-200/60',
      Travel: 'bg-orange-50/60 text-orange-700 border border-orange-200/60',
      Insurance: 'bg-indigo-50/60 text-indigo-700 border border-indigo-200/60',
      Investment:
        'bg-emerald-50/60 text-emerald-700 border border-emerald-200/60',
      Salary: 'bg-green-50/60 text-green-700 border border-green-200/60',
      Freelance: 'bg-blue-50/60 text-blue-700 border border-blue-200/60',
      Gifts: 'bg-purple-50/60 text-purple-700 border border-purple-200/60',
      Subscriptions:
        'bg-yellow-50/60 text-yellow-700 border border-yellow-200/60',
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
    return (
      colors[category] ||
      'bg-muted/30 text-muted-foreground border border-border/60'
    )
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
            descriptions, apply high-confidence matches, and send the rest to
            review.
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

          {(results.length > 0 || hasReview) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Categorization Results</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result, index) => {
                  const categoryName = result.suggestedCategory
                  return (
                    <div
                      key={`${result.transactionId}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            result.confidence > 0.7
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
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
                {hasReview && (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                    {reviewResults.length} transaction
                    {reviewResults.length === 1 ? '' : 's'} need review below.
                  </div>
                )}
              </div>
              {hasReview && !loading && (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Review low-confidence suggestions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reviewResults.length} transaction
                      {reviewResults.length === 1 ? '' : 's'} need confirmation.
                    </p>
                  </div>
                  <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                    {reviewItems.map(({ result, transaction }) => (
                      <div
                        key={result.transactionId}
                        className="rounded-xl border border-border/70 bg-card/70 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="text-sm font-medium text-foreground break-words">
                              {transaction?.description ?? 'Transaction'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction?.date
                                ? new Date(transaction.date).toLocaleDateString(
                                    'en-US'
                                  )
                                : 'Unknown date'}{' '}
                              ·{' '}
                              {formatCurrency(
                                Math.abs(transaction?.amount ?? 0)
                              )}
                            </p>
                            <p className="text-[11px] font-medium text-muted-foreground">
                              {Math.round(result.confidence * 100)}% confidence
                            </p>
                          </div>
                          <div className="sm:w-48">
                            <Select
                              value={reviewSelections[result.transactionId]}
                              onValueChange={(value) =>
                                setReviewSelections((prev) => ({
                                  ...prev,
                                  [result.transactionId]: value,
                                }))
                              }
                            >
                              <SelectTrigger className="h-9 w-full bg-background/80">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOpen(false)
                        setProgress(0)
                        setResults([])
                        setReviewResults([])
                      }}
                    >
                      Review later
                    </Button>
                    <Button
                      size="sm"
                      className="min-w-32"
                      onClick={handleApplyReview}
                      disabled={isApplyingReview}
                    >
                      {isApplyingReview ? 'Applying...' : 'Apply suggestions'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">
                Ready to categorize
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click &quot;Start Categorization&quot; to begin the AI-powered
                process.
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
            {loading ? 'Categorizing...' : 'Start Categorization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
