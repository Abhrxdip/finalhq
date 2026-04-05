"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ChevronRight, Clipboard } from "lucide-react";
import { InputField } from "./InputField";
import { useAuth } from "./AuthContext";
import { HackquestService } from "@/lib/services/hackquest.service";

const NEON = "#00FF41";
const MUTED = "rgba(120,160,120,0.7)";

const WALLETS = [
  {
    id: "pera",
    name: "Pera Wallet",
    tagline: "Official Algorand wallet",
    color: "#FF5B23",
    letter: "P",
    badge: "RECOMMENDED",
  },
  {
    id: "metamask",
    name: "MetaMask",
    tagline: "Popular Ethereum wallet",
    color: "#FF6B00",
    letter: "M",
    badge: null,
  },
  {
    id: "defly",
    name: "Defly Wallet",
    tagline: "DeFi-focused Algorand wallet",
    color: "#1B65F5",
    letter: "D",
    badge: null,
  },
  {
    id: "exodus",
    name: "Exodus",
    tagline: "Multi-chain wallet",
    color: "#6B49F5",
    letter: "E",
    badge: null,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    tagline: "Scan QR to connect",
    color: "rgba(200,200,200,0.5)",
    letter: "W",
    badge: null,
  },
];

function AlgorandLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 20h3.5l1.5-3.5h6l1.5 3.5H20L12 2zm0 6l2.2 5h-4.4L12 8z"
        fill={NEON}
      />
    </svg>
  );
}

function QRCodePlaceholder() {
  const cells = useMemo(() => {
    const size = 17;
    const result: { r: number; c: number; filled: boolean }[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let filled = false;
        // Finder patterns
        const inTL = r < 7 && c < 7;
        const inTR = r < 7 && c >= size - 7;
        const inBL = r >= size - 7 && c < 7;

        if (inTL) {
          const lr = r, lc = c;
          filled =
            lr === 0 || lr === 6 || lc === 0 || lc === 6
              ? true
              : lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        } else if (inTR) {
          const lr = r;
          const lc = c - (size - 7);
          filled =
            lr === 0 || lr === 6 || lc === 0 || lc === 6
              ? true
              : lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        } else if (inBL) {
          const lr = r - (size - 7);
          const lc = c;
          filled =
            lr === 0 || lr === 6 || lc === 0 || lc === 6
              ? true
              : lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        } else {
          const hash = (r * 17 + c * 31 + r * c * 7 + (r ^ c) * 3) % 11;
          filled = hash < 5;
        }
        result.push({ r, c, filled });
      }
    }
    return result;
  }, []);

  return (
    <div
      style={{
        width: 160,
        height: 160,
        background: "white",
        borderRadius: 8,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(17, 1fr)",
        gridTemplateRows: "repeat(17, 1fr)",
        gap: "1px",
        position: "relative",
      }}
    >
      {cells.map((cell) => (
        <div
          key={`${cell.r}-${cell.c}`}
          style={{ background: cell.filled ? "#111" : "#fff" }}
        />
      ))}
    </div>
  );
}

function TimerRing({ progress }: { progress: number }) {
  const r = 10;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke="rgba(0,255,65,0.12)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r={r}
        fill="none"
        stroke={NEON}
        strokeWidth="2"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}

