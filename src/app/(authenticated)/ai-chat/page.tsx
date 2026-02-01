'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { chatWithAI } from '@/lib/local-ai'
import {
  useAccounts,
  useTransactions,
  useBudgets,
  useGoals,
} from '@/hooks/use-finance-data'
import { AIStatusChecker } from '@/components/ai-status-checker'
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  Target,
  Wallet,
  Lightbulb,
} from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function AIChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { data: transactions = [] } = useTransactions()
  const { data: accounts = [] } = useAccounts()
  const { data: budgets = [] } = useBudgets()
  const { data: goals = [] } = useGoals()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your AI financial assistant. I can help you with:\n\n• Spending analysis and insights\n• Budget recommendations\n• Goal tracking advice\n• Financial planning tips\n• Transaction categorization\n\nWhat would you like to know about your finances?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare context for AI
      const context = {
        transactions: transactions.slice(-10).map(t => ({
          description: t.description,
          amount: t.amount,
          category: t.category || undefined
        })),
        budgets: budgets.map(budget => ({
          name: budget.name,
          amount: budget.amount
        })),
        goals: goals.map(goal => ({
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount
        }))
      }

      const response = await chatWithAI(input, context)
      console.log(response, 'AI Response')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      toast({
        title: 'AI Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to get AI response. Please check if Ollama is running.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    'How much did I spend on food this month?',
    "What's my biggest expense category?",
    'How am I doing with my budget?',
    'What can I do to save more money?',
    'Show me my spending trends',
    'Help me set a savings goal',
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              Loading AI assistant...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                AI Financial Assistant
              </h1>
            </div>
            <p className="text-muted-foreground">
              Get personalized financial insights and advice powered by local AI
            </p>
          </div>

          {/* AI Status Checker */}
          <div className="mb-6">
            <AIStatusChecker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>Chat with AI</span>
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about your finances (powered by local AI)
                  </CardDescription>
                </CardHeader>
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                          <div className="flex items-start space-x-2">
                            {msg.role === 'assistant' && (
                              <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                          <div
                            className={`text-xs mt-2 ${msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                          >
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  {/* Input Area */}
                  <div className="px-4 py-2 border-t bg-background flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about your finances..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="w-fit">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5" />
                    <span>Quick Questions</span>
                  </CardTitle>
                  <CardDescription>Try these common questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="w-full justify-start text-left py-2 px-6"
                        onClick={() => handleQuickQuestion(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Your Data</span>
                  </CardTitle>
                  <CardDescription>What I can analyze</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transactions</span>
                      <span className="text-sm font-medium">
                        {transactions.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Accounts</span>
                      <span className="text-sm font-medium">
                        {accounts.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budgets</span>
                      <span className="text-sm font-medium">
                        {budgets.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Goals</span>
                      <span className="text-sm font-medium">
                        {goals.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>I can help with</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-3 w-3 text-primary" />
                      <span>Spending analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-3 w-3 text-primary" />
                      <span>Budget optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <span>Financial planning</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bot className="h-3 w-3 text-primary" />
                      <span>Smart categorization</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
