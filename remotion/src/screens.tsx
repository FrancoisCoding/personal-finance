import React from 'react'
import { interpolate } from 'remotion'
import {
  BrowserFrame,
  colors,
  Donut,
  HeaderRow,
  progress,
  Sidebar,
  StatCard,
  TrendBars,
} from './shared'

export const DashboardOverviewScreen: React.FC<{ frame: number }> = ({
  frame,
}) => {
  const chartIn = progress(frame, 36, 42)
  return (
    <BrowserFrame title="financeflow.dev/dashboard">
      <div style={{ display: 'flex', height: 508 }}>
        <Sidebar activeLabel="Overview" />
        <div style={{ flex: 1, padding: 24, display: 'grid', gap: 18 }}>
          <HeaderRow
            caption="Overview"
            title="Everything that matters, one calm glance away"
            subtitle="Balances, budgets, nudges, and smart next steps stay readable without hiding the details."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 14,
            }}
          >
            <StatCard accent={colors.white} label="Net worth" value="$22.9k" />
            <StatCard
              accent={colors.teal}
              label="Cash runway"
              value="13 days"
            />
            <StatCard
              accent={colors.aqua}
              label="Saved this month"
              value="$864"
            />
            <StatCard accent={colors.gold} label="Subscriptions" value="$142" />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.35fr 0.9fr',
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 20,
              }}
            >
              <div
                style={{ color: colors.white, fontSize: 24, fontWeight: 700 }}
              >
                Cash flow planning
              </div>
              <div style={{ marginTop: 6, color: colors.muted, fontSize: 16 }}>
                Smooth peaks, spot dips, and act before things feel tight.
              </div>
              <div style={{ marginTop: 24 }}>
                <TrendBars progressValue={chartIn} />
              </div>
            </div>
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{ color: colors.white, fontSize: 24, fontWeight: 700 }}
              >
                Savings momentum
              </div>
              <div style={{ marginTop: 10 }}>
                <Donut progressValue={chartIn} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

