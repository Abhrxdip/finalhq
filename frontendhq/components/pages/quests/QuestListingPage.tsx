"use client";

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Zap, Clock, Users, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackteraService, type QuestView, type UserProfile } from '@/lib/services/hacktera.service';

const categories = ['All', 'Building', 'Deploy', 'Documentation', 'Social', 'Bonus'];

const difficultyConfig: Record<string, { bg: string; border: string; color: string }> = {
  EASY: { bg: colors.neon100, border: colors.neon300, color: colors.neon500 },
  MEDIUM: { bg: colors.gold100, border: 'rgba(255,215,0,0.3)', color: colors.gold500 },
  HARD: { bg: colors.orange100, border: 'rgba(255,107,0,0.3)', color: colors.orange500 },
  LEGENDARY: { bg: colors.purple100, border: 'rgba(123,47,255,0.3)', color: colors.purple500 },
};

const categoryIcons: Record<string, string> = {
  Building: '🏗️', Deploy: '🚀', Documentation: '📄', Social: '📢', Bonus: '⭐', Default: '🎯',
};

export function QuestListingPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [questList, setQuestList] = useState<QuestView[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteProfile] = await Promise.all([
        HackteraService.getQuests(),
        HackteraService.getCurrentUserProfile(),
      ]);
      if (!active) return;
      setQuestList(remoteQuests);
      setProfile(remoteProfile);
    })();

    return () => {
      active = false;
    };
  }, []);

  const filtered = activeFilter === 'All' ? questList : questList.filter(q => q.category === activeFilter);
  const totalXP = questList.reduce((sum, q) => sum + q.xp, 0);
  const streak = profile ? Math.max(1, Math.min(30, Math.floor(profile.totalXp / 400))) : 0;
  const firstQuestId = questList[0]?.id || 'quest';

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { backgroundColor: 'rgba(0,255,65,0.06)', border: `1px solid ${colors.borderDefault}` };
      case 'Expired': return { backgroundColor: 'rgba(255,68,68,0.04)', border: `1px solid rgba(255,68,68,0.15)` };
      case 'Locked': return { opacity: 0.4, backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}` };
      case 'In Progress': return { backgroundColor: colors.bgCard, border: `1px solid ${colors.borderEmphasis}`, borderLeft: `3px solid ${colors.neon500}` };
      default: return { backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}` };
    }
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>ACTIVE QUESTS</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Quest Board</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '12px', padding: '10px 16px' }}>
          <Zap size={16} style={{ color: colors.neon500 }} />
          <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.neon500 }}>{totalXP.toLocaleString()} XP</span>
          <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, letterSpacing: '2px' }}>AVAILABLE</span>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: activeFilter === cat ? `1px solid ${colors.neon300}` : `1px solid ${colors.borderSubtle}`,
              backgroundColor: activeFilter === cat ? colors.neon100 : 'transparent',
              color: activeFilter === cat ? colors.neon500 : colors.textMuted,
              fontFamily: fonts.mono,
              fontSize: '11px',
              letterSpacing: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
        {/* Quest grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((q) => {
            const diff = difficultyConfig[q.difficulty] || difficultyConfig.EASY;
            const statusStyle = getStatusStyle(q.status);
            const icon = categoryIcons[q.category] || categoryIcons.Default;
            return (
              <div
                key={q.id}
                style={{
                  ...statusStyle,
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: q.status === 'Locked' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onClick={() => q.status !== 'Locked' && navigate(`/quests/${q.id}`)}
                onMouseEnter={(e) => { if (q.status !== 'Locked') e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = statusStyle.backgroundColor || colors.bgCard; }}
              >
                {/* Locked overlay */}
                {q.status === 'Locked' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <Lock size={16} style={{ color: colors.textMuted }} />
                  </div>
                )}
                {/* Completed badge */}
                {q.status === 'Completed' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <CheckCircle size={16} style={{ color: colors.neon500 }} />
                  </div>
                )}
                {/* Expired badge */}
                {q.status === 'Expired' && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: colors.red500 }}>EXPIRED</div>
                )}

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${q.categoryColor}22`, border: `1px solid ${q.categoryColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
                    </div>
                    <span style={{ backgroundColor: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '10px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: diff.color }}>
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '0 0 12px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {q.description}
                </p>

                {/* Requirements chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {q.requirements.slice(0, 3).map((req) => (
                    <span key={req} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: colors.textMuted }}>
                      {req}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: '12px', display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.neon500 }}>⚡ {q.xp}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, letterSpacing: '2px' }}>XP</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textSecondary, fontSize: '12px' }}>
                    <Clock size={11} /> {q.timeLimit}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textSecondary, fontSize: '12px' }}>
                    <Users size={11} /> {q.completions}
                  </div>
                </div>

                {/* Progress bar */}
                {q.status === 'In Progress' && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                      <div style={{ width: `${q.progress}%`, height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '3px' }}>{q.progress}% complete</div>
                  </div>
                )}

                {/* CTA */}
                {q.status !== 'Locked' && q.status !== 'Expired' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/quests/${q.id}`); }}
                    style={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '10px',
                      border: q.status === 'In Progress' ? `1px solid ${colors.borderDefault}` : 'none',
                      backgroundColor: q.status === 'In Progress' ? 'transparent' : q.status === 'Completed' ? 'rgba(0,255,65,0.06)' : colors.neon500,
                      color: q.status === 'In Progress' ? colors.textPrimary : q.status === 'Completed' ? colors.neon500 : colors.bgBase,
                      fontFamily: fonts.outfit,
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {q.status === 'Completed' ? '✓ Completed' : q.status === 'In Progress' ? 'Continue →' : 'Start Quest →'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          {/* Daily XP cap */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>DAILY XP CAP</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>1,400 earned</span>
              <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>70%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '6px' }}>
              <div style={{ width: '70%', height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>600 XP remaining today</div>
          </div>

          {/* Streak */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>STREAK BONUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '32px' }}>🔥</span>
              <div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: colors.gold500 }}>{streak}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>day streak</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>+15% XP multiplier active on all quests</div>
          </div>

          {/* Bonus quest */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.gold500}44`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.gold500, marginBottom: '8px' }}>⭐ BONUS SPOTLIGHT</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Speed Run Challenge</div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>Complete 3 quests in 24h for a massive XP bonus</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} style={{ color: colors.gold500 }} />
              <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.gold500 }}>+500 XP BONUS</span>
            </div>
            <button
              onClick={() => navigate('/quests')}
              style={{ width: '100%', height: '38px', borderRadius: '10px', border: 'none', backgroundColor: colors.gold500, color: colors.bgBase, fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
            >
              View Details
            </button>
          </div>

          {/* Quick links */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>QUICK LINKS</div>
            {[
              { label: 'View Event Overview', path: '/event' },
              { label: 'My Submissions', path: `/quests/${firstQuestId}/status` },
              { label: 'Team Quests', path: '/team' },
            ].map((link) => (
              <div
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}`, cursor: 'pointer' }}
              >
                <span style={{ fontSize: '13px', color: colors.textSecondary }}>{link.label}</span>
                <ChevronRight size={14} style={{ color: colors.textMuted }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


