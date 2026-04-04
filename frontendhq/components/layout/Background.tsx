"use client";

import React, { useMemo } from 'react';
import { colors } from '@/lib/design-tokens';

interface ParticleDot {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export function Background() {
  const particles = useMemo<ParticleDot[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      color: Math.random() > 0.7 ? colors.purple500 : colors.neon500,
      opacity: 0.08 + Math.random() * 0.37,
    }));
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundColor: colors.bgBase,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Center radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px',
          height: '700px',
          background: 'radial-gradient(ellipse, rgba(0,255,65,0.07) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Top-left purple radial */}
      <div
        style={{
          position: 'absolute',
          top: '-200px',
          left: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(123,47,255,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Particle dots */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.color,
            opacity: p.opacity,
          }}
        />
      ))}
      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  );
}