export const AccountsTransactionsScreen: React.FC<{ frame: number }> = ({
  frame,
}) => {
  const rowsProgress = progress(frame, 30, 36)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26 }}>
      <BrowserFrame title="financeflow.dev/accounts" width={620} height={520}>
        <div style={{ display: 'flex', height: 448 }}>
          <Sidebar activeLabel="Accounts" />
          <div style={{ flex: 1, padding: 22, display: 'grid', gap: 14 }}>
            <HeaderRow
              caption="Accounts"
              title="See every account in one place"
              subtitle="Balances update together so cash, savings, and cards never feel disconnected."
            />
            {[
              ['Checking', '$8,420', colors.teal],
              ['Savings', '$12,100', colors.aqua],
              ['Credit card', '$1,744', colors.gold],
            ].map(([label, value, accent], index) => (
              <div
                key={label}
                style={{
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '18px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: interpolate(
                    rowsProgress,
                    [0, 0.45 + index * 0.12, 1],
                    [0, 1, 1]
                  ),
                  transform: `translateY(${interpolate(rowsProgress, [0, 1], [20 + index * 8, 0])}px)`,
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
                    style={{ marginTop: 4, color: colors.muted, fontSize: 14 }}
                  >
                    Synced and organized automatically
                  </div>
                </div>
                <div
                  style={{
                    color: accent as string,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>

      <BrowserFrame
        title="financeflow.dev/transactions"
        width={620}
        height={520}
      >
        <div style={{ display: 'flex', height: 448 }}>
          <Sidebar activeLabel="Transactions" />
          <div style={{ flex: 1, padding: 22, display: 'grid', gap: 14 }}>
            <HeaderRow
              caption="Transactions"
              title="Every dollar gets context"
              subtitle="Review recent activity, categories, merchants, and timing without digging through your bank feed."
            />
            {[
              ['Northwind Systems Payroll', '+$4,800', colors.teal],
              ['Whole Foods', '-$186', colors.white],
              ['Netflix', '-$16.99', colors.coral],
              ['Riverside Church donation', '-$100', colors.gold],
            ].map(([merchant, amount, accent], index) => (
              <div
                key={merchant}
                style={{
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: interpolate(
                    rowsProgress,
                    [0, 0.35 + index * 0.12, 1],
                    [0, 1, 1]
                  ),
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
                    style={{ marginTop: 4, color: colors.muted, fontSize: 14 }}
                  >
                    Categorized automatically
                  </div>
                </div>
                <div
                  style={{
                    color: accent as string,
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}

export const SubscriptionBudgetScreen: React.FC<{ frame: number }> = ({
  frame,
}) => {
  const blockIn = progress(frame, 24, 40)
  const timelineWidth = interpolate(blockIn, [0, 1], [80, 500])

  return (
    <BrowserFrame
      title="financeflow.dev/subscriptions-and-budgets"
      width={1120}
      height={590}
    >
      <div style={{ display: 'flex', height: 518 }}>
        <Sidebar activeLabel="Subscriptions" />
        <div style={{ flex: 1, padding: 24, display: 'grid', gap: 16 }}>
          <HeaderRow
            caption="Planning"
            title="Catch recurring costs before they surprise you"
            subtitle="Subscriptions, budgets, and renewal nudges work together so the plan stays realistic."
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 0.95fr',
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 20,
              }}
            >
              <div
                style={{ color: colors.white, fontSize: 22, fontWeight: 700 }}
              >
                Upcoming renewals
              </div>
              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                {[
                  ['Spotify', '$11.99', 'Mar 8', colors.aqua],
                  ['Notion', '$8.00', 'Mar 26', colors.violet],
                  ['Canva Pro', '$14.99', 'Apr 2', colors.gold],
                ].map(([name, price, date, accent], index) => (
                  <div
                    key={name}
                    style={{
                      borderRadius: 20,
                      border: `1px solid ${colors.border}`,
                      background: 'rgba(255,255,255,0.03)',
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: interpolate(
                        blockIn,
                        [0, 0.42 + index * 0.14, 1],
                        [0, 1, 1]
                      ),
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
                        {name}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          color: colors.muted,
                          fontSize: 14,
                        }}
                      >
                        Renewal on {date}
                      </div>
                    </div>
                    <div
                      style={{
                        color: accent as string,
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      {price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                borderRadius: 28,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 20,
              }}
            >
              <div
                style={{ color: colors.white, fontSize: 22, fontWeight: 700 }}
              >
                Budget forecast
              </div>
              <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
                {[
                  ['Housing', 'Over risk', colors.danger, 0.94],
                  ['Food & dining', 'On track', colors.teal, 0.62],
                  ['Transportation', 'On track', colors.aqua, 0.48],
                ].map(([label, status, accent, widthRatio]) => (
                  <div key={label} style={{ display: 'grid', gap: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
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
                          color: accent as string,
                          fontSize: 14,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {status}
                      </div>
                    </div>
                    <div
                      style={{
                        height: 14,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${timelineWidth * (widthRatio as number) * 0.18}px`,
                          minWidth: 60,
                          maxWidth: `${(widthRatio as number) * 100}%`,
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
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

export const AssistantScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const messageIn = progress(frame, 18, 32)

  return (
    <BrowserFrame title="financeflow.dev/assistant" width={1120} height={600}>
      <div style={{ display: 'flex', height: 528 }}>
        <Sidebar activeLabel="Financial Assistant" />
        <div
          style={{
            flex: 1,
            padding: 24,
            display: 'grid',
            gridTemplateColumns: '0.8fr 1.2fr',
            gap: 18,
          }}
        >
          <div style={{ paddingTop: 10 }}>
            <HeaderRow
              caption="Guidance"
              title="Ask the product what changed and what to do next"
              subtitle="The assistant turns raw spending patterns into simple, grounded next steps."
            />
            <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
              {[
                'Why did spending spike?',
                'What can I trim this week?',
                'How am I trending vs. last month?',
              ].map((prompt, index) => (
                <div
                  key={prompt}
                  style={{
                    borderRadius: 18,
                    border: `1px solid ${colors.border}`,
                    background:
                      index === 1
                        ? 'rgba(53, 223, 202, 0.12)'
                        : 'rgba(255,255,255,0.03)',
                    padding: '16px 18px',
                    color: index === 1 ? colors.white : colors.muted,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              border: `1px solid ${colors.border}`,
              background: colors.panel,
              padding: 20,
              display: 'grid',
              gap: 14,
            }}
          >
            {[
              [
                'You',
                'Why did spending jump this month?',
                'rgba(255,255,255,0.03)',
              ],
              [
                'FinanceFlow',
                'Dining rose 18%, and two subscriptions renewed earlier than usual.',
                'rgba(53, 223, 202, 0.12)',
              ],
              [
                'FinanceFlow',
                'Best move: pause one unused plan and cap dining at $140 this week.',
                'rgba(98, 212, 255, 0.1)',
              ],
            ].map(([sender, text, background], index) => (
              <div
                key={text}
                style={{
                  alignSelf: index === 0 ? 'end' : 'start',
                  marginLeft: index === 0 ? 120 : 0,
                  borderRadius: 24,
                  border: `1px solid ${colors.border}`,
                  background,
                  padding: '18px 18px 20px',
                  opacity: interpolate(
                    messageIn,
                    [0, 0.35 + index * 0.18, 1],
                    [0, 1, 1]
                  ),
                  transform: `translateY(${interpolate(messageIn, [0, 1], [26 + index * 6, 0])}px)`,
                }}
              >
                <div style={{ color: colors.muted, fontSize: 14 }}>
                  {sender}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    color: colors.white,
                    fontSize: 24,
                    lineHeight: 1.38,
                    fontWeight: 600,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: 'auto',
                borderRadius: 22,
                border: `1px solid ${colors.border}`,
                background: 'rgba(255,255,255,0.03)',
                padding: '16px 18px',
                color: colors.muted,
                fontSize: 18,
              }}
            >
              Ask a question or jump to a page...
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

export const PowerToolsScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const cardIn = progress(frame, 20, 36)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <BrowserFrame
        title="financeflow.dev/investments"
        width={620}
        height={520}
      >
        <div style={{ display: 'flex', height: 448 }}>
          <Sidebar activeLabel="Investments" />
          <div style={{ flex: 1, padding: 22, display: 'grid', gap: 14 }}>
            <HeaderRow
              caption="Investments"
              title="Keep long-term money in the same flow"
              subtitle="401(k), stocks, crypto, and real-world assets stay visible right next to day-to-day cash."
            />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              <StatCard accent={colors.white} label="Portfolio" value="$84k" />
              <StatCard
                accent={colors.teal}
                label="Monthly added"
                value="$640"
              />
            </div>
            <div
              style={{
                borderRadius: 24,
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                padding: 18,
                display: 'grid',
                gap: 12,
              }}
            >
              {[
                ['401(k)', '44%', colors.teal],
                ['Stocks', '28%', colors.aqua],
                ['Crypto', '8%', colors.gold],
                ['Cash + other', '20%', colors.violet],
              ].map(([label, value, accent], index) => (
                <div
                  key={label}
                  style={{
                    display: 'grid',
                    gap: 8,
                    opacity: interpolate(
                      cardIn,
                      [0, 0.34 + index * 0.12, 1],
                      [0, 1, 1]
                    ),
                  }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
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
                        fontWeight: 700,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                  <div
                    style={{
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
        </div>
      </BrowserFrame>

      <BrowserFrame title="financeflow.dev/invoices" width={620} height={520}>
        <div style={{ display: 'flex', height: 448 }}>
          <Sidebar activeLabel="Invoices" />
          <div style={{ flex: 1, padding: 22, display: 'grid', gap: 14 }}>
            <HeaderRow
              caption="Invoices"
              title="Create, track, and export simple invoices"
              subtitle="For freelancers and side hustles, clean invoice workflows live right inside the finance stack."
            />
            {[
              ['INV-1042', 'Northwind Systems', '$1,200', 'Paid', colors.teal],
              ['INV-1043', 'Studio Cobalt', '$480', 'Sent', colors.aqua],
              ['INV-1044', 'Local Design Co.', '$310', 'Draft', colors.gold],
            ].map(([id, client, amount, status, accent], index) => (
              <div
                key={id}
                style={{
                  borderRadius: 20,
                  border: `1px solid ${colors.border}`,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '16px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: interpolate(
                    cardIn,
                    [0, 0.34 + index * 0.12, 1],
                    [0, 1, 1]
                  ),
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
                    style={{
                      color: colors.white,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {amount}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      color: accent as string,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    </div>
  )
}
