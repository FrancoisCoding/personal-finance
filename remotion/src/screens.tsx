import React from 'react'
import { interpolate } from 'remotion'

import {
  colors,
  Donut,
  FloatingPanel,
  MetricPill,
  progress,
  StatCard,
  TrendBars,
} from './shared'

export const IntroMosaic: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 8, 36)

  return (
    <div
      style={{
        position: 'relative',
        width: 620,
        height: 450,
      }}
    >
      <FloatingPanel
        padding={20}
        rotate={-4}
        style={{
          position: 'absolute',
          left: 12,
          top: 26,
          width: 228,
          transform: `translateY(${interpolate(reveal, [0, 1], [28, 0])}px) rotate(-4deg)`,
          opacity: reveal,
        }}
      >
        <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
          This month
        </div>
        <div
          style={{
            marginTop: 10,
            color: colors.teal,
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: '-0.06em',
          }}
        >
          +$1.5k
        </div>
        <div style={{ marginTop: 10 }}>
          <MetricPill label="Spending in range" accent={colors.teal} />
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={24}
        style={{
          position: 'absolute',
          right: 16,
          top: 6,
          width: 332,
          transform: `translateY(${interpolate(reveal, [0, 1], [44, 0])}px)`,
          opacity: reveal,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: colors.white, fontSize: 22, fontWeight: 800 }}>
            Cash flow planning
          </div>
          <div style={{ color: colors.muted, fontSize: 14 }}>Next 30 days</div>
        </div>
        <div style={{ marginTop: 18 }}>
          <TrendBars progressValue={reveal} />
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={18}
        rotate={3}
        style={{
          position: 'absolute',
          left: 76,
          bottom: 44,
          width: 248,
          transform: `translateY(${interpolate(reveal, [0, 1], [36, 0])}px) rotate(3deg)`,
          opacity: reveal,
        }}
      >
        <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
          Assistant
        </div>
        <div
          style={{
            marginTop: 10,
            color: colors.white,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          “Dining is up 18%. Cap it at $140 this week.”
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={18}
        style={{
          position: 'absolute',
          right: 44,
          bottom: 22,
          width: 188,
          opacity: reveal,
        }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <StatCard accent={colors.aqua} label="Runway" value="13d" />
          <StatCard accent={colors.gold} label="Renewals" value="3" />
        </div>
      </FloatingPanel>
    </div>
  )
}

export const OverviewCluster: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 8, 26)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.18fr 0.82fr',
        gap: 18,
        width: 680,
      }}
    >
      <FloatingPanel
        padding={24}
        style={{
          minHeight: 394,
          transform: `translateY(${interpolate(reveal, [0, 1], [28, 0])}px)`,
          opacity: reveal,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          <StatCard accent={colors.white} label="Net worth" value="$22.9k" />
          <StatCard accent={colors.teal} label="Saved" value="$864" />
          <StatCard accent={colors.aqua} label="Runway" value="13d" />
        </div>
        <div
          style={{
            marginTop: 16,
            display: 'grid',
            gridTemplateColumns: '1.04fr 0.96fr',
            gap: 16,
          }}
        >
          <FloatingPanel padding={18} style={{ minHeight: 210 }}>
            <div
              style={{
                color: colors.white,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              Spending rhythm
            </div>
            <div style={{ marginTop: 14 }}>
              <TrendBars progressValue={reveal} />
            </div>
          </FloatingPanel>
          <FloatingPanel
            padding={18}
            style={{
              minHeight: 210,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Donut
              accent={colors.teal}
              label="saved"
              progressValue={reveal}
              value="62%"
            />
          </FloatingPanel>
        </div>
      </FloatingPanel>

      <div style={{ display: 'grid', gap: 16 }}>
        <FloatingPanel
          padding={20}
          rotate={3}
          style={{
            minHeight: 186,
            opacity: reveal,
          }}
        >
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
            Nudges
          </div>
          <div
            style={{
              marginTop: 10,
              color: colors.white,
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            One budget needs attention before the month gets away from you.
          </div>
        </FloatingPanel>
        <FloatingPanel
          padding={20}
          style={{
            minHeight: 176,
            opacity: reveal,
          }}
        >
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
            Next up
          </div>
          <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {[
              ['Spotify renewal', 'Mar 8', colors.aqua],
              ['Review dining cap', 'Today', colors.teal],
            ].map(([label, meta, accent]) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 10,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div>
                  <div
                    style={{
                      color: colors.white,
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: colors.muted,
                      fontSize: 14,
                    }}
                  >
                    {meta}
                  </div>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: accent as string,
                    boxShadow: `0 0 18px ${accent}aa`,
                  }}
                />
              </div>
            ))}
          </div>
        </FloatingPanel>
      </div>
    </div>
  )
}

export const MoneyMovementCluster: React.FC<{ frame: number }> = ({
  frame,
}) => {
  const reveal = progress(frame, 10, 30)

  return (
    <div
      style={{
        position: 'relative',
        width: 680,
        height: 390,
      }}
    >
      <FloatingPanel
        padding={20}
        style={{
          position: 'absolute',
          left: 0,
          top: 46,
          width: 286,
          minHeight: 254,
          opacity: reveal,
        }}
      >
        <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
          Accounts
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {[
            ['Checking', '$8,420', colors.teal],
            ['Savings', '$12,100', colors.aqua],
            ['Credit card', '$1,744', colors.coral],
          ].map(([label, value, accent]) => (
            <div
              key={label}
              style={{
                borderRadius: 20,
                border: `1px solid ${colors.border}`,
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{ color: colors.white, fontSize: 18, fontWeight: 700 }}
              >
                {label}
              </div>
              <div
                style={{
                  color: accent as string,
                  fontSize: 24,
                  fontWeight: 800,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={20}
        rotate={-1}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 392,
          minHeight: 332,
          opacity: reveal,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
            Transactions
          </div>
          <div
            style={{
              color: colors.teal,
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            Auto-categorized
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {[
            ['Northwind Payroll', '+$4,800', colors.teal],
            ['Whole Foods', '-$186', colors.white],
            ['Netflix', '-$16.99', colors.coral],
          ].map(([merchant, amount, accent]) => (
            <div
              key={merchant}
              style={{
                borderRadius: 18,
                border: `1px solid ${colors.border}`,
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    color: colors.white,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {merchant}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: colors.muted,
                    fontSize: 14,
                  }}
                >
                  Clear merchant + category context
                </div>
              </div>
              <div
                style={{
                  color: accent as string,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {amount}
              </div>
            </div>
          ))}
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={16}
        rotate={4}
        style={{
          position: 'absolute',
          left: 238,
          bottom: 34,
          width: 188,
          opacity: reveal,
        }}
      >
        <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
          Category lift
        </div>
        <div
          style={{
            marginTop: 12,
            color: colors.white,
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          Swipes stop looking cryptic.
        </div>
      </FloatingPanel>
    </div>
  )
}

export const PlanningCluster: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 10, 26)
  const meter = interpolate(reveal, [0, 1], [0.2, 1])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.04fr 0.96fr',
        gap: 18,
        width: 690,
      }}
    >
      <FloatingPanel padding={22} style={{ minHeight: 388, opacity: reveal }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
            Upcoming renewals
          </div>
          <MetricPill label="Caught early" accent={colors.gold} />
        </div>
        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {[
            ['Spotify', '$11.99', 'Mar 8', colors.aqua],
            ['Notion', '$8.00', 'Mar 26', colors.violet],
          ].map(([label, value, date, accent]) => (
            <div
              key={label}
              style={{
                borderRadius: 20,
                border: `1px solid ${colors.border}`,
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{ color: colors.white, fontSize: 18, fontWeight: 700 }}
                >
                  {label}
                </div>
                <div
                  style={{ marginTop: 4, color: colors.muted, fontSize: 14 }}
                >
                  Renewal on {date}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    color: accent as string,
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={22}
        rotate={-2}
        style={{ minHeight: 388, opacity: reveal }}
      >
        <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
          Budget forecast
        </div>
        <div style={{ marginTop: 20, display: 'grid', gap: 18 }}>
          {[
            ['Housing', 'Over risk', colors.danger, 0.94],
            ['Food & dining', 'On track', colors.teal, 0.62],
            ['Transportation', 'Healthy', colors.aqua, 0.44],
          ].map(([label, status, accent, width]) => (
            <div key={label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ color: colors.white, fontSize: 18, fontWeight: 700 }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: accent as string,
                    fontSize: 14,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {status}
                </div>
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 12,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${(width as number) * meter * 100}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: accent as string,
                    boxShadow: `0 0 16px ${accent}77`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <FloatingPanel
          padding={16}
          style={{
            marginTop: 24,
            background:
              'linear-gradient(180deg, rgba(76,240,215,0.14), rgba(76,240,215,0.06))',
          }}
        >
          <div style={{ color: colors.white, fontSize: 18, fontWeight: 800 }}>
            Better before it’s urgent.
          </div>
          <div
            style={{
              marginTop: 8,
              color: colors.muted,
              fontSize: 15,
              lineHeight: 1.4,
            }}
          >
            Renewals and category pacing stay in the same planning loop.
          </div>
        </FloatingPanel>
      </FloatingPanel>
    </div>
  )
}

export const AssistantCluster: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 8, 28)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '0.76fr 1.24fr',
        gap: 18,
        width: 720,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <FloatingPanel padding={18} rotate={-2} style={{ opacity: reveal }}>
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
            Ask anything
          </div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              'Why did spending spike?',
              'What should I trim first?',
              'How am I trending this month?',
            ].map((prompt, index) => (
              <div
                key={prompt}
                style={{
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: `1px solid ${colors.border}`,
                  background:
                    index === 1
                      ? 'rgba(76,240,215,0.12)'
                      : 'rgba(255,255,255,0.03)',
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {prompt}
              </div>
            ))}
          </div>
        </FloatingPanel>

        <FloatingPanel padding={18} rotate={3} style={{ opacity: reveal }}>
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
            Insight
          </div>
          <div
            style={{
              marginTop: 10,
              color: colors.white,
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.18,
            }}
          >
            Two changes could free up $140 this week.
          </div>
        </FloatingPanel>

        <FloatingPanel padding={18} style={{ opacity: reveal }}>
          <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
            Tone
          </div>
          <div
            style={{
              marginTop: 10,
              color: colors.white,
              fontSize: 19,
              fontWeight: 700,
              lineHeight: 1.34,
            }}
          >
            Calm answers. Real numbers. Zero finance jargon spiral.
          </div>
        </FloatingPanel>
      </div>

      <FloatingPanel padding={22} style={{ minHeight: 412, opacity: reveal }}>
        <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
          Assistant
        </div>
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {[
            ['You', 'Why did spending jump this month?', colors.white, true],
            [
              'FinanceFlow',
              'Dining rose 18%, and two subscriptions renewed earlier than usual.',
              colors.teal,
              false,
            ],
            [
              'FinanceFlow',
              'Best move: pause one unused plan and cap dining at $140 this week.',
              colors.aqua,
              false,
            ],
          ].map(([sender, text, accent, isUser]) => (
            <div
              key={text}
              style={{
                marginLeft: isUser ? 86 : 0,
                borderRadius: 22,
                border: `1px solid ${colors.border}`,
                background: isUser ? 'rgba(255,255,255,0.04)' : `${accent}16`,
                padding: '16px 18px',
              }}
            >
              <div
                style={{ color: colors.muted, fontSize: 13, fontWeight: 700 }}
              >
                {sender}
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: colors.white,
                  fontSize: 22,
                  fontWeight: 700,
                  lineHeight: 1.34,
                }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
      </FloatingPanel>
    </div>
  )
}

export const PowerToolsCluster: React.FC<{ frame: number }> = ({ frame }) => {
  const reveal = progress(frame, 8, 26)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        width: 700,
      }}
    >
      <FloatingPanel padding={22} style={{ minHeight: 386, opacity: reveal }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
            Investments
          </div>
          <MetricPill label="Long view" accent={colors.aqua} />
        </div>
        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.1fr',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Donut
              accent={colors.aqua}
              label="allocated"
              progressValue={reveal}
              value="84k"
            />
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              ['401(k)', '44%', colors.teal],
              ['Stocks', '28%', colors.aqua],
              ['Crypto', '8%', colors.gold],
              ['Cash + other', '20%', colors.violet],
            ].map(([label, value, accent]) => (
              <div key={label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      color: colors.white,
                      fontSize: 17,
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      color: accent as string,
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {value}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    height: 10,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: value as string,
                      height: '100%',
                      borderRadius: 999,
                      background: accent as string,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel
        padding={22}
        rotate={-2}
        style={{ minHeight: 386, opacity: reveal }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ color: colors.white, fontSize: 24, fontWeight: 800 }}>
            Invoices
          </div>
          <MetricPill label="Export ready" accent={colors.gold} />
        </div>
        <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
          {[
            ['INV-1042', 'Northwind Systems', '$1,200', 'Paid', colors.teal],
            ['INV-1043', 'Studio Cobalt', '$480', 'Sent', colors.aqua],
          ].map(([id, client, amount, status, accent]) => (
            <div
              key={id}
              style={{
                borderRadius: 18,
                border: `1px solid ${colors.border}`,
                background: 'rgba(255,255,255,0.03)',
                padding: '16px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{ color: colors.white, fontSize: 18, fontWeight: 700 }}
                >
                  {id}
                </div>
                <div
                  style={{ marginTop: 4, color: colors.muted, fontSize: 14 }}
                >
                  {client}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{ color: colors.white, fontSize: 22, fontWeight: 800 }}
                >
                  {amount}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    color: accent as string,
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  {status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </FloatingPanel>
    </div>
  )
}
