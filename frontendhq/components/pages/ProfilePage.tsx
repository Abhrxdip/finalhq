"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { ExternalLink, Zap, Copy } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import {
  HackteraService,
  type ActivityView,
  type LeaderboardView,
  type MarketplaceItemView,
  type QuestView,
  type UserProfile,
} from '@/lib/services/hacktera.service';

const profileTabs = ['Stats', 'Quests (42)', 'NFTs (12)', 'Team', 'Activity'];

const achievements = [
  { icon: '🐛', label: 'Bug Slayer', rarity: 'LEGENDARY', color: colors.gold500 },
  { icon: '⚡', label: 'Speed Demon', rarity: 'EPIC', color: colors.purple500 },
  { icon: '⛓️', label: 'Chain Master', rarity: 'RARE', color: colors.blue500 },
  { icon: '🎮', label: 'Genesis', rarity: 'LEGENDARY', color: colors.gold500 },
  { icon: '🔥', label: '7-Day Streak', rarity: 'EPIC', color: colors.orange500 },
  { icon: '🧙', label: 'Algo Sage', rarity: 'EPIC', color: colors.purple500 },
];

const rarityConfig: Record<string, { bg: string; border: string; color: string }> = {
  LEGENDARY: { bg: colors.gold100, border: 'rgba(255,215,0,0.3)', color: colors.gold500 },
  EPIC: { bg: colors.purple100, border: 'rgba(123,47,255,0.3)', color: colors.purple500 },
  RARE: { bg: colors.blue100, border: 'rgba(0,149,255,0.3)', color: colors.blue500 },
};

const skills = [
  { label: 'FRONTEND', value: 72, color: colors.neon500 },
  { label: 'BLOCKCHAIN', value: 85, color: colors.blue500 },
  { label: 'DESIGN', value: 58, color: colors.purple500 },
  { label: 'SECURITY', value: 45, color: colors.orange500 },
  { label: 'DEFI', value: 70, color: colors.gold500 },
];

