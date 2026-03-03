import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
} from 'remotion'

import {
  AnimatedHeadline,
  colors,
  HeaderLockup,
  MetricPill,
  sceneOpacity,
  StageBackground,
} from './shared'
import {
  AssistantCluster,
  IntroMosaic,
  MoneyMovementCluster,
  OverviewCluster,
  PlanningCluster,
  PowerToolsCluster,
} from './screens'

const introStartFrame = 0
const introDuration = 150
const overviewStartFrame = 150
const overviewDuration = 168
const transitionOneStartFrame = 318
const transitionDuration = 84
const movementStartFrame = 402
const movementDuration = 168
const transitionTwoStartFrame = 570
const planningStartFrame = 654
const planningDuration = 168
const transitionThreeStartFrame = 822
const assistantStartFrame = 906
const assistantDuration = 168
const transitionFourStartFrame = 1074
const powerStartFrame = 1158
const powerDuration = 168
const finaleStartFrame = 1326
const finaleDuration = 150

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame()
  const heroIn = spring({
    frame,
    fps: 30,
    config: {
      damping: 18,
      stiffness: 180,
      mass: 0.85,
    },
  })

  return (
    <AbsoluteFill style={{ padding: '70px 74px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.9fr 1.1fr',
          gap: 34,
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div style={{ opacity: heroIn }}>
          <HeaderLockup
            caption="FinanceFlow"
            title={'Money, without\nthe mess.'}
            subtitle="See every balance, catch overspending sooner, and make calmer money moves from one clear home for your finances."
            maxWidth={520}
          />
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <MetricPill label="Balances in one view" accent={colors.teal} />
            <MetricPill label="Spot issues sooner" accent={colors.aqua} />
            <MetricPill label="Plan without chaos" accent={colors.gold} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IntroMosaic frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const SplitScene: React.FC<{
  caption: string
  title: string
  subtitle: string
  sceneFrame: number
  visual: React.ReactNode
}> = ({ caption, title, subtitle, sceneFrame, visual }) => {
  return (
    <AbsoluteFill style={{ padding: '70px 74px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.74fr 1.26fr',
          gap: 28,
          alignItems: 'center',
          height: '100%',
        }}
      >
        <div>
          <AnimatedHeadline
            frame={sceneFrame}
            lines={title.split('\n')}
            accent={colors.teal}
          />
          <div
            style={{
              marginTop: 18,
              display: 'inline-block',
            }}
          >
            <MetricPill label={caption} accent={colors.white} />
          </div>
          <div
            style={{
              marginTop: 18,
              color: colors.muted,
              fontSize: 24,
              lineHeight: 1.5,
              maxWidth: 420,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {visual}
        </div>
      </div>
    </AbsoluteFill>
  )
}

const TransitionPunch: React.FC<{
  accent: string
  lead: string
  support: string
}> = ({ accent, lead, support }) => {
  const frame = useCurrentFrame()
  const enter = spring({
    frame,
    fps: 30,
    config: {
      damping: 17,
      stiffness: 190,
      mass: 0.86,
    },
  })
  const glowX = interpolate(frame, [0, transitionDuration], [160, 1120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const lines = lead.split('\n')

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 112px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '16% 8% 16% 8%',
          borderRadius: 58,
          background: `radial-gradient(circle at ${glowX}px 50%, ${accent}30, transparent 26%), linear-gradient(135deg, rgba(8, 18, 37, 0.92), rgba(5, 11, 23, 0.84))`,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.34)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 132,
          right: 132,
          top: '50%',
          height: 28,
          borderRadius: 999,
          transform: `translateY(${interpolate(frame, [0, transitionDuration], [42, 126])}px) scaleX(${interpolate(
            frame,
            [0, 24, transitionDuration],
            [0.16, 1, 1.04],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          )})`,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          filter: 'blur(14px)',
          opacity: interpolate(
            frame,
            [0, 18, 68, transitionDuration],
            [0, 0.95, 0.7, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          ),
        }}
      />
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])}) translateY(${interpolate(enter, [0, 1], [32, 0])}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 17,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
          }}
        >
          FinanceFlow
        </div>
        <div
          style={{
            marginTop: 22,
            color: colors.white,
            fontFamily: 'Sora, Manrope, system-ui, sans-serif',
            display: 'grid',
            gap: 0,
          }}
        >
          {lines.map((line, index) => {
            const lineSpring = spring({
              frame: frame - index * 6,
              fps: 30,
              config: {
                damping: 15,
                stiffness: 220,
                mass: 0.9,
              },
            })

            return (
              <div
                key={`${line}-${index}`}
                style={{
                  fontSize: 122,
                  lineHeight: 0.9,
                  fontWeight: 700,
                  letterSpacing: '-0.065em',
                  transform: `translateY(${interpolate(lineSpring, [0, 1], [40, 0])}px) rotate(${interpolate(
                    lineSpring,
                    [0, 1],
                    [index % 2 === 0 ? -8 : 8, 0]
                  )}deg)`,
                  opacity: lineSpring,
                }}
              >
                {line}
              </div>
            )
          })}
        </div>
        <div
          style={{
            marginTop: 18,
            color: colors.muted,
            fontSize: 21,
            lineHeight: 1.45,
            maxWidth: 620,
            marginInline: 'auto',
          }}
        >
          {support}
        </div>
      </div>
    </AbsoluteFill>
  )
}

