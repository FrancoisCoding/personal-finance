'use client'

import { useState } from 'react'
import { CreditCard, Loader2, Plus, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCreateCreditCard } from '@/hooks/use-finance-data'

interface ISupportedCard {
  id: string
  name: string
  issuer: string
  isPerkTrackingReady?: boolean
  suggestedLimit: number
  benefits: string[]
}

interface ICreditCardOnboardingProps {
  onCardAdded?: () => void
}

const supportedCards: ISupportedCard[] = [
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    issuer: 'American Express',
    suggestedLimit: 5000,
    benefits: [
      'Dining and grocery points acceleration',
      'Monthly dining and ride credits',
      'Travel purchase protections',
    ],
    isPerkTrackingReady: true,
  },
  {
    id: 'amex-platinum',
    name: 'Amex Platinum',
    issuer: 'American Express',
    suggestedLimit: 10000,
    benefits: [
      'Monthly Uber Cash and digital entertainment credits',
      'Airport lounge access',
      'Premium travel protections and benefits',
    ],
    isPerkTrackingReady: true,
  },
  {
    id: 'amex-blue-cash-everyday',
    name: 'Amex Blue Cash Everyday',
    issuer: 'American Express',
    suggestedLimit: 4000,
    benefits: [
      'U.S. online retail, gas, and grocery cash back categories',
      'Disney Bundle credit eligibility',
      'No annual fee cash back setup',
    ],
    isPerkTrackingReady: true,
  },
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    suggestedLimit: 10000,
    benefits: [
      'Premium travel protections and lounge access',
      'Flexible Ultimate Rewards redemptions',
      'Dining and travel rewards acceleration',
    ],
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    suggestedLimit: 6000,
    benefits: [
      'Travel category multipliers',
      'Primary rental car insurance',
      'Flexible rewards transfer partners',
    ],
  },
  {
    id: 'chase-freedom-flex',
    name: 'Chase Freedom Flex',
    issuer: 'Chase',
    suggestedLimit: 3000,
    benefits: [
      'Rotating quarterly cash back categories',
      'Strong pairing card for Sapphire setups',
      'Dining and drugstore cash back',
    ],
  },
  {
    id: 'chase-freedom-unlimited',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    suggestedLimit: 3500,
    benefits: [
      'Simple everyday cash back earning',
      'Useful UR ecosystem pairing card',
      'Dining and drugstore bonuses',
    ],
  },
  {
    id: 'capital-one-venture-x',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    suggestedLimit: 8000,
    benefits: [
      'Annual travel credit and bonus miles',
      'Airport lounge access',
      'Trip delay and purchase protection',
    ],
  },
  {
    id: 'capital-one-savor',
    name: 'Capital One Savor',
    issuer: 'Capital One',
    suggestedLimit: 5000,
    benefits: [
      'Dining and entertainment rewards',
      'Streaming and grocery bonus categories',
      'Strong companion to Venture cards',
    ],
  },
  {
    id: 'citi-strata-premier',
    name: 'Citi Strata Premier',
    issuer: 'Citi',
    suggestedLimit: 4500,
    benefits: [
      'Broad bonus categories for daily spend',
      'Points transfer partner flexibility',
      'No foreign transaction fees',
    ],
  },
  {
    id: 'citi-double-cash',
    name: 'Citi Double Cash',
    issuer: 'Citi',
    suggestedLimit: 4500,
    benefits: [
      'Simple flat-rate earning structure',
      'Popular everyday catch-all card',
      'Can pair with ThankYou ecosystem cards',
    ],
  },
  {
    id: 'bilt-mastercard',
    name: 'Bilt Mastercard',
    issuer: 'Wells Fargo / Bilt',
    suggestedLimit: 5000,
    benefits: [
      'Earn points on rent with no fee',
      'Transfer partners and travel redemptions',
      'Dining and travel bonus categories',
    ],
  },
  {
    id: 'wells-fargo-autograph',
    name: 'Wells Fargo Autograph',
    issuer: 'Wells Fargo',
    suggestedLimit: 4000,
    benefits: [
      'Travel, dining, gas, and transit bonuses',
      'No annual fee and no foreign transaction fees',
      'Popular all-around rewards card',
    ],
  },
  {
    id: 'discover-it-cash-back',
    name: 'Discover it Cash Back',
    issuer: 'Discover',
    suggestedLimit: 2500,
    benefits: [
      'Rotating quarterly bonus categories',
      'First-year cash back match (issuer promo dependent)',
      'No annual fee starter-friendly option',
    ],
  },
  {
    id: 'apple-card',
    name: 'Apple Card',
    issuer: 'Goldman Sachs / Apple',
    suggestedLimit: 3500,
    benefits: [
      'Daily Cash rewards',
      'Strong Apple ecosystem integration',
      'No annual fee and simple spend tracking',
    ],
  },
]

