"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Users, Zap } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService } from '@/lib/services/hackquest.service';

const tracks = [
  { id: 't1', name: 'DeFi Builder', icon: '💰', desc: 'Build decentralized finance protocols on Algorand', color: colors.neon500, multiplier: '2×' },
  { id: 't2', name: 'NFT Ecosystem', icon: '🎨', desc: 'Create NFT marketplaces and digital collectibles', color: colors.purple500, multiplier: '1.5×' },
  { id: 't3', name: 'dApp Developer', icon: '⚙️', desc: 'Develop decentralized applications with AVM', color: colors.blue500, multiplier: '2×' },
  { id: 't4', name: 'Social Impact', icon: '🌍', desc: 'Use blockchain technology for positive social change', color: colors.gold500, multiplier: '1.5×' },
];

const schedule = [
  { time: 'Apr 1 · 00:00', event: 'Event Kickoff', status: 'DONE' },
  { time: 'Apr 1 · 08:00', event: 'AMA with Algorand Foundation', status: 'DONE' },
  { time: 'Apr 2 · 18:00', event: 'Mentorship Office Hours', status: 'DONE' },
  { time: 'Apr 3 · 12:00', event: 'Midway Check-in', status: 'LIVE' },
  { time: 'Apr 4 · 00:00', event: 'Final Submission Deadline', status: 'UPCOMING' },
  { time: 'Apr 5 · 14:00', event: 'Winners Announcement', status: 'UPCOMING' },
];

const prizes = [
  { place: '🥇', label: '1st Place', algo: '5,000 ALGO', nft: 'Legendary NFT', color: colors.gold500 },
  { place: '🥈', label: '2nd Place', algo: '2,500 ALGO', nft: 'Epic NFT', color: '#C0C0C0' },
  { place: '🥉', label: '3rd Place', algo: '1,000 ALGO', nft: 'Rare NFT', color: '#CD7F32' },
];

const mainTabs = ['Overview', 'Tracks (4)', 'Rules', 'Schedule', 'Prizes'];

