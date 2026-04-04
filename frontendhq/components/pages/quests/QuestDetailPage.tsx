"use client";

import React, { useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { ArrowLeft, Bookmark, Share2, Zap, Clock, Users, ChevronLeft } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type QuestView } from '@/lib/services/hackquest.service';

const difficultyConfig: Record<string, { bg: string; border: string; color: string }> = {
  EASY: { bg: colors.neon100, border: colors.neon300, color: colors.neon500 },
  MEDIUM: { bg: colors.gold100, border: 'rgba(255,215,0,0.3)', color: colors.gold500 },
  HARD: { bg: colors.orange100, border: 'rgba(255,107,0,0.3)', color: colors.orange500 },
  LEGENDARY: { bg: colors.purple100, border: 'rgba(123,47,255,0.3)', color: colors.purple500 },
};

const categoryIcons: Record<string, string> = {
  Building: '🏗️', Deploy: '🚀', Documentation: '📄', Social: '📢', Bonus: '⭐', Default: '🎯',
};

const tabs = ['Overview', 'Requirements', 'Submissions (24)', 'Discussion'];

const criteria = [
  { id: 1, text: 'Smart contract must be deployed on Algorand testnet', done: true },
  { id: 2, text: 'Full test suite with >80% coverage', done: true },
  { id: 3, text: 'GitHub repository must be public and documented', done: false },
  { id: 4, text: 'Live deployment URL provided', done: false },
  { id: 5, text: 'Demo video walkthrough (2-5 min)', done: false },
];

const requirements = [
  'Create and deploy a smart contract using PyTeal or Beaker on Algorand testnet.',
  'Implement at least 3 atomic transactions in your contract logic.',
  'Write comprehensive unit tests using pytest-algorand with >80% code coverage.',
  'Deploy a frontend interface that interacts with your smart contract.',
  'Provide a public GitHub repository with complete documentation and README.',
];

