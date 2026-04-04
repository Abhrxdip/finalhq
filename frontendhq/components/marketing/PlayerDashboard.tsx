"use client";

import React, { useRef, useEffect, useState } from 'react';

// ── HUD Panel wrapper (corner brackets) ──────────────────────────────────
function HUDPanel({
  children,
  style,
  accentColor = 'rgba(0,255,65,0.45)',
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accentColor?: string;
}) {
  const cornerBase: React.CSSProperties = {
    position: 'absolute',
    width: '13px',
    height: '13px',
    borderColor: accentColor,
    borderStyle: 'solid',
    pointerEvents: 'none',
  };
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ ...cornerBase, top: -1, left: -1, borderWidth: '1.5px 0 0 1.5px' }} />
      <div style={{ ...cornerBase, top: -1, right: -1, borderWidth: '1.5px 1.5px 0 0' }} />
      <div style={{ ...cornerBase, bottom: -1, left: -1, borderWidth: '0 0 1.5px 1.5px' }} />
      <div style={{ ...cornerBase, bottom: -1, right: -1, borderWidth: '0 1.5px 1.5px 0' }} />
      {children}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({
  points, color, width = 200, height = 42,
}: {
  points: [number, number][]; color: string; width?: number; height?: number;
}) {
  const maxX = width, maxY = height;
  const pts = points
    .map(([x, y]) => `${(x / 100) * maxX},${maxY - (y / 100) * maxY}`)
    .join(' ');
  const firstX = (points[0][0] / 100) * maxX;
  const lastX = (points[points.length - 1][0] / 100) * maxX;
  const lastY = maxY - (points[points.length - 1][1] / 100) * maxY;
  const fillD = `M${firstX},${maxY} ${pts} L${lastX},${maxY} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={fillD} fill={`${color}12`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill={color} />
    </svg>
  );
}

// ── Stat Bar ──────────────────────────────────────────────────────────────
function StatBar({
  icon, label, value, color, percent, animate,
}: {
  icon: string; label: string; value: string; color: string;
  percent: number; animate: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '9.5px', letterSpacing: '1.5px', color: '#3A5A3A',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          <span>{icon}</span> {label}
        </span>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: 700, color }}>
          {value}
        </span>
      </div>
      <div
        style={{
          height: '5px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%', borderRadius: '3px',
            width: animate ? `${percent}%` : '0%',
            background:
              color === '#7B2FFF'
                ? 'linear-gradient(90deg, #5010D0 0%, #7B2FFF 100%)'
                : color === '#FF6B00'
                ? 'linear-gradient(90deg, #C44A00 0%, #FF6B00 100%)'
                : 'linear-gradient(90deg, #009930 0%, #00FF41 100%)',
            transition: 'width 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 0 6px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

// ── Progress Item ─────────────────────────────────────────────────────────
function ProgressItem({
  label, percent, animate,
}: {
  label: string; percent: number; animate: boolean;
}) {
  const color =
    percent === 100 ? '#00FF41' :
    percent >= 75 ? '#00FF41' :
    percent >= 40 ? '#FFD700' :
    '#FF6B00';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '9.5px', letterSpacing: '0.8px', color: '#3A5A3A',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '10px', fontWeight: 700, color,
          }}
        >
          {percent === 100 ? '✓' : `${percent}%`}
        </span>
      </div>
      <div
        style={{
          height: '4px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '2px', overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%', borderRadius: '2px',
            width: animate ? `${percent}%` : '0%',
            background:
              percent === 100
                ? 'linear-gradient(90deg, #009930, #00FF41)'
                : `linear-gradient(90deg, ${color}88, ${color})`,
            transition: 'width 1.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}

// ── Avatar with HUD rings ─────────────────────────────────────────────────
function HUDAvatar() {
  return (
    <div
      style={{
        position: 'relative',
        width: '240px',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer orbit ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px dashed rgba(0,255,65,0.18)',
          animation: 'orbitCW 18s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00FF41',
            boxShadow: '0 0 8px #00FF41',
          }}
        />
      </div>

      {/* Inner orbit ring */}
      <div
        style={{
          position: 'absolute',
          inset: '20px',
          borderRadius: '50%',
          border: '1px dashed rgba(123,47,255,0.22)',
          animation: 'orbitCCW 12s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: '-3px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#7B2FFF',
            boxShadow: '0 0 8px #7B2FFF',
          }}
        />
      </div>

      {/* Avatar core */}
      <div
        style={{
          position: 'relative',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, rgba(0,255,65,0.12) 0%, rgba(0,0,0,0.6) 100%)',
          border: '1.5px solid rgba(0,255,65,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,255,65,0.12), inset 0 0 30px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Scanlines */}
        <div className="hq-scanlines" />

        {/* Scan line animation */}
        <div
          style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,65,0.55) 40%, rgba(0,255,65,0.7) 50%, rgba(0,255,65,0.55) 60%, transparent 100%)',
            animation: 'scanLine 2.8s ease-in-out infinite',
            zIndex: 3,
          }}
        />

        {/* Character SVG */}
        <svg width="100" height="130" viewBox="0 0 100 130" fill="none" style={{ zIndex: 1 }}>
          <defs>
            <radialGradient id="headGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(0,255,65,0.2)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </radialGradient>
          </defs>
          {/* Head */}
          <circle cx="50" cy="32" r="22" fill="url(#headGrad)" stroke="rgba(0,255,65,0.6)" strokeWidth="1" />
          {/* Visor */}
          <rect x="32" y="23" width="36" height="13" rx="5" fill="rgba(0,255,65,0.18)" stroke="rgba(0,255,65,0.7)" strokeWidth="0.7" />
          {/* Eyes */}
          <rect x="37" y="26" width="10" height="6" rx="2.5" fill="#00FF41" opacity="0.95" />
          <rect x="53" y="26" width="10" height="6" rx="2.5" fill="#00FF41" opacity="0.95" />
          {/* Neck */}
          <rect x="44" y="53" width="12" height="10" rx="3" fill="rgba(0,255,65,0.1)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.7" />
          {/* Body */}
          <rect x="24" y="63" width="52" height="58" rx="7" fill="rgba(0,255,65,0.05)" stroke="rgba(0,255,65,0.4)" strokeWidth="1" />
          {/* Chest detail */}
          <rect x="34" y="72" width="32" height="20" rx="4" fill="rgba(0,255,65,0.1)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />
          <text x="50" y="86" textAnchor="middle" fontSize="11" fill="rgba(0,255,65,0.8)">⚡</text>
          {/* Shoulders */}
          <rect x="8" y="60" width="17" height="11" rx="4" fill="rgba(0,255,65,0.08)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.8" />
          <rect x="75" y="60" width="17" height="11" rx="4" fill="rgba(0,255,65,0.08)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.8" />
          {/* Arms */}
          <rect x="9" y="70" width="15" height="40" rx="5" fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.18)" strokeWidth="0.7" />
          <rect x="76" y="70" width="15" height="40" rx="5" fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.18)" strokeWidth="0.7" />
        </svg>

        {/* Bottom glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: '50%',
            transform: 'translateX(-50%)',
            width: '120px', height: '60px',
            background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,255,65,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Floating data tags */}
      {[
        { top: '12px', left: '0px', label: 'LEVEL', val: '24', color: '#00FF41' },
        { top: '12px', right: '0px', label: 'CLASS', val: 'BUILDER', color: '#7B2FFF' },
        { bottom: '16px', left: '0px', label: 'STATUS', val: 'ONLINE', color: '#00FF41' },
        { bottom: '16px', right: '0px', label: 'STREAK', val: '7d', color: '#FFD700' },
      ].map((tag, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...tag,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '8.5px',
            color: tag.color,
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${tag.color}33`,
            borderRadius: '4px',
            padding: '3px 6px',
            letterSpacing: '0.5px',
            backdropFilter: 'blur(4px)',
          } as React.CSSProperties}
        >
          <div style={{ color: '#2A4A2A', fontSize: '7.5px', marginBottom: '1px' }}>{tag.label}</div>
          <div>{tag.val}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function PlayerDashboard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setAnimated(true), 150); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const statBars = [
    { icon: '⚔️', label: 'BUILD SPEED', value: '78%', color: '#00FF41', percent: 78 },
    { icon: '🛡️', label: 'CODE QUALITY', value: '85%', color: '#00FF41', percent: 85 },
    { icon: '🔮', label: 'INNOVATION', value: '62%', color: '#7B2FFF', percent: 62 },
    { icon: '❤️', label: 'COLLABORATION', value: '91%', color: '#FF6B00', percent: 91 },
    { icon: '📋', label: 'DOCUMENTATION', value: '54%', color: '#00FF41', percent: 54 },
  ];

  const progressItems = [
    { label: 'FEATURE BUILD', percent: 75 },
    { label: 'DEPLOYMENT', percent: 100 },
    { label: 'DOCUMENTATION', percent: 40 },
    { label: 'PITCH READY', percent: 20 },
    { label: 'BUG FIXES', percent: 88 },
    { label: 'DEMO VIDEO', percent: 15 },
    { label: 'HELP TEAMMATES', percent: 95 },
    { label: 'SOLANA INTEGRATION', percent: 60 },
  ];

  const xpPoints: [number, number][] = [
    [0, 10], [12, 18], [25, 14], [38, 28], [50, 24],
    [62, 38], [75, 33], [88, 48], [100, 55],
  ];
  const winPoints: [number, number][] = [
    [0, 8], [14, 15], [28, 12], [42, 24], [56, 20],
    [70, 32], [84, 28], [100, 40],
  ];

  const cardBase: React.CSSProperties = {
    background: 'rgba(0,255,65,0.025)',
    border: '1px solid rgba(0,255,65,0.1)',
    borderRadius: '16px',
    padding: '24px',
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: '#080D08',
        padding: '80px',
        position: 'relative',
      }}
    >
      {/* Section header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            letterSpacing: '4px', color: '#2A4A2A', marginBottom: '6px',
          }}>
            // PLAYER_PROFILE · SESSION_ID: QST-2026-0042
          </div>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '26px',
            fontWeight: 700, letterSpacing: '1px', color: '#E8F5E8',
          }}>
            PLAYER DASHBOARD
          </h2>
        </div>
        <div style={{
          fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
          color: '#2A4A2A', letterSpacing: '1px', textAlign: 'right',
        }}>
          <div>LAST SYNC</div>
          <div style={{ color: '#4A6A4A' }}>2026-04-03 · 14:22:18Z</div>
        </div>
      </div>

      {/* 3-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr 280px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT PANEL ──────────────────────────────── */}
        <HUDPanel style={{ ...cardBase }}>
          {/* Player name */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '26px',
                fontWeight: 900, letterSpacing: '-1px', color: '#FFFFFF',
                lineHeight: 1.1,
              }}>
                alex_dev
              </h3>
              <div style={{
                background: 'rgba(0,255,65,0.1)', border: '1px solid rgba(0,255,65,0.25)',
                borderRadius: '6px', padding: '2px 7px',
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
                letterSpacing: '1px', color: '#00FF41',
              }}>
                ONLINE
              </div>
            </div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
              letterSpacing: '1.5px', color: '#3A5A3A', marginBottom: '4px',
            }}>
              ◆ SOLANA HACKATHON SPECIALIST
            </div>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              color: '#2A3A2A', letterSpacing: '0.5px',
            }}>
              5rEHjT2VnM9pK4wBzXsQ7...Mm
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,255,65,0.08)', marginBottom: '16px' }} />

          {/* XP / Rank / NFT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
            {[
              { val: '1,247', label: 'XP TOTAL', color: '#00FF41', bg: 'rgba(0,255,65,0.08)', b: 'rgba(0,255,65,0.18)' },
              { val: '#7', label: 'GLOBAL', color: '#FFD700', bg: 'rgba(255,215,0,0.06)', b: 'rgba(255,215,0,0.2)' },
              { val: '12', label: 'BADGES', color: '#7B2FFF', bg: 'rgba(123,47,255,0.07)', b: 'rgba(123,47,255,0.22)' },
            ].map((b) => (
              <div key={b.label}
                style={{
                  background: b.bg, border: `1px solid ${b.b}`, borderRadius: '10px',
                  padding: '9px 6px', textAlign: 'center',
                }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '17px', fontWeight: 700,
                  color: b.color, lineHeight: 1, marginBottom: '3px',
                }}>
                  {b.val}
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '7.5px',
                  letterSpacing: '0.8px', color: '#3A5A3A',
                }}>
                  {b.label}
                </div>
              </div>
            ))}
          </div>

          {/* Stat bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '18px' }}>
            {statBars.map((bar) => <StatBar key={bar.label} {...bar} animate={animated} />)}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,255,65,0.08)', marginBottom: '14px' }} />

          {/* XP sparkline */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              letterSpacing: '1.5px', color: '#3A5A3A',
            }}>
              7D XP TREND
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '18px',
                fontWeight: 700, color: '#00FF41', lineHeight: 1,
              }}>
                +340 XP
              </div>
              <div style={{
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: '#00FF41', opacity: 0.65,
              }}>
                ▲ +0.94%
              </div>
            </div>
          </div>
          <Sparkline points={xpPoints} color="#00FF41" width={252} height={42} />
        </HUDPanel>

        {/* ── CENTER PANEL ─────────────────────────────── */}
        <HUDPanel
          style={{ ...cardBase, padding: 0, overflow: 'hidden' }}
          accentColor="rgba(0,255,65,0.3)"
        >
          {/* Currency chips */}
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            display: 'flex', gap: '8px', zIndex: 4,
          }}>
            {[
              { val: '◆ 420', c: '#00FF41', bg: 'rgba(0,255,65,0.08)', b: 'rgba(0,255,65,0.18)' },
              { val: '● 37,300', c: '#FFD700', bg: 'rgba(255,215,0,0.06)', b: 'rgba(255,215,0,0.2)' },
            ].map((chip) => (
              <div key={chip.val} style={{
                background: chip.bg, border: `1px solid ${chip.b}`,
                borderRadius: '20px', padding: '4px 11px',
                fontFamily: 'Orbitron, sans-serif', fontSize: '11px', fontWeight: 700, color: chip.c,
              }}>
                {chip.val}
              </div>
            ))}
          </div>

          {/* Avatar area */}
          <div
            style={{
              minHeight: '360px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(180deg, #050A05 0%, #060C06 100%)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Grid lines */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
            {/* Radial floor glow */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: '320px', height: '120px',
              background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,255,65,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <HUDAvatar />
          </div>

          {/* Active quest strip */}
          <div style={{
            padding: '14px 20px',
            background: 'rgba(0,0,0,0.4)',
            borderTop: '1px solid rgba(0,255,65,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
                letterSpacing: '2px', color: '#2A4A2A', marginBottom: '3px',
              }}>
                ACTIVE QUEST
              </div>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontSize: '13px',
                fontWeight: 600, color: '#E8F5E8',
              }}>
                Solana Pay Integration
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
                letterSpacing: '1px', color: '#2A4A2A', marginBottom: '3px',
              }}>
                QST-0087
              </div>
              <div style={{
                fontFamily: 'Orbitron, sans-serif', fontSize: '12px',
                fontWeight: 700, color: '#FFD700',
              }}>
                +180 XP
              </div>
            </div>
          </div>

          {/* NFT badge strip */}
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid rgba(0,255,65,0.06)',
          }}>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              letterSpacing: '2px', color: '#2A4A2A', marginBottom: '9px',
            }}>
              NFT BADGES · 12 OWNED
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {[
                { l: '🏆 CHAMPION', c: '#FFD700', b: 'rgba(255,215,0,0.08)' },
                { l: '⚡ SPEEDRUN', c: '#00FF41', b: 'rgba(0,255,65,0.07)' },
                { l: '🔮 INNOVATOR', c: '#7B2FFF', b: 'rgba(123,47,255,0.08)' },
                { l: '🛡️ DEFENDER', c: '#00FF41', b: 'rgba(0,255,65,0.07)' },
                { l: '🌐 SOL OG', c: '#9945FF', b: 'rgba(153,69,255,0.08)' },
                { l: '📡 EARLY', c: '#FFD700', b: 'rgba(255,215,0,0.06)' },
              ].map((badge) => (
                <div key={badge.l} style={{
                  background: badge.b, border: `1px solid ${badge.c}28`,
                  borderRadius: '20px', padding: '3px 9px',
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
                  letterSpacing: '0.5px', color: badge.c,
                }}>
                  {badge.l}
                </div>
              ))}
            </div>
          </div>
        </HUDPanel>

        {/* ── RIGHT PANEL ──────────────────────────────── */}
        <HUDPanel style={{ ...cardBase }} accentColor="rgba(0,255,65,0.3)">
          <h4 style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '15px',
            fontWeight: 700, letterSpacing: '1.5px', color: '#E8F5E8',
            marginBottom: '4px',
          }}>
            PROGRESS
          </h4>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
            letterSpacing: '1px', color: '#2A4A2A', marginBottom: '16px',
          }}>
            QST-0042 · DEFI PROTOCOL TRACK
          </div>

          {/* Progress items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '18px' }}>
            {progressItems.map((item) => (
              <ProgressItem key={item.label} {...item} animate={animated} />
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,255,65,0.07)', marginBottom: '14px' }} />

          {/* Trophy section */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🏆</span>
              <div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '20px',
                  fontWeight: 700, color: '#FF6B00', lineHeight: 1,
                }}>
                  29.7%
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
                  letterSpacing: '1.5px', color: '#3A5A3A', marginTop: '2px',
                }}>
                  WIN PERCENTAGE
                </div>
              </div>
            </div>
            <div style={{
              background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.22)',
              borderRadius: '20px', padding: '3px 9px',
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px', color: '#FF6B00',
            }}>
              ▲ +1.22%
            </div>
          </div>
          <Sparkline points={winPoints} color="#FF6B00" width={232} height={42} />

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,255,65,0.07)', margin: '14px 0' }} />

          {/* Recent matches */}
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
            letterSpacing: '1.5px', color: '#2A4A2A', marginBottom: '10px',
          }}>
            RECENT RESULTS
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['W','W','L','W','W','L','W','W','W','L','W','W'].map((r, i) => (
              <div key={i} style={{
                width: '18px', height: '18px', borderRadius: '3px',
                background: r === 'W' ? 'rgba(0,255,65,0.15)' : 'rgba(255,107,0,0.12)',
                border: `1px solid ${r === 'W' ? 'rgba(0,255,65,0.3)' : 'rgba(255,107,0,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, sans-serif', fontSize: '8px', fontWeight: 700,
                color: r === 'W' ? '#00FF41' : '#FF6B00',
              }}>
                {r}
              </div>
            ))}
          </div>
        </HUDPanel>
      </div>
    </section>
  );
}