const FinaleScene: React.FC = () => {
  const frame = useCurrentFrame()
  const inSpring = spring({
    frame,
    fps: 30,
    config: {
      damping: 16,
      stiffness: 190,
      mass: 0.82,
    },
  })

  return (
    <AbsoluteFill
      style={{
        padding: '88px 84px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 1140,
          borderRadius: 44,
          border: `1px solid ${colors.border}`,
          background:
            'linear-gradient(180deg, rgba(8, 20, 38, 0.95), rgba(5, 12, 24, 0.95))',
          boxShadow: '0 30px 90px rgba(0,0,0,0.36)',
          padding: '46px 52px 54px',
          transform: `translateY(${interpolate(inSpring, [0, 1], [36, 0])}px) scale(${interpolate(
            inSpring,
            [0, 1],
            [0.94, 1]
          )})`,
          opacity: inSpring,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            color: colors.teal,
            fontSize: 18,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
          }}
        >
          FinanceFlow
        </div>
        <div
          style={{
            marginTop: 22,
            color: colors.white,
            fontFamily: 'Sora, Manrope, system-ui, sans-serif',
            fontSize: 82,
            lineHeight: 0.94,
            fontWeight: 700,
            letterSpacing: '-0.065em',
          }}
        >
          Know where
          <br />
          you stand.
        </div>
        <div
          style={{
            marginTop: 18,
            color: colors.teal,
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Move with clarity.
        </div>
        <div
          style={{
            marginTop: 14,
            color: colors.muted,
            fontSize: 24,
            lineHeight: 1.5,
            maxWidth: 720,
            marginInline: 'auto',
          }}
        >
          FinanceFlow keeps balances, spending, planning, and guidance in one
          calm system, so the next money move stays obvious.
        </div>
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <MetricPill label="Start free" accent={colors.teal} />
          <MetricPill label="See the demo" accent={colors.aqua} />
          <MetricPill label="financeflow.dev" accent={colors.gold} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const FinanceFlowMarketingVideo: React.FC = () => {
  const frame = useCurrentFrame()
  const introOpacity = sceneOpacity(frame, introStartFrame, introDuration)
  const overviewOpacity = sceneOpacity(
    frame,
    overviewStartFrame,
    overviewDuration
  )
  const movementOpacity = sceneOpacity(
    frame,
    movementStartFrame,
    movementDuration
  )
  const planningOpacity = sceneOpacity(
    frame,
    planningStartFrame,
    planningDuration
  )
  const assistantOpacity = sceneOpacity(
    frame,
    assistantStartFrame,
    assistantDuration
  )
  const powerOpacity = sceneOpacity(frame, powerStartFrame, powerDuration)
  const finaleOpacity = sceneOpacity(frame, finaleStartFrame, finaleDuration)

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Manrope, system-ui, sans-serif',
        color: colors.white,
        background: colors.background,
      }}
    >
      <StageBackground />

      <Sequence from={introStartFrame} durationInFrames={introDuration}>
        <AbsoluteFill style={{ opacity: introOpacity }}>
          <IntroScene />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={overviewStartFrame} durationInFrames={overviewDuration}>
        <AbsoluteFill style={{ opacity: overviewOpacity }}>
          <SplitScene
            caption="At a glance"
            title={'The signal.\nNot the clutter.'}
            subtitle="See balances, trends, nudges, and the next move in one surface that stays easy to scan."
            sceneFrame={frame - overviewStartFrame}
            visual={<OverviewCluster frame={frame - overviewStartFrame} />}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        from={transitionOneStartFrame}
        durationInFrames={transitionDuration}
      >
        <TransitionPunch
          accent={colors.gold}
          lead={'Know\nevery swipe.'}
          support="Transactions stop looking like noise."
        />
      </Sequence>

      <Sequence from={movementStartFrame} durationInFrames={movementDuration}>
        <AbsoluteFill style={{ opacity: movementOpacity }}>
          <SplitScene
            caption="Money movement"
            title={'Readable in.\nReadable out.'}
            subtitle="Every inflow and outflow lands with merchant, category, and account context that is easy to trust."
            sceneFrame={frame - movementStartFrame}
            visual={<MoneyMovementCluster frame={frame - movementStartFrame} />}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        from={transitionTwoStartFrame}
        durationInFrames={transitionDuration}
      >
        <TransitionPunch
          accent={colors.teal}
          lead={'Catch it\nbefore it grows.'}
          support="Budgets and renewals stay ahead of the month."
        />
      </Sequence>

      <Sequence from={planningStartFrame} durationInFrames={planningDuration}>
        <AbsoluteFill style={{ opacity: planningOpacity }}>
          <SplitScene
            caption="Planning"
            title={'Renew less.\nReact less.'}
            subtitle="Stay ahead of renewals and spending pace before they turn into cleanup."
            sceneFrame={frame - planningStartFrame}
            visual={<PlanningCluster frame={frame - planningStartFrame} />}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        from={transitionThreeStartFrame}
        durationInFrames={transitionDuration}
      >
        <TransitionPunch
          accent={colors.aqua}
          lead={'Ask what\nyour money needs.'}
          support="AI guidance turns vague money stress into specific next steps."
        />
      </Sequence>

      <Sequence from={assistantStartFrame} durationInFrames={assistantDuration}>
        <AbsoluteFill style={{ opacity: assistantOpacity }}>
          <SplitScene
            caption="Assistant"
            title={'Less finance\nfog.'}
            subtitle="Ask plain-English questions and get calm answers grounded in your actual numbers."
            sceneFrame={frame - assistantStartFrame}
            visual={<AssistantCluster frame={frame - assistantStartFrame} />}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence
        from={transitionFourStartFrame}
        durationInFrames={transitionDuration}
      >
        <TransitionPunch
          accent={colors.violet}
          lead={'Grow deeper.\nStay calm.'}
          support="Investments, invoices, and exports stay in the same flow."
        />
      </Sequence>

      <Sequence from={powerStartFrame} durationInFrames={powerDuration}>
        <AbsoluteFill style={{ opacity: powerOpacity }}>
          <SplitScene
            caption="Power tools"
            title={'More depth.\nSame calm.'}
            subtitle="When finances get deeper, the product stays coherent instead of sending you into more tools."
            sceneFrame={frame - powerStartFrame}
            visual={<PowerToolsCluster frame={frame - powerStartFrame} />}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={finaleStartFrame} durationInFrames={finaleDuration}>
        <AbsoluteFill style={{ opacity: finaleOpacity }}>
          <FinaleScene />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  )
}