export function QuestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [questList, setQuestList] = useState<QuestView[]>([]);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const remoteQuests = await HackquestService.getQuests();
      if (!active) return;
      setQuestList(remoteQuests);
    })();

    return () => {
      active = false;
    };
  }, []);

  const quest = questList.find(q => q.id === id) || questList[0] || {
    id: 'quest',
    title: 'Quest',
    category: 'Building',
    categoryColor: '#00FF41',
    description: 'Quest details are loading from backend.',
    difficulty: 'EASY',
    xp: 0,
    timeLimit: '48h',
    completions: 0,
    status: 'Available',
    progress: 0,
    requirements: [],
    tags: [],
  };
  const diff = difficultyConfig[quest.difficulty] || difficultyConfig.EASY;
  const icon = categoryIcons[quest.category] || categoryIcons.Default;

  // Countdown ring math
  const timeHours = parseInt(quest.timeLimit) || 48;
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = 0.62; // 62% time remaining
  const ringOffset = ringCircumference * (1 - ringProgress);

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Back nav */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/quests')}
          style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0 }}
        >
          <ChevronLeft size={16} />
          Quest Board
        </button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        {/* Left — Quest detail */}
        <div>
          {/* Hero area */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', marginBottom: '0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: `${quest.categoryColor}22`, border: `1px solid ${quest.categoryColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>{quest.title}</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ backgroundColor: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: diff.color }}>{quest.difficulty}</span>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}>{quest.category.toUpperCase()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}><Clock size={10} /> {quest.timeLimit}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.neon500 }}>⚡ {quest.xp} XP</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => setBookmarked(!bookmarked)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${bookmarked ? colors.neon300 : colors.borderSubtle}`, backgroundColor: bookmarked ? colors.neon100 : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Bookmark size={14} style={{ color: bookmarked ? colors.neon500 : colors.textMuted }} />
                </button>
                <button style={{ width: '36px', height: '36px', borderRadius: '8px', border: `1px solid ${colors.borderSubtle}`, backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Share2 size={14} style={{ color: colors.textMuted }} />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderSubtle}`, marginBottom: '24px' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? `2px solid ${colors.neon500}` : '2px solid transparent',
                  color: activeTab === tab ? '#fff' : colors.textMuted,
                  fontFamily: fonts.outfit,
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  marginBottom: '-1px',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'Overview' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '10px' }}>ABOUT THIS QUEST</div>
                <p style={{ fontSize: '16px', color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>{quest.description} This is a high-stakes challenge designed for experienced Algorand developers. You'll need a solid understanding of PyTeal or Beaker, atomic transactions, and smart contract testing methodologies.</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '12px' }}>WHAT YOU'LL BUILD</div>
                {['A fully deployable Algorand smart contract with custom logic', 'An automated test suite validating all contract states', 'A minimal frontend dApp connecting to your contract', 'Comprehensive technical documentation'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.neon500, marginTop: '7px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '12px' }}>ACCEPTANCE CRITERIA</div>
                {criteria.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '12px 16px', marginBottom: '8px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${c.done ? colors.neon500 : colors.borderSubtle}`, backgroundColor: c.done ? colors.neon500 : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.done && <span style={{ color: colors.bgBase, fontSize: '11px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: c.done ? colors.textPrimary : colors.textSecondary }}>{c.text}</span>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '10px' }}>TAGS</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {quest.tags.map((tag) => (
                    <span key={tag} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: colors.textMuted }}>#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Requirements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requirements.map((req, i) => (
                <div key={i} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '20px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: 'rgba(0,255,65,0.15)', flexShrink: 0, lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>{req}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Submissions (24)' && (
            <div>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '16px', marginBottom: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: colors.textPrimary, fontWeight: 600, flexShrink: 0 }}>
                    H{i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>hacker_0{i + 1}</div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>Submitted {i + 1}h ago</div>
                  </div>
                  <span style={{ backgroundColor: i < 2 ? colors.neon100 : colors.gold100, border: `1px solid ${i < 2 ? colors.neon300 : 'rgba(255,215,0,0.3)'}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: i < 2 ? colors.neon500 : colors.gold500 }}>{i < 2 ? 'APPROVED' : 'PENDING'}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Discussion' && (
            <div style={{ textAlign: 'center', padding: '48px', color: colors.textMuted }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
              <div style={{ fontSize: '14px' }}>Discussion forum coming soon. Ask questions and collaborate with other hackers.</div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          {/* XP reward */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '8px' }}>XP REWARD</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '48px', fontWeight: 700, color: colors.neon500, lineHeight: 1 }}>⚡{quest.xp}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginTop: '4px', marginBottom: '16px' }}>POINTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              {[{ label: 'Base XP', value: `+${Math.round(quest.xp * 0.7)}` }, { label: 'Streak Bonus', value: `+${Math.round(quest.xp * 0.15)}` }, { label: 'Speed Bonus', value: `+${Math.round(quest.xp * 0.15)}` }].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: colors.textMuted }}>{item.label}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.neon500 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countdown ring */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '16px' }}>TIME REMAINING</div>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 12px' }}>
              <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="60" cy="60" r={ringRadius} fill="none" stroke={colors.neon500} strokeWidth="6" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: colors.neon500 }}>{timeHours}h</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted, letterSpacing: '1px' }}>LIMIT</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>~{Math.round(timeHours * 0.62)}h remaining at 62%</div>
          </div>

          {/* Completion stats */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '12px' }}>COMPLETIONS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>{quest.completions} / 200</span>
              <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>{Math.round(quest.completions / 2)}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
              <div style={{ width: `${quest.completions / 2}%`, height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
            </div>
          </div>

          {/* NFT unlock */}
          <div style={{ backgroundColor: colors.purple100, border: `1px solid rgba(123,47,255,0.3)`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.purple500, marginBottom: '4px' }}>NFT UNLOCK</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>Complete this quest to unlock an exclusive NFT badge minted on Algorand.</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: 'rgba(123,47,255,0.5)', letterSpacing: '2px', marginTop: '8px' }}>COMPLETE TO UNLOCK</div>
          </div>

          {/* Similar quests */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '12px' }}>SIMILAR QUESTS</div>
            {questList.filter(q => q.id !== quest.id).slice(0, 2).map((q) => (
              <div key={q.id} onClick={() => navigate(`/quests/${q.id}`)} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}`, cursor: 'pointer' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: `${q.categoryColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {categoryIcons[q.category] || '🎯'}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary }}>{q.title}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500 }}>⚡ {q.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: '240px', right: 0, backgroundColor: `${colors.bgBase}E6`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${colors.borderSubtle}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{quest.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ backgroundColor: diff.bg, border: `1px solid ${diff.border}`, borderRadius: '8px', padding: '1px 6px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: diff.color }}>{quest.difficulty}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: colors.neon500 }}>⚡ {quest.xp} XP</span>
          <button
            onClick={() => navigate(`/quests/${quest.id}/submit`)}
            style={{ height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 24px', transition: 'box-shadow 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 30px rgba(0,255,65,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            {quest.status === 'In Progress' ? 'Submit Quest →' : 'Start Quest →'}
          </button>
        </div>
      </div>
      <div style={{ height: '80px' }} />
    </div>
  );
}


