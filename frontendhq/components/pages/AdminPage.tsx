"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { LayoutDashboard, Zap, FileText, Award, Trophy, Users, Settings, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type LeaderboardView, type QuestView } from '@/lib/services/hackquest.service';

const adminNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quests', label: 'Quests', icon: Zap },
  { id: 'submissions', label: 'Submissions', icon: FileText },
  { id: 'nft-minting', label: 'NFT Minting', icon: Award },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'participants', label: 'Participants', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const xpActivityData = [
  { time: '00:00', xp: 1200 }, { time: '04:00', xp: 840 }, { time: '08:00', xp: 2100 },
  { time: '12:00', xp: 3400 }, { time: '14:00', xp: 4200 }, { time: '16:00', xp: 3800 },
  { time: '18:00', xp: 5100 }, { time: '20:00', xp: 4600 }, { time: '22:00', xp: 3200 },
  { time: 'Now', xp: 2800 },
];

const pendingSubmissions = [
  { id: 's1', player: 'Algo Phoenix', quest: 'Deploy Smart Contract', githubUrl: 'github.com/algo/contract', liveUrl: 'demo.algo.app', xp: 500, time: '18 min ago' },
  { id: 's2', player: 'Block Shaman', quest: 'DeFi Dashboard', githubUrl: 'github.com/block/defi', liveUrl: 'defi.blockshaman.app', xp: 1200, time: '32 min ago' },
  { id: 's3', player: 'Terra Ghost', quest: 'Technical Documentation', githubUrl: 'github.com/terra/docs', liveUrl: '', xp: 150, time: '1h ago' },
];

const metricCards = [
  { label: 'Active Participants', value: '1,247', delta: '+23 today', color: colors.neon500 },
  { label: 'Quests Completed', value: '3,842', delta: '+187 today', color: colors.blue500 },
  { label: 'Pending Reviews', value: '12', delta: '3 urgent', color: colors.orange500 },
  { label: 'NFTs Minted', value: '412', delta: '+28 today', color: colors.purple500 },
  { label: 'Leaderboard Updates', value: '847', delta: 'Last 1h', color: colors.gold500 },
];

