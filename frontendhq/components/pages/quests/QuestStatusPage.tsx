"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { ChevronLeft, Copy, ExternalLink } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type QuestView } from '@/lib/services/hackquest.service';

type StatusType = 'pending' | 'approved' | 'rejected';

export function QuestStatusPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [questList, setQuestList] = useState<QuestView[]>([]);
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
  const [status, setStatus] = useState<StatusType>('pending');

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteProgress] = await Promise.all([
        HackquestService.getQuests(),
        HackquestService.getQuestProgressForCurrentWallet(),
      ]);

      if (!active) return;

      setQuestList(remoteQuests);

      const questId = id || quest.id;
      const progress = remoteProgress.find((item) => item.questId === questId);

      if (!progress) {
        setStatus('pending');
        return;
      }

      if (progress.isCompleted) {
        setStatus('approved');
      } else if (progress.currentValue > 0) {
        setStatus('pending');
      } else {
        setStatus('rejected');
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const statusConfig = {
    pending: { bg: colors.gold100, border: 'rgba(255,215,0,0.3)', color: colors.gold500, label: '⏳ UNDER REVIEW' },
    approved: { bg: colors.neon100, border: colors.neon300, color: colors.neon500, label: '✅ APPROVED' },
    rejected: { bg: colors.red100, border: 'rgba(255,68,68,0.3)', color: colors.red500, label: '❌ NEEDS REVISION' },
  };
  const cfg = statusConfig[status];

  return (
    <div style={{ fontFamily: fonts.outfit, maxWidth: '720px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/quests/${id}`)} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0, marginBottom: '24px' }}>
        <ChevronLeft size={16} /> Back to Quest
      </button>

      {/* Status toggle (demo) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['pending', 'approved', 'rejected'] as StatusType[]).map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{ padding: '5px 14px', borderRadius: '20px', border: `1px solid ${status === s ? colors.neon300 : colors.borderSubtle}`, backgroundColor: status === s ? colors.neon100 : 'transparent', color: status === s ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', cursor: 'pointer' }}>
            {s.toUpperCase()}
          </button>
        ))}
        <span style={{ fontSize: '12px', color: colors.textMuted, alignSelf: 'center', marginLeft: '4px' }}>(demo toggle)</span>
      </div>

      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', overflow: 'hidden' }}>
        {/* Status header */}
        <div style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: fonts.mono, fontSize: '12px', letterSpacing: '3px', color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: cfg.color }}>{quest.title}</span>
        </div>

        <div style={{ padding: '32px' }}>
          {/* PENDING */}
          {status === 'pending' && (
            <div>
              {/* Shimmer bar */}
              <div style={{ height: '8px', borderRadius: '4px', background: `linear-gradient(90deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.4) 50%, rgba(255,215,0,0.1) 100%)`, backgroundSize: '200% 100%', animation: 'shimmer 2s infinite', marginBottom: '20px' }} />
              <p style={{ fontSize: '15px', color: colors.textSecondary, marginBottom: '24px', textAlign: 'center' }}>Your submission is being reviewed by organizers. This usually takes 2–4 hours.</p>

              {/* Submitted links */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>SUBMITTED LINKS</div>
                {['GitHub Repo', 'Live Demo', 'Demo Video'].map((link) => (
                  <div key={link} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                    <span style={{ fontSize: '16px' }}>🔒</span>
                    <span style={{ fontSize: '13px', color: colors.textMuted }}>{link}</span>
                    <span style={{ fontSize: '12px', color: colors.textMuted, marginLeft: 'auto', fontFamily: fonts.mono }}>Under review</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '16px' }}>REVIEW TIMELINE</div>
                {[
                  { label: 'Submitted', status: 'done', time: '2 hours ago' },
                  { label: 'In Review', status: 'current', time: 'Est. 1-3 hours' },
                  { label: 'Decision', status: 'pending', time: 'Upcoming' },
                ].map((item, i) => (
                  <div key={item.label} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.status === 'done' ? colors.neon500 : item.status === 'current' ? colors.gold500 : 'rgba(255,255,255,0.1)', border: item.status === 'current' ? `2px solid ${colors.gold500}` : 'none', flexShrink: 0 }} />
                      {i < 2 && <div style={{ width: '1px', height: '28px', backgroundColor: colors.borderSubtle, margin: '4px 0' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: item.status === 'pending' ? colors.textMuted : colors.textPrimary }}>{item.label}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ width: '100%', height: '44px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '10px', border: `1px solid rgba(255,68,68,0.3)`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer' }}>
                Cancel Submission
              </button>
            </div>
          )}

          {/* APPROVED */}
          {status === 'approved' && (
            <div>
              {/* XP earned */}
              <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse, rgba(0,255,65,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontFamily: fonts.orbitron, fontSize: '72px', fontWeight: 700, color: colors.neon500, lineHeight: 1 }}>+{quest.xp}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '14px', letterSpacing: '3px', color: colors.neon500, marginTop: '4px' }}>XP EARNED</div>
                <div style={{ fontSize: '14px', color: colors.textMuted, marginTop: '8px' }}>Added to your profile on-chain</div>
              </div>

              {/* NFT minted */}
              <div style={{ backgroundColor: colors.purple100, border: '1px solid rgba(123,47,255,0.3)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '48px' }}>🏆</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.purple500, marginBottom: '4px' }}>NFT MINTED TO YOUR WALLET</div>
                    <div style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Bug Slayer #48</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>ALGO7XK3...M9PQ</span>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0 }}><Copy size={12} /></button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.blue500, padding: 0, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px' }}>
                        AlgoExplorer <ExternalLink size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviewer comment */}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,149,255,0.1)', border: `1px solid ${colors.blue500}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>JK</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>Jesse Kim · Organizer</div>
                    <p style={{ fontSize: '13px', color: colors.textSecondary, fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>"Excellent work! The smart contract implementation is clean and well-tested. The Beaker framework usage is particularly impressive. Great submission!"</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => navigate('/quests')} style={{ flex: 1, height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  View Next Quest
                </button>
                <button style={{ flex: 1, height: '44px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer' }}>
                  Share Achievement
                </button>
              </div>
            </div>
          )}

          {/* REJECTED */}
          {status === 'rejected' && (
            <div>
              <div style={{ backgroundColor: 'rgba(255,68,68,0.04)', border: '1px solid rgba(255,68,68,0.15)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.red500, marginBottom: '10px' }}>REJECTION REASON</div>
                <p style={{ fontSize: '14px', color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>Your submission doesn't meet the minimum test coverage requirement (80%). Please add more unit tests and ensure all acceptance criteria are satisfied before resubmitting.</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>FAILED CRITERIA</div>
                {[
                  { text: 'Test coverage >80%', failed: true },
                  { text: 'Live deployment URL', failed: true },
                  { text: 'GitHub repository public', failed: false },
                  { text: 'Smart contract deployed on testnet', failed: false },
                ].map((c) => (
                  <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${c.failed ? colors.red500 : colors.neon500}`, backgroundColor: c.failed ? 'rgba(255,68,68,0.1)' : colors.neon500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.failed ? <span style={{ color: colors.red500, fontSize: '12px', fontWeight: 700 }}>✗</span> : <span style={{ color: colors.bgBase, fontSize: '11px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: c.failed ? colors.red500 : colors.textSecondary }}>{c.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => navigate(`/quests/${id}/submit`)} style={{ flex: 2, height: '44px', backgroundColor: colors.orange500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  Revise & Resubmit →
                </button>
                <button style={{ flex: 1, height: '44px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer' }}>
                  Appeal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}


