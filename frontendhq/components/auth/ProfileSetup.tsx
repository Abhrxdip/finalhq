"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Globe,
  ChevronDown,
  ChevronRight,
  Check,
  Github,
  Twitter,
  AlertTriangle,
  X,
  Plus,
  Edit3,
} from "lucide-react";
import { InputField } from "./InputField";
import { useAuth } from "./AuthContext";
import { HackquestService } from "@/lib/services/hackquest.service";

const NEON = "#00FF41";
const MUTED = "rgba(120,160,120,0.7)";

const HACKER_CLASSES = [
  {
    id: "architect",
    icon: "🏗️",
    name: "Architect",
    desc: "System design & infrastructure",
    color: "#1B65F5",
  },
  {
    id: "warrior",
    icon: "⚔️",
    name: "Warrior",
    desc: "Frontend & UI battle",
    color: NEON,
  },
  {
    id: "mage",
    icon: "🔮",
    name: "Mage",
    desc: "AI & smart contracts",
    color: "#7B2FFF",
  },
  {
    id: "phantom",
    icon: "🥷",
    name: "Phantom",
    desc: "Backend & security",
    color: "#00B3FF",
  },
];

const AVATARS = [
  { id: 0, label: "HQ", gradient: "linear-gradient(135deg, rgba(0,255,65,0.3), rgba(0,255,65,0.08))", textColor: NEON },
  { id: 1, label: "W", gradient: "linear-gradient(135deg, #0f3d0f, #0a2a0a)", textColor: NEON },
  { id: 2, label: "M", gradient: "linear-gradient(135deg, #2d1060, #18083a)", textColor: "#7B2FFF" },
  { id: 3, label: "S", gradient: "linear-gradient(135deg, #4a1a08, #2d0e02)", textColor: "#FF5B23" },
  { id: 4, label: "A", gradient: "linear-gradient(135deg, #061840, #040d26)", textColor: "#1B65F5" },
  { id: 5, label: "H", gradient: "linear-gradient(135deg, rgba(0,255,65,0.35), rgba(0,200,50,0.12))", textColor: NEON },
  { id: 6, label: "P", gradient: "linear-gradient(135deg, #061006, #030803)", textColor: "rgba(0,255,65,0.45)" },
];

function SkillSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: MUTED,
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: 12,
            fontWeight: 700,
            color: NEON,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{ position: "relative", height: 18, display: "flex", alignItems: "center" }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              borderRadius: 3,
              background: `linear-gradient(to right, ${NEON}, rgba(0,255,65,0.3))`,
            }}
          />
        </div>
        {/* Custom thumb */}
        <div
          style={{
            position: "absolute",
            left: `calc(${value}% - 9px)`,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: NEON,
            boxShadow: "0 0 8px rgba(0,255,65,0.6)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Invisible range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
}

function MiniStatBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: MUTED,
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: NEON,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            borderRadius: 2,
            background: `linear-gradient(to right, ${NEON}, rgba(0,255,65,0.4))`,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function ProfileSetup() {
  const navigate = useNavigate();
  const { walletAddress, walletProvider } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [hackerClass, setHackerClass] = useState<string | null>(null);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [timezone, setTimezone] = useState("");
  const [frontendSkill, setFrontendSkill] = useState(72);
  const [blockchainSkill, setBlockchainSkill] = useState(45);
  const [designSkill, setDesignSkill] = useState(58);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [githubHandle, setGithubHandle] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedClass = HACKER_CLASSES.find((c) => c.id === hackerClass) || null;
  const currentAvatar = AVATARS[selectedAvatar] || AVATARS[0];

  // Username availability check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }
    setUsernameChecking(true);
    setUsernameAvailable(null);
    const timer = setTimeout(() => {
      const taken = ["admin", "hackquest", "test", "user", "hacker"];
      setUsernameAvailable(!taken.includes(username.toLowerCase()));
      setUsernameChecking(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [username]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowClassDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const truncateAddr = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleEnterArena = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    if (walletAddress) {
      HackquestService.persistWalletSession(walletAddress, walletProvider);

      if (HackquestService.isAuthenticated()) {
        const linked = await HackquestService.linkWallet(walletAddress);
        if (!linked) {
          setSubmitError("Wallet sync failed. You can continue and reconnect from Settings.");
          setIsSubmitting(false);
          return;
        }
      }
    }

    setIsSubmitting(false);
    navigate("/dashboard");
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
        padding: "100px 24px 48px",
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

      {/* Two-column layout */}
      <div
        style={{
          display: "flex",
          gap: 24,
          width: "100%",
          maxWidth: 1024,
          position: "relative",
          zIndex: 1,
          alignItems: "flex-start",
        }}
      >
        {/* ========== LEFT: Form Card ========== */}
        <div
          style={{
            flex: "1 1 600px",
            background: "rgba(0,255,65,0.03)",
            border: "1px solid rgba(0,255,65,0.12)",
            borderRadius: 20,
            padding: 40,
            boxShadow: "inset 0 1px 0 rgba(0,255,65,0.08)",
          }}
        >
          {/* Step indicator + heading */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "5px 14px",
                background: "rgba(0,255,65,0.08)",
                border: "1px solid rgba(0,255,65,0.2)",
                borderRadius: 20,
                marginBottom: 14,
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
                STEP 3 OF 3
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                margin: 0,
                marginBottom: 8,
              }}
            >
              Build Your Hacker Identity
            </h2>
            <p
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                color: MUTED,
                margin: 0,
              }}
            >
              Your profile is your war room. Make it legendary.
            </p>
          </div>

          {/* Avatar Selector */}
          <div style={{ marginBottom: 28 }}>
            {/* Main avatar preview */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ position: "relative" }}>
                {/* Outer glow ring */}
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: "50%",
                    border: `2px solid ${NEON}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 16px rgba(0,255,65,0.4)",
                  }}
                >
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: "50%",
                      background: currentAvatar.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Orbitron, sans-serif",
                        fontSize: 26,
                        fontWeight: 700,
                        color: currentAvatar.textColor,
                      }}
                    >
                      {username ? username.slice(0, 2).toUpperCase() : "HQ"}
                    </span>
                  </div>
                </div>
                {/* Edit badge */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#080D08",
                    border: "1px solid rgba(0,255,65,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Edit3 size={12} color={NEON} />
                </div>
              </div>
            </div>

            {/* Avatar grid */}
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 4,
                justifyContent: "center",
              }}
            >
              {AVATARS.map((av) => (
                <div
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.id)}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: av.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    border: `2px solid ${
                      selectedAvatar === av.id
                        ? NEON
                        : "rgba(0,255,65,0.08)"
                    }`,
                    boxShadow:
                      selectedAvatar === av.id
                        ? "0 0 10px rgba(0,255,65,0.4)"
                        : "none",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: av.textColor,
                    }}
                  >
                    {av.label}
                  </span>
                </div>
              ))}
              {/* Upload option */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                  border: "1px dashed rgba(0,255,65,0.2)",
                  transition: "border-color 0.18s",
                }}
              >
                <Plus size={20} color={MUTED} />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Username */}
            <div>
              <InputField
                type="text"
                placeholder="your_hacker_name"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/\s/g, ""))
                }
                leftIcon={
                  <span
                    style={{
                      fontFamily: "Orbitron, sans-serif",
                      fontSize: 14,
                      color: NEON,
                    }}
                  >
                    @
                  </span>
                }
                rightElement={
                  usernameChecking ? (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `2px solid ${NEON}`,
                        borderTopColor: "transparent",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : usernameAvailable === true ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Check size={14} color={NEON} />
                      <span
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 10,
                          color: NEON,
                        }}
                      >
                        Available
                      </span>
                    </div>
                  ) : usernameAvailable === false ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <X size={14} color="#FF4444" />
                      <span
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 10,
                          color: "#FF4444",
                        }}
                      >
                        Taken
                      </span>
                    </div>
                  ) : null
                }
                error={usernameAvailable === false}
              />
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 11,
                  color: "rgba(120,160,120,0.5)",
                  marginTop: 5,
                  marginLeft: 4,
                }}
              >
                Used on leaderboard and activity feed. No spaces.
              </p>
            </div>

            {/* Display Name */}
            <InputField
              type="text"
              placeholder="Full name or alias"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User size={18} />}
            />

            {/* Hacker Class Selector */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                style={{
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px 0 16px",
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    showClassDropdown
                      ? "rgba(0,255,65,0.4)"
                      : "rgba(0,255,65,0.1)"
                  }`,
                  borderRadius: 10,
                  cursor: "pointer",
                  boxShadow: showClassDropdown
                    ? "0 0 0 3px rgba(0,255,65,0.1)"
                    : "none",
                  transition: "all 0.18s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>
                    {selectedClass ? selectedClass.icon : "🎮"}
                  </span>
                  <span
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 14,
                      color: selectedClass
                        ? "rgba(255,255,255,0.9)"
                        : MUTED,
                    }}
                  >
                    {selectedClass ? selectedClass.name : "Select your class"}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  color={MUTED}
                  style={{
                    transform: showClassDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </div>

              <AnimatePresence>
                {showClassDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      right: 0,
                      background: "#080D08",
                      border: "1px solid rgba(0,255,65,0.15)",
                      borderRadius: 12,
                      padding: 8,
                      zIndex: 100,
                    }}
                  >
                    {HACKER_CLASSES.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => {
                          setHackerClass(cls.id);
                          setShowClassDropdown(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background:
                            hackerClass === cls.id
                              ? "rgba(0,255,65,0.08)"
                              : "transparent",
                          transition: "background 0.15s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.background =
                            "rgba(0,255,65,0.05)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.background =
                            hackerClass === cls.id
                              ? "rgba(0,255,65,0.08)"
                              : "transparent")
                        }
                      >
                        <span style={{ fontSize: 20 }}>{cls.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontFamily: "Outfit, sans-serif",
                              fontSize: 14,
                              fontWeight: 600,
                              color: "rgba(255,255,255,0.9)",
                            }}
                          >
                            {cls.name}
                          </div>
                          <div
                            style={{
                              fontFamily: "Outfit, sans-serif",
                              fontSize: 11,
                              color: MUTED,
                              marginTop: 1,
                            }}
                          >
                            {cls.desc}
                          </div>
                        </div>
                        {hackerClass === cls.id && (
                          <Check size={14} color={NEON} />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Timezone */}
            <InputField
              type="text"
              placeholder="Select timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              leftIcon={<Globe size={18} />}
              rightElement={<ChevronDown size={16} color={MUTED} />}
            />
          </div>

          {/* Skill Sliders */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <SkillSlider
              label="Frontend Skill"
              value={frontendSkill}
              onChange={setFrontendSkill}
            />
            <SkillSlider
              label="Blockchain Skill"
              value={blockchainSkill}
              onChange={setBlockchainSkill}
            />
            <SkillSlider
              label="Design Skill"
              value={designSkill}
              onChange={setDesignSkill}
            />
          </div>

          {/* Social Links */}
          <div style={{ marginTop: 24 }}>
            <div
              onClick={() => setShowSocialLinks(!showSocialLinks)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                marginBottom: showSocialLinks ? 14 : 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                Add social links (optional)
              </span>
              <ChevronRight
                size={14}
                color={MUTED}
                style={{
                  transform: showSocialLinks ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </div>

            <AnimatePresence>
              {showSocialLinks && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <InputField
                      type="text"
                      placeholder="github.com/username"
                      value={githubHandle}
                      onChange={(e) => setGithubHandle(e.target.value)}
                      leftIcon={<Github size={18} />}
                    />
                    <InputField
                      type="text"
                      placeholder="@handle"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      leftIcon={<Twitter size={18} />}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA */}
          <div style={{ marginTop: 32 }}>
            <button
              onClick={handleEnterArena}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                height: 52,
                background: isSubmitting ? "rgba(0,255,65,0.35)" : NEON,
                border: "none",
                borderRadius: 12,
                fontFamily: "Outfit, sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#050A05",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: btnHovered
                  ? "0 0 30px rgba(0,255,65,0.4)"
                  : "none",
                transform: btnHovered ? "translateY(-2px)" : "translateY(0)",
                transition: "all 0.15s ease",
              }}
            >
              {isSubmitting ? "Syncing profile..." : "Enter the Arena →"}
            </button>
            {submitError && (
              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 12,
                  color: "#FF6B00",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {submitError}
              </p>
            )}
            <p
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 12,
                color: "rgba(120,160,120,0.5)",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              You can update your profile anytime from Settings
            </p>

            {/* Progress Dots */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
              }}
            >
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      dot < 2
                        ? NEON
                        : "rgba(0,255,65,0.2)",
                    border:
                      dot === 2
                        ? `1px solid ${NEON}`
                        : "none",
                    boxShadow: dot < 2 ? "0 0 6px rgba(0,255,65,0.5)" : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ========== RIGHT: Live Preview Card ========== */}
        <div
          style={{
            flex: "0 0 340px",
            background: "#080D08",
            border: "1px solid rgba(0,255,65,0.12)",
            borderRadius: 16,
            padding: 24,
            position: "sticky",
            top: 90,
            alignSelf: "flex-start",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid rgba(0,255,65,0.08)",
            }}
          >
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: NEON,
                letterSpacing: "0.1em",
              }}
            >
              LIVE PREVIEW
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
          </div>

          {/* Avatar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: currentAvatar.gradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${NEON}`,
                boxShadow: "0 0 12px rgba(0,255,65,0.3)",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: currentAvatar.textColor,
                }}
              >
                {username ? username.slice(0, 2).toUpperCase() : "HQ"}
              </span>
            </div>

            {/* Player Name */}
            <div
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: username
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.2)",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {username || "your_hacker_name"}
            </div>

            {/* Class badge */}
            {selectedClass ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  background: `${selectedClass.color}18`,
                  border: `1px solid ${selectedClass.color}40`,
                  borderRadius: 20,
                }}
              >
                <span style={{ fontSize: 12 }}>{selectedClass.icon}</span>
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    color: selectedClass.color,
                  }}
                >
                  {selectedClass.name}
                </span>
              </div>
            ) : (
              <div
                style={{
                  padding: "4px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 20,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                No class selected
              </div>
            )}
          </div>

          {/* Stat bars */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            <MiniStatBar label="Build Speed" value={frontendSkill} />
            <MiniStatBar label="Blockchain" value={blockchainSkill} />
            <MiniStatBar label="Design" value={designSkill} />
          </div>

          {/* XP badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                padding: "5px 14px",
                background: "rgba(0,255,65,0.06)",
                border: "1px solid rgba(0,255,65,0.12)",
                borderRadius: 20,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: MUTED,
                letterSpacing: "0.04em",
              }}
            >
              0 XP · RANK PENDING
            </div>
          </div>

          {/* Wallet row */}
          <div
            style={{
              paddingTop: 14,
              borderTop: "1px solid rgba(0,255,65,0.06)",
            }}
          >
            {walletAddress ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: MUTED,
                  }}
                >
                  {truncateAddr(walletAddress)}
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 20h3.5l1.5-3.5h6l1.5 3.5H20L12 2zm0 6l2.2 5h-4.4L12 8z"
                      fill={NEON}
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <AlertTriangle size={13} color="rgba(255,107,0,0.8)" />
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "rgba(255,107,0,0.8)",
                  }}
                >
                  Wallet not connected
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #00FF41; }
          50% { opacity: 0.5; box-shadow: 0 0 12px #00FF41; }
        }
      `}</style>
    </div>
  );
}


