'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Zap,
  BarChart3,
  CreditCard,
  PiggyBank,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level security with end-to-end encryption',
    },
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'AI-powered insights to optimize your finances',
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Automatic transaction categorization and updates',
    },
  ]

  const stats = [
    { label: 'Active Users', value: '50K+' },
    { label: 'Connected Accounts', value: '200K+' },
    { label: 'Transactions Analyzed', value: '10M+' },
  ]

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" variant="gradient" />
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Master Your
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Financial Future
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The intelligent finance app that helps you track, analyze, and
            optimize your money with AI-powered insights and automated
            categorization.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Get Started Free
              <ArrowRight
                className={cn(
                  'ml-2 h-5 w-5 transition-transform duration-300',
                  isHovered ? 'translate-x-1' : ''
                )}
              />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 transition-colors duration-300"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* App preview mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-2 shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500">
                    FinanceFlow Dashboard
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Dashboard cards */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="text-xs text-blue-600 font-medium">
                        Balance
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $12,450
                    </div>
                    <div className="text-xs text-green-600">
                      +2.5% from last month
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        Income
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $8,200
                    </div>
                    <div className="text-xs text-green-600">
                      +12% from last month
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">
                        Expenses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $3,150
                    </div>
                    <div className="text-xs text-red-600">
                      -8% from last month
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <PiggyBank className="w-5 h-5 text-purple-600" />
                      <span className="text-xs text-purple-600 font-medium">
                        Savings
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $1,100
                    </div>
                    <div className="text-xs text-green-600">
                      +15% from last month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
