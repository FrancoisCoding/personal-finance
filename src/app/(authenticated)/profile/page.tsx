'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeDollarSign,
  Globe2,
  Loader2,
  Mail,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccounts, useTransactions } from '@/hooks/use-finance-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useUpdateUserPreferences,
  useUserPreferences,
} from '@/hooks/use-user-preferences'
import {
  defaultUserCurrency,
  defaultUserLocale,
  userCurrencyOptions,
  userLocaleOptions,
} from '@/lib/user-preferences'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: accounts = [] } = useAccounts()
  const { data: transactions = [] } = useTransactions()
  const { data: preferences, isLoading: isPreferencesLoading } =
    useUserPreferences()
  const updatePreferences = useUpdateUserPreferences()

  const displayName = session?.user?.name || 'User'
  const displayEmail = session?.user?.email || 'No email on file'
  const initials =
    displayName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  const selectedLocale = preferences?.locale || defaultUserLocale
  const selectedCurrency = preferences?.currency || defaultUserCurrency
  const isSavingPreferences = updatePreferences.isPending
  const formattedPreviewAmount = new Intl.NumberFormat(selectedLocale, {
    style: 'currency',
    currency: selectedCurrency,
    maximumFractionDigits: 2,
  }).format(128420.53)

  const handleLocaleChange = (locale: string) => {
    updatePreferences.mutate({ locale })
  }

  const handleCurrencyChange = (currency: string) => {
    updatePreferences.mutate({ currency })
  }

  const handleUseAutoDetectedCurrency = () => {
    updatePreferences.mutate({ useAutoDetectedCurrency: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 lg:px-8">
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/60">
              <AvatarImage src={session?.user?.image || ''} alt={displayName} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Profile
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/security">
              Security center
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Connected accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {accounts.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Transactions tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">
              {transactions.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Account status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-foreground">Active</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <UserCircle2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Display name</p>
              <p className="text-sm font-medium text-foreground">
                {displayName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">
                {displayEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Language and currency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Language
              </label>
              <Select
                value={selectedLocale}
                onValueChange={handleLocaleChange}
                disabled={isSavingPreferences || isPreferencesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose language" />
                </SelectTrigger>
                <SelectContent>
                  {userLocaleOptions.map((localeOption) => (
                    <SelectItem
                      key={localeOption.code}
                      value={localeOption.code}
                    >
                      {localeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Currency
              </label>
              <Select
                value={selectedCurrency}
                onValueChange={handleCurrencyChange}
                disabled={isSavingPreferences || isPreferencesLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose currency" />
                </SelectTrigger>
                <SelectContent>
                  {userCurrencyOptions.map((currencyOption) => (
                    <SelectItem
                      key={currencyOption.code}
                      value={currencyOption.code}
                    >
                      {currencyOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Locale preview</p>
                <p className="text-sm font-medium text-foreground">
                  {selectedLocale}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Currency formatting preview
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formattedPreviewAmount}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleUseAutoDetectedCurrency}
              disabled={isSavingPreferences || isPreferencesLoading}
            >
              {isSavingPreferences ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Use connected account currency
            </Button>
            <p className="text-xs text-muted-foreground">
              By default, currency follows your latest synced Teller account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
