"use client";

import React, { useState } from 'react';
import { Zap, Trophy, Users, Shield } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackteraService, type NotificationView } from '@/lib/services/hacktera.service';

const filterTabs = ['All', 'XP', 'NFTs', 'Leaderboard', 'Team', 'System'];

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  xp: { icon: <Zap size={16} />, color: colors.neon500, bg: colors.neon100 },
  nft: { icon: <span style={{ fontSize: '14px' }}>🎖️</span>, color: colors.purple500, bg: colors.purple100 },
  rank: { icon: <Trophy size={16} />, color: colors.gold500, bg: colors.gold100 },
  team: { icon: <Users size={16} />, color: colors.blue500, bg: colors.blue100 },
  system: { icon: <Shield size={16} />, color: colors.orange500, bg: colors.orange100 },
};

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [notifState, setNotifState] = useState<NotificationView[]>([]);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const remoteNotifications = await HackteraService.getNotifications();
      if (!active) return;
      setNotifState(remoteNotifications);
    })();

    return () => {
      active = false;
    };
  }, []);

  const markAllRead = () => setNotifState(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifState(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filtered = activeFilter === 'All' ? notifState : notifState.filter(n => {
    const map: Record<string, string> = { XP: 'xp', NFTs: 'nft', Leaderboard: 'rank', Team: 'team', System: 'system' };
    return n.type === map[activeFilter];
  });

  const unreadCount = notifState.filter(n => !n.read).length;

  // Group by day
  const today = filtered.filter(n => ['2 min ago', '15 min ago', '1h ago'].includes(n.time));
  const yesterday = filtered.filter(n => n.time === 'Yesterday');
  const older = filtered.filter(n => !['2 min ago', '15 min ago', '1h ago', 'Yesterday'].includes(n.time));

  const Section = ({ label, items }: { label: string; items: typeof notifState }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '3px', color: colors.textMuted, padding: '12px 0 8px', borderBottom: `1px solid ${colors.borderSubtle}` }}>{label}</div>
        {items.map((n) => {
          const tc = typeConfig[n.type] || typeConfig.system;
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0',
                borderBottom: `1px solid ${colors.borderSubtle}`,
                backgroundColor: !n.read ? 'rgba(0,255,65,0.02)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !n.read ? 'rgba(0,255,65,0.02)' : 'transparent'; }}
            >
              {/* Unread indicator */}
              {!n.read && <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: '3px', height: '32px', backgroundColor: colors.neon500, borderRadius: '2px' }} />}
              
              {/* Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: tc.bg, border: `1px solid ${tc.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: !n.read ? '8px' : '0' }}>
                <span style={{ color: tc.color }}>{tc.icon}</span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: n.read ? 400 : 600, color: n.read ? colors.textSecondary : colors.textPrimary, marginBottom: '3px' }}>{n.title}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.description}</div>
              </div>

              {/* Right */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{n.time}</span>
                {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500 }} />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: fonts.outfit, maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>NOTIFICATIONS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Inbox</h1>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', padding: '2px 10px', fontFamily: fonts.mono, fontSize: '11px', fontWeight: 700 }}>{unreadCount}</span>
            )}
          </div>
        </div>
        <button onClick={markAllRead} style={{ height: '36px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '8px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 14px', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.neon300; e.currentTarget.style.color = colors.neon500; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderDefault; e.currentTarget.style.color = colors.textMuted; }}
        >
          Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderSubtle}`, marginBottom: '0' }}>
        {filterTabs.map((tab) => {
          const tabTypeMap: Record<string, string> = { XP: 'xp', NFTs: 'nft', Leaderboard: 'rank', Team: 'team', System: 'system' };
          const count = tab === 'All' ? unreadCount : notifState.filter(n => !n.read && n.type === tabTypeMap[tab]).length;
          return (
            <button key={tab} onClick={() => setActiveFilter(tab)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeFilter === tab ? `2px solid ${colors.neon500}` : '2px solid transparent', color: activeFilter === tab ? '#fff' : colors.textMuted, fontFamily: fonts.outfit, fontSize: '14px', fontWeight: activeFilter === tab ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tab}
              {count > 0 && <span style={{ backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '8px', padding: '0 5px', fontFamily: fonts.mono, fontSize: '9px', fontWeight: 700 }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', color: colors.textMuted }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
          <div style={{ fontSize: '14px' }}>No notifications in this category</div>
        </div>
      ) : (
        <div>
          <Section label="TODAY" items={today} />
          <Section label="YESTERDAY" items={yesterday} />
          <Section label="EARLIER" items={older} />
        </div>
      )}
    </div>
  );
}

