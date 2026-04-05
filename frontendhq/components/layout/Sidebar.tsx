"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLink, useLocation } from '@/lib/router-compat';
import { Award, CalendarPlus, FileText, LayoutDashboard, LogOut, Settings, Trophy, Users } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { appNavItems } from '@/components/layout/navigation';
import { HackquestService } from '@/lib/services/hackquest.service';

const ADMIN_NAV_PATHS = ['/dashboard', '/quests', '/admin', '/leaderboard', '/marketplace', '/settings'];
const PLAYER_NAV_PATHS = [
  '/dashboard',
  '/quests',
  '/team',
  '/leaderboard',
  '/profile/cipher_hawk',
  '/marketplace',
  '/activity',
  '/wallet',
  '/notifications',
  '/settings',
];

const adminSectionNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Quest', icon: CalendarPlus },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'nft-minting', label: 'NFT Minting', icon: Award },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const searchParams = useSearchParams();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [displayName, setDisplayName] = React.useState('Player');
  const [level, setLevel] = React.useState(1);
  const [rank, setRank] = React.useState(0);
  const [xp, setXp] = React.useState(0);
  const [avatarInitials, setAvatarInitials] = React.useState('PL');

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [profile, session] = await Promise.all([
        HackquestService.getCurrentUserProfile(),
        HackquestService.getAuthMe(),
      ]);
      if (!active || !profile) return;

      setIsAdmin(session.authUser?.role === 'admin');

      setDisplayName(profile.displayName);
      setLevel(profile.level);
      setRank(profile.rank);
      setXp(profile.totalXp);

      const initials = profile.displayName
        .split(' ')
        .filter(Boolean)
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      if (initials) {
        setAvatarInitials(initials);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const visibleNavItems = React.useMemo(
    () => {
      const allowedPaths = isAdmin ? ADMIN_NAV_PATHS : PLAYER_NAV_PATHS;
      return appNavItems.filter((item) => allowedPaths.includes(item.path));
    },
    [isAdmin]
  );

  const showAdminSectionMenu = isAdmin && location.pathname === '/admin';
  const activeAdminSection = searchParams.get('section') || 'overview';

  const handleLogout = React.useCallback(async () => {
    await HackquestService.logout();
    HackquestService.clearWalletSession();
    window.location.assign('/login');
  }, []);

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: colors.bgSurface,
        borderRight: `1px solid ${colors.borderDefault}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        fontFamily: fonts.outfit,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: colors.neon500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.orbitron,
              fontSize: '14px',
              fontWeight: 900,
              color: colors.bgBase,
              flexShrink: 0,
            }}
          >
            HQ
          </div>
          <div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500, letterSpacing: '2px' }}>
              HACKQUEST
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: fonts.mono, letterSpacing: '1px' }}>
              GENESIS · S01
            </div>
          </div>
        </div>
      </div>

      {/* Player info */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `2px solid ${colors.neon500}`,
              backgroundColor: 'rgba(0,255,65,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.orbitron,
              fontSize: '12px',
              fontWeight: 700,
              color: colors.neon500,
              flexShrink: 0,
            }}
          >
            {avatarInitials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: fonts.mono }}>
              LVL {level} · #{rank} GLOBAL
            </div>
          </div>
        </div>
        {/* XP bar */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>XP</span>
            <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500 }}>{xp.toLocaleString()}</span>
          </div>
          <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
            <div style={{ width: '72%', height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {showAdminSectionMenu ? (
          <>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: '10px',
                letterSpacing: '2px',
                color: colors.orange500,
                padding: '8px 12px',
                marginBottom: '4px',
              }}
            >
              ADMIN PANEL
            </div>
            {adminSectionNavItems.map((item) => {
              const active = activeAdminSection === item.id;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={`/admin?section=${item.id}`}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: '2px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: active ? colors.neon100 : 'transparent',
                      borderLeft: active ? `3px solid ${colors.neon500}` : '3px solid transparent',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: active ? colors.neon500 : colors.textMuted, flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: active ? 600 : 400,
                        color: active ? colors.neon500 : colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </>
        ) : (
          visibleNavItems.map((item) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;
            const accentColor = item.accent || colors.neon500;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none', display: 'block', marginBottom: '2px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    backgroundColor: active ? colors.neon100 : 'transparent',
                    borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: active ? accentColor : colors.textMuted, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: active ? 600 : 400,
                      color: active ? accentColor : colors.textSecondary,
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      style={{
                        backgroundColor: colors.neon500,
                        color: colors.bgBase,
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: fonts.mono,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${colors.borderSubtle}` }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 0',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
          }}
        >
          <LogOut size={14} style={{ color: colors.red500 }} />
          <span style={{ fontSize: '13px', color: colors.textMuted }}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}


