'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCategories, useTransactions } from '@/hooks/use-finance-data'
import { formatCurrency } from '@/lib/utils'
import {
  BulkCategorizeRequest,
  BulkCategorizeResponse,
  CategorizationResult,
} from '@/types/api'

const MIN_AUTOCATEGORIZE_PROGRESS_MS = 900

export function AutoCategorizeModal() {
  const { data: transactions = [], isLoading } = useTransactions()
  const { data: categories = [] } = useCategories()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [reviewResults, setReviewResults] = useState<CategorizationResult[]>([])
  const [reviewSelections, setReviewSelections] = useState<
    Record<string, string>
  >({})
  const [isApplyingReview, setIsApplyingReview] = useState(false)
  const [suppressedReviewIds, setSuppressedReviewIds] = useState<string[]>([])
  const [processedTransactionIds, setProcessedTransactionIds] = useState<
    string[]
  >([])
  const lastRunIdsRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<number | null>(null)
  const finalizeTimeoutRef = useRef<number | null>(null)
  const runStartedAtRef = useRef<number | null>(null)

  const uncategorizedTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          !transaction.categoryId &&
          !transaction.categoryRelation?.name &&
          (!transaction.category ||
            transaction.category === 'Other' ||
            transaction.category === 'Uncategorized')
      ),
    [transactions]
  )
  const eligibleTransactions = useMemo(
    () =>
      uncategorizedTransactions.filter(
        (transaction) =>
          !suppressedReviewIds.includes(transaction.id) &&
          !processedTransactionIds.includes(transaction.id)
      ),
    [processedTransactionIds, suppressedReviewIds, uncategorizedTransactions]
  )

  const { mutate, isPending, isSuccess, isError } = useMutation<
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
      const finalize = () => {
        const categorizedCount = data?.appliedCount ?? 0
        const reviewItems = data?.review ?? []
        if (progressIntervalRef.current !== null) {
          window.clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        setProgress(100)
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        setReviewResults(reviewItems)
        setReviewSelections(
          reviewItems.reduce<Record<string, string>>((acc, item) => {
            acc[item.transactionId] = item.suggestedCategory
            return acc
          }, {})
        )
        if (reviewItems.length > 0) {
          setSuppressedReviewIds((previous) =>
            Array.from(
              new Set([
                ...previous,
                ...reviewItems.map((item) => item.transactionId),
              ])
            )
          )
        }
        toast({
          title:
            categorizedCount > 0
              ? 'Categorization complete'
              : reviewItems.length > 0
                ? 'Review needed'
                : 'No updates',
          description:
            categorizedCount > 0
              ? `Categorized ${categorizedCount} transactions${
                  reviewItems.length > 0
                    ? ` · ${reviewItems.length} need review`
                    : ''
                }.`
              : reviewItems.length > 0
                ? `${reviewItems.length} suggestions need confirmation.`
                : 'No uncategorized transactions were found.',
        })
        runStartedAtRef.current = null

        if (reviewItems.length === 0) {
          setTimeout(() => {
            setOpen(false)
            setProgress(0)
          }, 900)
        }
      }

      const startedAt = runStartedAtRef.current
      const elapsed = startedAt ? Date.now() - startedAt : 0
      const remainingDelay = Math.max(
        0,
        MIN_AUTOCATEGORIZE_PROGRESS_MS - elapsed
      )
      if (finalizeTimeoutRef.current !== null) {
        window.clearTimeout(finalizeTimeoutRef.current)
      }
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeTimeoutRef.current = null
        finalize()
      }, remainingDelay)
    },
    onError: (error) => {
      console.error('Auto-categorization error:', error)
      const finalize = () => {
        if (progressIntervalRef.current !== null) {
          window.clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
        setReviewResults([])
        toast({
          title: 'Auto-categorization failed',
          description: 'Unable to categorize transactions automatically.',
          variant: 'destructive',
        })
        runStartedAtRef.current = null

        setTimeout(() => {
          setOpen(false)
          setProgress(0)
        }, 1200)
      }

      const startedAt = runStartedAtRef.current
      const elapsed = startedAt ? Date.now() - startedAt : 0
      const remainingDelay = Math.max(
        0,
        MIN_AUTOCATEGORIZE_PROGRESS_MS - elapsed
      )
      if (finalizeTimeoutRef.current !== null) {
        window.clearTimeout(finalizeTimeoutRef.current)
      }
      finalizeTimeoutRef.current = window.setTimeout(() => {
        finalizeTimeoutRef.current = null
        finalize()
      }, remainingDelay)
    },
  })

  useEffect(() => {
    const uncategorizedIds = new Set(
      uncategorizedTransactions.map((transaction) => transaction.id)
    )
    setSuppressedReviewIds((previous) =>
      previous.filter((id) => uncategorizedIds.has(id))
    )
    setProcessedTransactionIds((previous) =>
      previous.filter((id) => uncategorizedIds.has(id))
    )
  }, [uncategorizedTransactions])

  useEffect(() => {
    if (isLoading || isPending) {
      return
    }

    if (eligibleTransactions.length === 0) {
      return
    }

    const currentIds = eligibleTransactions
      .map((transaction) => transaction.id)
      .sort()
      .join(',')

    if (lastRunIdsRef.current === currentIds) {
      return
    }

    const transactionIds = eligibleTransactions.map(
      (transaction) => transaction.id
    )
    lastRunIdsRef.current = currentIds
    setProcessedTransactionIds((previous) =>
      Array.from(new Set([...previous, ...transactionIds]))
    )
    runStartedAtRef.current = Date.now()
    setOpen(true)
    setProgress(8)
    mutate({
      transactionIds,
    })
  }, [eligibleTransactions, isLoading, isPending, mutate])

  useEffect(() => {
    if (!open || !isPending) {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      return
    }

    if (progressIntervalRef.current !== null) {
      return
    }

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= 90) {
          return currentProgress
        }

        const nextProgress =
          currentProgress < 35
            ? currentProgress + 7
            : currentProgress < 70
              ? currentProgress + 4
              : currentProgress + 1

        return Math.min(90, nextProgress)
      })
    }, 240)

    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isPending, open])

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (finalizeTimeoutRef.current !== null) {
        window.clearTimeout(finalizeTimeoutRef.current)
        finalizeTimeoutRef.current = null
      }
    }
  }, [])

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
      setSuppressedReviewIds((previous) =>
        previous.filter(
          (id) => !reviewResults.some((result) => result.transactionId === id)
        )
      )
      setOpen(false)
      setProgress(0)
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

  const statusLabel = isPending
    ? 'Categorizing your transactions...'
    : hasReview
      ? 'Review low-confidence suggestions'
      : isSuccess
        ? 'Categorization complete'
        : isError
          ? 'Categorization failed'
          : 'Preparing categorization'
  const displayedUncategorizedCount = Math.max(
    eligibleTransactions.length,
    reviewResults.length
  )

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Auto-categorizing transactions</DialogTitle>
          <DialogDescription>
            We found {displayedUncategorizedCount} uncategorized{' '}
            {displayedUncategorizedCount === 1 ? 'transaction' : 'transactions'}
            . This will run automatically in the background.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{statusLabel}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {hasReview && !isPending && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Review suggestions
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
                        · {formatCurrency(Math.abs(transaction?.amount ?? 0))}
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
                            <SelectItem key={category.id} value={category.name}>
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
      </DialogContent>
    </Dialog>
  )
}
