'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  Coins,
  Home,
  Landmark,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { Badge } from '@/components/ui/badge'
import { generateId, formatCurrency } from '@/lib/utils'

const investmentsStorageKey = 'financeflow.investments'

type TInvestmentAssetClass =
  | 'RETIREMENT_401K'
  | 'STOCKS'
  | 'CRYPTO'
  | 'REAL_ESTATE'
  | 'CASH'
  | 'OTHER'

interface IInvestmentHolding {
  id: string
  name: string
  institution: string
  assetClass: TInvestmentAssetClass
  currentValue: number
  costBasis: number
  monthlyContribution: number
}

interface IInvestmentFormState {
  name: string
  institution: string
  assetClass: TInvestmentAssetClass
  currentValue: string
  costBasis: string
  monthlyContribution: string
}

const investmentAssetClassLabels: Record<TInvestmentAssetClass, string> = {
  RETIREMENT_401K: '401(k) / Retirement',
  STOCKS: 'Stocks / Brokerage',
  CRYPTO: 'Crypto',
  REAL_ESTATE: 'Real estate',
  CASH: 'Cash',
  OTHER: 'Other assets',
}

const investmentAssetClassTone: Record<TInvestmentAssetClass, string> = {
  RETIREMENT_401K:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  STOCKS: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  CRYPTO:
    'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
  REAL_ESTATE:
    'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  CASH: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300',
  OTHER: 'border-border/70 bg-muted/20 text-muted-foreground',
}

const getDemoInvestments = (): IInvestmentHolding[] => [
  {
    id: 'inv-401k',
    name: 'Employer 401(k)',
    institution: 'Fidelity',
    assetClass: 'RETIREMENT_401K',
    currentValue: 128400,
    costBasis: 101250,
    monthlyContribution: 1200,
  },
  {
    id: 'inv-brokerage',
    name: 'Taxable Brokerage',
    institution: 'Charles Schwab',
    assetClass: 'STOCKS',
    currentValue: 58250,
    costBasis: 49780,
    monthlyContribution: 500,
  },
  {
    id: 'inv-crypto',
    name: 'Crypto Wallet',
    institution: 'Coinbase',
    assetClass: 'CRYPTO',
    currentValue: 9450,
    costBasis: 11100,
    monthlyContribution: 150,
  },
  {
    id: 'inv-home',
    name: 'Rental Condo Equity',
    institution: 'Self-managed',
    assetClass: 'REAL_ESTATE',
    currentValue: 76000,
    costBasis: 63000,
    monthlyContribution: 0,
  },
  {
    id: 'inv-cash',
    name: 'High-yield Savings',
    institution: 'Ally',
    assetClass: 'CASH',
    currentValue: 22000,
    costBasis: 22000,
    monthlyContribution: 400,
  },
]

const defaultFormState: IInvestmentFormState = {
  name: '',
  institution: '',
  assetClass: 'RETIREMENT_401K',
  currentValue: '',
  costBasis: '',
  monthlyContribution: '',
}

const parseStoredInvestments = (
  rawValue: string | null
): IInvestmentHolding[] => {
  if (!rawValue) return []
  try {
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => ({
        id: String(item?.id ?? generateId()),
        name: String(item?.name ?? ''),
        institution: String(item?.institution ?? ''),
        assetClass: (item?.assetClass ?? 'OTHER') as TInvestmentAssetClass,
        currentValue: Number(item?.currentValue ?? 0),
        costBasis: Number(item?.costBasis ?? 0),
        monthlyContribution: Number(item?.monthlyContribution ?? 0),
      }))
      .filter(
        (item) =>
          item.name &&
          Number.isFinite(item.currentValue) &&
          Number.isFinite(item.costBasis) &&
          Number.isFinite(item.monthlyContribution)
      )
  } catch {
    return []
  }
}

