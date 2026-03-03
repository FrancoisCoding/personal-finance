import React from 'react'
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export const colors = {
  background: '#030712',
  panel: 'rgba(7, 17, 31, 0.88)',
  border: 'rgba(112, 146, 198, 0.2)',
  white: '#f8fafc',
  muted: '#9fb0c8',
  teal: '#35dfca',
  aqua: '#62d4ff',
  lime: '#9effb7',
  gold: '#f8bd53',
  coral: '#ff7d62',
  violet: '#a98cff',
  danger: '#ff6b81',
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
  const fadeIn = interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeOut = interpolate(
    frame,
    [startFrame + durationInFrames - 24, startFrame + durationInFrames],
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
        border: `1px solid ${colors.border}`,
        background: 'rgba(6, 15, 28, 0.7)',
        padding: '12px 18px',
        color: colors.teal,
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: colors.teal,
          boxShadow: '0 0 20px rgba(53, 223, 202, 0.7)',
        }}
      />
      {label}
    </div>
  )
}

export const GridBackground: React.FC = () => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()

  const mainGlowX = interpolate(frame, [0, 1800], [width * 0.18, width * 0.82])
  const mainGlowY = interpolate(frame, [0, 1800], [height * 0.2, height * 0.72])
  const secondaryGlowX = interpolate(
    frame,
    [0, 1800],
    [width * 0.78, width * 0.28]
  )
  const secondaryGlowY = interpolate(
    frame,
    [0, 1800],
    [height * 0.18, height * 0.74]
  )

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${mainGlowX}px ${mainGlowY}px, rgba(53, 223, 202, 0.14), transparent 24%),
          radial-gradient(circle at ${secondaryGlowX}px ${secondaryGlowY}px, rgba(98, 212, 255, 0.11), transparent 22%),
          radial-gradient(circle at 18% 82%, rgba(248, 189, 83, 0.09), transparent 18%),
          linear-gradient(135deg, #01040b 0%, #06101c 48%, #020711 100%)`,
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(88, 118, 167, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 118, 167, 0.12) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          opacity: 0.42,
        }}
      />
      {Array.from({ length: 28 }).map((_, index) => {
        const left = 4 + ((index * 13) % 90)
        const top = 6 + ((index * 17) % 86)
        const drift = interpolate(
          (frame + index * 9) % 240,
          [0, 239],
          [-18, 18]
        )
        const scale = interpolate(
          (frame + index * 11) % 180,
          [0, 90, 179],
          [0.8, 1.2, 0.8]
        )
        const color =
          index % 4 === 0
            ? colors.teal
            : index % 4 === 1
              ? colors.aqua
              : index % 4 === 2
                ? colors.gold
                : colors.violet

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: index % 5 === 0 ? 12 : 8,
              height: index % 5 === 0 ? 12 : 8,
              borderRadius: 999,
              background: color,
              boxShadow: `0 0 28px ${color}40`,
              opacity: 0.38,
              transform: `translateY(${drift}px) scale(${scale})`,
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}

export const BrowserFrame: React.FC<{
  children: React.ReactNode
  height?: number
  title?: string
  width?: number
}> = ({ children, height = 580, title = 'FinanceFlow', width = 1040 }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 34,
        border: `1px solid ${colors.border}`,
        background:
          'linear-gradient(180deg, rgba(9, 20, 37, 0.98), rgba(4, 12, 24, 0.98))',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.42)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 72,
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {['#ff6b81', '#f8bd53', '#35dfca'].map((color) => (
            <span
              key={color}
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: color,
              }}
            />
          ))}
        </div>
        <div
          style={{
            width: 380,
            height: 40,
            borderRadius: 999,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.muted,
            fontSize: 16,
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          {title}
        </div>
        <div style={{ color: colors.muted, fontSize: 16 }}>
          Live product preview
        </div>
      </div>
      {children}
    </div>
  )
}

