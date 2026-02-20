'use client'

import { useState } from 'react'
import { CreditCard, Info, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCreditCard } from '@/hooks/use-finance-data'
import { useToast } from '@/hooks/use-toast'

interface ICreditCardManagementActionsProps {
  className?: string
  showPerkTrackingNote?: boolean
}

const popularCards = [
  {
    name: 'American Express Gold',
    detail:
      'Supported for perk tracking: Uber Cash, Dining Credit, Dunkin Credit.',
  },
  {
    name: 'Chase Sapphire Preferred',
    detail:
      'Great for travel transfer partners and flexible rewards redemption.',
  },
  {
    name: 'Capital One Venture X',
    detail: 'Strong flat-rate rewards with travel credits and lounge value.',
  },
  {
    name: 'Citi Strata Premier',
    detail: 'Solid category multipliers for travel, groceries, and dining.',
  },
]

export function CreditCardManagementActions({
  className = '',
  showPerkTrackingNote = false,
}: ICreditCardManagementActionsProps) {
  const { toast } = useToast()
  const createCreditCard = useCreateCreditCard()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSupportedDialogOpen, setIsSupportedDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [limit, setLimit] = useState('')

  const handleAddCard = async () => {
    const trimmedName = name.trim()
    const parsedBalance = Number.parseFloat(balance || '0')
    const parsedLimit = Number.parseFloat(limit)

    if (!trimmedName || Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      toast({
        title: 'Missing information',
        description:
          'Add a card name and a credit limit greater than zero to continue.',
        variant: 'destructive',
      })
      return
    }

    try {
      await createCreditCard.mutateAsync({
        name: trimmedName,
        balance: Number.isNaN(parsedBalance) ? 0 : parsedBalance,
        limit: parsedLimit,
      })
      setName('')
      setBalance('')
      setLimit('')
      setIsAddDialogOpen(false)
    } catch {
      return
    }
  }

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          onClick={() => setIsSupportedDialogOpen(true)}
        >
          <Info className="mr-2 h-4 w-4" />
          Supported cards
        </Button>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <CreditCard className="mr-2 h-4 w-4" />
          Add card
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add credit card</DialogTitle>
            <DialogDescription>
              Connect a credit card to unlock utilization and perk insights.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="credit-card-name">Card name</Label>
              <Input
                id="credit-card-name"
                placeholder="e.g., American Express Gold"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="credit-card-balance">Current balance</Label>
                <Input
                  id="credit-card-balance"
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={balance}
                  onChange={(event) => setBalance(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="credit-card-limit">Credit limit</Label>
                <Input
                  id="credit-card-limit"
                  type="number"
                  inputMode="decimal"
                  placeholder="10000"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={createCreditCard.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCard}
              disabled={createCreditCard.isPending}
            >
              {createCreditCard.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding card...
                </>
              ) : (
                'Add card'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSupportedDialogOpen}
        onOpenChange={setIsSupportedDialogOpen}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Supported popular cards</DialogTitle>
            <DialogDescription>
              Add one of these cards to get richer analytics and tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {popularCards.map((card) => (
              <div
                key={card.name}
                className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2"
              >
                <p className="text-sm font-semibold text-foreground">
                  {card.name}
                </p>
                <p className="text-xs text-muted-foreground">{card.detail}</p>
              </div>
            ))}
          </div>
          {showPerkTrackingNote ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Perk auto-detection currently supports American Express Gold.
              </span>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
