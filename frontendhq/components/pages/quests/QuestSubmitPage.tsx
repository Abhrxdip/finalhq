"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@/lib/router-compat';
import { ChevronLeft, Github, Globe, Video, FileText, Image, Check, X } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackteraService, type LeaderboardView, type QuestView } from '@/lib/services/hacktera.service';

const steps = ['Project Info', 'Links & Files', 'Demo', 'Review'];

export function QuestSubmitPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const routeQuestId = Array.isArray(id) ? id[0] : id;
  const [questList, setQuestList] = useState<QuestView[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; displayName: string }>>([]);
  const quest = questList.find(q => q.id === routeQuestId) || questList[0] || {
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

  const [currentStep, setCurrentStep] = useState(0);
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['React', 'PyTeal']);
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [innovation, setInnovation] = useState('');
  const [attested, setAttested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteLeaderboard] = await Promise.all([
        HackteraService.getQuests(),
        HackteraService.getLeaderboard(),
      ]);
      if (!active) return;
      setQuestList(remoteQuests);
      setTeamMembers(
        remoteLeaderboard.slice(0, 4).map((entry: LeaderboardView) => ({
          id: entry.username,
          displayName: entry.displayName,
        }))
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleFinalizeSubmit = async () => {
    if (!attested || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const questId = routeQuestId || quest.id;
    const result = await HackteraService.completeQuestForCurrentWallet(questId);

    if (!result) {
      setSubmitError('Quest completion could not be synced. Connect a backend-linked wallet to record XP on-chain.');
      setSubmitting(false);
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hacktera_last_submission', JSON.stringify(result));
    }

    setSubmitting(false);
    navigate(`/quests/${questId}/status`);
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    height: '52px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: '10px',
    color: colors.textPrimary,
    fontFamily: fonts.outfit,
    fontSize: '14px',
    padding: '0 16px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const techOptions = ['React', 'PyTeal', 'Beaker', 'TypeScript', 'Go', 'Python', 'Rust', 'Next.js', 'Algod'];

  return (
    <div style={{ fontFamily: fonts.outfit, maxWidth: '740px', margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate(`/quests/${routeQuestId || quest.id}`)} style={{ background: 'none', border: 'none', color: colors.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0, marginBottom: '24px' }}>
        <ChevronLeft size={16} /> Back to Quest
      </button>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>SUBMISSION</div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>Submit Your Quest</h1>
        <span style={{ backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '20px', padding: '4px 14px', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.neon500 }}>{quest.title}</span>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div
                onClick={() => i <= currentStep && setCurrentStep(i)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: i < currentStep ? colors.neon500 : i === currentStep ? colors.neon500 : 'rgba(255,255,255,0.06)',
                  border: i <= currentStep ? 'none' : `1px solid ${colors.borderSubtle}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: i <= currentStep ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                }}
              >
                {i < currentStep
                  ? <Check size={14} style={{ color: colors.bgBase }} />
                  : <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: i === currentStep ? colors.bgBase : colors.textMuted }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', color: i === currentStep ? colors.neon500 : i < currentStep ? colors.textSecondary : colors.textMuted, textAlign: 'center' }}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 2, height: '2px', backgroundColor: i < currentStep ? colors.neon500 : 'rgba(255,255,255,0.06)', transition: 'all 0.3s', marginBottom: '24px', maxWidth: '60px' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '32px' }}>
        {/* Step 1: Project Info */}
        {currentStep === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Project Info</div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>PROJECT TITLE</label>
              <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Enter your project name..." style={inputBase} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>TECH STACK</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {techOptions.map((tech) => (
                  <button key={tech} onClick={() => setTechStack(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech])} style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${techStack.includes(tech) ? colors.neon300 : colors.borderSubtle}`, backgroundColor: techStack.includes(tech) ? colors.neon100 : 'transparent', color: techStack.includes(tech) ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {tech}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>TEAM MEMBERS</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {teamMembers.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '20px', padding: '4px 12px 4px 6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.15)', border: `1px solid ${colors.neon500}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: colors.neon500 }}>{m.displayName.split(' ').map(n => n[0]).join('')}</div>
                    <span style={{ fontSize: '12px', color: colors.textPrimary }}>{m.displayName}</span>
                  </div>
                ))}
                <button style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px dashed ${colors.borderDefault}`, backgroundColor: 'transparent', color: colors.textMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px' }}>+</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>DESCRIBE WHAT YOU BUILT</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your project..." rows={4} style={{ ...inputBase, height: '120px', padding: '14px 16px', resize: 'vertical', lineHeight: 1.5 }} />
            </div>
          </div>
        )}

        {/* Step 2: Links & Files */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Links & Files</div>
            {[
              { icon: <Github size={20} />, label: 'GitHub Repository URL', sub: 'Public repository with your code', value: githubUrl, set: setGithubUrl, placeholder: 'https://github.com/username/project' },
              { icon: <Globe size={20} />, label: 'Live Demo URL', sub: 'Deployed & accessible project', value: liveUrl, set: setLiveUrl, placeholder: 'https://your-project.vercel.app' },
              { icon: <Video size={20} />, label: 'Demo Video', sub: 'YouTube or direct MP4 link (2-5 min)', value: videoUrl, set: setVideoUrl, placeholder: 'https://youtube.com/watch?v=...' },
              { icon: <FileText size={20} />, label: 'Documentation', sub: 'PDF or URL to your project docs', value: '', set: () => {}, placeholder: 'https://docs.your-project.com' },
            ].map((field) => (
              <div key={field.label} style={{ backgroundColor: field.value ? 'rgba(0,255,65,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${field.value ? colors.neon300 : colors.borderDefault}`, borderRadius: '10px', padding: '16px', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: field.value ? colors.neon500 : colors.textMuted, flexShrink: 0 }}>{field.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, marginBottom: '2px' }}>{field.label}</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>{field.sub}</div>
                    <input value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder} style={{ ...inputBase, height: '36px', marginTop: '8px', fontSize: '12px', fontFamily: fonts.mono }} />
                  </div>
                  {field.value && <Check size={16} style={{ color: colors.neon500, flexShrink: 0 }} />}
                </div>
              </div>
            ))}
            {/* Screenshots drop zone */}
            <div style={{ height: '100px', border: `1px dashed ${colors.borderDefault}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer' }}>
              <Image size={20} style={{ color: colors.textMuted }} />
              <span style={{ fontSize: '13px', color: colors.textMuted }}>+ Add screenshots (drag & drop)</span>
            </div>
          </div>
        )}

        {/* Step 3: Demo */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Demo Preview</div>
            <div style={{ width: '100%', height: '240px', backgroundColor: 'rgba(0,0,0,0.4)', border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {videoUrl ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span style={{ fontSize: '24px' }}>▶</span>
                  </div>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>Preview Ready</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: colors.textMuted }}>
                  <Video size={32} style={{ marginBottom: '8px', opacity: 0.4 }} />
                  <div style={{ fontSize: '13px' }}>Add a video URL in Step 2 to preview</div>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>EXPLAIN YOUR APPROACH (JUDGES WILL READ THIS)</label>
              <textarea placeholder="Walk judges through your technical decisions, architecture choices, and implementation details..." rows={4} style={{ ...inputBase, height: '120px', padding: '14px 16px', resize: 'vertical', lineHeight: 1.5 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>WHAT MAKES THIS UNIQUE?</label>
              <textarea value={innovation} onChange={(e) => setInnovation(e.target.value)} placeholder="Highlight what makes your approach innovative for this hackathon..." rows={3} style={{ ...inputBase, height: '90px', padding: '14px 16px', resize: 'vertical', lineHeight: 1.5 }} />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Review & Submit</div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>SUBMISSION SUMMARY</div>
              {[
                { label: 'Project Title', value: projectTitle || 'Not set', icon: projectTitle ? <Check size={14} style={{ color: colors.neon500 }} /> : <X size={14} style={{ color: colors.red500 }} /> },
                { label: 'GitHub URL', value: githubUrl || 'Not provided', icon: githubUrl ? <Check size={14} style={{ color: colors.neon500 }} /> : <X size={14} style={{ color: colors.red500 }} /> },
                { label: 'Live Demo', value: liveUrl || 'Not provided', icon: liveUrl ? <Check size={14} style={{ color: colors.neon500 }} /> : <X size={14} style={{ color: colors.red500 }} /> },
                { label: 'Demo Video', value: videoUrl || 'Not provided', icon: videoUrl ? <Check size={14} style={{ color: colors.neon500 }} /> : <X size={14} style={{ color: colors.red500 }} /> },
                { label: 'Tech Stack', value: techStack.join(', '), icon: <Check size={14} style={{ color: colors.neon500 }} /> },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                  {item.icon}
                  <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, width: '100px' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: colors.textSecondary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>XP BREAKDOWN</div>
              {[{ label: 'Base Reward', val: `+${Math.round(quest.xp * 0.7)}` }, { label: '7-Day Streak Bonus', val: `+${Math.round(quest.xp * 0.15)}` }, { label: 'Speed Bonus (est.)', val: `+${Math.round(quest.xp * 0.15)}` }].map((x) => (
                <div key={x.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: colors.textMuted }}>{x.label}</span>
                  <span style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>{x.val}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>Total Potential</span>
                <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.neon500 }}>⚡ {quest.xp} XP</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'rgba(0,255,65,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '14px' }}>
              <div onClick={() => setAttested(!attested)} style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${attested ? colors.neon500 : colors.borderSubtle}`, backgroundColor: attested ? colors.neon500 : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>
                {attested && <Check size={12} style={{ color: colors.bgBase }} />}
              </div>
              <span style={{ fontSize: '13px', color: colors.textMuted, lineHeight: 1.5 }}>I confirm this is original work created during this hackathon event. All external resources and collaborations are disclosed above.</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: `1px solid ${colors.borderSubtle}` }}>
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(s => s - 1) : navigate(`/quests/${id}`)}
            style={{ height: '44px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}
          >
            ← Back
          </button>
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(s => s + 1)}
              style={{ height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 28px' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinalizeSubmit}
              disabled={!attested || submitting}
              style={{ height: '44px', backgroundColor: attested ? colors.neon500 : 'rgba(255,255,255,0.06)', color: attested ? colors.bgBase : colors.textMuted, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: attested ? 'pointer' : 'not-allowed', padding: '0 28px', transition: 'all 0.2s', opacity: submitting ? 0.8 : 1 }}
            >
              {submitting ? 'Syncing...' : 'Submit for Review →'}
            </button>
          )}
        </div>

        {submitError && (
          <div style={{ marginTop: '14px', fontSize: '12px', color: colors.red500 }}>
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}


