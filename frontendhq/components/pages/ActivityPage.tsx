"use client";

import React, { useState } from 'react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type ActivityView, type LeaderboardView, type UserProfile } from '@/lib/services/hackquest.service';

const filterPills = ['All', '⚡ XP Earned', '🏆 NFTs Minted', '⬆️ Rank Changes', '⚡ Quests Done', '👥 Team Activity'];
const timeFilters = ['Last hour', 'Today', 'This week'];

const dotColor = (type: string) => type === 'quest' ? colors.neon500 : type === 'nft' ? colors.purple500 : type === 'rank' ? colors.gold500 : type === 'team' ? colors.blue500 : colors.orange500;
const typeIcon = (type: string) => type === 'quest' ? '⚡' : type === 'nft' ? '🎖️' : type === 'rank' ? '🏆' : type === 'team' ? '👥' : '🐛';

export function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [activityList, setActivityList] = useState<ActivityView[]>([]);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardView[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [remoteActivity, remoteLeaderboard, remoteProfile] = await Promise.all([
        HackquestService.getActivityFeed(),
        HackquestService.getLeaderboard(),
        HackquestService.getCurrentUserProfile(),
      ]);

      if (!active) return;
      setActivityList(remoteActivity);
      setLeaderboardList(remoteLeaderboard);
      setProfile(remoteProfile);
    })();

    return () => {
      active = false;
    };
  }, []);

  const supplementalFeed = React.useMemo(
    () =>
      leaderboardList.slice(0, 5).map((player, index) => {
        const variant = index % 3;

        if (variant === 0) {
          return {
            id: 100 + index,
            type: 'rank',
            player: player.displayName,
            avatar: null,
            event: 'climbed to',
            detail: `#${player.rank} Global`,
            time: `${(index + 1) * 11} min ago`,
            reactions: { '👏': 2 + index, '⚡': 1 + index },
          } as ActivityView;
        }

        if (variant === 1) {
          return {
            id: 100 + index,
            type: 'quest',
            player: player.displayName,
            avatar: null,
            event: 'completed quest',
            detail: 'Deploy Smart Contract',
            xp: `+${Math.max(100, Math.round(player.level * 30))} XP`,
            time: `${(index + 1) * 14} min ago`,
            reactions: { '👏': 2 + index },
          } as ActivityView;
        }

        return {
          id: 100 + index,
          type: 'nft',
          player: player.displayName,
          avatar: null,
          event: 'minted NFT',
          detail: `Mythic Relic #${index + 10}`,
          time: `${(index + 1) * 17} min ago`,
          reactions: { '🔥': 1 + index, '⚡': 1 },
        } as ActivityView;
      }),
    [leaderboardList]
  );

  const latestNftMints = React.useMemo(
    () =>
      leaderboardList.slice(0, 3).map((player, index) => ({
        name: `Mythic Relic #${index + 40}`,
        player: player.displayName,
        icon: index === 0 ? '🐉' : index === 1 ? '🦄' : '🪽',
        rarity: index === 0 ? 'LEGENDARY' : index === 1 ? 'EPIC' : 'RARE',
        time: `${(index + 1) * 9}m ago`,
      })),
    [leaderboardList]
  );

  const fullFeed = [...activityList, ...supplementalFeed];

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500 }}>LIVE FEED</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
          </div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>All Activity</h1>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textMuted, alignSelf: 'flex-end' }}>847 events today</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {filterPills.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${activeFilter === f ? colors.neon300 : colors.borderSubtle}`, backgroundColor: activeFilter === f ? colors.neon100 : 'transparent', color: activeFilter === f ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s' }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {timeFilters.map((t) => (
            <button key={t} onClick={() => setTimeFilter(t)} style={{ padding: '5px 12px', borderRadius: '12px', border: `1px solid ${timeFilter === t ? colors.neon300 : colors.borderSubtle}`, backgroundColor: timeFilter === t ? colors.neon100 : 'transparent', color: timeFilter === t ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', cursor: 'pointer' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '28px', alignItems: 'start' }}>
        {/* Feed timeline */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', borderLeft: `1px dashed ${colors.borderSubtle}` }} />
          {fullFeed.map((item, i) => {
            const dc = dotColor(item.type);
            return (
              <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingLeft: '16px', position: 'relative' }}>
                {/* Icon circle */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors.bgBase, border: `1px solid ${dc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  {typeIcon(item.type)}
                </div>
                {/* Timeline dot */}
                <div style={{ position: 'absolute', left: '9px', top: '16px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dc, zIndex: 2 }} />
                {/* Content card */}
                <div style={{ flex: 1, backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px 16px', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgCard; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: `${dc}15`, border: `1px solid ${dc}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: dc }}>
                        {item.player[0]}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>{item.player}</span>
                      <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, letterSpacing: '1px' }}>{item.event.toUpperCase()}</span>
                    </div>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, flexShrink: 0 }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '10px' }}>
                    {item.detail && <span style={{ color: dc, fontWeight: 600 }}>{item.detail}</span>}
                    {(item as any).xp && <span style={{ color: colors.neon500 }}> {(item as any).xp}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Object.entries(item.reactions).map(([emoji, count]) => (
                      <button key={emoji} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '3px 10px', fontSize: '11px', color: colors.textSecondary, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.neon100; e.currentTarget.style.borderColor = colors.neon300; e.currentTarget.style.color = colors.neon500; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = colors.borderSubtle; e.currentTarget.style.color = colors.textSecondary; }}
                      >
                        {emoji} {count}
                      </button>
                    ))}
                    <button style={{ backgroundColor: 'transparent', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '3px 10px', fontSize: '11px', color: colors.textMuted, cursor: 'pointer' }}>React</button>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ paddingLeft: '56px' }}>
            <button style={{ height: '44px', width: '100%', backgroundColor: 'transparent', color: colors.textSecondary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.neon300; e.currentTarget.style.color = colors.neon500; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderDefault; e.currentTarget.style.color = colors.textSecondary; }}
            >
              Load 50 more events
            </button>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          {/* Trending */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '16px' }}>TRENDING NOW</div>
            {[
              { rank: 1, action: 'Deploy Smart Contract', count: 47, color: colors.neon500 },
              { rank: 2, action: 'NFT Minting Contract', count: 31, color: colors.purple500 },
              { rank: 3, action: 'DeFi Dashboard Build', count: 24, color: colors.blue500 },
            ].map((item) => (
              <div key={item.rank} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.1)', width: '24px' }}>{item.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary }}>{item.action}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: item.color }}>{item.count} completions this hour</div>
                </div>
              </div>
            ))}
          </div>

          {/* Most XP Today */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.gold500, marginBottom: '16px' }}>MOST XP TODAY</div>
            {leaderboardList.slice(0, 5).map((player, i) => (
              <div key={player.rank} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${colors.borderSubtle}` : 'none' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: colors.textPrimary, flexShrink: 0 }}>
                  {player.displayName.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: player.username === profile?.username ? colors.neon500 : colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.displayName}</div>
                </div>
                <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.neon500 }}>+{Math.round(Math.random() * 800 + 200)}</span>
              </div>
            ))}
          </div>

          {/* New NFTs */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.purple500, marginBottom: '16px' }}>NEW NFTs MINTED</div>
            {latestNftMints.map((nft) => (
              <div key={nft.name} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: colors.purple100, border: '1px solid rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{nft.icon}</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary }}>{nft.name}</div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>by {nft.player}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{nft.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