export function AdminPage() {
  const navigate = useNavigate();
  const [questList, setQuestList] = useState<QuestView[]>([]);
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardView[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [selected, setSelected] = useState<string[]>([]);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [mintProgress, setMintProgress] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [chainActionMessage, setChainActionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteQuests, remoteLeaderboard, session] = await Promise.all([
        HackquestService.getQuests(),
        HackquestService.getLeaderboard(),
        HackquestService.getAuthMe(),
      ]);

      if (!active) return;
      setQuestList(remoteQuests);
      setLeaderboardList(remoteLeaderboard);
      setIsAdmin(session.authUser?.role === 'admin');
      setAuthChecked(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  if (authChecked && !isAdmin) {
    return (
      <div style={{ fontFamily: fonts.outfit }}>
        <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.orange500, marginBottom: '10px' }}>ADMIN ACCESS REQUIRED</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>You are signed in as a non-admin account</h1>
          <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>
            To deploy smart contracts from this UI, register/login with an email configured in backend ADMIN_EMAILS.
          </p>
          <button onClick={() => navigate('/dashboard')} style={{ height: '40px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const approve = (id: string) => { setApprovedIds(p => [...p, id]); setRejectedIds(p => p.filter(r => r !== id)); };
  const reject = (id: string) => { setRejectedIds(p => [...p, id]); setApprovedIds(p => p.filter(a => a !== id)); };

  const handleBatchMint = () => {
    setIsMinting(true); setMintProgress(0);
    const interval = setInterval(() => {
      setMintProgress(p => { if (p >= 100) { clearInterval(interval); setIsMinting(false); return 100; } return p + 5; });
    }, 120);
  };

  const handleDeployRegistry = async () => {
    setChainActionMessage('Deploying XP registry...');
    const payload = await HackquestService.deployXpRegistry();

    if (!payload || typeof payload !== 'object') {
      setChainActionMessage('XP registry deployment failed.');
      return;
    }

    const deployment = (payload as Record<string, unknown>).deployment;
    if (!deployment || typeof deployment !== 'object') {
      setChainActionMessage('XP registry deployment failed.');
      return;
    }

    const deploymentData = deployment as Record<string, unknown>;
    const txId = typeof deploymentData.txId === 'string' ? deploymentData.txId : 'tx unavailable';
    const appId = Number(deploymentData.appId ?? 0);
    setChainActionMessage(`XP registry deployed. tx: ${txId}${appId > 0 ? ` · app: ${appId}` : ''}`);
  };

  const handleRecordDemoXp = async () => {
    const wallet = HackquestService.getCurrentWalletAddress();
    if (!wallet) {
      setChainActionMessage('Connect a wallet before recording XP on-chain.');
      return;
    }

    setChainActionMessage('Recording demo XP transaction...');
    const payload = await HackquestService.recordXp({
      userWallet: wallet,
      xp: 25,
      questId: 'admin-demo-sync',
    });

    if (!payload || typeof payload !== 'object') {
      setChainActionMessage('XP record request failed.');
      return;
    }

    const result = (payload as Record<string, unknown>).result;
    if (!result || typeof result !== 'object') {
      setChainActionMessage('XP record request failed.');
      return;
    }

    const txId = (result as Record<string, unknown>).txId;
    setChainActionMessage(typeof txId === 'string' ? `XP recorded on-chain. tx: ${txId}` : 'XP recorded (tx pending).');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{ backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, borderRadius: '8px', padding: '10px 14px' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>{label}</div>
          <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500 }}>+{payload[0].value.toLocaleString()} XP</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Admin badge header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: colors.orange100, border: '1px solid rgba(255,107,0,0.3)', borderRadius: '10px', padding: '4px 12px', fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.orange500 }}>ORGANIZER</div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Admin Panel</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Admin nav sidebar */}
        <div style={{ backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '12px', position: 'sticky', top: '24px' }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', backgroundColor: active ? colors.neon100 : 'transparent', borderLeft: `3px solid ${active ? colors.neon500 : 'transparent'}`, color: active ? colors.neon500 : colors.textSecondary, fontFamily: fonts.outfit, fontSize: '14px', fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: '2px' }}>
                <Icon size={15} style={{ flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div>
          {/* OVERVIEW */}
          {activeSection === 'overview' && (
            <div>
              {/* Metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {metricCards.map((m) => (
                  <div key={m.label} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', color: colors.textMuted, marginBottom: '8px' }}>{m.label.toUpperCase()}</div>
                    <div style={{ fontFamily: fonts.orbitron, fontSize: '22px', fontWeight: 700, color: m.color, marginBottom: '4px' }}>{m.value}</div>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>{m.delta}</div>
                  </div>
                ))}
              </div>

              {/* XP Activity Chart */}
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '20px' }}>XP ACTIVITY TIMELINE</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={xpActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,65,0.06)" />
                    <XAxis dataKey="time" tick={{ fontFamily: fonts.mono, fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontFamily: fonts.mono, fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="xp" stroke={colors.neon500} strokeWidth={2} dot={{ fill: colors.neon500, r: 3 }} activeDot={{ r: 5, fill: colors.neon500 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveSection('submissions')} style={{ height: '44px', backgroundColor: colors.orange500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Approve All Pending ▸</button>
                <button onClick={handleDeployRegistry} style={{ height: '44px', backgroundColor: colors.blue500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Deploy XP Registry</button>
                <button onClick={handleRecordDemoXp} style={{ height: '44px', backgroundColor: colors.purple500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Record +25 XP</button>
                <button style={{ height: '44px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}>Broadcast Message</button>
                <button style={{ height: '44px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '10px', border: 'rgba(255,68,68,0.3) 1px solid', fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}>Pause Event</button>
              </div>

              {chainActionMessage && (
                <div style={{ marginTop: '12px', fontFamily: fonts.mono, fontSize: '11px', color: colors.blue500 }}>
                  {chainActionMessage}
                </div>
              )}
            </div>
          )}

          {/* QUESTS */}
          {activeSection === 'quests' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Quest Management</h2>
                <button style={{ height: '40px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>+ Create Quest</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {questList.map((q) => (
                  <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{q.title}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{q.category} · {q.difficulty} · ⚡ {q.xp} XP</div>
                    </div>
                    <span style={{ backgroundColor: q.status === 'In Progress' ? colors.neon100 : q.status === 'Completed' ? 'rgba(0,255,65,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: q.status === 'In Progress' ? colors.neon500 : q.status === 'Completed' ? colors.neon500 : colors.textMuted }}>{q.status.toUpperCase()}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={{ height: '32px', backgroundColor: 'transparent', color: colors.neon500, borderRadius: '6px', border: `1px solid ${colors.neon300}`, fontSize: '12px', cursor: 'pointer', padding: '0 10px' }}>Edit</button>
                      <button style={{ height: '32px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '6px', border: 'rgba(255,68,68,0.3) 1px solid', fontSize: '12px', cursor: 'pointer', padding: '0 10px' }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUBMISSIONS */}
          {activeSection === 'submissions' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Review Queue ({pendingSubmissions.length})</h2>
                {selected.length > 0 && (
                  <button style={{ height: '40px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>
                    Approve Selected ({selected.length})
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingSubmissions.map((sub) => {
                  const isApproved = approvedIds.includes(sub.id);
                  const isRejected = rejectedIds.includes(sub.id);
                  return (
                    <div key={sub.id} style={{ backgroundColor: isApproved ? 'rgba(0,255,65,0.04)' : isRejected ? 'rgba(255,68,68,0.04)' : colors.bgCard, border: `1px solid ${isApproved ? colors.neon300 : isRejected ? 'rgba(255,68,68,0.3)' : colors.borderDefault}`, borderRadius: '14px', padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <input type="checkbox" checked={selected.includes(sub.id)} onChange={() => toggleSelect(sub.id)} style={{ width: '16px', height: '16px', accentColor: colors.neon500, cursor: 'pointer' }} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>
                          {sub.player.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{sub.player}</div>
                          <div style={{ fontSize: '12px', color: colors.textMuted }}>{sub.quest} · {sub.time}</div>
                        </div>
                        {isApproved && <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.neon500 }}>✓ APPROVED</span>}
                        {isRejected && <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.red500 }}>✗ REJECTED</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        {sub.githubUrl && (
                          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.blue500, textDecoration: 'none' }}>
                            <ExternalLink size={11} /> {sub.githubUrl}
                          </a>
                        )}
                        {sub.liveUrl && (
                          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: colors.blue500, textDecoration: 'none' }}>
                            <ExternalLink size={11} /> {sub.liveUrl}
                          </a>
                        )}
                      </div>
                      {!isApproved && !isRejected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button onClick={() => approve(sub.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '8px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button onClick={() => reject(sub.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '8px', border: `1px solid rgba(255,68,68,0.3)`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer', padding: '0 16px' }}>
                            <XCircle size={14} /> Reject
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                            <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>XP:</span>
                            <input type="number" defaultValue={sub.xp} style={{ width: '80px', height: '34px', backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '6px', color: colors.neon500, fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, padding: '0 10px', outline: 'none', textAlign: 'center' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NFT MINTING */}
          {activeSection === 'nft-minting' && (
            <div>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>NFT Minting</h2>
              <div style={{ backgroundColor: 'rgba(0,149,255,0.04)', border: `1px solid rgba(0,149,255,0.2)`, borderRadius: '12px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: colors.blue500 }}>◆</span>
                <span style={{ fontSize: '13px', color: colors.textSecondary }}>Connected to Algorand Mainnet · ARC-69 NFT Standard</span>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.neon500, marginLeft: '4px' }} />
                <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500 }}>READY</span>
              </div>

              {isMinting && (
                <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.neon500, marginBottom: '12px' }}>BATCH MINTING IN PROGRESS</div>
                  <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '6px' }}>
                    <div style={{ width: `${mintProgress}%`, height: '100%', background: `linear-gradient(90deg, ${colors.neon500}, ${colors.neon700})`, borderRadius: '4px', transition: 'width 0.1s' }} />
                  </div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{mintProgress}% complete</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {approvedIds.length > 0 ? (
                  pendingSubmissions.filter(s => approvedIds.includes(s.id)).map((sub) => (
                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '28px' }}>🎖️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{sub.player}</div>
                        <div style={{ fontSize: '12px', color: colors.textMuted }}>{sub.quest} — NFT Eligible</div>
                      </div>
                      <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.neon500, border: `1px solid ${colors.neon300}`, borderRadius: '6px', padding: '2px 8px' }}>ELIGIBLE</span>
                      <button style={{ height: '34px', backgroundColor: colors.purple500, color: '#fff', borderRadius: '8px', border: 'none', fontFamily: fonts.outfit, fontSize: '12px', fontWeight: 700, cursor: 'pointer', padding: '0 14px' }}>Mint NFT</button>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: colors.textMuted }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎖️</div>
                    <div style={{ fontSize: '14px' }}>Approve submissions first to enable NFT minting</div>
                  </div>
                )}
              </div>

              {approvedIds.length > 0 && (
                <button onClick={handleBatchMint} disabled={isMinting} style={{ height: '48px', backgroundColor: colors.purple500, color: '#fff', borderRadius: '12px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: isMinting ? 'not-allowed' : 'pointer', padding: '0 28px', opacity: isMinting ? 0.7 : 1 }}>
                  {isMinting ? `Minting... ${mintProgress}%` : `Batch Mint All (${approvedIds.length}) NFTs →`}
                </button>
              )}
            </div>
          )}

          {/* PARTICIPANTS */}
          {activeSection === 'participants' && (
            <div>
              <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>Participants ({leaderboardList.length})</h2>
              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 120px 80px', padding: '12px 20px', borderBottom: `1px solid ${colors.borderDefault}` }}>
                  {['PLAYER', 'EMAIL', 'LEVEL', 'XP', 'STATUS'].map((h) => (
                    <span key={h} style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}>{h}</span>
                  ))}
                </div>
                {leaderboardList.map((p, i) => (
                  <div key={p.rank} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 120px 80px', padding: '12px 20px', borderBottom: `1px solid ${colors.borderSubtle}`, alignItems: 'center', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,255,65,0.1)', border: `1px solid ${colors.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: colors.neon500, flexShrink: 0 }}>
                        {p.displayName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.displayName}</span>
                    </div>
                    <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{p.username}@hackquest.io</span>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>LVL {p.level}</span>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: colors.neon500 }}>⚡ {(p.xp / 1000).toFixed(1)}k</span>
                    <span style={{ backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '6px', padding: '2px 6px', fontFamily: fonts.mono, fontSize: '9px', color: colors.neon500 }}>ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {(activeSection === 'leaderboard' || activeSection === 'settings') && (
            <div style={{ textAlign: 'center', padding: '64px', color: colors.textMuted }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚙️</div>
              <div style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.textSecondary, marginBottom: '8px' }}>
                {activeSection === 'leaderboard' ? 'Leaderboard Management' : 'Admin Settings'}
              </div>
              <div style={{ fontSize: '14px' }}>This section is under construction. Check back soon.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


