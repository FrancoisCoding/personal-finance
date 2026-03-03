import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
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
const overviewDuration = 180
const transitionOneStartFrame = 330
const transitionDuration = 60
const movementStartFrame = 390
const movementDuration = 180
const transitionTwoStartFrame = 570
const planningStartFrame = 630
const planningDuration = 180
const transitionThreeStartFrame = 810
const assistantStartFrame = 870
const assistantDuration = 180
const transitionFourStartFrame = 1050
const powerStartFrame = 1110
const powerDuration = 180
const finaleStartFrame = 1290
const finaleDuration = 120

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
            subtitle="Track balances, spot trends, plan ahead, and ask better questions in one product that looks alive."
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
            <MetricPill label="Track less manually" accent={colors.teal} />
            <MetricPill label="Notice more earlier" accent={colors.aqua} />
            <MetricPill label="Plan with less friction" accent={colors.gold} />
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
  chips: string[]
  lead: string
  support: string
}> = ({ accent, chips, lead, support }) => {
  const frame = useCurrentFrame()
  const enter = spring({
    frame,
    fps: 30,
    config: {
      damping: 15,
      stiffness: 210,
      mass: 0.78,
    },
  })
  const glowX = interpolate(frame, [0, 60], [220, 1040], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const words = lead.split(' ')

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 120px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '18% 10% 18% 10%',
          borderRadius: 52,
          background: `radial-gradient(circle at ${glowX}px 50%, ${accent}26, transparent 28%), linear-gradient(135deg, rgba(8, 18, 37, 0.92), rgba(5, 11, 23, 0.84))`,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.34)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 180,
          top: 170,
          width: 230,
          height: 100,
          borderRadius: 30,
          border: `1px solid ${accent}33`,
          background: `${accent}12`,
          transform: `translateX(${interpolate(frame, [0, 60], [-120, 0])}px) rotate(-9deg)`,
          opacity: interpolate(frame, [0, 16, 60], [0, 0.56, 0.3], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 180,
          bottom: 154,
          width: 260,
          height: 110,
          borderRadius: 34,
          border: `1px solid ${colors.white}1c`,
          background: 'rgba(255,255,255,0.04)',
          transform: `translateX(${interpolate(frame, [0, 60], [120, 0])}px) rotate(8deg)`,
          opacity: interpolate(frame, [0, 16, 60], [0, 0.42, 0.24], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <div
        style={{
          position: 'relative',
          textAlign: 'center',
          transform: `scale(${interpolate(enter, [0, 1], [0.92, 1])}) translateY(${interpolate(enter, [0, 1], [24, 0])}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: 18,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
          }}
        >
          FinanceFlow
        </div>
        <div
          style={{
            marginTop: 18,
            color: colors.white,
            fontFamily: 'Sora, Manrope, system-ui, sans-serif',
            display: 'flex',
            gap: 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {words.map((word, index) => {
            const wordSpring = spring({
              frame: frame - index * 4,
              fps: 30,
              config: {
                damping: 15,
                stiffness: 240,
                mass: 0.8,
              },
            })

            return (
              <span
                key={`${word}-${index}`}
                style={{
                  display: 'inline-block',
                  fontSize: 86,
                  lineHeight: 0.94,
                  fontWeight: 700,
                  letterSpacing: '-0.065em',
                  transform: `translateY(${interpolate(wordSpring, [0, 1], [40, 0])}px) rotate(${interpolate(
                    wordSpring,
                    [0, 1],
                    [index % 2 === 0 ? -8 : 8, 0]
                  )}deg)`,
                  opacity: wordSpring,
                }}
              >
                {word}
              </span>
            )
          })}
        </div>
        <div
          style={{
            marginTop: 16,
            color: colors.muted,
            fontSize: 28,
            lineHeight: 1.44,
            maxWidth: 760,
          }}
        >
          {support}
        </div>
        <div
          style={{
            marginTop: 26,
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {chips.map((chip, index) => (
            <div
              key={chip}
              style={{
                padding: '12px 16px',
                borderRadius: 999,
                border: `1px solid ${index === 0 ? `${accent}55` : colors.border}`,
                background:
                  index === 0 ? `${accent}18` : 'rgba(255,255,255,0.04)',
                color: colors.white,
                fontSize: 16,
                fontWeight: 700,
                transform: `translateY(${interpolate(
                  frame,
                  [16 + index * 4, 42 + index * 4],
                  [18, 0],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }
                )}px)`,
                opacity: interpolate(
                  frame,
                  [16 + index * 4, 42 + index * 4],
                  [0, 1],
                  {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }
                ),
              }}
            >
              {chip}
            </div>
          ))}
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
          Track less.
          <br />
          Notice more.
        </div>
        <div
          style={{
            marginTop: 18,
            color: colors.muted,
            fontSize: 28,
            lineHeight: 1.48,
            maxWidth: 760,
            marginInline: 'auto',
          }}
        >
          Budgets, subscriptions, AI guidance, investments, invoices, and
          exports in one cleaner flow.
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
          <MetricPill label="Try the demo" accent={colors.aqua} />
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
      <Audio src={staticFile('financeflow-pulse.wav')} volume={0.56} />

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
            subtitle="Overview condenses balances, trends, nudges, and next moves into a surface you can actually scan."
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
          chips={['Merchant clarity', 'Auto-categories', 'Zero guessing']}
          lead="Swipes get stories."
          support="Every transaction lands with context, not a mystery merchant name and a shrug."
        />
      </Sequence>

      <Sequence from={movementStartFrame} durationInFrames={movementDuration}>
        <AbsoluteFill style={{ opacity: movementOpacity }}>
          <SplitScene
            caption="Money movement"
            title={'Readable in.\nReadable out.'}
            subtitle="Accounts stay in sync, transaction history stays legible, and categorization stays fast."
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
          chips={['Renewals', 'Forecasts', 'Gentle warnings']}
          lead="Catch it early."
          support="Budgets, renewals, and soft warnings work better before they become clean-up work."
        />
      </Sequence>

      <Sequence from={planningStartFrame} durationInFrames={planningDuration}>
        <AbsoluteFill style={{ opacity: planningOpacity }}>
          <SplitScene
            caption="Planning"
            title={'Renew less.\nReact less.'}
            subtitle="Subscriptions and category pacing stay in the same loop, so the plan stays honest."
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
          chips={['Ask better', 'See patterns', 'Act faster']}
          lead="Ask sharper."
          support="The assistant turns vague money anxiety into specific next actions grounded in your actual data."
        />
      </Sequence>

      <Sequence from={assistantStartFrame} durationInFrames={assistantDuration}>
        <AbsoluteFill style={{ opacity: assistantOpacity }}>
          <SplitScene
            caption="Assistant"
            title={'Less finance\nfog.'}
            subtitle="Questions sound conversational, but the answers stay precise, calm, and tied to your numbers."
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
          chips={['Investments', 'Invoices', 'Exports']}
          lead="Grow without sprawl."
          support="Investments, invoices, and exports stay inside the same product instead of splitting into more tools."
        />
      </Sequence>

      <Sequence from={powerStartFrame} durationInFrames={powerDuration}>
        <AbsoluteFill style={{ opacity: powerOpacity }}>
          <SplitScene
            caption="Power tools"
            title={'More depth.\nSame calm.'}
            subtitle="When finances get bigger, the product stays coherent instead of sending you somewhere else."
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