export function WalletConnect() {
  const navigate = useNavigate();
  const { setWalletAddress, setWalletProvider } = useAuth();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [countdown, setCountdown] = useState(178);
  const [btnHovered, setBtnHovered] = useState(false);
  const [skipHovered, setSkipHovered] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const showQR = selectedWallet === "pera";

  useEffect(() => {
    if (!showQR) {
      setCountdown(178);
      return;
    }
    const iv = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(iv);
  }, [showQR]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleConnect = async () => {
    if (isConnecting) {
      return;
    }

    const provider = selectedWallet || null;
    const selectedWalletDetails = WALLETS.find((wallet) => wallet.id === provider);
    const providerLabel = selectedWalletDetails?.name || provider || null;
    let addr = manualAddress.trim();

    setConnectError(null);
    setIsConnecting(true);

    if (provider === "pera") {
      const connection = await HackquestService.connectWalletProvider("pera");
      if (connection?.walletAddress) {
        addr = connection.walletAddress;
      }
    }

    if (!addr) {
      setConnectError("Wallet address missing. Connect Pera Wallet or paste a valid address.");
      setIsConnecting(false);
      return;
    }

    setWalletAddress(addr);
    setWalletProvider(providerLabel);

    HackquestService.persistWalletSession(addr, providerLabel);

    if (HackquestService.isAuthenticated()) {
      const linked = await HackquestService.linkWallet(addr);
      if (!linked) {
        setConnectError("Wallet link failed. Check backend connectivity and retry.");
        setIsConnecting(false);
        return;
      }
    }

    setIsConnecting(false);
    navigate("/auth/profile-setup");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
        padding: "100px 16px 40px",
      }}
    >
      {/* Ghost text */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "Orbitron, sans-serif",
          fontSize: "clamp(48px, 10vw, 160px)",
          fontWeight: 900,
          color: "rgba(0,255,65,0.022)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "0.1em",
          zIndex: 0,
        }}
      >
        HACKQUEST
      </div>

      {/* Card */}
      <div
        style={{
          width: 480,
          maxWidth: "100%",
          background: "rgba(0,255,65,0.03)",
          border: "1px solid rgba(0,255,65,0.12)",
          borderRadius: 20,
          padding: 40,
          position: "relative",
          zIndex: 1,
          boxShadow: "inset 0 1px 0 rgba(0,255,65,0.08)",
        }}
      >
        {/* Step indicator */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "5px 14px",
              background: "rgba(0,255,65,0.08)",
              border: "1px solid rgba(0,255,65,0.2)",
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: NEON,
                letterSpacing: "0.08em",
              }}
            >
              STEP 2 OF 3
            </span>
          </div>
          <h2
            style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              margin: 0,
              marginBottom: 10,
            }}
          >
            Connect Your Wallet
          </h2>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: MUTED,
              margin: "0 auto",
              maxWidth: 320,
              lineHeight: 1.55,
            }}
          >
            Link your Algorand wallet to earn XP, mint NFTs, and own your
            achievements on-chain.
          </p>
        </div>

        {/* Algorand Network Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "6px 14px",
            background: "rgba(0,255,65,0.06)",
            border: "1px solid rgba(0,255,65,0.15)",
            borderRadius: 20,
            marginBottom: 24,
            width: "fit-content",
            margin: "0 auto 24px",
          }}
        >
          <AlgorandLogo />
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            Algorand TestNet
          </span>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: NEON,
              boxShadow: `0 0 6px ${NEON}`,
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; box-shadow: 0 0 6px #00FF41; }
              50% { opacity: 0.5; box-shadow: 0 0 12px #00FF41; }
            }
          `}</style>
        </div>

        {/* Wallet Cards */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}
        >
          {WALLETS.map((wallet) => {
            const isSelected = selectedWallet === wallet.id;
            return (
              <div key={wallet.id}>
                <motion.div
                  onClick={() =>
                    setSelectedWallet(isSelected ? null : wallet.id)
                  }
                  whileHover={{ scale: 1.005 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "0 16px",
                    height: 68,
                    background: isSelected
                      ? "rgba(0,255,65,0.06)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${
                      isSelected
                        ? "rgba(0,255,65,0.5)"
                        : "rgba(0,255,65,0.08)"
                    }`,
                    borderRadius: 12,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "background 0.18s, border-color 0.18s",
                  }}
                >
                  {/* Selected accent bar */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: NEON,
                        borderRadius: "12px 0 0 12px",
                      }}
                    />
                  )}

                  {/* Wallet Logo */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "rgba(0,255,65,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginLeft: isSelected ? 8 : 0,
                      transition: "margin 0.18s",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: wallet.color,
                      }}
                    >
                      {wallet.letter}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {wallet.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit, sans-serif",
                        fontSize: 11,
                        color: MUTED,
                        marginTop: 2,
                      }}
                    >
                      {wallet.tagline}
                    </div>
                  </div>

                  {/* Right */}
                  {wallet.badge ? (
                    <div
                      style={{
                        padding: "3px 8px",
                        background: "rgba(0,255,65,0.1)",
                        border: "1px solid rgba(0,255,65,0.3)",
                        borderRadius: 6,
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 9,
                        color: NEON,
                        letterSpacing: "0.06em",
                        flexShrink: 0,
                      }}
                    >
                      {wallet.badge}
                    </div>
                  ) : (
                    <ChevronRight
                      size={16}
                      color={isSelected ? NEON : MUTED}
                      style={{ flexShrink: 0, transition: "color 0.18s" }}
                    />
                  )}
                </motion.div>

                {/* QR Expand for Pera */}
                <AnimatePresence>
                  {wallet.id === "pera" && isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", damping: 22, stiffness: 300 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          marginTop: 10,
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(0,255,65,0.12)",
                          borderRadius: 12,
                          padding: 24,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        {/* QR Code with corner brackets */}
                        <div style={{ position: "relative" }}>
                          <QRCodePlaceholder />
                          {/* Corner brackets */}
                          {[
                            { top: -6, left: -6, borderTop: true, borderLeft: true },
                            { top: -6, right: -6, borderTop: true, borderRight: true },
                            { bottom: -6, left: -6, borderBottom: true, borderLeft: true },
                            { bottom: -6, right: -6, borderBottom: true, borderRight: true },
                          ].map((pos, i) => {
                            const {
                              borderTop,
                              borderBottom,
                              borderLeft,
                              borderRight,
                              ...position
                            } = pos;

                            return (
                              <div
                                key={i}
                                style={{
                                  position: "absolute",
                                  width: 16,
                                  height: 16,
                                  ...position,
                                  borderColor: NEON,
                                  borderStyle: "solid",
                                  borderWidth: 0,
                                  borderTopWidth: borderTop ? 2 : 0,
                                  borderBottomWidth: borderBottom ? 2 : 0,
                                  borderLeftWidth: borderLeft ? 2 : 0,
                                  borderRightWidth: borderRight ? 2 : 0,
                                }}
                              />
                            );
                          })}
                        </div>

                        <p
                          style={{
                            fontFamily: "Outfit, sans-serif",
                            fontSize: 13,
                            color: MUTED,
                            margin: 0,
                          }}
                        >
                          Scan with Pera Wallet app
                        </p>

                        {/* Timer */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "Outfit, sans-serif",
                              fontSize: 13,
                              color: MUTED,
                            }}
                          >
                            Expires in
                          </span>
                          <span
                            style={{
                              fontFamily: "Orbitron, sans-serif",
                              fontSize: 14,
                              fontWeight: 600,
                              color: NEON,
                            }}
                          >
                            {fmt(countdown)}
                          </span>
                          <TimerRing progress={countdown / 178} />
                        </div>

                        {/* Divider */}
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "rgba(0,255,65,0.08)",
                            }}
                          />
                          <span
                            style={{
                              fontFamily: "Outfit, sans-serif",
                              fontSize: 12,
                              color: MUTED,
                            }}
                          >
                            or enter address manually
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "rgba(0,255,65,0.08)",
                            }}
                          />
                        </div>

                        <div style={{ width: "100%" }}>
                          <InputField
                            placeholder="Algorand wallet address (58 chars)"
                            value={manualAddress}
                            onChange={(e) => setManualAddress(e.target.value)}
                            rightElement={
                              <Clipboard
                                size={16}
                                color={MUTED}
                                style={{ cursor: "pointer" }}
                                onClick={async () => {
                                  const text =
                                    await navigator.clipboard.readText();
                                  setManualAddress(text);
                                }}
                              />
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: 12,
            background: "rgba(255,107,0,0.05)",
            border: "1px solid rgba(255,107,0,0.15)",
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <Shield size={16} color="rgba(255,107,0,0.7)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: MUTED,
              lineHeight: 1.5,
            }}
          >
            HackQuest never accesses your funds. Connection is read-only for XP
            and NFT minting.
          </span>
        </div>

        {/* CTA Buttons */}
        <button
          onClick={handleConnect}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          disabled={!selectedWallet || isConnecting}
          style={{
            width: "100%",
            height: 52,
            background: selectedWallet && !isConnecting ? NEON : "rgba(0,255,65,0.2)",
            border: "none",
            borderRadius: 12,
            fontFamily: "Outfit, sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: selectedWallet && !isConnecting ? "#050A05" : "rgba(0,255,65,0.4)",
            cursor: selectedWallet && !isConnecting ? "pointer" : "not-allowed",
            boxShadow:
              btnHovered && selectedWallet && !isConnecting
                ? "0 0 30px rgba(0,255,65,0.4)"
                : "none",
            transform: btnHovered && selectedWallet && !isConnecting ? "translateY(-2px)" : "translateY(0)",
            transition: "all 0.15s ease",
            marginBottom: 12,
          }}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet →"}
        </button>

        {connectError && (
          <div
            style={{
              marginBottom: 12,
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: "#FF6B00",
              textAlign: "center",
            }}
          >
            {connectError}
          </div>
        )}

        <button
          onClick={() => navigate("/auth/profile-setup")}
          onMouseEnter={() => setSkipHovered(true)}
          onMouseLeave={() => setSkipHovered(false)}
          style={{
            width: "100%",
            height: 40,
            background: "transparent",
            border: "none",
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: skipHovered ? MUTED : "rgba(120,160,120,0.45)",
            cursor: "pointer",
            transition: "color 0.18s",
          }}
        >
          Skip for now (limited features)
        </button>
      </div>
    </div>
  );
}


