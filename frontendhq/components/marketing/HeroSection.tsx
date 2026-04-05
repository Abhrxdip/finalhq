"use client";

import React, { useRef, useEffect, useState } from 'react';

interface Particle {
  x: number; y: number; radius: number;
  color: string; opacity: number; vx: number; vy: number;
}

// ── Dot-grid background ───────────────────────────────────────────────────
const DOT_GRID = `radial-gradient(circle, rgba(0,255,65,0.18) 1px, transparent 1px)`;

// ── Terminal Prompt ───────────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: '> init hacktera@1.4.2 --network mainnet-beta', color: '#4A6A4A' },
  { text: '> ✓  rpc: mainnet.helius.dev  ·  slot 312,847,201', color: '#4A6A4A' },
  { text: '> ✓  wallet: 5rEHjT2...Mm  ·  4.24 ◎ SOL', color: '#4A6A4A' },
  { text: '> ✓  event: SOLANA_SUMMER_HACK_2026  ·  247 active', color: '#00FF41' },
  { text: '> ▶  14h 22m 18s remaining  ·  87% capacity', color: '#00FF41' },
];

function TerminalPrompt() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    TERMINAL_LINES.forEach((_, i) => {
      setTimeout(() => setVisible(i + 1), 500 + i * 420);
    });
  }, []);

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(0,255,65,0.14)',
        borderRadius: '8px',
        padding: '14px 18px',
        maxWidth: '420px',
        lineHeight: 1.75,
        backdropFilter: 'blur(8px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* top label */}
      <div
        style={{
          position: 'absolute',
          top: '-1px', left: '16px',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '9px',
          letterSpacing: '2px',
          color: '#4A6A4A',
          background: '#050A05',
          padding: '0 6px',
        }}
      >
        SYSTEM STATUS
      </div>
      {TERMINAL_LINES.slice(0, visible).map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px',
            color: i < visible - 1 ? '#334A33' : line.color,
          }}
        >
          {line.text}
          {i === visible - 1 && (
            <span style={{ animation: 'cursorBlink 1s infinite', marginLeft: '1px' }}>█</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Counting stat number ─────────────────────────────────────────────────
function CountStat({
  target, suffix = '', label,
}: {
  target: number; suffix?: string; label: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const inc = target / 55;
        const id = setInterval(() => {
          cur += inc;
          if (cur >= target) { setVal(target); clearInterval(id); }
          else setVal(Math.floor(cur));
        }, 18);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 'clamp(22px, 2.2vw, 30px)',
          fontWeight: 700,
          color: '#00FF41',
          lineHeight: 1,
          marginBottom: '6px',
        }}
      >
        {val.toLocaleString()}{suffix}
      </div>
      <div
        style={{
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '10px',
          letterSpacing: '3px',
          color: '#4A6A4A',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────
export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const pts: Particle[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.4,
      color: Math.random() > 0.75 ? '#7B2FFF' : '#00FF41',
      opacity: Math.random() * 0.35 + 0.07,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
    }));

    const LINK_DIST = 90;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // connecting lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.save();
            ctx.globalAlpha = ((LINK_DIST - dist) / LINK_DIST) * 0.06;
            ctx.strokeStyle = '#00FF41';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
      // dots
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#050A05',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: '68px',
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: DOT_GRID,
          backgroundSize: '30px 30px',
          opacity: 0.4,
        }}
      />

      {/* Radial gradients */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 75% 65% at 50% 45%, rgba(0,255,65,0.09) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 40% at 8% 88%, rgba(0,255,65,0.04) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 40% 40% at 92% 10%, rgba(123,47,255,0.07) 0%, transparent 60%)' }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Content */}
      <div
        style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '0 40px',
        }}
      >
        {/* Ghost text */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-70px', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(55px, 10.5vw, 140px)',
            fontWeight: 900, letterSpacing: '12px',
            color: 'rgba(0,255,65,0.03)',
            userSelect: 'none', whiteSpace: 'nowrap',
          }}
        >
          HACKTERA
        </div>

        {/* Live badge */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,255,65,0.07)',
            border: '1px solid rgba(0,255,65,0.22)',
            borderRadius: '20px', padding: '5px 16px',
            marginBottom: '28px',
          }}
        >
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00FF41', flexShrink: 0,
            animation: 'pulseDot 1.5s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '10px', letterSpacing: '3px', color: '#00FF41',
          }}>
            LIVE EVENT · 14 HOURS REMAINING
          </span>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '10px', letterSpacing: '1px', color: '#2A4A2A',
          }}>
            #SOLANA_SUMMER_HACK_2026
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 'clamp(42px, 6.2vw, 92px)',
            fontWeight: 900, letterSpacing: '-2px',
            marginBottom: '16px', lineHeight: 1.04,
          }}
        >
          <span style={{ color: '#FFFFFF' }}>hack</span>
          <span
            style={{
              color: '#00FF41',
              textShadow: '0 0 40px rgba(0,255,65,0.55), 0 0 80px rgba(0,255,65,0.2)',
            }}
          >
            quest
          </span>
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '15px', letterSpacing: '0.3px',
            color: '#4A6A4A', maxWidth: '480px',
            margin: '0 auto 28px', lineHeight: 1.7,
          }}
        >
          Turn your code into conquest. The hackathon meta-game on Solana —
          earn XP, mint NFTs, climb the ranks.
        </p>

        {/* Terminal prompt */}
        <div style={{ marginBottom: '32px' }}>
          <TerminalPrompt />
        </div>

        {/* CTA row */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginBottom: '56px', flexWrap: 'wrap' }}>
          <button
            className="hq-cta-primary"
            style={{
              background: '#00FF41',
              border: 'none', borderRadius: '30px',
              padding: '13px 30px',
              color: '#050A05',
              fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', transition: 'box-shadow 0.3s',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            ⚡ Enter the Quest
            <span style={{ opacity: 0.6, fontSize: '12px' }}>→</span>
          </button>
          <button
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,255,65,0.18)',
              borderRadius: '30px', padding: '13px 30px',
              color: '#E8F5E8',
              fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 400,
              cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,65,0.45)';
              e.currentTarget.style.color = '#00FF41';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,255,65,0.18)';
              e.currentTarget.style.color = '#E8F5E8';
            }}
          >
            View Leaderboard
          </button>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex', gap: '10px',
            justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: '56px', maxWidth: '820px',
          }}
        >
          {[
            { icon: '⚡', label: 'Live XP System', sub: 'Earn points in real-time', bg: 'rgba(0,255,65,0.12)' },
            { icon: '🏆', label: 'NFT Achievements', sub: 'Mint on Solana', bg: 'rgba(255,215,0,0.1)' },
            { icon: '🌐', label: 'Solana-Native', sub: '400ms finality', bg: 'rgba(153,69,255,0.12)' },
            { icon: '📡', label: 'Real-time Feed', sub: 'Live activity stream', bg: 'rgba(0,255,65,0.12)' },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(0,255,65,0.1)',
                borderRadius: '10px', padding: '10px 18px',
                transition: 'border-color 0.2s',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,255,65,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,255,65,0.1)')}
            >
              <div
                style={{
                  width: '30px', height: '30px', borderRadius: '7px',
                  background: c.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', flexShrink: 0,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: 600, color: '#E8F5E8' }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#4A6A4A', letterSpacing: '0.5px' }}>
                  {c.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid rgba(0,255,65,0.1)',
          borderBottom: '1px solid rgba(0,255,65,0.1)',
          display: 'flex', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {[
          { target: 247, suffix: '', label: 'ACTIVE HACKERS' },
          { target: 1840, suffix: '', label: 'QUESTS COMPLETED' },
          { target: 312, suffix: '', label: 'NFTS MINTED' },
          { target: 48, suffix: 'h', label: 'HACKATHON WINDOW' },
        ].map((s, i, arr) => (
          <div
            key={i}
            style={{
              padding: '22px 52px',
              borderRight: i < arr.length - 1 ? '1px solid rgba(0,255,65,0.07)' : 'none',
              flex: '1 1 120px', display: 'flex', flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <CountStat target={s.target} suffix={s.suffix} label={s.label} />
          </div>
        ))}
      </div>
    </section>
  );
}


