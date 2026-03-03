import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'
import {
  colors,
  GridBackground,
  progress,
  sceneOpacity,
  SectionEyebrow,
} from './shared'
import {
  AccountsTransactionsScreen,
  AssistantScreen,
  DashboardOverviewScreen,
  PowerToolsScreen,
  SubscriptionBudgetScreen,
} from './screens'

const introDuration = 180
const overviewStartFrame = 150
const overviewDuration = 300
const movementStartFrame = 420
const movementDuration = 300
const planningStartFrame = 690
const planningDuration = 300
const assistantStartFrame = 960
const assistantDuration = 330
const toolsStartFrame = 1260
const toolsDuration = 270
const finaleStartFrame = 1500
const finaleDuration = 300

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const heroIn = spring({
    frame,
    fps,
    config: {
      damping: 16,
      stiffness: 120,
      mass: 0.9,
    },
  })

  const screenshotIn = progress(frame, 24, 36)

  return (
    <AbsoluteFill style={{ padding: '72px 86px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.82fr 1.18fr',
          gap: 28,
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div style={{ opacity: heroIn }}>
          <SectionEyebrow label="Playful finance" />
          <div
            style={{
              marginTop: 22,
              color: colors.white,
              fontFamily: 'Sora, Manrope, system-ui, sans-serif',
              fontSize: 90,
              fontWeight: 700,
              lineHeight: 0.96,
              letterSpacing: '-0.06em',
            }}
          >
            Your money,
            <br />
            finally in one
            <br />
            good-looking place.
          </div>
          <div
            style={{
              marginTop: 24,
              color: colors.muted,
              fontSize: 28,
              lineHeight: 1.45,
              maxWidth: 500,
            }}
          >
            FinanceFlow turns budgets, subscriptions, AI guidance, invoices, and
            investments into one calm product experience.
          </div>
          <div
            style={{
              display: 'flex',
              gap: 14,
              marginTop: 28,
              flexWrap: 'wrap',
            }}
          >
            {['Track cash', 'Plan smarter', 'Ask AI', 'Stay ahead'].map(
              (label, index) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${index === 2 ? 'rgba(53,223,202,0.42)' : colors.border}`,
                    background:
                      index === 2
                        ? 'rgba(53,223,202,0.12)'
                        : 'rgba(255,255,255,0.03)',
                    padding: '14px 18px',
                    color: index === 2 ? colors.white : colors.muted,
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              )
            )}
          </div>
        </div>

        <div
          style={{
            transform: `translateY(${interpolate(screenshotIn, [0, 1], [40, 0])}px) rotate(${interpolate(
              screenshotIn,
              [0, 1],
              [2.2, 0]
            )}deg) scale(${interpolate(screenshotIn, [0, 1], [0.96, 1])})`,
            opacity: screenshotIn,
          }}
        >
          <DashboardOverviewScreen frame={frame + 40} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const OverviewScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - overviewStartFrame
  const opacity = sceneOpacity(frame, overviewStartFrame, overviewDuration)
  const scale = interpolate(localFrame, [0, overviewDuration], [0.96, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        padding: '54px 68px',
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <DashboardOverviewScreen frame={localFrame} />
    </AbsoluteFill>
  )
}

const MovementScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - movementStartFrame
  const opacity = sceneOpacity(frame, movementStartFrame, movementDuration)

  return (
    <AbsoluteFill style={{ padding: '72px 72px', opacity }}>
      <div style={{ marginBottom: 26 }}>
        <SectionEyebrow label="Money movement" />
      </div>
      <div
        style={{
          color: colors.white,
          fontFamily: 'Sora, Manrope, system-ui, sans-serif',
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 0.98,
          letterSpacing: '-0.05em',
          maxWidth: 860,
        }}
      >
        Accounts stay synced.
        <br />
        Transactions stay readable.
      </div>
      <div
        style={{
          marginTop: 16,
          color: colors.muted,
          fontSize: 26,
          lineHeight: 1.45,
          maxWidth: 760,
        }}
      >
        No spreadsheet juggling. No mystery charges without context. Just one
        clean workflow from balance to category.
      </div>
      <div
        style={{
          marginTop: 34,
          transform: `translateY(${interpolate(localFrame, [0, 30], [28, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px)`,
        }}
      >
        <AccountsTransactionsScreen frame={localFrame} />
      </div>
    </AbsoluteFill>
  )
}

const PlanningScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - planningStartFrame
  const opacity = sceneOpacity(frame, planningStartFrame, planningDuration)

  return (
    <AbsoluteFill style={{ padding: '70px 72px', opacity }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.58fr 1.42fr',
          gap: 28,
          alignItems: 'start',
        }}
      >
        <div style={{ paddingTop: 20 }}>
          <SectionEyebrow label="Planning" />
          <div
            style={{
              marginTop: 22,
              color: colors.white,
              fontFamily: 'Sora, Manrope, system-ui, sans-serif',
              fontSize: 64,
              lineHeight: 0.98,
              fontWeight: 700,
              letterSpacing: '-0.05em',
            }}
          >
            Renewals,
            <br />
            budgets, and
            <br />
            gentle warnings.
          </div>
          <div
            style={{
              marginTop: 18,
              color: colors.muted,
              fontSize: 24,
              lineHeight: 1.48,
            }}
          >
            FinanceFlow nudges you before money gets messy.
          </div>
        </div>
        <div>
          <SubscriptionBudgetScreen frame={localFrame} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const AssistantScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - assistantStartFrame
  const opacity = sceneOpacity(frame, assistantStartFrame, assistantDuration)

  return (
    <AbsoluteFill style={{ padding: '72px 72px', opacity }}>
      <div style={{ marginBottom: 24 }}>
        <SectionEyebrow label="Assistant" />
      </div>
      <div
        style={{
          color: colors.white,
          fontFamily: 'Sora, Manrope, system-ui, sans-serif',
          fontSize: 70,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          maxWidth: 920,
        }}
      >
        Ask a better money question.
        <br />
        Get a calmer answer.
      </div>
      <div
        style={{
          marginTop: 18,
          color: colors.muted,
          fontSize: 26,
          lineHeight: 1.45,
          maxWidth: 760,
        }}
      >
        It feels like chatting, but the guidance stays grounded in your budgets,
        cash flow, and actual behavior.
      </div>
      <div style={{ marginTop: 28 }}>
        <AssistantScreen frame={localFrame} />
      </div>
    </AbsoluteFill>
  )
}

const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - toolsStartFrame
  const opacity = sceneOpacity(frame, toolsStartFrame, toolsDuration)

  return (
    <AbsoluteFill style={{ padding: '72px 72px', opacity }}>
      <div style={{ marginBottom: 24 }}>
        <SectionEyebrow label="Power tools" />
      </div>
      <div
        style={{
          color: colors.white,
          fontFamily: 'Sora, Manrope, system-ui, sans-serif',
          fontSize: 66,
          lineHeight: 0.98,
          fontWeight: 700,
          letterSpacing: '-0.05em',
          maxWidth: 900,
        }}
      >
        When life gets bigger,
        <br />
        the product grows with it.
      </div>
      <div
        style={{
          marginTop: 18,
          color: colors.muted,
          fontSize: 24,
          lineHeight: 1.46,
          maxWidth: 760,
        }}
      >
        Investments, invoices, and richer reporting live inside the same
        experience instead of splintering into ten other tools.
      </div>
      <div style={{ marginTop: 30 }}>
        <PowerToolsScreen frame={localFrame} />
      </div>
    </AbsoluteFill>
  )
}

const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame()
  const localFrame = frame - finaleStartFrame
  const opacity = sceneOpacity(frame, finaleStartFrame, finaleDuration)

  return (
    <AbsoluteFill
      style={{
        padding: '82px 90px',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          width: 1180,
          borderRadius: 42,
          border: `1px solid ${colors.border}`,
          background:
            'linear-gradient(180deg, rgba(7,17,31,0.95), rgba(4,12,24,0.97))',
          boxShadow: '0 34px 96px rgba(0,0,0,0.48)',
          padding: '46px 54px 54px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${interpolate(localFrame, [0, 30], [0.94, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })})`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 20% 20%, rgba(53,223,202,0.12), transparent 28%), radial-gradient(circle at 80% 30%, rgba(98,212,255,0.1), transparent 26%), radial-gradient(circle at 50% 88%, rgba(248,189,83,0.08), transparent 22%)',
          }}
        />
        <div style={{ position: 'relative' }}>
          <SectionEyebrow label="FinanceFlow" />
          <div
            style={{
              marginTop: 26,
              color: colors.white,
              fontFamily: 'Sora, Manrope, system-ui, sans-serif',
              fontSize: 74,
              lineHeight: 0.98,
              fontWeight: 700,
              letterSpacing: '-0.05em',
            }}
          >
            Finance that feels
            <br />
            playful, clear, and finally connected.
          </div>
          <div
            style={{
              marginTop: 20,
              color: colors.muted,
              fontSize: 28,
              lineHeight: 1.48,
              maxWidth: 840,
              marginInline: 'auto',
            }}
          >
            Budgets, subscriptions, AI guidance, investments, invoices, and
            exports. One product, one flow, and far less chaos.
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
              ['Start free', colors.white],
              ['Try demo', colors.gold],
              ['Go Pro', colors.teal],
            ].map(([label, color], index) => (
              <div
                key={label}
                style={{
                  borderRadius: 999,
                  padding: '16px 24px',
                  border: `1px solid ${color}44`,
                  background:
                    index === 2
                      ? 'rgba(53,223,202,0.14)'
                      : 'rgba(255,255,255,0.04)',
                  color,
                  fontSize: 22,
                  fontWeight: 700,
                  transform: `translateY(${interpolate(
                    localFrame,
                    [26 + index * 4, 52 + index * 4],
                    [20, 0],
                    {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }
                  )}px)`,
                  opacity: interpolate(
                    localFrame,
                    [22 + index * 4, 48 + index * 4],
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
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            financeflow.dev
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const FinanceFlowMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame()
  const introOpacity = sceneOpacity(frame, 0, introDuration)

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: colors.white,
        background: colors.background,
      }}
    >
      <GridBackground />

      <Sequence from={0} durationInFrames={introDuration}>
        <AbsoluteFill style={{ opacity: introOpacity }}>
          <IntroScene />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={overviewStartFrame} durationInFrames={overviewDuration}>
        <OverviewScene />
      </Sequence>

      <Sequence from={movementStartFrame} durationInFrames={movementDuration}>
        <MovementScene />
      </Sequence>

      <Sequence from={planningStartFrame} durationInFrames={planningDuration}>
        <PlanningScene />
      </Sequence>

      <Sequence from={assistantStartFrame} durationInFrames={assistantDuration}>
        <AssistantScene />
      </Sequence>

      <Sequence from={toolsStartFrame} durationInFrames={toolsDuration}>
        <ToolsScene />
      </Sequence>

      <Sequence from={finaleStartFrame} durationInFrames={finaleDuration}>
        <FinaleScene />
      </Sequence>
    </AbsoluteFill>
  )
}
