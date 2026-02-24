'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  ArrowUpRight,
  Wallet,
  PieChart,
  ShieldCheck,
  Bell,
  Plus,
  CreditCard,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function InteractiveHero() {
  const [activeTab, setActiveTab] = useState<
    'networth' | 'cashflow' | 'budget'
  >('networth')

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12 lg:py-20 flex flex-col items-center">
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        {/* Left Side: Dynamic Data Visualization Area */}
        <div className="flex flex-col gap-6">
          <CardContainer className="min-h-[400px] p-0 overflow-hidden flex flex-col">
            {/* Header / Tabs */}
            <div className="flex items-center gap-6 px-8 py-6 border-b border-border/40 bg-background/20 backdrop-blur-md">
              <HeaderTab
                active={activeTab === 'networth'}
                onClick={() => setActiveTab('networth')}
                label="Overview"
              />
              <HeaderTab
                active={activeTab === 'cashflow'}
                onClick={() => setActiveTab('cashflow')}
                label="Cash Flow"
              />
              <HeaderTab
                active={activeTab === 'budget'}
                onClick={() => setActiveTab('budget')}
                label="Spending"
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 relative">
              <AnimatePresence mode="wait">
                {activeTab === 'networth' && (
                  <motion.div
                    key="networth"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-8"
                  >
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                          Total Net Worth
                        </p>
                        <h3 className="text-4xl lg:text-5xl font-bold mt-1">
                          $284,312.42
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full text-sm">
                        <TrendingUp size={16} />
                        +14.2%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <MetricBlock
                        label="Checking"
                        value="$12,400"
                        sub="+ $420"
                      />
                      <MetricBlock
                        label="Investment"
                        value="$192,500"
                        sub="+ 8.2%"
                      />
                      <MetricBlock
                        label="Real Estate"
                        value="$350,000"
                        sub="Steady"
                      />
                    </div>

                    {/* Mock Chart Visualization */}
                    <div className="h-40 w-full bg-primary/5 rounded-2xl relative overflow-hidden group">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 400 100"
                        preserveAspectRatio="none"
                      >
                        <motion.path
                          d="M0 80 Q 50 70, 100 50 T 200 60 T 300 30 T 400 40"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                        <rect
                          width="100%"
                          height="100%"
                          fill="url(#gradient)"
                          className="opacity-10"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="hsl(var(--primary))" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Interactive Point */}
                      <motion.div
                        className="absolute h-4 w-4 bg-primary rounded-full border-4 border-background shadow-lg cursor-pointer z-20"
                        style={{ left: '75%', top: '30%' }}
                        whileHover={{ scale: 1.5 }}
                      >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 bg-foreground text-background text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Peak: $286k
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'cashflow' && (
                  <motion.div
                    key="cashflow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-2xl">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          In Flow
                        </p>
                        <p className="text-2xl font-bold text-emerald-500">
                          $9,400.00
                        </p>
                      </div>
                      <div className="h-10 w-[1px] bg-border" />
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          Out Flow
                        </p>
                        <p className="text-2xl font-bold text-rose-500">
                          $4,210.00
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-bold">Recent Transactions</p>
                      <TransactionRow
                        icon={CreditCard}
                        name="Apple Music"
                        category="Subscriptions"
                        amount="-$14.99"
                        date="Today"
                      />
                      <TransactionRow
                        icon={Plus}
                        name="Deposit (Salary)"
                        category="Income"
                        amount="+$4,500.00"
                        date="Yesterday"
                        positive
                      />
                      <TransactionRow
                        icon={PieChart}
                        name="Starbucks"
                        category="Dining"
                        amount="-$6.40"
                        date="Yesterday"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'budget' && (
                  <motion.div
                    key="budget"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <div className="flex justify-between mb-2 items-end">
                        <p className="text-sm font-bold">General Spending</p>
                        <p className="text-sm font-medium text-muted-foreground">
                          $2,400 of $3,500
                        </p>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: '68%' }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 border border-border/40 rounded-2xl bg-muted/10">
                        <Target className="text-primary mb-2" size={20} />
                        <p className="text-xs text-muted-foreground font-bold uppercase">
                          Goal Tracking
                        </p>
                        <p className="text-lg font-bold">Down Payment</p>
                        <p className="text-sm text-primary">82% completed</p>
                      </div>
                      <div className="p-4 border border-border/40 rounded-2xl bg-muted/10">
                        <Bell className="text-amber-500 mb-2" size={20} />
                        <p className="text-xs text-muted-foreground font-bold uppercase">
                          Smart Alerts
                        </p>
                        <p className="text-lg font-bold">Over Budget</p>
                        <p className="text-sm text-rose-500">Entertainment</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContainer>
        </div>

        {/* Right Side: Secondary Floating Widgets */}
        <div className="flex flex-col gap-6 lg:mt-12">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CardContainer className="bg-primary text-primary-foreground border-none">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium opacity-80 uppercase tracking-widest">
                    Trust Score
                  </p>
                  <p className="text-2xl font-bold">94 / 100</p>
                </div>
              </div>
            </CardContainer>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CardContainer className="hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Sync successful</p>
                    <p className="text-xs text-muted-foreground">
                      3 Banks connected
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="text-muted-foreground" size={20} />
              </div>
            </CardContainer>
          </motion.div>

          {/* Interactive Toggle for Display Only */}
          <div className="p-1 bg-muted/50 rounded-2xl border border-border/40 flex items-center justify-center">
            <p className="text-[10px] text-muted-foreground font-bold uppercase py-1">
              Live data preview
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'p-6 rounded-[32px] border border-border/60 bg-white/70 dark:bg-card/40 backdrop-blur-xl shadow-2xl relative',
        className
      )}
    >
      {children}
    </div>
  )
}

function HeaderTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-sm font-bold uppercase tracking-[0.2em] transition-all relative pb-2',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {active && (
        <motion.div
          layoutId="tab-underline"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
        />
      )}
    </button>
  )
}

function MetricBlock({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
        {label}
      </p>
      <p className="text-xl font-bold mt-1">{value}</p>
      <p
        className={cn(
          'text-xs font-bold mt-1',
          sub.includes('+') ? 'text-emerald-500' : 'text-muted-foreground'
        )}
      >
        {sub}
      </p>
    </div>
  )
}

function TransactionRow({
  icon: Icon,
  name,
  category,
  amount,
  date,
  positive,
}: any) {
  return (
    <div className="flex items-center justify-between group p-2 hover:bg-muted/30 rounded-xl transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon size={18} className="text-foreground/70" />
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={cn(
            'text-sm font-bold',
            positive ? 'text-emerald-500' : ''
          )}
        >
          {amount}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  )
}
