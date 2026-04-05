"use client";

import { Wallet } from "lucide-react";

const NEON = "#00FF41";
const MUTED = "rgba(120,160,120,0.7)";

export function Navbar() {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 36,
        paddingRight: 36,
        background: "rgba(5,10,5,0.85)",
        borderBottom: "1px solid rgba(0,255,65,0.12)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Left: HQ Monogram + Wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            background: NEON,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: 13,
              fontWeight: 900,
              color: "#050A05",
              lineHeight: 1,
            }}
          >
            HQ
          </span>
        </div>
        <span
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: NEON,
            letterSpacing: "2px",
          }}
        >
          HACKTERA
        </span>
      </div>

      {/* Right: Wallet status (empty/not connected) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 14px",
          border: "1px solid rgba(0,255,65,0.1)",
          borderRadius: 8,
          background: "rgba(0,255,65,0.02)",
          cursor: "pointer",
        }}
      >
        <Wallet size={14} color="rgba(0,255,65,0.35)" />
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: MUTED,
          }}
        >
          No wallet connected
        </span>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(0,255,65,0.3)",
          }}
        />
      </div>
    </nav>
  );
}


