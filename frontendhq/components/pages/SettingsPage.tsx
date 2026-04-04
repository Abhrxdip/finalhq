"use client";

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { User, Wallet, Lock, Bell, Palette, Shield, AlertTriangle } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService } from '@/lib/services/hackquest.service';

const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'wallet', label: 'Wallet & Blockchain', icon: Wallet },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: value ? colors.neon500 : 'rgba(255,255,255,0.08)', cursor: 'pointer', position: 'relative', transition: 'background-color 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.borderSubtle}`, gap: '16px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{label}</div>
        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>{desc}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState('Player');
  const [username, setUsername] = useState('player');
  const [walletAddress, setWalletAddress] = useState(HackquestService.getCurrentWalletAddress() || '');
  const [walletProvider, setWalletProvider] = useState(HackquestService.getCurrentWalletProvider() || 'Pera Wallet');
  const [privacyToggles, setPrivacyToggles] = useState({ profilePublic: true, showXP: true, leaderboard: true, activityFeed: true, nftShowcase: true });
  const [notifToggles, setNotifToggles] = useState({ xpAlerts: true, rankChanges: true, teamInvites: true, nftMints: true, adminMessages: true, emailDigest: false });
  const [network, setNetwork] = useState<'Mainnet' | 'Testnet'>('Mainnet');
  const [acceptNFTs, setAcceptNFTs] = useState(true);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const profile = await HackquestService.getCurrentUserProfile();
      if (!active || !profile) return;

      setDisplayName(profile.displayName);
      setUsername(profile.username);
      if (profile.walletAddress) {
        setWalletAddress(profile.walletAddress);
      }

      const provider = HackquestService.getCurrentWalletProvider();
      if (provider) {
        setWalletProvider(provider);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const inputStyle: React.CSSProperties = { width: '100%', height: '48px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', color: colors.textPrimary, fontFamily: fonts.outfit, fontSize: '14px', padding: '0 16px', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>ACCOUNT</div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Settings</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Nav */}
        <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '12px', position: 'sticky', top: '24px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', backgroundColor: active ? colors.neon100 : 'transparent', borderLeft: `3px solid ${active ? colors.neon500 : 'transparent'}`, color: active ? colors.neon500 : colors.textSecondary, fontFamily: fonts.outfit, fontSize: '14px', fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: '2px' }}>
                <Icon size={16} style={{ flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {/* Profile */}
          {activeSection === 'profile' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Profile Settings</h2>
              
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `2px solid ${colors.neon500}`, backgroundColor: 'rgba(0,255,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: colors.neon500 }}>CH</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}>✏️</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>{displayName}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '8px' }}>@{username}</div>
                  <button style={{ height: '32px', backgroundColor: 'transparent', color: colors.neon500, borderRadius: '8px', border: `1px solid ${colors.neon300}`, fontFamily: fonts.outfit, fontSize: '12px', cursor: 'pointer', padding: '0 14px' }}>Upload Photo</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>DISPLAY NAME</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>USERNAME</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>BIO</label>
                  <textarea placeholder="Tell the world about yourself..." rows={3} style={{ ...inputStyle, height: '90px', padding: '12px 16px', resize: 'vertical', lineHeight: 1.5 }} />
                </div>
                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                  <button style={{ height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 24px' }}>Save Changes</button>
                  <button onClick={() => navigate(`/profile/${username}`)} style={{ height: '44px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}>Preview Profile →</button>
                </div>
              </div>
            </div>
          )}

          {/* Wallet */}
          {activeSection === 'wallet' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Wallet & Blockchain</h2>
              <div style={{ backgroundColor: 'rgba(0,149,255,0.04)', border: `1px solid rgba(0,149,255,0.15)`, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: colors.blue500 }}>◆</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>CONNECTED WALLET</span>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
                  <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500 }}>{walletProvider.toUpperCase()}</span>
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textSecondary, marginBottom: '12px' }}>{walletAddress}</div>
                <button style={{ height: '36px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '8px', border: `1px solid rgba(255,68,68,0.3)`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 14px' }}>Disconnect</button>
              </div>
              <button style={{ width: '100%', height: '48px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginBottom: '20px' }}>Connect Different Wallet</button>
              
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>ALGORAND NETWORK</div>
                <div style={{ display: 'flex', gap: '0', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '4px' }}>
                  {(['Mainnet', 'Testnet'] as const).map((n) => (
                    <button key={n} onClick={() => setNetwork(n)} style={{ flex: 1, height: '36px', borderRadius: '8px', border: network === n ? `1px solid ${colors.neon300}` : '1px solid transparent', backgroundColor: network === n ? colors.neon100 : 'transparent', color: network === n ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>{n.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '16px', backgroundColor: 'rgba(0,255,65,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>⚡ Algorand is feeless — no gas costs for transactions or NFT minting on this platform.</div>
              </div>
              <ToggleRow label="Accept NFT Gifts" desc="Allow other players to send NFTs to your wallet" value={acceptNFTs} onChange={setAcceptNFTs} />
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Privacy Settings</h2>
              <ToggleRow label="Public Profile" desc="Allow anyone to view your profile page" value={privacyToggles.profilePublic} onChange={(v) => setPrivacyToggles(p => ({ ...p, profilePublic: v }))} />
              <ToggleRow label="Show XP Publicly" desc="Display your XP total on your public profile" value={privacyToggles.showXP} onChange={(v) => setPrivacyToggles(p => ({ ...p, showXP: v }))} />
              <ToggleRow label="Leaderboard Inclusion" desc="Appear on the global and event leaderboards" value={privacyToggles.leaderboard} onChange={(v) => setPrivacyToggles(p => ({ ...p, leaderboard: v }))} />
              <ToggleRow label="Activity Feed Visibility" desc="Show your activity in the live feed" value={privacyToggles.activityFeed} onChange={(v) => setPrivacyToggles(p => ({ ...p, activityFeed: v }))} />
              <ToggleRow label="NFT Showcase Public" desc="Display your NFT collection on your profile" value={privacyToggles.nftShowcase} onChange={(v) => setPrivacyToggles(p => ({ ...p, nftShowcase: v }))} />
              <button style={{ marginTop: '20px', height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 24px' }}>Save Preferences</button>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Notification Settings</h2>
              <ToggleRow label="XP Alerts" desc="Get notified when XP is credited to your account" value={notifToggles.xpAlerts} onChange={(v) => setNotifToggles(p => ({ ...p, xpAlerts: v }))} />
              <ToggleRow label="Rank Changes" desc="Alerts when your leaderboard position changes" value={notifToggles.rankChanges} onChange={(v) => setNotifToggles(p => ({ ...p, rankChanges: v }))} />
              <ToggleRow label="Team Invites" desc="Notifications for team join requests and invites" value={notifToggles.teamInvites} onChange={(v) => setNotifToggles(p => ({ ...p, teamInvites: v }))} />
              <ToggleRow label="NFT Mints" desc="Confirmation when your NFTs are minted on Algorand" value={notifToggles.nftMints} onChange={(v) => setNotifToggles(p => ({ ...p, nftMints: v }))} />
              <ToggleRow label="Admin Messages" desc="Important announcements from event organizers" value={notifToggles.adminMessages} onChange={(v) => setNotifToggles(p => ({ ...p, adminMessages: v }))} />
              <ToggleRow label="Email Digest" desc="Daily summary email of your hackathon progress" value={notifToggles.emailDigest} onChange={(v) => setNotifToggles(p => ({ ...p, emailDigest: v }))} />
              <button style={{ marginTop: '20px', height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 24px' }}>Save Preferences</button>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Security</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[{ label: 'CURRENT PASSWORD', placeholder: '••••••••••••' }, { label: 'NEW PASSWORD', placeholder: 'Enter new password' }, { label: 'CONFIRM NEW PASSWORD', placeholder: 'Confirm new password' }].map((f) => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>{f.label}</label>
                    <input type="password" placeholder={f.placeholder} style={{ width: '100%', height: '48px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', color: colors.textPrimary, fontFamily: fonts.outfit, fontSize: '14px', padding: '0 16px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button style={{ height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', width: 'fit-content', padding: '0 24px', marginTop: '4px' }}>Update Password</button>
              </div>
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${colors.borderSubtle}` }}>
                <ToggleRow label="Two-Factor Authentication" desc="Require email verification on login" value={true} onChange={() => {}} />
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === 'appearance' && (
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 24px' }}>Appearance</h2>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>ACCENT COLOR</div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[colors.neon500, colors.purple500, colors.blue500, colors.orange500, colors.gold500].map((c) => (
                  <div key={c} onClick={() => {}} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: c === colors.neon500 ? `3px solid #fff` : '3px solid transparent', transition: 'all 0.15s' }} />
                ))}
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>THEME</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ name: 'Neon Dark', desc: 'Default — green neon on dark' }, { name: 'Cyber Blue', desc: 'Electric blue on dark' }].map((t) => (
                  <div key={t.name} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${t.name === 'Neon Dark' ? colors.neon300 : colors.borderSubtle}`, borderRadius: '10px', padding: '16px', cursor: 'pointer' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === 'danger' && (
            <div style={{ backgroundColor: 'rgba(255,68,68,0.04)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: '16px', padding: '28px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: colors.red500, margin: '0 0 8px' }}>⚠️ Danger Zone</h2>
              <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '24px' }}>These actions are irreversible. Proceed with caution.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Reset XP (Dev Only)', desc: 'Reset all XP and progress to zero. This cannot be undone.' },
                  { label: 'Export Data', desc: 'Download a copy of all your account data and on-chain records.' },
                  { label: 'Delete Account', desc: 'Permanently delete your account. NFTs will remain on-chain.' },
                ].map((action) => (
                  <div key={action.label} style={{ backgroundColor: 'rgba(255,68,68,0.03)', border: '1px solid rgba(255,68,68,0.12)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{action.label}</div>
                      <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>{action.desc}</div>
                    </div>
                    <button style={{ height: '36px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '8px', border: `1px solid rgba(255,68,68,0.4)`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 14px', flexShrink: 0, whiteSpace: 'nowrap' }}>{action.label}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


