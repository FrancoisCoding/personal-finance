'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useTransactions } from '@/hooks/use-finance-data'
import { BulkCategorizeRequest, BulkCategorizeResponse } from '@/types/api'

export function AutoCategorizeModal() {
  const { data: transactions = [], isLoading } = useTransactions()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastRunIdsRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<number | null>(null)

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
      const categorizedCount = data?.results?.length ?? 0
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setProgress(100)
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      toast({
        title: categorizedCount > 0 ? 'Categorization complete' : 'No updates',
        description:
          categorizedCount > 0
            ? `Automatically categorized ${categorizedCount} transactions.`
            : 'No uncategorized transactions were found.',
      })

      setTimeout(() => {
        setOpen(false)
        setProgress(0)
      }, 1200)
    },
    onError: (error) => {
      console.error('Auto-categorization error:', error)
      if (progressIntervalRef.current !== null) {
        window.clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      toast({
        title: 'Auto-categorization failed',
        description: 'Unable to categorize transactions automatically.',
        variant: 'destructive',
      })

      setTimeout(() => {
        setOpen(false)
        setProgress(0)
      }, 1500)
    },
  })

  useEffect(() => {
    if (isLoading || isPending) {
      return
    }

    if (uncategorizedTransactions.length === 0) {
      return
    }

    const currentIds = uncategorizedTransactions
      .map((transaction) => transaction.id)
      .sort()
      .join(',')

    if (lastRunIdsRef.current === currentIds) {
      return
    }

    lastRunIdsRef.current = currentIds
    setOpen(true)
    setProgress(8)
    mutate({
      transactionIds: uncategorizedTransactions.map((t) => t.id),
    })
  }, [isLoading, isPending, mutate, uncategorizedTransactions])

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

  const statusLabel = isPending
    ? 'Categorizing your transactions...'
    : isSuccess
      ? 'Categorization complete'
      : isError
        ? 'Categorization failed'
        : 'Preparing categorization'

  if (!open) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Auto-categorizing transactions</DialogTitle>
          <DialogDescription>
            We found {uncategorizedTransactions.length} uncategorized{' '}
            {uncategorizedTransactions.length === 1
              ? 'transaction'
              : 'transactions'}
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
      </DialogContent>
    </Dialog>
  )
}
