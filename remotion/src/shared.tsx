import React from 'react'
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export const colors = {
  background: '#040816',
  backgroundElevated: '#071225',
  panel: 'rgba(8, 18, 37, 0.84)',
  panelStrong: 'rgba(10, 22, 42, 0.94)',
  border: 'rgba(124, 156, 210, 0.18)',
  white: '#f8fbff',
  muted: '#9aa9c4',
  teal: '#4cf0d7',
  aqua: '#68c6ff',
  lime: '#baff74',
  gold: '#ffc261',
  coral: '#ff8f73',
  violet: '#b196ff',
  danger: '#ff6b86',
  ink: '#03101d',
} as const

export const progress = (
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
      easing: Easing.out(Easing.cubic),
    }
  )
}

export const sceneOpacity = (
  frame: number,
  startFrame: number,
  durationInFrames: number
) => {
  const fadeIn = interpolate(frame, [startFrame, startFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = interpolate(
    frame,
    [startFrame + durationInFrames - 14, startFrame + durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  return fadeIn * fadeOut
}

export const SectionEyebrow: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 999,
        padding: '12px 20px',
        minHeight: 46,
        whiteSpace: 'nowrap',
        width: 'fit-content',
        color: colors.white,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${colors.border}`,
        fontSize: 15,
        fontWeight: 800,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: colors.teal,
          boxShadow: '0 0 24px rgba(76, 240, 215, 0.85)',
        }}
      />
      {label}
    </div>
  )
}

export const StageBackground: React.FC = () => {
  const frame = useCurrentFrame()
  const { durationInFrames, height } = useVideoConfig()
  const horizonShift = interpolate(frame, [0, durationInFrames], [-60, 60])
  const ribbonOne = interpolate(frame, [0, durationInFrames], [-220, 160])
  const ribbonTwo = interpolate(frame, [0, durationInFrames], [160, -200])
  const ribbonThree = interpolate(frame, [0, durationInFrames], [40, -120])

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, #040714 0%, #071224 48%, #030712 100%)',
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 16% 16%, rgba(104, 198, 255, 0.22), transparent 24%),
            radial-gradient(circle at 78% 18%, rgba(177, 150, 255, 0.18), transparent 22%),
            radial-gradient(circle at 52% 72%, rgba(255, 194, 97, 0.11), transparent 24%),
            radial-gradient(circle at 26% 84%, rgba(76, 240, 215, 0.12), transparent 24%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-12% -6% auto -12%',
          height: height * 0.68,
          transform: `translateY(${ribbonOne}px) rotate(-10deg)`,
          background:
            'linear-gradient(90deg, rgba(76, 240, 215, 0), rgba(76, 240, 215, 0.17), rgba(104, 198, 255, 0))',
          filter: 'blur(32px)',
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '22% -18% auto 22%',
          height: height * 0.5,
          transform: `translateY(${ribbonTwo}px) rotate(18deg)`,
          background:
            'linear-gradient(90deg, rgba(177, 150, 255, 0), rgba(177, 150, 255, 0.18), rgba(255, 194, 97, 0))',
          filter: 'blur(36px)',
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -140,
          right: -140,
          top: height * 0.54,
          height: height * 0.26,
          transform: `translateY(${ribbonThree}px) rotate(-6deg)`,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.08), rgba(255,255,255,0))',
          filter: 'blur(28px)',
          opacity: 0.52,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -140,
          right: -140,
          bottom: -220,
          height: 420,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 0%, rgba(104, 198, 255, 0.16), rgba(5, 12, 24, 0.02) 60%, transparent 75%)',
          transform: `translateY(${horizonShift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          maskImage:
            'linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.24) 60%, transparent 100%)',
          opacity: 0.32,
        }}
      />
      {Array.from({ length: 26 }).map((_, index) => {
        const size = index % 3 === 0 ? 3 : 2
        const left = ((index * 37) % 96) + 1
        const top = ((index * 23) % 88) + 2
        const opacity = 0.12 + ((index * 7) % 11) * 0.018
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: 999,
              background: colors.white,
              opacity,
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}

export const FloatingPanel: React.FC<{
  children: React.ReactNode
  className?: string
  padding?: number
  rotate?: number
  style?: React.CSSProperties
}> = ({ children, padding = 20, rotate = 0, style }) => {
  return (
    <div
      style={{
        borderRadius: 30,
        border: `1px solid ${colors.border}`,
        background:
          'linear-gradient(180deg, rgba(10, 22, 42, 0.94), rgba(7, 17, 34, 0.88))',
        boxShadow:
          '0 28px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)',
        padding,
        transform: `rotate(${rotate}deg)`,
        backdropFilter: 'blur(18px)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export const HeaderLockup: React.FC<{
  caption: string
  title: string
  subtitle: string
  maxWidth?: number
}> = ({ caption, title, subtitle, maxWidth = 520 }) => {
  const titleLines = title.split('\n')

  return (
    <div style={{ maxWidth }}>
      <SectionEyebrow label={caption} />
      <div
        style={{
          marginTop: 24,
          color: colors.white,
          fontFamily: 'Sora, Manrope, system-ui, sans-serif',
          fontSize: 76,
          lineHeight: 0.94,
          fontWeight: 700,
          letterSpacing: '-0.06em',
        }}
      >
        {titleLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <div
        style={{
          marginTop: 18,
          color: colors.muted,
          fontSize: 22,
          lineHeight: 1.46,
          maxWidth,
        }}
      >
        {subtitle}
      </div>
    </div>
  )
}

export const StatCard: React.FC<{
  accent: string
  label: string
  value: string
  detail?: string
}> = ({ accent, label, value, detail }) => {
  return (
    <FloatingPanel
      padding={18}
      style={{
        minHeight: 130,
        background:
          'linear-gradient(180deg, rgba(10, 22, 42, 0.92), rgba(8, 16, 31, 0.86))',
      }}
    >
      <div style={{ color: colors.muted, fontSize: 14, fontWeight: 700 }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 12,
          color: accent,
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: '-0.05em',
        }}
      >
        {value}
      </div>
      {detail ? (
        <div
          style={{
            marginTop: 10,
            color: colors.muted,
            fontSize: 15,
            lineHeight: 1.4,
          }}
        >
          {detail}
        </div>
      ) : null}
    </FloatingPanel>
  )
}

export const MetricPill: React.FC<{
  label: string
  accent: string
}> = ({ label, accent }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        minHeight: 46,
        borderRadius: 999,
        border: `1px solid ${accent}55`,
        background: `${accent}18`,
        color: colors.white,
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        width: 'fit-content',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 20px ${accent}`,
        }}
      />
      {label}
    </div>
  )
}

export const TrendBars: React.FC<{ progressValue: number }> = ({
  progressValue,
}) => {
  const values = [0.36, 0.44, 0.4, 0.7, 0.62, 0.85, 0.78]
  return (
    <div
      style={{
        height: 170,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      {values.map((value, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            borderRadius: 16,
            height: `${interpolate(progressValue, [0, 1], [12, value * 152])}px`,
            background:
              index > 4
                ? 'linear-gradient(180deg, rgba(76,240,215,0.14), rgba(76,240,215,1))'
                : 'linear-gradient(180deg, rgba(104,198,255,0.12), rgba(104,198,255,0.85))',
            boxShadow:
              index > 4
                ? '0 0 22px rgba(76,240,215,0.24)'
                : '0 0 20px rgba(104,198,255,0.18)',
          }}
        />
      ))}
    </div>
  )
}

export const Donut: React.FC<{
  accent: string
  label: string
  progressValue: number
  value: string
}> = ({ accent, label, progressValue, value }) => {
  const strokeOffset = interpolate(progressValue, [0, 1], [218, 78])
  return (
    <svg width="188" height="188" viewBox="0 0 188 188">
      <circle
        cx="94"
        cy="94"
        r="70"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="20"
        fill="none"
      />
      <circle
        cx="94"
        cy="94"
        r="70"
        stroke={accent}
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="440"
        strokeDashoffset={strokeOffset}
        transform="rotate(-90 94 94)"
      />
      <text
        x="94"
        y="88"
        textAnchor="middle"
        fill={colors.white}
        style={{ fontSize: 34, fontWeight: 800 }}
      >
        {value}
      </text>
      <text
        x="94"
        y="116"
        textAnchor="middle"
        fill={colors.muted}
        style={{
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </text>
    </svg>
  )
}

export const AnimatedHeadline: React.FC<{
  frame: number
  lines: string[]
  accent?: string
}> = ({ frame, lines, accent = colors.white }) => {
  const { fps } = useVideoConfig()

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {lines.map((line, index) => {
        const lineSpring = spring({
          fps,
          frame: frame - index * 4,
          config: {
            damping: 17,
            stiffness: 190,
            mass: 0.8,
          },
        })
        return (
          <div
            key={line}
            style={{
              color: index === lines.length - 1 ? accent : colors.white,
              fontFamily: 'Sora, Manrope, system-ui, sans-serif',
              fontSize: 82,
              lineHeight: 0.93,
              fontWeight: 700,
              letterSpacing: '-0.065em',
              transform: `translateY(${interpolate(lineSpring, [0, 1], [36, 0])}px)`,
              opacity: lineSpring,
            }}
          >
            {line}
          </div>
        )
      })}
    </div>
  )
}