const formatEventDate = (raw: string | null, fallbackValue: string): string => {
  if (!raw) {
    return fallbackValue;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return fallbackValue;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function EventPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeLeft, setTimeLeft] = useState({ h: 36, m: 14, s: 22 });
  const [eventTitle, setEventTitle] = useState('HackQuest Genesis');
  const [eventStatus, setEventStatus] = useState('LIVE');
  const [participants, setParticipants] = useState(1247);
  const [startDate, setStartDate] = useState('Apr 1, 2026');
  const [endDate, setEndDate] = useState('Apr 4, 2026');
  const [teamSize, setTeamSize] = useState('1-4');
  const [prizePool, setPrizePool] = useState('8,500 ALGO');
  const [backendStatus, setBackendStatus] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      const [healthPayload, events] = await Promise.all([
        HackquestService.getHealth(),
        HackquestService.getEvents(),
      ]);

      if (!active) return;

      if (healthPayload) {
        setBackendStatus('ONLINE');
      }

      const live =
        events.find((event) => ['live', 'active', 'ongoing'].includes(event.status.toLowerCase())) ||
        events[0];

      if (!live) {
        return;
      }

      const detailed = live.id ? await HackquestService.getEventById(live.id) : null;
      const resolvedEvent = detailed || live;

      if (!active) return;

      setEventTitle(resolvedEvent.name || 'HackQuest Genesis');
      setEventStatus((resolvedEvent.status || 'live').toUpperCase());
      setParticipants(resolvedEvent.participantCount || 1247);
      setStartDate(formatEventDate(resolvedEvent.startDate, 'Apr 1, 2026'));
      setEndDate(formatEventDate(resolvedEvent.endDate, 'Apr 4, 2026'));
      setTeamSize(resolvedEvent.teamSize || '1-4');
      setPrizePool(resolvedEvent.prizePool || '8,500 ALGO');
    })();

    return () => {
      active = false;
    };
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Hero */}
      <div style={{ borderRadius: '20px', border: `1px solid ${colors.borderDefault}`, overflow: 'hidden', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(0,255,65,0.08) 0%, rgba(0,0,0,0) 60%), rgba(0,255,65,0.02)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(255,255,255,0.015) 24px, rgba(255,255,255,0.015) 25px)', pointerEvents: 'none' }} />
        <div style={{ padding: '48px 32px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500, animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500 }}>{eventStatus} EVENT</span>
            <span style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: backendStatus === 'ONLINE' ? colors.neon500 : colors.red500 }}>
              API {backendStatus}
            </span>
          </div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '48px', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>{eventTitle}</h1>
          <div style={{ fontFamily: fonts.orbitron, fontSize: '20px', color: colors.neon500, marginBottom: '16px', letterSpacing: '4px' }}>SEASON 01</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: colors.textMuted, fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '-4px' }}>
              {['VA', 'PZ', 'SM', 'CW'].map((init, i) => (
                <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.15)', border: `2px solid ${colors.bgBase}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: colors.neon500, marginLeft: i > 0 ? '-6px' : 0 }}>{init}</div>
              ))}
            </div>
            <span>{participants.toLocaleString()} participants · Organized by Algorand Foundation</span>
          </div>

          {/* Countdown */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '12px' }}>TIME REMAINING</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {[{ label: 'HRS', value: pad(timeLeft.h) }, { label: 'MIN', value: pad(timeLeft.m) }, { label: 'SEC', value: pad(timeLeft.s) }].map((t, i) => (
                <React.Fragment key={t.label}>
                  <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(0,0,0,0.5)', border: `1px solid ${colors.neon300}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: colors.neon500, lineHeight: 1 }}>{t.value}</div>
                    <div style={{ fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: colors.textMuted, marginTop: '2px' }}>{t.label}</div>
                  </div>
                  {i < 2 && <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', color: colors.neon500, alignSelf: 'center', opacity: 0.7 }}>:</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Prize pool strip */}
      <div style={{ backgroundColor: 'rgba(255,215,0,0.04)', border: `1px solid rgba(255,215,0,0.12)`, borderRadius: '16px', padding: '16px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
        {prizes.map((p) => (
          <div key={p.place} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{p.place}</div>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '4px' }}>{p.label}</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: p.color }}>{p.algo}</div>
            <div style={{ fontSize: '12px', color: colors.textSecondary }}>+ {p.nft}</div>
          </div>
        ))}
      </div>

      {/* Three-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '24px', alignItems: 'start' }}>
        {/* Left — Event info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.neon500 }}>LIVE</span>
            </div>
            {[
              { label: 'Start Date', value: startDate },
              { label: 'End Date', value: endDate },
              { label: 'Participants', value: participants.toLocaleString() },
              { label: 'Teams', value: '312 teams' },
              { label: 'Team Size', value: `${teamSize} members` },
              { label: 'Prize Pool', value: prizePool },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <span style={{ fontSize: '12px', color: colors.textMuted }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>{item.value}</span>
              </div>
            ))}
            <button onClick={() => navigate('/team')} style={{ width: '100%', height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}>
              JOIN EVENT
            </button>
            <button style={{ width: '100%', height: '44px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
              VIEW RULES
            </button>
          </div>
        </div>

        {/* Center — Tabs */}
        <div>
          <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderSubtle}`, marginBottom: '24px' }}>
            {mainTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: activeTab === tab ? `2px solid ${colors.neon500}` : '2px solid transparent', color: activeTab === tab ? '#fff' : colors.textMuted, fontFamily: fonts.outfit, fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px', whiteSpace: 'nowrap' }}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Overview' && (
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '10px' }}>ABOUT THIS EVENT</div>
              <p style={{ fontSize: '15px', color: colors.textSecondary, lineHeight: 1.7, marginBottom: '20px' }}>HackQuest Genesis Season 01 is the flagship Algorand hackathon bringing together the brightest blockchain developers worldwide. Compete across 4 specialized tracks, earn XP, mint exclusive NFTs, and claim your place on the global leaderboard.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[['🌍', 'Global Event', '1,247 participants from 68 countries'], ['⚡', 'XP Racing', 'Compete for XP across all 4 tracks'], ['🎖️', 'NFT Rewards', 'Exclusive on-chain badges for top performers'], ['◆', 'Algorand Native', 'All rewards minted on Algorand mainnet']].map(([icon, title, desc]) => (
                  <div key={title as string} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'Tracks (4)') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {tracks.map((track) => (
                <div key={track.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${track.color}22`, border: `1px solid ${track.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '12px' }}>{track.icon}</div>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{track.name}</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px', lineHeight: 1.4 }}>{track.desc}</div>
                  <span style={{ backgroundColor: colors.gold100, border: '1px solid rgba(255,215,0,0.3)', borderRadius: '10px', padding: '3px 10px', fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.gold500 }}>{track.multiplier} XP</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '1px', backgroundColor: colors.borderSubtle }} />
              {schedule.map((item) => (
                <div key={item.time} style={{ display: 'flex', gap: '16px', marginBottom: '20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-20px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.status === 'LIVE' ? colors.neon500 : item.status === 'DONE' ? colors.textMuted : 'rgba(255,255,255,0.1)', border: item.status === 'LIVE' ? `2px solid ${colors.neon500}` : 'none' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted, marginBottom: '3px' }}>{item.time}</div>
                    <div style={{ fontSize: '14px', color: item.status === 'DONE' ? colors.textMuted : colors.textPrimary }}>{item.event}</div>
                  </div>
                  <span style={{ backgroundColor: item.status === 'LIVE' ? colors.neon100 : item.status === 'DONE' ? 'transparent' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.status === 'LIVE' ? colors.neon300 : colors.borderSubtle}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: item.status === 'LIVE' ? colors.neon500 : colors.textMuted, alignSelf: 'flex-start' }}>{item.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Prizes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prizes.map((p) => (
                <div key={p.place} style={{ backgroundColor: colors.bgCard, border: `1px solid ${p.color}33`, borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '40px' }}>{p.place}</div>
                  <div>
                    <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: p.color, marginBottom: '4px' }}>{p.label.toUpperCase()}</div>
                    <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: p.color }}>{p.algo}</div>
                    <div style={{ fontSize: '13px', color: colors.textSecondary, marginTop: '2px' }}>+ {p.nft} (on-chain)</div>
                  </div>
                </div>
              ))}
              <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>ADDITIONAL PRIZES</div>
                {['Best Use of AVM · 500 ALGO', 'Most Innovative DeFi · 500 ALGO', 'Community Choice · 250 ALGO', 'Best Documentation · 250 ALGO'].map((p) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                    <Zap size={12} style={{ color: colors.gold500 }} />
                    <span style={{ fontSize: '13px', color: colors.textSecondary }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Projects must be built during the event window (Apr 1–4)', 'Teams of 1–4 members; all members must be registered', 'All code must be open-source and hosted on GitHub', 'Projects must use the Algorand blockchain in a meaningful way', 'AI-assisted code is allowed but must be disclosed', 'Plagiarism will result in immediate disqualification', 'Judges\' decisions are final'].map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '14px 16px' }}>
                  <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: 'rgba(0,255,65,0.2)', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: '14px', color: colors.textSecondary, lineHeight: 1.5 }}>{rule}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — Live stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '16px' }}>LIVE STATS</div>
            {[
              { label: 'Active Participants', value: participants.toLocaleString(), icon: <Users size={14} /> },
              { label: 'Quests Completed', value: '3,842', icon: '⚡' },
              { label: 'XP Distributed', value: '284,100', icon: <Zap size={14} /> },
              { label: 'NFTs Minted', value: '412', icon: '🎖️' },
            ].map((stat) => (
              <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textMuted, fontSize: '12px' }}>
                  <span style={{ color: colors.neon500 }}>{stat.icon}</span>
                  {stat.label}
                </div>
                <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500 }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>TEAM FORMATION</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: colors.textSecondary }}>312 / 400 teams</span>
              <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>78%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '12px' }}>
              <div style={{ width: '78%', height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
            </div>
            <button onClick={() => navigate('/team')} style={{ width: '100%', height: '38px', backgroundColor: 'transparent', color: colors.neon500, borderRadius: '8px', border: `1px solid ${colors.neon300}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer' }}>
              Find / Create Team →
            </button>
          </div>

          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '12px' }}>TOP SUBMISSION</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>AlgoSwap Protocol</div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>by void_architect</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={12} style={{ color: colors.neon500 }} />
              <span style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500 }}>1,200 XP</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}


