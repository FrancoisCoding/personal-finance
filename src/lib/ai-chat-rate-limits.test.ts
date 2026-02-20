import { getAiChatRateLimitPolicy } from '@/lib/ai-chat-rate-limits'

describe('ai chat rate limit policy', () => {
  it('returns demo policy when demo mode is enabled', () => {
    const result = getAiChatRateLimitPolicy({
      isDemoMode: true,
      tier: null,
    })

    expect(result.scope).toBe('ai-chat-demo')
    expect(result.policy.burstMaxRequests).toBe(10)
    expect(result.policy.windowMaxRequests).toBe(40)
    expect(result.policy.dailyMaxRequests).toBe(120)
  })

  it('returns basic policy for basic tier', () => {
    const result = getAiChatRateLimitPolicy({
      isDemoMode: false,
      tier: 'BASIC',
    })

    expect(result.scope).toBe('ai-chat-basic')
    expect(result.policy.burstMaxRequests).toBe(30)
    expect(result.policy.windowMaxRequests).toBe(150)
    expect(result.policy.dailyMaxRequests).toBe(600)
  })

  it('returns pro policy for pro tier', () => {
    const result = getAiChatRateLimitPolicy({
      isDemoMode: false,
      tier: 'PRO',
    })

    expect(result.scope).toBe('ai-chat-pro')
    expect(result.policy.burstMaxRequests).toBe(200)
    expect(result.policy.windowMaxRequests).toBe(5000)
    expect(result.policy.dailyMaxRequests).toBe(30000)
  })
})