export default function InvestmentsPage() {
  const { isDemoMode } = useDemoMode()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const [holdings, setHoldings] = useState<IInvestmentHolding[]>([])
  const [formState, setFormState] =
    useState<IInvestmentFormState>(defaultFormState)
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)

  const hasProAccess =
    isDemoMode ||
    billingData?.isSuperUser === true ||
    billingData?.currentPlan === 'PRO'

  useEffect(() => {
    try {
      const stored = parseStoredInvestments(
        window.localStorage.getItem(investmentsStorageKey)
      )
      if (stored.length > 0) {
        setHoldings(stored)
      } else if (isDemoMode) {
        setHoldings(getDemoInvestments())
      } else {
        setHoldings([])
      }
    } catch {
      setHoldings(isDemoMode ? getDemoInvestments() : [])
    } finally {
      setHasLoadedStorage(true)
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!hasLoadedStorage) return
    try {
      window.localStorage.setItem(
        investmentsStorageKey,
        JSON.stringify(holdings)
      )
    } catch {
      return
    }
  }, [hasLoadedStorage, holdings])

  const totalValue = holdings.reduce(
    (sum, holding) => sum + Math.max(holding.currentValue, 0),
    0
  )
  const totalCostBasis = holdings.reduce(
    (sum, holding) => sum + Math.max(holding.costBasis, 0),
    0
  )
  const totalMonthlyContribution = holdings.reduce(
    (sum, holding) => sum + Math.max(holding.monthlyContribution, 0),
    0
  )
  const unrealizedGainLoss = totalValue - totalCostBasis

  const allocationRows = useMemo(() => {
    const rows = Object.keys(investmentAssetClassLabels).map(
      (assetClassKey) => {
        const assetClass = assetClassKey as TInvestmentAssetClass
        const classValue = holdings
          .filter((holding) => holding.assetClass === assetClass)
          .reduce((sum, holding) => sum + Math.max(holding.currentValue, 0), 0)
        const classContribution = holdings
          .filter((holding) => holding.assetClass === assetClass)
          .reduce(
            (sum, holding) => sum + Math.max(holding.monthlyContribution, 0),
            0
          )

        return {
          assetClass,
          classContribution,
          classValue,
          percent: totalValue > 0 ? (classValue / totalValue) * 100 : 0,
        }
      }
    )

    return rows
      .filter((row) => row.classValue > 0)
      .sort((left, right) => right.classValue - left.classValue)
  }, [holdings, totalValue])

  const topHolding = useMemo(
    () =>
      holdings.reduce<IInvestmentHolding | null>((largest, holding) => {
        if (!largest || holding.currentValue > largest.currentValue)
          return holding
        return largest
      }, null),
    [holdings]
  )

  const handleFormValueChange = (
    field: keyof IInvestmentFormState,
    value: string
  ) => {
    setFormState((previousState) => ({
      ...previousState,
      [field]: value,
    }))
  }

  const handleAddHolding = () => {
    const name = formState.name.trim()
    const institution = formState.institution.trim()
    const currentValue = Number(formState.currentValue)
    const costBasis = Number(formState.costBasis || '0')
    const monthlyContribution = Number(formState.monthlyContribution || '0')

    if (
      !name ||
      !institution ||
      !Number.isFinite(currentValue) ||
      currentValue < 0
    ) {
      return
    }

    if (!Number.isFinite(costBasis) || costBasis < 0) {
      return
    }

    if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) {
      return
    }

    const nextHolding: IInvestmentHolding = {
      id: generateId(),
      name,
      institution,
      assetClass: formState.assetClass,
      currentValue,
      costBasis,
      monthlyContribution,
    }

    setHoldings((previousHoldings) =>
      [...previousHoldings, nextHolding].sort(
        (left, right) => right.currentValue - left.currentValue
      )
    )
    setFormState(defaultFormState)
  }

  const handleRemoveHolding = (id: string) => {
    setHoldings((previousHoldings) =>
      previousHoldings.filter((holding) => holding.id !== id)
    )
  }

  if (isBillingLoading && !isDemoMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Investments</h1>
        <p className="text-sm text-muted-foreground">
          Loading investment workspace...
        </p>
      </div>
    )
  }

  if (!hasProAccess) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl">Investments</CardTitle>
          <CardDescription>
            Investments is available on the Pro plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro to track 401(k), brokerage, crypto, cash, and other
            assets in one portfolio view.
          </p>
          <Button asChild>
            <Link href="/billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-start justify-between gap-3"
        data-demo-step="demo-investments-header"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Investments</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track retirement, stocks, crypto, and other assets in one Pro
            portfolio workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/billing">Manage plan</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total portfolio
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Cost basis
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(totalCostBasis)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Unrealized gain/loss
            </p>
            <p
              className={
                'mt-1 text-2xl font-semibold ' +
                (unrealizedGainLoss >= 0
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300')
              }
            >
              {formatCurrency(unrealizedGainLoss)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Monthly contribution
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(totalMonthlyContribution)}
            </p>
            {topHolding ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Largest position: {topHolding.name}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add holding</CardTitle>
            <CardDescription>
              Add any investment or asset account to your Pro portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent
            className="space-y-4"
            data-demo-step="demo-investments-form"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="investment-name">Account or asset name</Label>
                <Input
                  id="investment-name"
                  value={formState.name}
                  onChange={(event) =>
                    handleFormValueChange('name', event.target.value)
                  }
                  placeholder="Roth IRA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment-institution">Institution</Label>
                <Input
                  id="investment-institution"
                  value={formState.institution}
                  onChange={(event) =>
                    handleFormValueChange('institution', event.target.value)
                  }
                  placeholder="Vanguard"
                />
              </div>
              <div className="space-y-2">
                <Label>Asset class</Label>
                <Select
                  value={formState.assetClass}
                  onValueChange={(value) =>
                    handleFormValueChange(
                      'assetClass',
                      value as TInvestmentAssetClass
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an asset class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(investmentAssetClassLabels).map(
                      ([assetClass, label]) => (
                        <SelectItem key={assetClass} value={assetClass}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment-value">Current value</Label>
                <Input
                  id="investment-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.currentValue}
                  onChange={(event) =>
                    handleFormValueChange('currentValue', event.target.value)
                  }
                  placeholder="25000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment-cost-basis">Cost basis</Label>
                <Input
                  id="investment-cost-basis"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.costBasis}
                  onChange={(event) =>
                    handleFormValueChange('costBasis', event.target.value)
                  }
                  placeholder="22000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment-contribution">
                  Monthly contribution
                </Label>
                <Input
                  id="investment-contribution"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.monthlyContribution}
                  onChange={(event) =>
                    handleFormValueChange(
                      'monthlyContribution',
                      event.target.value
                    )
                  }
                  placeholder="500"
                />
              </div>
            </div>

            <Button onClick={handleAddHolding} className="gap-2">
              <Plus className="h-4 w-4" />
              Add holding
            </Button>
          </CardContent>
        </Card>

        <Card
          className="border-border/70 bg-card/90"
          data-demo-step="demo-investments-allocation"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Allocation breakdown</CardTitle>
            <CardDescription>
              Portfolio mix across retirement, stocks, crypto, and other assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
                Add your first holding to see allocation breakdown and
                concentration insights.
              </div>
            ) : (
              allocationRows.map((row) => (
                <div key={row.assetClass} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={investmentAssetClassTone[row.assetClass]}
                      >
                        {investmentAssetClassLabels[row.assetClass]}
                      </Badge>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">
                        {formatCurrency(row.classValue)}
                      </p>
                      <p>{row.percent.toFixed(1)}% allocation</p>
                    </div>
                  </div>
                  <Progress value={row.percent} className="h-2" />
                  {row.classContribution > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Monthly contribution:{' '}
                      {formatCurrency(row.classContribution)}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card
        className="border-border/70 bg-card/90"
        data-demo-step="demo-investments-table"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Holdings</CardTitle>
          <CardDescription>
            Review balances, cost basis, and contributions by account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-sm text-muted-foreground">
              No holdings yet. Add a 401(k), brokerage, crypto wallet, or
              another asset to start tracking your portfolio.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Current value</TableHead>
                    <TableHead className="text-right">Cost basis</TableHead>
                    <TableHead className="text-right">Gain/Loss</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdings.map((holding) => {
                    const gainLoss = holding.currentValue - holding.costBasis
                    const allocationPercent =
                      totalValue > 0
                        ? (holding.currentValue / totalValue) * 100
                        : 0
                    return (
                      <TableRow key={holding.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {holding.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {holding.institution}
                            </p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                              {holding.assetClass === 'RETIREMENT_401K' ? (
                                <Landmark className="h-3.5 w-3.5" />
                              ) : holding.assetClass === 'CRYPTO' ? (
                                <Coins className="h-3.5 w-3.5" />
                              ) : holding.assetClass === 'REAL_ESTATE' ? (
                                <Home className="h-3.5 w-3.5" />
                              ) : holding.assetClass === 'CASH' ? (
                                <Wallet className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingUp className="h-3.5 w-3.5" />
                              )}
                              {allocationPercent.toFixed(1)}% of portfolio
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              investmentAssetClassTone[holding.assetClass]
                            }
                          >
                            {investmentAssetClassLabels[holding.assetClass]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatCurrency(holding.currentValue)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(holding.costBasis)}
                        </TableCell>
                        <TableCell
                          className={
                            'text-right font-medium ' +
                            (gainLoss >= 0
                              ? 'text-emerald-600 dark:text-emerald-300'
                              : 'text-rose-600 dark:text-rose-300')
                          }
                        >
                          {formatCurrency(gainLoss)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(holding.monthlyContribution)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                            onClick={() => handleRemoveHolding(holding.id)}
                            aria-label={`Remove ${holding.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
