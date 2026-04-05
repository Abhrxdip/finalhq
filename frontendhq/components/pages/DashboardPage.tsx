"use client";

import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Zap, Trophy, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type ActivityView, type LeaderboardView, type QuestView, type UserProfile } from '@/lib/services/hackquest.service';
import { PremiumEventsService, type PendingReward } from '@/lib/services/premium-events.service';

function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '6px' }}>{sub}</div>}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [timeLeft] = React.useState({ h: 14, m: 32, s: 47 });
  const [questList, setQuestList] = React.useState<QuestView[]>([]);
  const [leaderboardList, setLeaderboardList] = React.useState<LeaderboardView[]>([]);
  const [activityList, setActivityList] = React.useState<ActivityView[]>([]);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [pendingReward, setPendingReward] = React.useState<PendingReward | null>(null);
  const [showRewardPopup, setShowRewardPopup] = React.useState(false);
  const [rewardMessage, setRewardMessage] = React.useState<string | null>(null);
  const [rewardAnimation, setRewardAnimation] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteLeaderboard, remoteActivity, remoteProfile] = await Promise.all([
        HackquestService.getQuests(),
        HackquestService.getLeaderboard(),
        HackquestService.getActivityFeed(),
        HackquestService.getCurrentUserProfile(),
      ]);

      if (!active) return;
      setQuestList(remoteQuests);
      setLeaderboardList(remoteLeaderboard);
      setActivityList(remoteActivity);
      setProfile(remoteProfile);

      const nextPendingReward = await PremiumEventsService.getPendingRewardForCurrentUser();
      if (!active) return;

      setPendingReward(nextPendingReward);
      setShowRewardPopup(Boolean(nextPendingReward));
    })();

    return () => {
      active = false;
    };
  }, []);

  const myLeaderboardEntry = profile
    ? leaderboardList.find((entry) => entry.username === profile.username)
    : null;

  const totalXp = profile?.totalXp ?? myLeaderboardEntry?.xp ?? 0;
  const rank = profile?.rank || myLeaderboardEntry?.rank || 0;
  const questsCompleted = myLeaderboardEntry?.quests ?? questList.filter((quest) => quest.status === 'Completed').length;
  const nftCount = profile?.nftCount ?? myLeaderboardEntry?.nfts ?? 0;
  const streak = profile ? Math.max(1, Math.min(30, Math.floor(profile.totalXp / 400))) : 0;

  const handleClaimReward = async () => {
    if (!pendingReward) {
      return;
    }

    try {
      setRewardAnimation(true);

      if (pendingReward.isWinner) {
        await PremiumEventsService.grantWinnerNftFromReward(pendingReward);
        await PremiumEventsService.consumePendingReward(pendingReward.id);
        setRewardMessage('Winner reward complete: your Premium NFT has been generated and sent to inventory.');
      } else {
        await PremiumEventsService.consumePendingReward(pendingReward.id);
        setRewardMessage(`Ranking reward claimed: +${pendingReward.xpAwarded} XP added.`);
      }

      const nextPending = await PremiumEventsService.getPendingRewardForCurrentUser();
      setPendingReward(nextPending);

      if (!nextPending) {
        setTimeout(() => {
          setShowRewardPopup(false);
        }, 1000);
      }
    } catch (error) {
      setRewardMessage(error instanceof Error ? error.message : 'Unable to claim reward.');
    } finally {
      setRewardAnimation(false);
    }
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>DASHBOARD</div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Arena Overview</h1>
        <p style={{ color: colors.textMuted, marginTop: '6px', fontSize: '14px' }}>Welcome back, <span style={{ color: colors.neon500 }}>{profile?.displayName || 'Hacker'}</span>. Your streak: <span style={{ color: colors.gold500 }}>🔥 {streak} days</span></p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="TOTAL XP" value={totalXp.toLocaleString()} sub="Synced from backend" color={colors.neon500} icon={<Zap size={20} />} />
        <StatCard label="GLOBAL RANK" value={rank > 0 ? `#${rank}` : '—'} sub="Live leaderboard" color={colors.gold500} icon={<Trophy size={20} />} />
        <StatCard label="QUESTS DONE" value={String(questsCompleted)} sub={`${questList.filter((quest) => quest.status === 'In Progress').length} in progress`} color="#fff" icon={<TrendingUp size={20} />} />
        <StatCard label="NFTs EARNED" value={String(nftCount)} sub="On-chain inventory" color={colors.purple500} icon={<span style={{ fontSize: '20px' }}>🎖️</span>} />
      </div>

      {/* Countdown + Active quest */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(0,0,0,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500 }}>LIVE QUEST</span>
            </div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: '#fff' }}>hacktera Genesis · Season 01</div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>1,247 participants · 4 tracks active</div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[{ label: 'HRS', value: String(timeLeft.h).padStart(2, '0') }, { label: 'MIN', value: String(timeLeft.m).padStart(2, '0') }, { label: 'SEC', value: String(timeLeft.s).padStart(2, '0') }].map((t) => (
              <div key={t.label} style={{ width: '72px', height: '72px', backgroundColor: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.neon300}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: colors.neon500, lineHeight: 1 }}>{t.value}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: colors.textMuted, marginTop: '2px' }}>{t.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/quests')}
            style={{ height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}
          >
            View Quest →
          </button>
        </div>
      </div>

      {/* 2-col layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
        {/* Active quests */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>Active Quests</h2>
            <button onClick={() => navigate('/quests')} style={{ background: 'none', border: 'none', color: colors.neon500, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>View all <ChevronRight size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questList.filter(q => q.status === 'In Progress' || q.status === 'Available').slice(0, 3).map((q) => (
              <div
                key={q.id}
                onClick={() => navigate(`/quests/${q.id}`)}
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${q.status === 'In Progress' ? colors.borderEmphasis : colors.borderDefault}`,
                  borderLeft: q.status === 'In Progress' ? `3px solid ${colors.neon500}` : `1px solid ${colors.borderDefault}`,
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgCard; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${q.categoryColor}22`, border: `1px solid ${q.categoryColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {q.category === 'Deploy' ? '🚀' : q.category === 'Building' ? '🏗️' : q.category === 'Documentation' ? '📄' : '📢'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
                      <span style={{ backgroundColor: q.difficulty === 'HARD' ? colors.orange100 : q.difficulty === 'LEGENDARY' ? colors.purple100 : colors.neon100, border: `1px solid ${q.difficulty === 'HARD' ? colors.orange500 : q.difficulty === 'LEGENDARY' ? colors.purple500 : colors.neon300}44`, borderRadius: '10px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: q.difficulty === 'HARD' ? colors.orange500 : q.difficulty === 'LEGENDARY' ? colors.purple500 : colors.neon500, flexShrink: 0 }}>
                        {q.difficulty}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>⚡ {q.xp} XP</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.textSecondary }}><Clock size={11} /> {q.timeLimit}</span>
                    </div>
                    {q.status === 'In Progress' && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                          <div style={{ width: `${q.progress}%`, height: '100%', backgroundColor: colors.neon500, borderRadius: '3px' }} />
                        </div>
                        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '3px' }}>{q.progress}% complete</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Streak */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>DAILY STREAK</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '36px' }}>🔥</span>
              <div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: colors.gold500 }}>{streak}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>days in a row</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
              <div style={{ width: '70%', height: '100%', background: `linear-gradient(90deg, ${colors.orange500}, ${colors.gold500})`, borderRadius: '3px' }} />
            </div>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>1,400 / 2,000 XP daily cap</div>
          </div>

          {/* Leaderboard mini */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted }}>TOP PLAYERS</div>
              <button onClick={() => navigate('/leaderboard')} style={{ background: 'none', border: 'none', color: colors.neon500, fontSize: '12px', cursor: 'pointer' }}>View all</button>
            </div>
            {leaderboardList.slice(0, 5).map((p, i) => (
              <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${colors.borderSubtle}` : 'none' }}>
                <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: i === 0 ? colors.gold500 : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.textMuted, width: '20px', textAlign: 'center' }}>#{p.rank}</span>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: colors.textPrimary, fontWeight: 600, flexShrink: 0 }}>
                  {p.displayName.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: profile?.username === p.username ? 700 : 400, color: profile?.username === p.username ? colors.neon500 : colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.displayName} {profile?.username === p.username && <span style={{ fontSize: '11px', color: colors.textMuted }}>(you)</span>}
                  </div>
                </div>
                <span style={{ fontFamily: fonts.orbitron, fontSize: '11px', fontWeight: 700, color: colors.neon500 }}>{(p.xp / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted }}>LIVE FEED</div>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
            </div>
            {activityList.slice(0, 4).map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.type === 'quest' ? colors.neon500 : item.type === 'nft' ? colors.purple500 : item.type === 'rank' ? colors.gold500 : colors.blue500, marginTop: '5px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', color: colors.textPrimary }}><span style={{ fontWeight: 600 }}>{item.player}</span> {item.event} <span style={{ color: item.type === 'quest' ? colors.neon500 : item.type === 'nft' ? colors.purple500 : colors.gold500 }}>{item.detail}</span></div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showRewardPopup && pendingReward && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, backgroundColor: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px' }}>
          <div style={{ width: '560px', maxWidth: '96vw', backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: pendingReward.isWinner ? 'rgba(255,215,0,0.12)' : colors.neon100, borderBottom: `1px solid ${colors.borderSubtle}`, padding: '14px 20px' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: pendingReward.isWinner ? colors.gold500 : colors.neon500 }}>
                QUEST COMPLETED • RANKING REWARD
              </div>
            </div>

            <div style={{ padding: '22px' }}>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '22px', margin: '0 0 10px', color: '#fff' }}>
                {pendingReward.isWinner ? 'You Won Premium NFT Access' : 'You Received XP Reward'}
              </h2>

              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '14px', lineHeight: 1.6 }}>
                Event: {pendingReward.eventName}
                <br />
                Rank: #{pendingReward.rank}
              </div>

              {pendingReward.isWinner ? (
                <div style={{ marginBottom: '16px', backgroundColor: 'rgba(255,215,0,0.08)', border: `1px solid rgba(255,215,0,0.3)`, borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.gold500, marginBottom: '6px' }}>
                    Premium NFT Category: {pendingReward.premiumNftCategory}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    Generate animation appears while your NFT is minted and published to marketplace + inventory.
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '16px', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: colors.neon500 }}>
                    +{pendingReward.xpAwarded} XP
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                    XP reward based on organizer ranking distribution (100 to 10 XP).
                  </div>
                </div>
              )}

              {rewardAnimation && (
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', border: `3px solid ${colors.neon300}`, borderTop: `3px solid ${colors.neon500}`, borderRadius: '50%', animation: 'hqSpin 0.9s linear infinite' }} />
                  <div style={{ fontSize: '12px', color: colors.textMuted }}>
                    {pendingReward.isWinner ? 'Generating your Premium NFT...' : 'Applying XP reward...'}
                  </div>
                </div>
              )}

              {rewardMessage && <div style={{ marginBottom: '16px', fontSize: '12px', color: colors.blue500 }}>{rewardMessage}</div>}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowRewardPopup(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, backgroundColor: 'transparent', color: colors.textMuted, cursor: 'pointer' }}>
                  Later
                </button>
                <button onClick={handleClaimReward} style={{ flex: 2, height: '42px', borderRadius: '10px', border: 'none', backgroundColor: colors.neon500, color: colors.bgBase, fontWeight: 700, cursor: 'pointer' }}>
                  {pendingReward.isWinner ? 'Generate Premium NFT' : 'Claim XP'}
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes hqSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}


