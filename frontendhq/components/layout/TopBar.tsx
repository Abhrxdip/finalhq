"use client";

import React, { useState } from 'react';
import { Bell, Search, Zap } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { NavLink, useLocation, useNavigate } from '@/lib/router-compat';
import { appNavItems } from '@/components/layout/navigation';
import { HackquestService } from '@/lib/services/hackquest.service';

const topBarNavPaths = [
  '/dashboard',
  '/quests',
  '/event',
  '/team',
  '/leaderboard',
  '/profile/cipher_hawk',
  '/marketplace',
  '/activity',
  '/wallet',
  '/notifications',
  '/settings',
  '/admin',
];

export function TopBar() {
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [xp, setXp] = useState(0);
  const [avatarInitials, setAvatarInitials] = useState('PL');
  const [profilePath, setProfilePath] = useState('/profile/player');
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [profile, session] = await Promise.all([
        HackquestService.getCurrentUserProfile(),
        HackquestService.getAuthMe(),
      ]);
      if (!active || !profile) return;

      setIsAdmin(session.authUser?.role === 'admin');

      setXp(profile.totalXp);
      setProfilePath(`/profile/${profile.username}`);

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

  const visibleTopBarItems = React.useMemo(
    () =>
      appNavItems.filter(
        (item) => topBarNavPaths.includes(item.path) && (item.path !== '/admin' || isAdmin)
      ),
    [isAdmin]
  );

  const handleLogout = React.useCallback(async () => {
    await HackquestService.logout();
    HackquestService.clearWalletSession();
    window.location.assign('/login');
  }, []);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: `${colors.bgSurface}CC`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.borderSubtle}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        fontFamily: fonts.outfit,
      }}
    >
      {/* Search */}
      <div
        style={{
          flex: 1,
          maxWidth: '400px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search size={14} style={{ position: 'absolute', left: '14px', color: colors.textMuted }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quests, players, events..."
          style={{
            width: '100%',
            height: '38px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: `1px solid ${colors.borderSubtle}`,
            borderRadius: '10px',
            color: colors.textPrimary,
            fontFamily: fonts.outfit,
            fontSize: '13px',
            padding: '0 16px 0 38px',
            outline: 'none',
          }}
        />
      </div>

      {/* Primary nav */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: '8px',
          marginRight: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {visibleTopBarItems.map((item) => {
          const isProfilePath = item.path.startsWith('/profile/');
          const isActive = isProfilePath
            ? location.pathname.startsWith('/profile/')
            : location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          const navLabel = item.path === '/marketplace' ? 'NFT Marketplace' : item.label;
          const navColor = isActive ? (item.accent || colors.neon500) : colors.textSecondary;
          const navBorderColor = isActive ? (item.accent ? `${item.accent}66` : colors.neon300) : colors.borderSubtle;
          const navBgColor = isActive ? (item.accent ? `${item.accent}22` : colors.neon100) : 'transparent';
          return (
            <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '18px',
                  border: `1px solid ${navBorderColor}`,
                  backgroundColor: navBgColor,
                  color: navColor,
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {navLabel}
                {item.badge && (
                  <span
                    style={{
                      backgroundColor: colors.neon500,
                      color: colors.bgBase,
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontSize: '10px',
                      fontFamily: fonts.mono,
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </span>
            </NavLink>
          );
        })}

        <button
          onClick={handleLogout}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '34px',
            padding: '0 12px',
            borderRadius: '18px',
            border: `1px solid rgba(255,68,68,0.35)`,
            backgroundColor: 'rgba(255,68,68,0.08)',
            color: colors.red500,
            fontSize: '12px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </nav>

      <div style={{ flex: 1 }} />

      {/* Live event indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(0,255,65,0.06)',
          border: `1px solid ${colors.borderDefault}`,
          borderRadius: '20px',
          padding: '6px 14px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/event')}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.neon500,
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.neon500 }}>
          LIVE EVENT
        </span>
      </div>

      {/* XP pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: colors.neon100,
          border: `1px solid ${colors.neon300}`,
          borderRadius: '20px',
          padding: '4px 12px',
        }}
      >
        <Zap size={12} style={{ color: colors.neon500 }} />
        <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.neon500, fontWeight: 700 }}>
          {xp.toLocaleString()} XP
        </span>
      </div>

      {/* Notifications */}
      <button
        onClick={() => navigate('/notifications')}
        style={{
          position: 'relative',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: `1px solid ${colors.borderSubtle}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Bell size={16} style={{ color: colors.textSecondary }} />
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.neon500,
          }}
        />
      </button>

      {/* Avatar */}
      <div
        onClick={() => navigate(profilePath)}
        style={{
          width: '38px',
          height: '38px',
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
          cursor: 'pointer',
        }}
      >
        {avatarInitials}
      </div>
    </header>
  );
}


