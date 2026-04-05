"use client";

import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Github,
  Check,
  Shield,
} from "lucide-react";
import { InputField } from "./InputField";
import { HackquestService } from "@/lib/services/hackquest.service";

const NEON = "#00FF41";
const MUTED = "rgba(120,160,120,0.7)";

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 6) s++;
  if (password.length >= 10) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[!@#$%^&*_\-]/.test(password)) s++;
  return s;
}

const STRENGTH = [
  { color: "transparent", label: "" },
  { color: "#FF4444", label: "WEAK" },
  { color: "#FF6B00", label: "FAIR" },
  { color: "#FFD700", label: "GOOD" },
  { color: "#00FF41", label: "STRONG" },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function Divider() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        margin: "20px 0",
      }}
    >
      <div
        style={{ flex: 1, height: 1, background: "rgba(0,255,65,0.08)" }}
      />
      <span
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: 12,
          color: MUTED,
          whiteSpace: "nowrap",
        }}
      >
        or continue with
      </span>
      <div
        style={{ flex: 1, height: 1, background: "rgba(0,255,65,0.08)" }}
      />
    </div>
  );
}

function SocialButtons() {
  const btnStyle = (hovered: boolean) => ({
    flex: 1,
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: hovered ? "rgba(0,255,65,0.06)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${hovered ? "rgba(0,255,65,0.25)" : "rgba(0,255,65,0.1)"}`,
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "Outfit, sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.85)",
  });

  const [ghHov, setGhHov] = useState(false);
  const [goHov, setGoHov] = useState(false);

  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        style={btnStyle(ghHov)}
        onMouseEnter={() => setGhHov(true)}
        onMouseLeave={() => setGhHov(false)}
      >
        <Github size={18} color="rgba(255,255,255,0.8)" />
        GitHub
      </button>
      <button
        style={btnStyle(goHov)}
        onMouseEnter={() => setGoHov(true)}
        onMouseLeave={() => setGoHov(false)}
      >
        <GoogleIcon />
        Google
      </button>
    </div>
  );
}

interface LoginSignupProps {
  initialTab?: "login" | "signup";
}