export function ProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('Stats');
  const [copied, setCopied] = useState(false);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardView[]>([]);
  const [nftList, setNftList] = useState<MarketplaceItemView[]>([]);
  const [questList, setQuestList] = useState<QuestView[]>([]);
  const [activityList, setActivityList] = useState<ActivityView[]>([]);
  const [viewerProfile, setViewerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteLeaderboard, remoteNfts, remoteQuests, remoteActivity, remoteProfile] = await Promise.all([
        HackteraService.getLeaderboard(),
        HackteraService.getMarketplaceItems(),
        HackteraService.getQuests(),
        HackteraService.getActivityFeed(),
        HackteraService.getCurrentUserProfile(),
      ]);

      if (!active) return;
      setLeaderboardList(remoteLeaderboard);
      setNftList(remoteNfts);
      setQuestList(remoteQuests);
      setActivityList(remoteActivity);
      setViewerProfile(remoteProfile);
    })();

    return () => {
      active = false;
    };
  }, []);

  const defaultPlayer: LeaderboardView = {
    rank: 0,
    username: viewerProfile?.username || 'player',
    displayName: viewerProfile?.displayName || 'Player',
    class: viewerProfile?.className || 'Architect',
    level: viewerProfile?.level || 1,
    xp: viewerProfile?.totalXp || 0,
    quests: 0,
    nfts: viewerProfile?.nftCount || 0,
    lastActive: 'just now',
    change: '+0',
  };

  const player = leaderboardList.find((entry) => entry.username === username) || defaultPlayer;
  const isYou = viewerProfile?.username === player.username;
  const fullWalletAddress = viewerProfile?.walletAddress || '';
  const walletLabel = fullWalletAddress
    ? `${fullWalletAddress.slice(0, 8)}...${fullWalletAddress.slice(-4)}`
    : 'No wallet linked';

  const handleCopy = () => {
    if (!fullWalletAddress) {
      return;
    }

    navigator.clipboard.writeText(fullWalletAddress).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const classColors: Record<string, string> = {
    Architect: colors.neon500, Warrior: colors.orange500, Mage: colors.purple500, Phantom: colors.blue500,
  };
  const classColor = classColors[player.class] || colors.neon500;

  // Radar chart points (5 axes: Frontend, Blockchain, Design, Security, DeFi)
  const radarValues = [72, 85, 58, 45, 70];
  const radarSize = 160;
  const center = radarSize / 2;
  const radarRadius = 60;
  const axes = 5;
  const angleStep = (2 * Math.PI) / axes;
  const radarPoints = radarValues.map((val, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const r = (val / 100) * radarRadius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  });
  const gridPoints = (scale: number) => Array.from({ length: axes }, (_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return `${center + scale * radarRadius * Math.cos(angle)},${center + scale * radarRadius * Math.sin(angle)}`;
  }).join(' ');
  const filledPolygon = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Hero */}
      <div style={{ borderRadius: '20px', border: `1px solid ${colors.borderDefault}`, overflow: 'hidden', marginBottom: '0', background: 'linear-gradient(135deg, rgba(0,255,65,0.06) 0%, rgba(123,47,255,0.04) 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 32px, rgba(255,255,255,0.015) 32px, rgba(255,255,255,0.015) 33px)', pointerEvents: 'none' }} />
        <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', position: 'relative' }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: `3px solid ${classColor}`, backgroundColor: `${classColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: classColor, boxShadow: `0 0 20px ${classColor}40` }}>
                {player.displayName.split(' ').map(n => n[0]).join('')}
              </div>
              {isYou && <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colors.neon500, border: `2px solid ${colors.bgBase}` }} />}
            </div>
            <div>
              <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{player.displayName}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span style={{ backgroundColor: `${classColor}15`, border: `1px solid ${classColor}44`, borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: classColor }}>{player.class.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textMuted }}>Level {player.level} · ELITE HACKER</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{walletLabel}</span>
                <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: fullWalletAddress ? 'pointer' : 'not-allowed', color: colors.textMuted, padding: 0, opacity: fullWalletAddress ? 1 : 0.5 }}><Copy size={12} /></button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.blue500, padding: 0 }}><ExternalLink size={12} /></button>
                <span style={{ fontSize: '12px', color: colors.blue500 }}>◆ Algorand</span>
              </div>
            </div>
          </div>
          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: colors.gold500 }}>#{player.rank} GLOBAL</div>
              <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: colors.neon500 }}>⚡ {player.xp.toLocaleString()} XP</div>
            </div>
            {isYou ? (
              <button onClick={() => navigate('/settings')} style={{ height: '40px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 16px' }}>Edit Profile</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ height: '40px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Follow</button>
                <button style={{ height: '40px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 16px' }}>Challenge</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderSubtle}`, marginBottom: '28px' }}>
        {profileTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '14px 18px', background: 'none', border: 'none', borderBottom: activeTab === tab ? `2px solid ${colors.neon500}` : '2px solid transparent', color: activeTab === tab ? '#fff' : colors.textMuted, fontFamily: fonts.outfit, fontSize: '14px', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px', whiteSpace: 'nowrap' }}>{tab}</button>
        ))}
      </div>

      {/* Stats Tab */}
      {activeTab === 'Stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr', gap: '24px' }}>
          {/* Left - Stat bars */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '20px' }}>SKILL MATRIX</div>
            {skills.map((skill) => (
              <div key={skill.label} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted }}>{skill.label}</span>
                  <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: skill.color }}>{skill.value}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                  <div style={{ width: `${skill.value}%`, height: '100%', background: `linear-gradient(90deg, ${skill.color}, ${skill.color}99)`, borderRadius: '3px', transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: '16px', marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ label: 'Quests Completed', value: String(player.quests) }, { label: 'NFTs Owned', value: String(player.nfts) }, { label: 'Win Rate', value: '87%' }, { label: 'Avg XP/Quest', value: '297' }].map((s) => (
                <div key={s.label} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Center - Radar chart */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '16px', textAlign: 'center' }}>RADAR</div>
            <svg width={radarSize} height={radarSize}>
              {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                <polygon key={i} points={gridPoints(scale)} fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="1" />
              ))}
              {Array.from({ length: axes }, (_, i) => {
                const angle = -Math.PI / 2 + i * angleStep;
                return <line key={i} x1={center} y1={center} x2={center + radarRadius * Math.cos(angle)} y2={center + radarRadius * Math.sin(angle)} stroke="rgba(0,255,65,0.1)" strokeWidth="1" />;
              })}
              <polygon points={filledPolygon} fill="rgba(0,255,65,0.12)" stroke={colors.neon500} strokeWidth="2" />
              {radarPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={colors.neon500} />)}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', width: '100%' }}>
              {['Frontend', 'Blockchain', 'Design', 'Security', 'DeFi'].map((l, i) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>{l}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.neon500 }}>{radarValues[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Achievement badges */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '20px' }}>ACHIEVEMENTS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {achievements.map((ach) => {
                const rc = rarityConfig[ach.rarity];
                return (
                  <div key={ach.label} style={{ backgroundColor: rc.bg, border: `1px solid ${rc.border}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{ach.icon}</div>
                    <div style={{ fontFamily: fonts.orbitron, fontSize: '10px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{ach.label}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: ach.color }}>{ach.rarity}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quests Tab */}
      {activeTab === 'Quests (42)' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {questList.map((q) => (
            <div key={q.id} onClick={() => navigate(`/quests/${q.id}`)} style={{ backgroundColor: q.status === 'Completed' ? 'rgba(0,255,65,0.04)' : colors.bgCard, border: `1px solid ${q.status === 'Completed' ? colors.neon300 : colors.borderDefault}`, borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = q.status === 'Completed' ? 'rgba(0,255,65,0.04)' : colors.bgCard; }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${q.categoryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {q.category === 'Deploy' ? '🚀' : q.category === 'Building' ? '🏗️' : '📄'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{q.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>⚡{q.xp}</span>
                    {q.status === 'Completed' && <span style={{ fontSize: '11px', color: colors.neon500 }}>✓ Done</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NFTs Tab */}
      {activeTab === 'NFTs (12)' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {nftList.map((nft) => {
            const rc = rarityConfig[nft.rarity] || rarityConfig.RARE;
            return (
              <div key={nft.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.15s', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,255,65,0.12)'; e.currentTarget.style.borderColor = colors.neon300; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = colors.borderDefault; }}
              >
                <div style={{ height: '120px', backgroundColor: rc.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', top: '8px', left: '8px', width: '14px', height: '14px', border: `2px solid ${colors.neon500}`, borderRight: 'none', borderBottom: 'none' }} />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '14px', height: '14px', border: `2px solid ${colors.neon500}`, borderLeft: 'none', borderBottom: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '14px', height: '14px', border: `2px solid ${colors.neon500}`, borderRight: 'none', borderTop: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '14px', height: '14px', border: `2px solid ${colors.neon500}`, borderLeft: 'none', borderTop: 'none' }} />
                  <span style={{ fontSize: '48px' }}>{nft.icon}</span>
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{nft.name}</div>
                  <span style={{ backgroundColor: rc.bg, border: `1px solid ${rc.border}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: rc.color }}>{nft.rarity}</span>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: colors.textMuted }}>From: <span style={{ color: colors.neon500 }}>{nft.questFrom}</span></div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textDisabled, marginTop: '4px' }}>{nft.txHash}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'Activity' && (
        <div style={{ position: 'relative', paddingLeft: '48px' }}>
          <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', backgroundColor: colors.borderSubtle }} />
          {activityList.map((item) => {
            const dotColor = item.type === 'quest' ? colors.neon500 : item.type === 'nft' ? colors.purple500 : item.type === 'rank' ? colors.gold500 : colors.blue500;
            return (
              <div key={item.id} style={{ display: 'flex', gap: '16px', marginBottom: '16px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-36px', top: '14px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor }} />
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: `${dotColor}15`, border: `1px solid ${dotColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  {item.type === 'quest' ? '⚡' : item.type === 'nft' ? '🎖️' : item.type === 'rank' ? '🏆' : '👥'}
                </div>
                <div style={{ flex: 1, backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: colors.textPrimary }}><span style={{ fontWeight: 600 }}>{item.player}</span> {item.event} <span style={{ color: dotColor }}>{item.detail}</span>{item.xp && <span style={{ color: colors.neon500 }}> {item.xp}</span>}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, flexShrink: 0 }}>{item.time}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {Object.entries(item.reactions).map(([emoji, count]) => (
                      <span key={emoji} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '2px 8px', fontSize: '11px', color: colors.textSecondary, cursor: 'pointer' }}>{emoji} {count}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'Team' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff' }}>NeonSquad</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.textMuted }}>#neonsquad · Rank #12</div>
              </div>
              <button onClick={() => navigate('/team')} style={{ height: '36px', backgroundColor: 'transparent', color: colors.neon500, borderRadius: '8px', border: `1px solid ${colors.neon300}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 14px' }}>View Team →</button>
            </div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: colors.neon500 }}>⚡ 35,580 TEAM XP</div>
          </div>
        </div>
      )}
    </div>
  );
}


