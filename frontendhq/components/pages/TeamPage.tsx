"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Copy, Zap, Trophy, Users } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import {
  HackteraService,
  type ActivityView,
  type LeaderboardView,
  type QuestView,
  type UserProfile,
} from '@/lib/services/hacktera.service';

const teamStats = [
  { label: 'TOTAL XP', value: '35,580', color: colors.neon500, icon: '⚡' },
  { label: 'TEAM RANK', value: '#12', color: colors.gold500, icon: '🏆' },
  { label: 'QUESTS DONE', value: '31', color: '#fff', icon: '✓' },
  { label: 'NFTs EARNED', value: '8', color: colors.purple500, icon: '🎖️' },
];

export function TeamPage() {
  const navigate = useNavigate();
  const [questList, setQuestList] = useState<QuestView[]>([]);
  const [activityList, setActivityList] = useState<ActivityView[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{
    id: string;
    username: string;
    displayName: string;
    role: 'CAPTAIN' | 'MEMBER';
    xp: number;
    contribution: number;
    online: boolean;
    skills: string[];
  }>>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'join'>('dashboard');

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteActivity, remoteLeaderboard, profile] = await Promise.all([
        HackteraService.getQuests(),
        HackteraService.getActivityFeed(),
        HackteraService.getLeaderboard(),
        HackteraService.getCurrentUserProfile(),
      ]);

      if (!active) return;
      setQuestList(remoteQuests);
      setActivityList(remoteActivity);

      const generatedMembers = buildTeamMembers(remoteLeaderboard, profile);
      setTeamMembers(generatedMembers);
    })();

    return () => {
      active = false;
    };
  }, []);

  const buildTeamMembers = (leaderboard: LeaderboardView[], profile: UserProfile | null) => {
    const contributionByIndex = [35, 28, 22, 15];
    const skillsByIndex = [
      ['React', 'PyTeal', 'Web3'],
      ['Solidity', 'Go', 'Rust'],
      ['Figma', 'CSS', 'React'],
      ['Python', 'DeFi', 'Algorand'],
    ];

    const candidates = leaderboard.slice(0, 4).map((entry, index) => ({
      id: `team-${entry.username}`,
      username: entry.username,
      displayName: entry.displayName,
      role: (index === 0 ? 'CAPTAIN' : 'MEMBER') as 'CAPTAIN' | 'MEMBER',
      xp: entry.xp,
      contribution: contributionByIndex[index] || 10,
      online: index % 2 === 0,
      skills: skillsByIndex[index] || ['Algorand'],
    }));

    if (profile && !candidates.find((member) => member.username === profile.username)) {
      candidates[0] = {
        id: `team-${profile.username}`,
        username: profile.username,
        displayName: profile.displayName,
        role: 'CAPTAIN',
        xp: profile.totalXp,
        contribution: 35,
        online: true,
        skills: skillsByIndex[0],
      };
    }

    return candidates;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('NQ-7X3K').then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 20px', borderRadius: '20px', border: `1px solid ${activeTab === 'dashboard' ? colors.neon300 : colors.borderSubtle}`, backgroundColor: activeTab === 'dashboard' ? colors.neon100 : 'transparent', color: activeTab === 'dashboard' ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>MY TEAM</button>
        <button onClick={() => setActiveTab('join')} style={{ padding: '8px 20px', borderRadius: '20px', border: `1px solid ${activeTab === 'join' ? colors.neon300 : colors.borderSubtle}`, backgroundColor: activeTab === 'join' ? colors.neon100 : 'transparent', color: activeTab === 'join' ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', cursor: 'pointer' }}>BROWSE TEAMS</button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Team hero bar */}
          <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(0,255,65,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '6px' }}>ACTIVE TEAM</div>
              <div style={{ fontFamily: fonts.orbitron, fontSize: '36px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>NeonSquad</div>
              <div style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textMuted }}>#neonsquad · DeFi Builder Track</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '4px' }}>RANK</div>
              <div style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: colors.gold500 }}>#12</div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>GLOBAL</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {teamStats.map((stat) => (
              <div key={stat.label} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Main 2-col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
            {/* Members */}
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '16px' }}>TEAM MEMBERS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {teamMembers.map((m) => (
                  <div key={m.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `2px solid ${m.online ? colors.neon500 : colors.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500 }}>
                        {m.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {m.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.neon500, border: `2px solid ${colors.bgBase}` }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{m.displayName}</span>
                        <span style={{ backgroundColor: m.role === 'CAPTAIN' ? colors.gold100 : 'rgba(255,255,255,0.04)', border: `1px solid ${m.role === 'CAPTAIN' ? 'rgba(255,215,0,0.3)' : colors.borderSubtle}`, borderRadius: '8px', padding: '1px 7px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: m.role === 'CAPTAIN' ? colors.gold500 : colors.textMuted }}>{m.role}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        {m.skills.map((skill) => (
                          <span key={skill} style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '6px', padding: '1px 7px', fontSize: '10px', color: colors.textMuted }}>{skill}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                          <div style={{ width: `${m.contribution}%`, height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.neon500, fontWeight: 700, flexShrink: 0 }}>{m.contribution}%</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>{m.xp.toLocaleString()}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>XP</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team quests progress */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '16px' }}>TEAM QUESTS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {questList.filter(q => q.status === 'In Progress' || q.status === 'Available').slice(0, 3).map((q) => (
                    <div key={q.id} onClick={() => navigate(`/quests/${q.id}`)} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.bgCard; }}
                    >
                      <div style={{ fontSize: '20px' }}>
                        {q.category === 'Deploy' ? '🚀' : q.category === 'Building' ? '🏗️' : '📄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>{q.title}</div>
                        <div style={{ display: 'flex', gap: '-6px' }}>
                          {teamMembers.slice(0, 2).map((m, i) => (
                            <div key={m.id} style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.15)', border: `2px solid ${colors.bgBase}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: colors.neon500, fontWeight: 700, marginLeft: i > 0 ? '-4px' : 0 }}>
                              {m.displayName[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>⚡{q.xp}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
              {/* Invite code */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '12px' }}>INVITE CODE</div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: colors.neon500, letterSpacing: '8px', marginBottom: '16px' }}>NQ-7X3K</div>
                <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto', padding: '8px 20px', borderRadius: '10px', border: `1px solid ${colors.neon300}`, backgroundColor: colors.neon100, color: colors.neon500, fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <Copy size={14} />
                  {codeCopied ? 'Copied!' : 'Copy Code'}
                </button>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '12px' }}>Share this code so others can join your team</div>
              </div>

              {/* Activity feed */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '14px' }}>TEAM ACTIVITY</div>
                {activityList.slice(0, 4).map((item) => (
                  <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.type === 'quest' ? colors.neon500 : item.type === 'nft' ? colors.purple500 : colors.gold500, marginTop: '5px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}><span style={{ fontWeight: 600, color: colors.textPrimary }}>{item.player}</span> {item.event} <span style={{ color: colors.neon500 }}>{item.detail}</span></div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Requests */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '14px' }}>JOIN REQUESTS (2)</div>
                {[{ name: 'algo_wizard', xp: '8.2k', time: '12m ago' }, { name: 'chain_ghost', xp: '5.1k', time: '1h ago' }].map((req) => (
                  <div key={req.name} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: colors.neon500, fontWeight: 700 }}>{req.name[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>{req.name}</div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500 }}>⚡ {req.xp} XP</div>
                      </div>
                      <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{req.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ flex: 1, height: '32px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Accept</button>
                      <button style={{ flex: 1, height: '32px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '8px', border: `1px solid rgba(255,68,68,0.3)`, fontSize: '12px', cursor: 'pointer' }}>Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'join' && (
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>BROWSE TEAMS</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Find Your Squad</h1>

          {/* Search */}
          <input placeholder="Search teams by name, tag, or track..." style={{ width: '100%', height: '52px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '10px', color: colors.textPrimary, fontFamily: fonts.outfit, fontSize: '14px', padding: '0 20px', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[
              { name: 'AlgoBuilders', tag: '#algobuilders', track: 'DeFi Builder', members: 2, maxMembers: 4, xp: 18400 },
              { name: 'ChainStrike', tag: '#chainstrike', track: 'NFT Ecosystem', members: 3, maxMembers: 4, xp: 22100 },
              { name: 'ZeroNode', tag: '#zeronode', track: 'dApp Developer', members: 1, maxMembers: 4, xp: 9800 },
              { name: 'SocialDAO', tag: '#socialdao', track: 'Social Impact', members: 2, maxMembers: 4, xp: 14300 },
            ].map((team) => (
              <div key={team.name} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '60px', background: 'linear-gradient(135deg, rgba(0,255,65,0.08), rgba(123,47,255,0.08))', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                  <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: '#fff' }}>{team.name}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: i < team.members ? 'rgba(0,255,65,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i < team.members ? colors.neon500 : colors.borderSubtle}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: colors.neon500 }}>
                          {i < team.members ? '✓' : ''}
                        </div>
                      ))}
                    </div>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{team.members}/{team.maxMembers} members</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '1px', color: colors.neon500 }}>{team.track}</span>
                  </div>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.neon500, marginBottom: '12px' }}>⚡ {team.xp.toLocaleString()} XP</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ flex: 1, height: '36px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Request to Join</button>
                    <button style={{ height: '36px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '8px', border: `1px solid ${colors.borderDefault}`, fontSize: '12px', cursor: 'pointer', padding: '0 12px' }}>View</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Join by code */}
          <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textPrimary, marginBottom: '4px' }}>Have an invite code?</div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>Enter a 6-character team code to join directly</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {Array.from({ length: 6 }, (_, i) => (
                <input key={i} maxLength={1} style={{ width: '52px', height: '64px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '8px', color: colors.neon500, fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, textAlign: 'center', outline: 'none' }} />
              ))}
              <button style={{ height: '52px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 24px', marginLeft: '8px' }}>Join →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