export function LoginSignup({ initialTab = "login" }: LoginSignupProps) {
  const navigate = useNavigate();
  const demoAdmin = HackquestService.getDemoAdminCredentials();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

  // Shared form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessMode, setAccessMode] = useState<"user" | "admin">("user");
  const [adminAccessKey, setAdminAccessKey] = useState("");

  const strength = getPasswordStrength(password);
  const strengthInfo = STRENGTH[strength] || STRENGTH[0];

  const eyeBtn = (show: boolean, setShow: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => setShow(!show)}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: MUTED }}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const PrimaryBtn = ({
    label,
    onClick,
    disabled = false,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      disabled={disabled}
      style={{
        width: "100%",
        height: 52,
        background: disabled ? "rgba(0,255,65,0.35)" : NEON,
        border: "none",
        borderRadius: 12,
        fontFamily: "Outfit, sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: "#050A05",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        boxShadow: btnHovered
          ? "0 0 30px rgba(0,255,65,0.4)"
          : "0 0 0 rgba(0,255,65,0)",
        transform: btnHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.15s ease",
        opacity: disabled ? 0.8 : 1,
      }}
    >
      {label}
    </button>
  );

  const resetAuthError = () => setAuthError(null);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    resetAuthError();

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    const isDemoAdminAttempt =
      email.trim().toLowerCase() === demoAdmin.email &&
      password === demoAdmin.password;

    if (accessMode === "admin" && !adminAccessKey && !isDemoAdminAttempt) {
      setAuthError("Admin access key is required for admin login.");
      return;
    }

    setIsSubmitting(true);
    const session = await HackquestService.login({
      email,
      password,
      requestedRole: accessMode,
      adminAccessKey: accessMode === "admin" ? adminAccessKey || undefined : undefined,
    });
    setIsSubmitting(false);

    if (!session) {
      setAuthError(
        accessMode === "admin"
          ? "Admin login failed. Use an approved admin email and valid access key, or use demo admin credentials."
          : "Login failed. Check your credentials and backend availability."
      );
      return;
    }

    navigate(session.authUser?.role === "admin" ? "/admin" : "/dashboard");
  };

  const handleSignup = async () => {
    if (isSubmitting) {
      return;
    }

    resetAuthError();

    if (!displayName || !username || !email || !password) {
      setAuthError("Display name, username, email, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setAuthError("You must accept terms before creating an account.");
      return;
    }

    setIsSubmitting(true);
    const session = await HackquestService.register({
      displayName,
      username,
      email,
      password,
      walletAddress: null,
    });
    setIsSubmitting(false);

    if (!session) {
      setAuthError("Signup failed. Try a different email/username or check backend connectivity.");
      return;
    }

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
        {/* Brand Block */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              background: NEON,
              borderRadius: 12,
            }}
          >
            <span
              style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: 18,
                fontWeight: 900,
                color: "#050A05",
              }}
            >
              HQ
            </span>
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: "Orbitron, sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: NEON,
              letterSpacing: "2px",
            }}
          >
            HACKQUEST
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: MUTED,
            }}
          >
            Enter the arena.
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(0,255,65,0.08)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {(["login", "signup"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: 8,
                border:
                  activeTab === tab
                    ? "1px solid rgba(0,255,65,0.3)"
                    : "1px solid transparent",
                background:
                  activeTab === tab
                    ? "rgba(0,255,65,0.1)"
                    : "transparent",
                color: activeTab === tab ? NEON : MUTED,
                fontFamily: "Outfit, sans-serif",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {tab === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          {activeTab === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* Login Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(0,255,65,0.12)",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11,
                      letterSpacing: "1px",
                      color: MUTED,
                      textTransform: "uppercase",
                    }}
                  >
                    <Shield size={14} />
                    Access Mode
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {([
                      { key: "user", label: "User Workspace" },
                      { key: "admin", label: "Admin Console" },
                    ] as const).map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => {
                          resetAuthError();
                          setAccessMode(mode.key);
                        }}
                        style={{
                          height: 36,
                          borderRadius: 8,
                          border:
                            accessMode === mode.key
                              ? "1px solid rgba(0,255,65,0.35)"
                              : "1px solid rgba(255,255,255,0.08)",
                          background:
                            accessMode === mode.key ? "rgba(0,255,65,0.12)" : "rgba(255,255,255,0.01)",
                          color: accessMode === mode.key ? NEON : "rgba(255,255,255,0.75)",
                          fontFamily: "Outfit, sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  {accessMode === "admin" && (
                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      <div
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "1px",
                          color: "rgba(255,255,255,0.82)",
                        }}
                      >
                        Demo ID: {demoAdmin.email}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "1px",
                          color: "rgba(255,255,255,0.82)",
                        }}
                      >
                        Demo Password: {demoAdmin.password}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          resetAuthError();
                          setEmail(demoAdmin.email);
                          setPassword(demoAdmin.password);
                          setAdminAccessKey(demoAdmin.accessKey);
                        }}
                        style={{
                          height: 32,
                          borderRadius: 8,
                          border: "1px solid rgba(0,255,65,0.3)",
                          background: "rgba(0,255,65,0.1)",
                          color: NEON,
                          fontFamily: "Outfit, sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Use Demo Admin Login
                      </button>
                    </div>
                  )}
                </div>

                <InputField
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  style={{ color: "rgba(255,255,255,0.9)" }}
                />
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={18} />}
                  rightElement={eyeBtn(showPassword, setShowPassword)}
                />
                {accessMode === "admin" && (
                  <InputField
                    type="password"
                    placeholder="Admin access key"
                    value={adminAccessKey}
                    onChange={(e) => {
                      resetAuthError();
                      setAdminAccessKey(e.target.value);
                    }}
                    leftIcon={<Shield size={18} />}
                  />
                )}
              </div>

              {/* Forgot Password */}
              <div style={{ textAlign: "right", marginTop: 8 }}>
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "rgba(0,255,65,0.6)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Forgot password?
                </span>
              </div>

              <div style={{ marginTop: 20 }}>
                <PrimaryBtn
                  label={isSubmitting ? "Signing In..." : "Login to Arena →"}
                  onClick={handleLogin}
                  disabled={isSubmitting}
                />
              </div>

              {authError && (
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "#ff6b6b",
                    textAlign: "center",
                  }}
                >
                  {authError}
                </div>
              )}

              <Divider />
              <SocialButtons />

              <div
                style={{
                  marginTop: 16,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(0,255,65,0.12)",
                  borderRadius: 12,
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "1px",
                      color: NEON,
                      marginBottom: 4,
                    }}
                  >
                    ADMIN EXTRA FEATURES
                  </div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    Full moderation queue, on-chain XP registry controls, and user intelligence lookup from Admin Panel / Participants.
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "1px",
                      color: "#ffb86b",
                      marginBottom: 4,
                    }}
                  >
                    USER LIMITED FEATURES
                  </div>
                  <div style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>
                    Users can manage only their own quests, wallet, and profile; admin-only routes and cross-user data access stay blocked.
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                New to HackQuest?{" "}
                <span
                  style={{ color: NEON, cursor: "pointer" }}
                  onClick={() => setActiveTab("signup")}
                >
                  Sign up →
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* Signup Form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <InputField
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => {
                    resetAuthError();
                    setDisplayName(e.target.value);
                  }}
                  leftIcon={<User size={18} />}
                />
                <InputField
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    resetAuthError();
                    setUsername(e.target.value);
                  }}
                  leftIcon={<User size={18} />}
                />
                <InputField
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    resetAuthError();
                    setEmail(e.target.value);
                  }}
                  leftIcon={<Mail size={18} />}
                />
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    resetAuthError();
                    setPassword(e.target.value);
                  }}
                  leftIcon={<Lock size={18} />}
                  rightElement={eyeBtn(showPassword, setShowPassword)}
                />
                <InputField
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    resetAuthError();
                    setConfirmPassword(e.target.value);
                  }}
                  leftIcon={<Lock size={18} />}
                  rightElement={eyeBtn(showConfirmPassword, setShowConfirmPassword)}
                  error={
                    confirmPassword.length > 0 && confirmPassword !== password
                  }
                />
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{ display: "flex", flex: 1, gap: 4, height: 8 }}
                    >
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          style={{
                            flex: 1,
                            height: "100%",
                            borderRadius: 4,
                            background:
                              seg <= strength
                                ? strengthInfo.color
                                : "rgba(255,255,255,0.06)",
                            transition: "background 0.3s",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 10,
                        color: strengthInfo.color,
                        minWidth: 44,
                        textAlign: "right",
                      }}
                    >
                      {strengthInfo.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginTop: 16,
                  cursor: "pointer",
                }}
                onClick={() => setAgreeTerms(!agreeTerms)}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: "1px solid rgba(0,255,65,0.2)",
                    background: agreeTerms
                      ? NEON
                      : "rgba(0,255,65,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                    transition: "all 0.18s",
                  }}
                >
                  {agreeTerms && (
                    <Check size={12} color="#050A05" strokeWidth={3} />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: MUTED,
                    lineHeight: 1.5,
                  }}
                >
                  I agree to the{" "}
                  <span
                    style={{
                      color: NEON,
                      textDecoration: "underline",
                    }}
                  >
                    Terms of Quest
                  </span>{" "}
                  and{" "}
                  <span style={{ color: NEON, textDecoration: "underline" }}>
                    Privacy Policy
                  </span>
                </span>
              </div>

              <div style={{ marginTop: 20 }}>
                <PrimaryBtn
                  label={isSubmitting ? "Creating Account..." : "Create Account →"}
                  onClick={handleSignup}
                  disabled={isSubmitting}
                />
              </div>

              {authError && (
                <div
                  style={{
                    marginTop: 12,
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 12,
                    color: "#ff6b6b",
                    textAlign: "center",
                  }}
                >
                  {authError}
                </div>
              )}

              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "Outfit, sans-serif",
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                Already have an account?{" "}
                <span
                  style={{ color: NEON, cursor: "pointer" }}
                  onClick={() => setActiveTab("login")}
                >
                  Login →
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
