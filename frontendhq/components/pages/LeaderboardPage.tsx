"use client";

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type LeaderboardView, type UserProfile } from '@/lib/services/hackquest.service';

const timeFilters = ['Daily', 'Weekly', 'Overall'];
const scopeFilters = ['Individual', 'Teams'];

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [scope, setScope] = useState('Individual');
  const [timeFilter, setTimeFilter] = useState('Overall');
  const [page, setPage] = useState(1);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardView[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [remoteLeaderboard, remoteProfile] = await Promise.all([
        HackquestService.getLeaderboard(),
        HackquestService.getCurrentUserProfile(),
      ]);
      if (!active) return;
      setLeaderboardList(remoteLeaderboard);
      setProfile(remoteProfile);
    })();

    return () => {
      active = false;
    };
  }, []);

  const top3 = leaderboardList.slice(0, 3);
  const myEntry = profile ? leaderboardList.find((entry) => entry.username === profile.username) : null;

  const getRankColor = (rank: number) => rank === 1 ? colors.gold500 : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : colors.textMuted;
  const getChangeColor = (change: string) => change.startsWith('+') && change !== '+0' ? colors.neon500 : change.startsWith('-') ? colors.red500 : colors.textMuted;

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>GLOBAL RANKINGS</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Leaderboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '12px', padding: '10px 16px' }}>
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}>YOUR RANK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: colors.neon500 }}>
                {myEntry?.rank ? `#${myEntry.rank}` : '—'}
              </span>
              <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.neon500 }}>
                {myEntry?.change || '+0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {scopeFilters.map((f) => (
            <button key={f} onClick={() => setScope(f)} style={{ padding: '8px 20px', borderRadius: '20px', border: `1px solid ${scope === f ? colors.neon300 : colors.borderSubtle}`, backgroundColor: scope === f ? colors.neon100 : 'transparent', color: scope === f ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.15s' }}>{f.toUpperCase()}</button>
          ))}
        </div>
        <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {timeFilters.map((f) => (
            <button key={f} onClick={() => setTimeFilter(f)} style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${timeFilter === f ? colors.neon300 : colors.borderSubtle}`, backgroundColor: timeFilter === f ? colors.neon100 : 'transparent', color: timeFilter === f ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', cursor: 'pointer' }}>{f.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Podium */}
      {top3.length >= 3 && (
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '24px' }}>
          {/* Rank 2 */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥈</div>
            <div onClick={() => navigate(`/profile/${top3[1].username}`)} style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid #C0C0C0`, backgroundColor: 'rgba(192,192,192,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: '#C0C0C0', margin: '0 auto 10px', cursor: 'pointer' }}>
              {top3[1].displayName.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{top3[1].displayName}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: '#C0C0C0' }}>#{top3[1].rank}</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500, marginTop: '6px' }}>⚡ {(top3[1].xp / 1000).toFixed(1)}k</div>
            <div style={{ height: '80px', backgroundColor: 'rgba(192,192,192,0.05)', border: '1px solid rgba(192,192,192,0.15)', borderRadius: '8px 8px 0 0', marginTop: '12px' }} />
          </div>

          {/* Rank 1 */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '20px', color: colors.gold500, marginBottom: '4px' }}>👑</div>
            <div onClick={() => navigate(`/profile/${top3[0].username}`)} style={{ width: '72px', height: '72px', borderRadius: '50%', border: `3px solid ${colors.gold500}`, backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: colors.gold500, margin: '0 auto 10px', cursor: 'pointer', boxShadow: `0 0 20px rgba(255,215,0,0.2)` }}>
              {top3[0].displayName.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{top3[0].displayName}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.gold500 }}>HACKATHON LEADER</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: colors.neon500, marginTop: '6px' }}>⚡ {(top3[0].xp / 1000).toFixed(1)}k</div>
            <div style={{ height: '120px', backgroundColor: 'rgba(255,215,0,0.04)', border: `1px solid ${colors.gold500}33`, borderRadius: '8px 8px 0 0', marginTop: '12px' }} />
          </div>

          {/* Rank 3 */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥉</div>
            <div onClick={() => navigate(`/profile/${top3[2].username}`)} style={{ width: '52px', height: '52px', borderRadius: '50%', border: `2px solid #CD7F32`, backgroundColor: 'rgba(205,127,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#CD7F32', margin: '0 auto 10px', cursor: 'pointer' }}>
              {top3[2].displayName.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{top3[2].displayName}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: '#CD7F32' }}>#{top3[2].rank}</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500, marginTop: '6px' }}>⚡ {(top3[2].xp / 1000).toFixed(1)}k</div>
            <div style={{ height: '56px', backgroundColor: 'rgba(205,127,50,0.04)', border: '1px solid rgba(205,127,50,0.15)', borderRadius: '8px 8px 0 0', marginTop: '12px' }} />
          </div>
        </div>
      </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px 120px 80px 60px 100px 80px', gap: '0', padding: '14px 20px', borderBottom: `1px solid ${colors.borderDefault}` }}>
          {['RANK', 'PLAYER', 'LEVEL', 'XP', 'QUESTS', 'NFTS', 'LAST ACTIVE', 'CHANGE'].map((h) => (
            <span key={h} style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {leaderboardList.map((player, i) => {
          const isYou = profile?.username === player.username;
          const changeColor = getChangeColor(player.change);
          return (
            <div
              key={player.rank}
              onClick={() => navigate(`/profile/${player.username}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 120px 80px 60px 100px 80px',
                gap: '0',
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.borderSubtle}`,
                backgroundColor: isYou ? 'rgba(0,255,65,0.06)' : 'transparent',
                borderLeft: isYou ? `3px solid ${colors.neon500}` : '3px solid transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => { if (!isYou) e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isYou ? 'rgba(0,255,65,0.06)' : 'transparent'; }}
            >
              <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: getRankColor(player.rank) }}>{player.rank <= 3 ? ['', '🥇', '🥈', '🥉'][player.rank] : `#${player.rank}`}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: isYou ? 'rgba(0,255,65,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isYou ? colors.neon500 : colors.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: isYou ? colors.neon500 : colors.textPrimary, flexShrink: 0 }}>
                  {player.displayName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: isYou ? 700 : 500, color: isYou ? colors.neon500 : colors.textPrimary }}>
                    {player.displayName} {isYou && <span style={{ fontSize: '11px', color: colors.textMuted, fontWeight: 400 }}>(you)</span>}
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{player.class.toUpperCase()}</div>
                </div>
              </div>
              <span style={{ backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.orbitron, fontSize: '11px', fontWeight: 700, color: colors.neon500, display: 'inline-block' }}>LVL {player.level}</span>
              <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500 }}>⚡ {(player.xp / 1000).toFixed(1)}k</span>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>{player.quests}</span>
              <span style={{ fontSize: '13px', color: colors.purple500 }}>● {player.nfts}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{player.lastActive}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '12px', fontWeight: 700, color: changeColor }}>{player.change.startsWith('+') && player.change !== '+0' ? `▲${player.change.slice(1)}` : player.change.startsWith('-') ? `▼${player.change.slice(1)}` : '—'}</span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textMuted }}>Showing 1–{leaderboardList.length} of 247</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ height: '36px', padding: '0 16px', backgroundColor: 'transparent', color: page === 1 ? colors.textDisabled : colors.textPrimary, borderRadius: '8px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>← Prev</button>
          {[1, 2, 3].map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ width: '36px', height: '36px', backgroundColor: page === p ? colors.neon500 : 'transparent', color: page === p ? colors.bgBase : colors.textMuted, borderRadius: '8px', border: `1px solid ${page === p ? colors.neon500 : colors.borderDefault}`, fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => p + 1)} style={{ height: '36px', padding: '0 16px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '8px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer' }}>Next →</button>
        </div>
      </div>
    </div>
  );
}


