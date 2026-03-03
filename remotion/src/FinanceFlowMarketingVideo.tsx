import React from 'react'
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const colors = {
  background: '#020817',
  panel: '#081326',
  panelSoft: 'rgba(11, 24, 43, 0.86)',
  border: 'rgba(78, 130, 184, 0.24)',
  white: '#f8fafc',
  muted: '#94a3b8',
  teal: '#31dbc7',
  aqua: '#55d9ff',
  lime: '#9effa6',
  gold: '#f6b73c',
  coral: '#ff7a59',
}

const formatFrameProgress = (
  frame: number,
  startFrame: number,
  durationInFrames: number
) => {
  return interpolate(
    frame,
    [startFrame, startFrame + durationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )
}

const GridBackground: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const glowX = interpolate(frame, [0, 359], [width * 0.22, width * 0.8])
  const glowY = interpolate(frame, [0, 359], [height * 0.2, height * 0.68])
  const orbitX = interpolate(frame, [0, 359], [width * 0.82, width * 0.18])
  const orbitY = interpolate(frame, [0, 359], [height * 0.26, height * 0.78])

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${glowX}px ${glowY}px, rgba(49, 219, 199, 0.18), transparent 30%),
          radial-gradient(circle at ${orbitX}px ${orbitY}px, rgba(255, 122, 89, 0.14), transparent 28%),
          linear-gradient(140deg, #01050f 0%, #031022 42%, #020817 100%)`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(69, 102, 146, 0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(69, 102, 146, 0.14) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.45,
        }}
      />
      {Array.from({ length: 14 }).map((_, index) => {
        const offsetFrame = (frame + index * 9) % 360
        const translateY = interpolate(offsetFrame, [0, 359], [42, -42])
        const scale = interpolate(
          offsetFrame,
          [0, 180, 359],
          [0.85, 1.18, 0.85]
        )
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${8 + ((index * 7) % 84)}%`,
              top: `${10 + ((index * 11) % 78)}%`,
              width: index % 4 === 0 ? 12 : 8,
              height: index % 4 === 0 ? 12 : 8,
              borderRadius: 999,
              background:
                index % 3 === 0
                  ? 'rgba(85, 217, 255, 0.92)'
                  : index % 3 === 1
                    ? 'rgba(49, 219, 199, 0.82)'
                    : 'rgba(246, 183, 60, 0.82)',
              boxShadow: '0 0 28px rgba(85, 217, 255, 0.38)',
              opacity: 0.45,
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleRise = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  })

  const badgeOpacity = interpolate(frame, [0, 16, 54], [0, 1, 1], {
    extrapolateRight: 'clamp',
  })

  const subtitleOpacity = interpolate(frame, [10, 32, 84], [0, 1, 1], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        padding: '84px 92px',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          borderRadius: 999,
          padding: '12px 18px',
          border: `1px solid ${colors.border}`,
          background: 'rgba(4, 15, 31, 0.74)',
          color: colors.white,
          fontSize: 18,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          opacity: badgeOpacity,
          width: 'fit-content',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: colors.teal,
            boxShadow: '0 0 24px rgba(49, 219, 199, 0.8)',
          }}
        />
        FinanceFlow
      </div>

      <div style={{ maxWidth: 760 }}>
        <div
          style={{
            color: colors.white,
            fontFamily: 'Sora, Manrope, system-ui, sans-serif',
            fontSize: 92,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '-0.05em',
            transform: `translateY(${interpolate(titleRise, [0, 1], [60, 0])}px)`,
            opacity: interpolate(titleRise, [0, 1], [0, 1]),
          }}
        >
          Money clarity,
          <br />
          finally in flow.
        </div>
        <div
          style={{
            marginTop: 24,
            color: colors.muted,
            fontSize: 28,
            lineHeight: 1.4,
            maxWidth: 690,
            opacity: subtitleOpacity,
            transform: `translateY(${interpolate(frame, [10, 36], [28, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })}px)`,
          }}
        >
          A playful finance workspace for budgets, subscriptions, AI guidance,
          invoices, investments, and better daily decisions.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 18,
          alignItems: 'center',
        }}
      >
        {['Track', 'Plan', 'Decide'].map((label, index) => (
          <div
            key={label}
            style={{
              borderRadius: 999,
              padding: '16px 24px',
              background:
                index === 1
                  ? 'rgba(49, 219, 199, 0.12)'
                  : 'rgba(255,255,255,0.04)',
              border: `1px solid ${index === 1 ? 'rgba(49, 219, 199, 0.45)' : colors.border}`,
              color: index === 1 ? colors.teal : colors.white,
              fontSize: 22,
              fontWeight: 600,
              transform: `translateY(${interpolate(
                frame,
                [20 + index * 4, 46 + index * 4],
                [30, 0],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              )}px)`,
              opacity: interpolate(
                frame,
                [18 + index * 4, 40 + index * 4],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              ),
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

const FloatingPill: React.FC<{
  color: string
  label: string
  left: number
  top: number
  progress: number
}> = ({ color, label, left, top, progress }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        padding: '14px 18px',
        borderRadius: 999,
        border: `1px solid ${color}44`,
        background: 'rgba(3, 12, 26, 0.86)',
        boxShadow: `0 14px 32px ${color}1f`,
        color,
        fontSize: 18,
        fontWeight: 700,
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [24, 0])}px) scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
      }}
    >
      {label}
    </div>
  )
}

const DashboardScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({
    frame: frame - 70,
    fps,
    config: {
      damping: 15,
      stiffness: 120,
      mass: 0.9,
    },
  })

  const barProgress = formatFrameProgress(frame, 108, 46)
  const chipA = formatFrameProgress(frame, 86, 24)
  const chipB = formatFrameProgress(frame, 98, 24)
  const chipC = formatFrameProgress(frame, 110, 24)

  return (
    <AbsoluteFill
      style={{
        padding: '72px 80px',
      }}
    >
      <div
        style={{
          width: 1060,
          height: 560,
          margin: '0 auto',
          borderRadius: 36,
          background:
            'linear-gradient(180deg, rgba(8,19,38,0.95), rgba(3,11,23,0.96))',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          transform: `translateY(${interpolate(enter, [0, 1], [60, 0])}px) scale(${interpolate(enter, [0, 1], [0.94, 1])}) rotate(${interpolate(enter, [0, 1], [1.4, 0])}deg)`,
          opacity: interpolate(enter, [0, 1], [0, 1]),
          position: 'relative',
        }}
      >
        <div
          style={{
            height: 82,
            borderBottom: `1px solid ${colors.border}`,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #31dbc7, #1892f1)',
              }}
            />
            <div style={{ color: colors.white, fontSize: 24, fontWeight: 700 }}>
              FinanceFlow
            </div>
          </div>
          <div style={{ color: colors.muted, fontSize: 18 }}>
            One calm dashboard for your money
          </div>
        </div>

        <div style={{ display: 'flex', height: 478 }}>
          <div
            style={{
              width: 244,
              borderRight: `1px solid ${colors.border}`,
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {[
              'Overview',
              'Accounts',
              'Budgets',
              'Subscriptions',
              'AI Assistant',
            ].map((item, index) => (
              <div
                key={item}
                style={{
                  borderRadius: 16,
                  padding: '16px 18px',
                  background:
                    index === 0
                      ? 'rgba(49, 219, 199, 0.12)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${index === 0 ? 'rgba(49, 219, 199, 0.35)' : 'transparent'}`,
                  color: index === 0 ? colors.white : colors.muted,
                  fontSize: 19,
                  fontWeight: 600,
                  transform: `translateX(${interpolate(
                    frame,
                    [74 + index * 3, 96 + index * 3],
                    [-18, 0],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }
                  )}px)`,
                  opacity: interpolate(
                    frame,
                    [72 + index * 3, 94 + index * 3],
                    [0, 1],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }
                  ),
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, padding: 28 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.35fr 0.95fr',
                gap: 18,
              }}
            >
              <div
                style={{
                  borderRadius: 26,
                  background: colors.panelSoft,
                  border: `1px solid ${colors.border}`,
                  padding: 22,
                  minHeight: 254,
                }}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: 16,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Cash Flow
                </div>
                <div
                  style={{
                    marginTop: 16,
                    color: colors.white,
                    fontSize: 56,
                    fontWeight: 700,
                  }}
                >
                  $22,920
                </div>
                <div
                  style={{ marginTop: 8, color: colors.muted, fontSize: 22 }}
                >
                  Live across your connected accounts
                </div>
                <div
                  style={{
                    marginTop: 30,
                    height: 140,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 14,
                  }}
                >
                  {[0.38, 0.54, 0.48, 0.72, 0.6, 0.88, 0.76].map(
                    (value, index) => (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          borderRadius: 18,
                          background:
                            index >= 5
                              ? 'linear-gradient(180deg, rgba(49,219,199,0.24), rgba(49,219,199,0.95))'
                              : 'linear-gradient(180deg, rgba(85,217,255,0.16), rgba(85,217,255,0.72))',
                          height: `${interpolate(barProgress, [0, 1], [12, value * 120])}px`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 26,
                  background: colors.panelSoft,
                  border: `1px solid ${colors.border}`,
                  padding: 22,
                  minHeight: 254,
                }}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: 16,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                  }}
                >
                  Smart Nudges
                </div>
                <div style={{ marginTop: 22, display: 'grid', gap: 14 }}>
                  {[
                    {
                      label: 'Budget runway',
                      value: '13 days',
                      color: colors.gold,
                    },
                    {
                      label: 'Subscription drift',
                      value: '$42 found',
                      color: colors.coral,
                    },
                    {
                      label: 'Savings momentum',
                      value: '+11%',
                      color: colors.lime,
                    },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${stat.color}33`,
                        background: 'rgba(255,255,255,0.03)',
                        padding: '16px 18px',
                        opacity: interpolate(
                          frame,
                          [90 + index * 6, 120 + index * 6],
                          [0, 1],
                          {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                          }
                        ),
                        transform: `translateY(${interpolate(
                          frame,
                          [90 + index * 6, 120 + index * 6],
                          [20, 0],
                          {
                            extrapolateLeft: 'clamp',
                            extrapolateRight: 'clamp',
                          }
                        )}px)`,
                      }}
                    >
                      <div style={{ color: colors.muted, fontSize: 16 }}>
                        {stat.label}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          color: stat.color,
                          fontSize: 34,
                          fontWeight: 700,
                        }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FloatingPill
          color={colors.aqua}
          label="Budgets"
          left={730}
          top={120}
          progress={chipA}
        />
        <FloatingPill
          color={colors.coral}
          label="Subscriptions"
          left={860}
          top={418}
          progress={chipB}
        />
        <FloatingPill
          color={colors.lime}
          label="AI Insights"
          left={520}
          top={430}
          progress={chipC}
        />
      </div>
    </AbsoluteFill>
  )
}

const InsightCard: React.FC<{
  accent: string
  body: string
  label: string
  progress: number
  top: number
}> = ({ accent, body, label, progress, top }) => {
  return (
    <div
      style={{
        position: 'absolute',
        right: 92,
        top,
        width: 380,
        borderRadius: 28,
        border: `1px solid ${accent}44`,
        background: 'rgba(3, 12, 26, 0.88)',
        boxShadow: `0 18px 44px ${accent}22`,
        padding: '22px 24px',
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [32, 0])}px)`,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          padding: '8px 12px',
          borderRadius: 999,
          background: `${accent}18`,
          color: accent,
          fontSize: 15,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 16,
          color: colors.white,
          fontSize: 28,
          lineHeight: 1.25,
          fontWeight: 600,
        }}
      >
        {body}
      </div>
    </div>
  )
}

const AssistantScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const panelIn = spring({
    frame: frame - 190,
    fps,
    config: {
      damping: 13,
      stiffness: 120,
      mass: 0.85,
    },
  })

  return (
    <AbsoluteFill style={{ padding: '70px 80px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.95fr 1.05fr',
          gap: 26,
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        <div
          style={{
            paddingTop: 40,
            opacity: panelIn,
            transform: `translateY(${interpolate(panelIn, [0, 1], [48, 0])}px)`,
          }}
        >
          <div
            style={{
              color: colors.teal,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            AI that feels human
          </div>
          <div
            style={{
              marginTop: 18,
              color: colors.white,
              fontFamily: 'Sora, Manrope, system-ui, sans-serif',
              fontSize: 72,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: '-0.05em',
            }}
          >
            Ask smarter
            <br />
            money questions.
          </div>
          <div
            style={{
              marginTop: 22,
              color: colors.muted,
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 470,
            }}
          >
            Get pattern spotting, gentle nudges, and clear next steps without
            drowning in charts.
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 34,
            background:
              'linear-gradient(180deg, rgba(8,19,38,0.96), rgba(3,11,23,0.96))',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at top left, rgba(85,217,255,0.14), transparent 36%), radial-gradient(circle at bottom right, rgba(49,219,199,0.16), transparent 36%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 28,
              right: 28,
              top: 30,
              color: colors.white,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            Financial Assistant
          </div>
          <div
            style={{
              position: 'absolute',
              left: 28,
              right: 28,
              top: 92,
              display: 'grid',
              gap: 14,
            }}
          >
            {[
              {
                sender: 'You',
                text: 'Why did spending jump this month?',
                color: 'rgba(255,255,255,0.04)',
              },
              {
                sender: 'FinanceFlow',
                text: 'Dining and subscriptions rose 18%. Two renewals hit earlier than usual.',
                color: 'rgba(49,219,199,0.12)',
              },
              {
                sender: 'FinanceFlow',
                text: 'Quick win: pause one unused plan and trim dining by $40 this week.',
                color: 'rgba(85,217,255,0.1)',
              },
            ].map((message, index) => {
              const messageProgress = interpolate(
                frame,
                [204 + index * 14, 230 + index * 14],
                [0, 1],
                {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }
              )
              return (
                <div
                  key={index}
                  style={{
                    alignSelf: index === 0 ? 'end' : 'start',
                    maxWidth: index === 0 ? 360 : 420,
                    marginLeft: index === 0 ? 84 : 0,
                    borderRadius: 24,
                    border: `1px solid ${colors.border}`,
                    background: message.color,
                    padding: '18px 18px 20px',
                    opacity: messageProgress,
                    transform: `translateY(${interpolate(messageProgress, [0, 1], [22, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    {message.sender}
                  </div>
                  <div
                    style={{
                      color: colors.white,
                      fontSize: 24,
                      lineHeight: 1.35,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <InsightCard
        accent={colors.gold}
        label="Insight"
        body="Your subscription stack could shrink by $216 this year."
        top={74}
        progress={formatFrameProgress(frame, 236, 30)}
      />
      <InsightCard
        accent={colors.aqua}
        label="Momentum"
        body="Savings rate is up. Keep this week under $140 to lock it in."
        top={476}
        progress={formatFrameProgress(frame, 252, 28)}
      />
    </AbsoluteFill>
  )
}

const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame()
  const fade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  })
  const scale = interpolate(frame, [0, 30], [0.92, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          width: 980,
          borderRadius: 40,
          border: `1px solid ${colors.border}`,
          background:
            'linear-gradient(180deg, rgba(5,17,34,0.94), rgba(3,11,23,0.96))',
          boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
          padding: '50px 56px',
          textAlign: 'center',
          opacity: fade,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: colors.teal,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          FinanceFlow
        </div>
        <div
          style={{
            marginTop: 18,
            color: colors.white,
            fontFamily: 'Sora, Manrope, system-ui, sans-serif',
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.05em',
          }}
        >
          Finance that feels
          <br />
          playful, not painful.
        </div>
        <div
          style={{
            marginTop: 22,
            color: colors.muted,
            fontSize: 28,
            lineHeight: 1.45,
            maxWidth: 700,
            marginInline: 'auto',
          }}
        >
          Budgets, subscriptions, AI guidance, exports, investments, and
          invoices. All in one beautifully calm flow.
        </div>

        <div
          style={{
            marginTop: 34,
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[
            ['Free', colors.white],
            ['Basic', colors.aqua],
            ['Pro', colors.teal],
            ['Demo', colors.gold],
          ].map(([label, color], index) => (
            <div
              key={label}
              style={{
                borderRadius: 999,
                padding: '14px 22px',
                border: `1px solid ${color}33`,
                color,
                background: 'rgba(255,255,255,0.03)',
                fontSize: 20,
                fontWeight: 700,
                transform: `translateY(${interpolate(
                  frame,
                  [24 + index * 4, 44 + index * 4],
                  [18, 0],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }
                )}px)`,
                opacity: interpolate(
                  frame,
                  [22 + index * 4, 40 + index * 4],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }
                ),
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 34,
            color: colors.white,
            fontSize: 26,
            fontWeight: 700,
          }}
        >
          financeflow.dev
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const FinanceFlowMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame()

  const overlayOpacity = interpolate(frame, [0, 22], [1, 0], {
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: colors.white,
      }}
    >
      <GridBackground />
      <Sequence from={0} durationInFrames={95}>
        <IntroScene />
      </Sequence>
      <Sequence from={66} durationInFrames={150}>
        <DashboardScene />
      </Sequence>
      <Sequence from={182} durationInFrames={116}>
        <AssistantScene />
      </Sequence>
      <Sequence from={280} durationInFrames={80}>
        <FinaleScene />
      </Sequence>
      <AbsoluteFill
        style={{
          background: colors.background,
          opacity: overlayOpacity,
        }}
      />
    </AbsoluteFill>
  )
}
