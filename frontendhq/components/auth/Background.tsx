"use client";

import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export function Background() {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      const angle = (i * 137.508 * Math.PI) / 180;
      const spread = i < 50 ? 15 + (i % 17) * 2.2 : 30 + (i % 23) * 1.8;
      const x = 50 + spread * Math.cos(angle);
      const y = 50 + spread * 0.65 * Math.sin(angle);
      items.push({
        id: i,
        x: Math.max(1, Math.min(99, x)),
        y: Math.max(1, Math.min(99, y)),
        size: 0.5 + (i % 5) * 0.42,
        color: i % 3 === 0 ? "#7B2FFF" : "#00FF41",
        opacity: 0.08 + (i % 9) * 0.035,
      });
    }
    return items;
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        background: "#050A05",
      }}
    >
      {/* Center radial glow */}
      <div
        style={{
          position: "absolute",
          width: "900px",
          height: "700px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(ellipse at center, rgba(0,255,65,0.07) 0%, transparent 65%)",
        }}
      />
      {/* Top-left ambient */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "400px",
          left: "-100px",
          top: "-100px",
          background:
            "radial-gradient(ellipse at center, rgba(123,47,255,0.05) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-right ambient */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          right: "-100px",
          bottom: "-100px",
          background:
            "radial-gradient(ellipse at center, rgba(0,255,65,0.04) 0%, transparent 70%)",
        }}
      />
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: "50%",
            opacity: p.opacity,
          }}
        />
      ))}
      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </div>
  );
}


