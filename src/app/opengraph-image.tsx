import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'FinanceFlow | AI-Powered Personal Finance Management'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 16% 20%, rgba(61, 243, 215, 0.25), transparent 42%), radial-gradient(circle at 82% 22%, rgba(56, 189, 248, 0.14), transparent 44%), linear-gradient(135deg, #020617 0%, #031326 52%, #041b2f 100%)',
          color: '#f8fafc',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.35,
          }}
        />

        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            padding: '56px 64px',
            justifyContent: 'space-between',
            gap: '36px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '64%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(180deg, rgba(45, 212, 191, 0.95), rgba(20, 184, 166, 0.9))',
                  boxShadow: '0 0 0 1px rgba(45,212,191,0.22)',
                }}
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '999px',
                    background: '#ecfeff',
                    opacity: 0.95,
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                }}
              >
                FinanceFlow
              </div>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '56px',
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  maxWidth: '92%',
                }}
              >
                AI-Powered Personal Finance Management
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  lineHeight: 1.35,
                  color: 'rgba(226,232,240,0.8)',
                  maxWidth: '88%',
                }}
              >
                Track spending, optimize budgets, and act on AI insights with a
                modern finance workspace.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Budgets', 'Subscriptions', 'Investments', 'AI Insights'].map(
                (label) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '999px',
                      background: 'rgba(15, 23, 42, 0.65)',
                      border: '1px solid rgba(45, 212, 191, 0.18)',
                      color: 'rgba(240, 253, 250, 0.95)',
                      fontSize: '16px',
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '999px',
                        background: '#2dd4bf',
                      }}
                    />
                    {label}
                  </div>
                )
              )}
            </div>
          </div>

          <div
            style={{
              width: '36%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '82%',
                borderRadius: '22px',
                display: 'flex',
                flexDirection: 'column',
                background:
                  'linear-gradient(180deg, rgba(10, 23, 43, 0.9), rgba(7, 17, 31, 0.95))',
                border: '1px solid rgba(56, 189, 248, 0.14)',
                boxShadow:
                  '0 24px 60px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
                padding: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'rgba(148,163,184,0.95)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Overview
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 700 }}>
                    Dashboard
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: '12px',
                    background: 'rgba(15,23,42,0.8)',
                    border: '1px solid rgba(45,212,191,0.16)',
                    fontSize: '13px',
                    color: '#99f6e4',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '999px',
                      background: '#2dd4bf',
                    }}
                  />
                  Live
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                {[
                  ['Balance', '$22,920'],
                  ['Net income', '$1,552'],
                  ['Budgets', '3 at risk'],
                  ['Subscriptions', '$91/mo'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      width: '48%',
                      borderRadius: '14px',
                      border: '1px solid rgba(148,163,184,0.12)',
                      background: 'rgba(2, 6, 23, 0.45)',
                      padding: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(148,163,184,0.9)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: '4px',
                  borderRadius: '14px',
                  border: '1px solid rgba(148,163,184,0.12)',
                  background: 'rgba(2, 6, 23, 0.42)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    color: 'rgba(148,163,184,0.95)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Spending trend
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    height: '64px',
                  }}
                >
                  {[28, 36, 22, 42, 34, 52, 46, 38, 31, 48].map(
                    (height, index) => (
                      <div
                        key={index}
                        style={{
                          width: '22px',
                          height: `${height}px`,
                          borderRadius: '8px 8px 4px 4px',
                          background:
                            index > 7
                              ? 'linear-gradient(180deg, rgba(251, 191, 36, 0.95), rgba(217, 119, 6, 0.8))'
                              : 'linear-gradient(180deg, rgba(45, 212, 191, 0.92), rgba(13, 148, 136, 0.75))',
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