export const Sidebar: React.FC<{ activeLabel: string }> = ({ activeLabel }) => {
  const items = [
    'Overview',
    'Accounts',
    'Transactions',
    'Subscriptions',
    'Budgets',
    'Financial Assistant',
    'Investments',
    'Invoices',
    'Billing',
  ]

  return (
    <div
      style={{
        width: 230,
        borderRight: `1px solid ${colors.border}`,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background:
          'linear-gradient(180deg, rgba(6, 15, 28, 0.9), rgba(4, 11, 22, 0.96))',
      }}
    >
      <div
        style={{
          borderRadius: 22,
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ color: colors.white, fontSize: 24, fontWeight: 700 }}>
          FinanceFlow
        </div>
        <div style={{ marginTop: 6, color: colors.muted, fontSize: 15 }}>
          Smart finance
        </div>
      </div>
      {items.map((item) => {
        const isActive = item === activeLabel
        return (
          <div
            key={item}
            style={{
              borderRadius: 16,
              padding: '14px 16px',
              background: isActive ? 'rgba(53, 223, 202, 0.12)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(53, 223, 202, 0.32)' : 'transparent'}`,
              color: isActive ? colors.white : colors.muted,
              fontSize: 17,
              fontWeight: 600,
            }}
          >
            {item}
          </div>
        )
      })}
      <div
        style={{
          marginTop: 'auto',
          borderRadius: 18,
          padding: '16px 18px',
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${colors.border}`,
          color: colors.muted,
          fontSize: 15,
          lineHeight: 1.4,
        }}
      >
        Demo mode keeps the tour playful while the product stays readable.
      </div>
    </div>
  )
}

export const HeaderRow: React.FC<{
  caption: string
  title: string
  subtitle: string
}> = ({ caption, title, subtitle }) => {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          color: colors.teal,
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {caption}
      </div>
      <div
        style={{
          marginTop: 10,
          color: colors.white,
          fontSize: 34,
          fontWeight: 700,
          lineHeight: 1.06,
          letterSpacing: '-0.04em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 8,
          color: colors.muted,
          fontSize: 18,
          lineHeight: 1.45,
          maxWidth: 560,
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
}> = ({ accent, label, value }) => {
  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid ${colors.border}`,
        background: 'rgba(255,255,255,0.03)',
        padding: '18px 20px',
      }}
    >
      <div style={{ color: colors.muted, fontSize: 15 }}>{label}</div>
      <div
        style={{
          marginTop: 10,
          color: accent,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        {value}
      </div>
    </div>
  )
}

export const TrendBars: React.FC<{ progressValue: number }> = ({
  progressValue,
}) => {
  const values = [0.32, 0.48, 0.41, 0.68, 0.61, 0.83, 0.72]
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
            height: `${interpolate(progressValue, [0, 1], [16, value * 150])}px`,
            background:
              index > 4
                ? 'linear-gradient(180deg, rgba(53,223,202,0.18), rgba(53,223,202,1))'
                : 'linear-gradient(180deg, rgba(98,212,255,0.12), rgba(98,212,255,0.82))',
          }}
        />
      ))}
    </div>
  )
}

export const Donut: React.FC<{ progressValue: number }> = ({
  progressValue,
}) => {
  const strokeOffset = interpolate(progressValue, [0, 1], [196, 52])
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle
        cx="90"
        cy="90"
        r="62"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="20"
        fill="none"
      />
      <circle
        cx="90"
        cy="90"
        r="62"
        stroke={colors.teal}
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="390"
        strokeDashoffset={strokeOffset}
        transform="rotate(-90 90 90)"
      />
      <text
        x="90"
        y="82"
        textAnchor="middle"
        fill={colors.white}
        style={{ fontSize: 34, fontWeight: 700 }}
      >
        62%
      </text>
      <text
        x="90"
        y="108"
        textAnchor="middle"
        fill={colors.muted}
        style={{
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        saved
      </text>
    </svg>
  )
}