export function CreditCardOnboarding({
  onCardAdded,
}: ICreditCardOnboardingProps) {
  const createCreditCardMutation = useCreateCreditCard()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSupportedCardsDialogOpen, setIsSupportedCardsDialogOpen] =
    useState(false)
  const [cardName, setCardName] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [currentBalance, setCurrentBalance] = useState('0')

  const resetForm = () => {
    setCardName('')
    setCreditLimit('')
    setCurrentBalance('0')
  }

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true)
  }

  const handleSupportedCardSelect = (card: ISupportedCard) => {
    setCardName(card.name)
    setCreditLimit(String(card.suggestedLimit))
    if (!currentBalance) {
      setCurrentBalance('0')
    }
    setIsSupportedCardsDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleCreateCard = async () => {
    const parsedLimit = Number(creditLimit)
    const parsedBalance = Number(currentBalance || '0')
    if (!cardName.trim() || Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      return
    }

    await createCreditCardMutation.mutateAsync({
      name: cardName.trim(),
      limit: parsedLimit,
      balance: Number.isNaN(parsedBalance) ? 0 : parsedBalance,
    })

    resetForm()
    setIsCreateDialogOpen(false)
    onCardAdded?.()
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add credit card
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsSupportedCardsDialogOpen(true)}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Supported cards
        </Button>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add credit card</DialogTitle>
            <DialogDescription>
              Add a card here to activate perk tracking and credit report
              analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credit-card-name">Card name</Label>
              <Input
                id="credit-card-name"
                placeholder="Amex Gold"
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="credit-card-limit">Credit limit</Label>
                <Input
                  id="credit-card-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5000"
                  value={creditLimit}
                  onChange={(event) => setCreditLimit(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit-card-balance">Current balance</Label>
                <Input
                  id="credit-card-balance"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={currentBalance}
                  onChange={(event) => setCurrentBalance(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={createCreditCardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCard}
              disabled={
                createCreditCardMutation.isPending ||
                !cardName.trim() ||
                !creditLimit ||
                Number(creditLimit) <= 0
              }
            >
              {createCreditCardMutation.isPending ? (
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
        open={isSupportedCardsDialogOpen}
        onOpenChange={setIsSupportedCardsDialogOpen}
      >
        <DialogContent className="sm:max-w-[760px]">
          <DialogHeader>
            <DialogTitle>Supported popular cards</DialogTitle>
            <DialogDescription>
              Pick a popular card template, then adjust values before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>{supportedCards.length} popular templates</p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
              >
                Perk tracking ready
              </Badge>
              <Badge variant="outline">Template only</Badge>
            </div>
          </div>
          <ScrollArea className="max-h-[58vh] pr-3">
            <div className="grid gap-3 md:grid-cols-2">
              {supportedCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-border/60 bg-muted/10 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {card.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {card.issuer}
                      </p>
                    </div>
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={
                        card.isPerkTrackingReady
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                          : ''
                      }
                    >
                      {card.isPerkTrackingReady
                        ? 'Perk tracking ready'
                        : 'Template only'}
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {card.benefits.map((benefit) => (
                      <li key={`${card.id}-${benefit}`}>- {benefit}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Suggested limit: {card.suggestedLimit.toLocaleString()}
                  </p>
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => handleSupportedCardSelect(card)}
                  >
                    Use this card
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CreditCardOnboarding
