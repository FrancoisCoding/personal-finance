'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  DollarSign,
  Edit,
  Loader2,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { formatCurrency, calculatePercentage, formatDate } from '@/lib/utils'
import {
  useGoals,
  useCreateGoal,
  useCategories,
} from '@/hooks/use-finance-data'
import { CreateGoalModal } from '@/components/goals/create-goal-modal'
import type { Goal } from '@/hooks/use-finance-data'

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { data: goals = [], isLoading } = useGoals()
  const { data: categories = [] } = useCategories()
  const createGoalMutation = useCreateGoal()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    targetAmount: '',
    description: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate goal statistics
  const activeGoals = goals.filter((g) => !g.isCompleted)
  const completedGoals = goals.filter((g) => g.isCompleted)
  const totalTargetAmount = activeGoals.reduce(
    (sum, g) => sum + g.targetAmount,
    0
  )
  const totalCurrentAmount = activeGoals.reduce(
    (sum, g) => sum + g.currentAmount,
    0
  )
  const overallProgress = calculatePercentage(
    totalCurrentAmount,
    totalTargetAmount
  )

  // Get goal progress
  const getGoalProgress = (goal: Goal) => {
    const percentage = calculatePercentage(
      goal.currentAmount,
      goal.targetAmount
    )
    const remaining = goal.targetAmount - goal.currentAmount
    const isCompleted = goal.currentAmount >= goal.targetAmount

    // Calculate days remaining
    let daysRemaining = 0
    if (goal.targetDate) {
      const targetDate = new Date(goal.targetDate)
      const today = new Date()
      daysRemaining = Math.ceil(
        (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
    }

    return { percentage, remaining, isCompleted, daysRemaining }
  }

  const getGoalStatus = (goal: Goal) => {
    const { percentage, daysRemaining, isCompleted } = getGoalProgress(goal)

    if (isCompleted) {
      return {
        status: 'completed',
        label: 'Completed',
        badgeClass:
          'border-amber-200/60 bg-amber-50/60 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
      }
    }
    if (percentage >= 80) {
      return {
        status: 'near',
        label: 'Nearly there',
        badgeClass:
          'border-emerald-200/60 bg-emerald-50/60 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
      }
    }
    if (goal.targetDate && daysRemaining <= 30) {
      return {
        status: 'urgent',
        label: 'Due soon',
        badgeClass:
          'border-red-200/60 bg-red-50/60 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
      }
    }

    return {
      status: 'active',
      label: 'In progress',
      badgeClass:
        'border-blue-200/60 bg-blue-50/60 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    }
  }

  // Handle goal creation
  const handleCreateGoal = (goalData: {
    name: string
    description?: string
    targetAmount: number
    targetDate: Date
    color: string
    icon?: string
  }) => {
    createGoalMutation.mutate(goalData, {
      onSuccess: () => {
        setShowCreateModal(false)
      },
    })
  }

  // Handle milestone creation
  const handleCreateMilestone = () => {
    if (!selectedGoal || !newMilestone.name || !newMilestone.targetAmount) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    // TODO: Implement milestone creation mutation
    toast({
      title: 'Milestone added!',
      description: `"${newMilestone.name}" has been added to your goal.`,
    })

    setNewMilestone({ name: '', targetAmount: '', description: '' })
    setSelectedGoal(null)
  }

  // Handle goal deletion
  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId)
    if (goal) {
      toast({
        title: 'Goal removed',
        description: `"${goal.name}" has been removed.`,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Set and track your financial goals with milestones and celebrations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {activeGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedGoals.length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Goals
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {completedGoals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Celebrating progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overallProgress.toFixed(1)}%
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalCurrentAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(totalTargetAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid gap-6">
        {goals.length === 0 ? (
          <Card>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No goals yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  Create your first financial goal to start your journey.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const { percentage, remaining, daysRemaining } =
              getGoalProgress(goal)
            const { status, label, badgeClass } = getGoalStatus(goal)
            const accentColor = goal.color || '#2563EB'
            const targetLabel = goal.targetDate
              ? formatDate(goal.targetDate)
              : 'No target date'

            return (
              <Card
                key={goal.id}
                className="relative border-border/60 bg-card/80 shadow-sm"
              >
                <div
                  className="absolute left-0 top-0 h-full w-1"
                  style={{ backgroundColor: accentColor }}
                />
                <CardHeader className="space-y-3">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full border"
                        style={{
                          color: accentColor,
                          backgroundColor: `${accentColor}1A`,
                          borderColor: `${accentColor}33`,
                        }}
                      >
                        {goal.icon ? (
                          <span className="text-lg">{goal.icon}</span>
                        ) : (
                          <Target className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{goal.name}</CardTitle>
                        <CardDescription>
                          Target by {targetLabel}
                          {goal.description && ` - ${goal.description}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={badgeClass}>
                        {label}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedGoal(goal.id)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Milestone
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Saved</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Days left</p>
                      <p
                        className={`text-lg font-semibold ${goal.targetDate && daysRemaining <= 30 && daysRemaining > 0 ? 'text-orange-600' : ''}`}
                      >
                        {goal.targetDate ? daysRemaining : 'No target'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg border p-3 text-sm font-medium ${
                      status === 'completed'
                        ? 'border-amber-200/60 bg-amber-50/50 text-amber-800'
                        : status === 'near'
                          ? 'border-emerald-200/60 bg-emerald-50/50 text-emerald-700'
                          : status === 'urgent'
                            ? 'border-red-200/60 bg-red-50/50 text-red-700'
                            : 'border-blue-200/60 bg-blue-50/50 text-blue-700'
                    }`}
                  >
                    {status === 'completed' &&
                      "You've achieved this goal. Great work."}
                    {status === 'near' &&
                      'You are close to the finish line. Keep going.'}
                    {status === 'urgent' &&
                      `${daysRemaining} days left to reach this goal.`}
                    {status === 'active' &&
                      'Steady progress. Keep your momentum.'}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Milestone Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Milestone</CardTitle>
              <CardDescription>
                Break down your goal into smaller, achievable milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Milestone Name
                </label>
                <Input
                  placeholder="e.g., 25% saved, Halfway point"
                  value={newMilestone.name}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Target Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newMilestone.targetAmount}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      targetAmount: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description (Optional)
                </label>
                <Input
                  placeholder="What will you do when you reach this milestone?"
                  value={newMilestone.description}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateMilestone}>Add Milestone</Button>
                <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateGoal}
        isLoading={createGoalMutation.isPending}
        categories={categories}
      />
    </div>
  )
}
