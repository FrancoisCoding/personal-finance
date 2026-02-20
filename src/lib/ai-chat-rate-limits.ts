export type TSubscriptionTier = 'BASIC' | 'PRO'

interface IAiChatRateLimitPolicy {
  burstMaxRequests: number
  burstWindowMs: number
  windowMaxRequests: number
  windowMs: number
  dailyMaxRequests: number
  dailyWindowMs: number
}

const minuteInMilliseconds = 60_000
const fourHoursInMilliseconds = 14_400_000
const dayInMilliseconds = 86_400_000

const demoRateLimitPolicy: IAiChatRateLimitPolicy = {
  burstMaxRequests: 10,
  burstWindowMs: minuteInMilliseconds,
  windowMaxRequests: 40,
  windowMs: fourHoursInMilliseconds,
  dailyMaxRequests: 120,
  dailyWindowMs: dayInMilliseconds,
}

const basicRateLimitPolicy: IAiChatRateLimitPolicy = {
  burstMaxRequests: 30,
  burstWindowMs: minuteInMilliseconds,
  windowMaxRequests: 150,
  windowMs: fourHoursInMilliseconds,
  dailyMaxRequests: 600,
  dailyWindowMs: dayInMilliseconds,
}

const proRateLimitPolicy: IAiChatRateLimitPolicy = {
  burstMaxRequests: 200,
  burstWindowMs: minuteInMilliseconds,
  windowMaxRequests: 5_000,
  windowMs: fourHoursInMilliseconds,
  dailyMaxRequests: 30_000,
  dailyWindowMs: dayInMilliseconds,
}

export const getAiChatRateLimitPolicy = ({
  isDemoMode,
  tier,
}: {
  isDemoMode: boolean
  tier: TSubscriptionTier | null
}) => {
  if (isDemoMode) {
    return {
      scope: 'ai-chat-demo',
      policy: demoRateLimitPolicy,
    }
  }

  if (tier === 'PRO') {
    return {
      scope: 'ai-chat-pro',
      policy: proRateLimitPolicy,
    }
  }

  return {
    scope: 'ai-chat-basic',
    policy: basicRateLimitPolicy,
  }
}

export const aiChatPlanMessaging = {
  BASIC:
    'AI Assistant access with guarded limits (30 req/min, 150 messages every 4 hours, auto reset).',
  PRO: 'High-throughput AI Assistant access with fair-use safeguards (200 req/min, 5,000 messages every 4 hours).',
} as const
