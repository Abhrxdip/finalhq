"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNavigate } from '@/lib/router-compat';
import { CheckCircle, XCircle, ExternalLink, Search, Crown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type AdminUserInfo, type LeaderboardView } from '@/lib/services/hackquest.service';
import {
  PremiumEventsService,
  type OrganizerEvent,
  type OrganizerRankingRow,
  type PremiumNftCategory,
} from '@/lib/services/premium-events.service';

const adminSectionIds = [
  'overview',
  'events',
  'submissions',
  'nft-minting',
  'leaderboard',
  'participants',
  'settings',
] as const;

type AdminSectionId = (typeof adminSectionIds)[number];

const resolveAdminSection = (section: string | null): AdminSectionId => {
  if (section && adminSectionIds.includes(section as AdminSectionId)) {
    return section as AdminSectionId;
  }

  return 'overview';
};

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

const premiumCategories = PremiumEventsService.getPremiumNftCategories();

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        reject(new Error('Unable to read selected poster file'));
        return;
      }

      resolve(result);
    };
    reader.onerror = () => reject(new Error('Unable to read selected poster file'));
    reader.readAsDataURL(file);
  });

export function AdminPage() {
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const [leaderboardList, setLeaderboardList] = useState<LeaderboardView[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSectionId>(
    () => resolveAdminSection(searchParams.get('section'))
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [mintProgress, setMintProgress] = useState(0);
  const [isMinting, setIsMinting] = useState(false);
  const [chainActionMessage, setChainActionMessage] = useState<string | null>(null);
  const [userLookup, setUserLookup] = useState('');
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<AdminUserInfo | null>(null);
  const [organizerEvents, setOrganizerEvents] = useState<OrganizerEvent[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [rankingRows, setRankingRows] = useState<OrganizerRankingRow[]>([]);
  const [eventForm, setEventForm] = useState({
    posterUrl: '',
    eventName: '',
    eventDateTime: '',
    premiumNftCategory: 'Singularity' as PremiumNftCategory,
  });

  useEffect(() => {
    setActiveSection(resolveAdminSection(searchParams.get('section')));
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    (async () => {
      const [remoteLeaderboard, session, remoteEvents] = await Promise.all([
        HackquestService.getLeaderboard(),
        HackquestService.getAuthMe(),
        PremiumEventsService.getOrganizerEvents(),
      ]);

      if (!active) return;
      setLeaderboardList(remoteLeaderboard);
      setIsAdmin(session.authUser?.role === 'admin');
      setOrganizerEvents(remoteEvents);

      if (remoteEvents[0]) {
        setEditingEventId(remoteEvents[0].id);
        setEventForm({
          posterUrl: remoteEvents[0].posterUrl,
          eventName: remoteEvents[0].eventName,
          eventDateTime: remoteEvents[0].eventDateTime.slice(0, 16),
          premiumNftCategory: remoteEvents[0].premiumNftCategory,
        });
        setRankingRows(remoteEvents[0].rankings);
      }

      setAuthChecked(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  const openSection = (section: AdminSectionId) => {
    setActiveSection(section);
    navigate(`/admin?section=${section}`, { replace: true });
  };

  if (authChecked && !isAdmin) {
    return (
      <div style={{ fontFamily: fonts.outfit }}>
        <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '28px' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.orange500, marginBottom: '10px' }}>ADMIN ACCESS REQUIRED</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>You are signed in as a non-admin account</h1>
          <p style={{ color: colors.textMuted, fontSize: '14px', marginBottom: '16px' }}>
            To deploy smart contracts from this UI, register/login with an email configured in backend ADMIN_EMAILS.
          </p>
          <p style={{ color: colors.textMuted, fontSize: '13px', marginBottom: '16px' }}>
            User accounts are intentionally limited to self-scope features: personal profile, wallet, quest activity, and settings.
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

  const handleLookupUser = async () => {
    const lookup = userLookup.trim();
    if (!lookup) {
      setLookupMessage('Enter a username to query user intelligence.');
      setSelectedUserInfo(null);
      return;
    }

    const details = await HackquestService.getUserInfoForAdmin(lookup);
    if (!details) {
      setLookupMessage('User lookup failed. Ensure admin privileges and a valid username.');
      setSelectedUserInfo(null);
      return;
    }

    setSelectedUserInfo(details);
    setLookupMessage(`Audit log: ${details.username} data viewed by admin at ${new Date().toLocaleTimeString()}.`);
  };

  const loadEventForEditing = (eventId: string) => {
    const target = organizerEvents.find((event) => event.id === eventId);
    if (!target) {
      return;
    }

    setEditingEventId(target.id);
    setEventForm({
      posterUrl: target.posterUrl,
      eventName: target.eventName,
      eventDateTime: target.eventDateTime.slice(0, 16),
      premiumNftCategory: target.premiumNftCategory,
    });
    setRankingRows(target.rankings);
    setEventMessage(`Loaded ${target.eventName} for editing.`);
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventForm({
      posterUrl: '',
      eventName: '',
      eventDateTime: '',
      premiumNftCategory: 'Singularity',
    });
    setRankingRows([]);
    setEventMessage('Ready to create a new event.');
  };

  const setRankingCell = (index: number, field: 'rank' | 'playerId', value: string) => {
    setRankingRows((previous) => {
      const next = [...previous];
      const target = next[index] || {
        rank: index + 1,
        playerId: '',
        xpAwarded: PremiumEventsService.getXpForRank(index + 1),
        isWinner: index === 0,
        badgeText: index === 0 ? 'WINNER • Premium NFT' : `${PremiumEventsService.getXpForRank(index + 1)} XP`,
      };

      if (field === 'rank') {
        const parsed = Number(value);
        target.rank = Number.isFinite(parsed) && parsed > 0 ? parsed : target.rank;
      } else {
        target.playerId = value;
      }

      target.isWinner = target.rank === 1;
      target.xpAwarded = target.isWinner ? 0 : PremiumEventsService.getXpForRank(target.rank);
      target.badgeText = target.isWinner ? 'WINNER • Premium NFT' : `${target.xpAwarded} XP`;
      next[index] = target;

      return next.sort((left, right) => left.rank - right.rank);
    });
  };

  const addRankingRow = () => {
    setRankingRows((previous) => {
      const nextRank = previous.length > 0 ? Math.max(...previous.map((item) => item.rank)) + 1 : 1;
      const isWinner = nextRank === 1;
      const xpAwarded = isWinner ? 0 : PremiumEventsService.getXpForRank(nextRank);

      return [
        ...previous,
        {
          rank: nextRank,
          playerId: '',
          xpAwarded,
          isWinner,
          badgeText: isWinner ? 'WINNER • Premium NFT' : `${xpAwarded} XP`,
        },
      ];
    });
  };

  const removeRankingRow = (index: number) => {
    setRankingRows((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
  };

  const handlePosterFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    try {
      const fileDataUrl = await fileToDataUrl(selectedFile);
      setEventForm((previous) => ({
        ...previous,
        posterUrl: fileDataUrl,
      }));
      setEventMessage('Poster selected. Ratio target: 3:4.');
    } catch (error) {
      setEventMessage(error instanceof Error ? error.message : 'Unable to load poster file');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.posterUrl || !eventForm.eventName.trim() || !eventForm.eventDateTime) {
      setEventMessage('Event poster, name, and date/time are required.');
      return;
    }

    setIsSavingEvent(true);

    try {
      const payload = {
        posterUrl: eventForm.posterUrl,
        eventName: eventForm.eventName,
        eventDateTime: new Date(eventForm.eventDateTime).toISOString(),
        premiumNftCategory: eventForm.premiumNftCategory,
      };

      const savedEvent = editingEventId
        ? await PremiumEventsService.updateOrganizerEvent(editingEventId, payload)
        : await PremiumEventsService.createOrganizerEvent(payload);

      const freshEvents = await PremiumEventsService.getOrganizerEvents();
      setOrganizerEvents(freshEvents);
      setEditingEventId(savedEvent.id);

      const matched = freshEvents.find((event) => event.id === savedEvent.id);
      setRankingRows(matched?.rankings || []);

      setEventMessage(
        editingEventId
          ? `Updated ${savedEvent.eventName}.`
          : `Created ${savedEvent.eventName}. Configure rankings in the update panel.`
      );
    } catch (error) {
      setEventMessage(error instanceof Error ? error.message : 'Unable to save event');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleSaveRankings = async () => {
    if (!editingEventId) {
      setEventMessage('Save an event before assigning rankings.');
      return;
    }

    try {
      const preparedRankings = rankingRows
        .map((row) => ({
          rank: Number(row.rank),
          playerId: String(row.playerId || '').trim().toLowerCase(),
        }))
        .filter((row) => Number.isFinite(row.rank) && row.rank > 0 && row.playerId);

      if (preparedRankings.length === 0) {
        setEventMessage('Add at least one player ranking to save.');
        return;
      }

      const result = await PremiumEventsService.saveEventRankings(editingEventId, preparedRankings);
      setRankingRows(result.event.rankings);

      const freshEvents = await PremiumEventsService.getOrganizerEvents();
      setOrganizerEvents(freshEvents);

      setEventMessage(
        `Rankings saved. Winner gets ${result.event.premiumNftCategory} Premium NFT and others receive XP rewards.`
      );
    } catch (error) {
      setEventMessage(error instanceof Error ? error.message : 'Unable to save rankings');
    }
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

      <div>
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
                <button onClick={() => openSection('submissions')} style={{ height: '44px', backgroundColor: colors.orange500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Approve All Pending ▸</button>
                <button onClick={handleDeployRegistry} style={{ height: '44px', backgroundColor: colors.blue500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Deploy XP Registry</button>
                <button onClick={handleRecordDemoXp} style={{ height: '44px', backgroundColor: colors.purple500, color: '#fff', borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '0 20px' }}>Record +25 XP</button>
                <button style={{ height: '44px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}>Broadcast Message</button>
                <button style={{ height: '44px', backgroundColor: 'transparent', color: colors.red500, borderRadius: '10px', border: 'rgba(255,68,68,0.3) 1px solid', fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer', padding: '0 20px' }}>Pause Event</button>
              </div>

              <div style={{ marginTop: '18px', backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.orange500, marginBottom: '8px' }}>
                  ACCESS POLICY SNAPSHOT
                </div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: 1.6 }}>
                  Admins have extended controls, including cross-user intelligence lookup, moderation, and chain operations. Regular users are restricted to their own profile, wallet, and quest scope.
                </div>
                <div style={{ marginTop: '10px', display: 'grid', gap: '6px' }}>
                  {[
                    'View operational user info by username (email, wallet, rank, XP, role, flags)',
                    'Approve or reject submissions and control review queue outcomes',
                    'Trigger XP registry deploy and record XP transactions',
                    'Initiate NFT minting for approved submissions',
                  ].map((feature) => (
                    <div key={feature} style={{ fontSize: '12px', color: colors.textMuted }}>
                      • {feature}
                    </div>
                  ))}
                </div>
              </div>

              {chainActionMessage && (
                <div style={{ marginTop: '12px', fontFamily: fonts.mono, fontSize: '11px', color: colors.blue500 }}>
                  {chainActionMessage}
                </div>
              )}
            </div>
          )}

          {/* QUESTS */}
          {activeSection === 'events' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ fontFamily: fonts.orbitron, fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Organizer Quest
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={resetEventForm}
                    style={{
                      height: '38px',
                      backgroundColor: 'transparent',
                      color: colors.textPrimary,
                      borderRadius: '10px',
                      border: `1px solid ${colors.borderDefault}`,
                      fontFamily: fonts.outfit,
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '0 14px',
                    }}
                  >
                    + New Quest
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={isSavingEvent}
                    style={{
                      height: '38px',
                      backgroundColor: colors.neon500,
                      color: colors.bgBase,
                      borderRadius: '10px',
                      border: 'none',
                      fontFamily: fonts.outfit,
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isSavingEvent ? 'not-allowed' : 'pointer',
                      padding: '0 14px',
                      opacity: isSavingEvent ? 0.7 : 1,
                    }}
                  >
                    {editingEventId ? 'Save Quest Update' : 'Create Quest'}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.neon500, marginBottom: '12px' }}>
                  CREATE / UPDATE QUEST
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(220px, 260px)', gap: '14px' }}>
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '6px' }}>
                        QUEST POSTER (3:4)
                      </div>
                      <label
                        htmlFor="event-poster-input"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '34px',
                          border: `1px solid ${colors.borderDefault}`,
                          borderRadius: '8px',
                          padding: '0 12px',
                          color: colors.textPrimary,
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginBottom: '8px',
                        }}
                      >
                        Upload Poster
                      </label>
                      <input id="event-poster-input" type="file" accept="image/*" onChange={handlePosterFile} style={{ display: 'none' }} />

                      <div
                        style={{
                          width: '240px',
                          maxWidth: '100%',
                          aspectRatio: '3 / 4',
                          borderRadius: '12px',
                          border: `1px solid ${colors.borderDefault}`,
                          overflow: 'hidden',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {eventForm.posterUrl ? (
                          <img
                            src={eventForm.posterUrl}
                            alt="Quest poster"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '12px', color: colors.textMuted }}>Poster preview</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '6px' }}>
                        QUEST NAME
                      </div>
                      <input
                        value={eventForm.eventName}
                        onChange={(event) =>
                          setEventForm((previous) => ({
                            ...previous,
                            eventName: event.target.value,
                          }))
                        }
                        placeholder="Enter quest name"
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: '10px',
                          color: colors.textPrimary,
                          fontFamily: fonts.outfit,
                          fontSize: '13px',
                          padding: '0 12px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '6px' }}>
                        DATE & TIME
                      </div>
                      <input
                        type="datetime-local"
                        value={eventForm.eventDateTime}
                        onChange={(event) =>
                          setEventForm((previous) => ({
                            ...previous,
                            eventDateTime: event.target.value,
                          }))
                        }
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: '10px',
                          color: colors.textPrimary,
                          fontFamily: fonts.outfit,
                          fontSize: '13px',
                          padding: '0 12px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '6px' }}>
                        REWARDS • PREMIUM NFT CATEGORY
                      </div>
                      <select
                        value={eventForm.premiumNftCategory}
                        onChange={(event) =>
                          setEventForm((previous) => ({
                            ...previous,
                            premiumNftCategory: event.target.value as PremiumNftCategory,
                          }))
                        }
                        style={{
                          width: '100%',
                          height: '38px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: '10px',
                          color: colors.textPrimary,
                          fontFamily: fonts.outfit,
                          fontSize: '13px',
                          padding: '0 12px',
                          outline: 'none',
                        }}
                      >
                        {premiumCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'rgba(123,47,255,0.08)',
                        border: `1px solid ${colors.borderSubtle}`,
                        borderRadius: '10px',
                        padding: '10px',
                        fontSize: '12px',
                        color: colors.textSecondary,
                        lineHeight: 1.5,
                      }}
                    >
                      Winner receives a Premium NFT.
                      <br />
                      Other ranked players receive XP from 100 down to 10.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.gold500 }}>
                    UPDATE QUEST • RANKINGS
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={addRankingRow}
                      style={{
                        height: '32px',
                        backgroundColor: 'transparent',
                        color: colors.textPrimary,
                        borderRadius: '8px',
                        border: `1px solid ${colors.borderDefault}`,
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '0 12px',
                      }}
                    >
                      + Add Rank
                    </button>
                    <button
                      onClick={handleSaveRankings}
                      style={{
                        height: '32px',
                        backgroundColor: colors.gold500,
                        color: colors.bgBase,
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '0 12px',
                      }}
                    >
                      Save Rankings
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {rankingRows.length === 0 && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: colors.textMuted,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: `1px dashed ${colors.borderSubtle}`,
                        borderRadius: '10px',
                        padding: '12px',
                      }}
                    >
                      Add ranking rows to distribute XP and assign winner NFT.
                    </div>
                  )}

                  {rankingRows.map((row, index) => (
                    <div
                      key={`${row.rank}-${index}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '90px 1fr 140px 90px 38px',
                        gap: '8px',
                        alignItems: 'center',
                        backgroundColor: row.isWinner ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${row.isWinner ? 'rgba(255,215,0,0.3)' : colors.borderSubtle}`,
                        borderRadius: '10px',
                        padding: '10px',
                      }}
                    >
                      <input
                        type="number"
                        min={1}
                        value={row.rank}
                        onChange={(event) => setRankingCell(index, 'rank', event.target.value)}
                        style={{
                          width: '100%',
                          height: '32px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: '8px',
                          color: colors.textPrimary,
                          fontSize: '12px',
                          padding: '0 8px',
                          outline: 'none',
                        }}
                      />
                      <input
                        value={row.playerId}
                        onChange={(event) => setRankingCell(index, 'playerId', event.target.value)}
                        placeholder="player username"
                        style={{
                          width: '100%',
                          height: '32px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${colors.borderSubtle}`,
                          borderRadius: '8px',
                          color: colors.textPrimary,
                          fontSize: '12px',
                          padding: '0 10px',
                          outline: 'none',
                        }}
                      />
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '12px', fontWeight: 700, color: row.isWinner ? colors.gold500 : colors.neon500 }}>
                        {row.isWinner ? 'Premium NFT' : `${row.xpAwarded} XP`}
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        height: '26px',
                        borderRadius: '7px',
                        backgroundColor: row.isWinner ? 'rgba(255,215,0,0.18)' : 'rgba(0,255,65,0.08)',
                        border: `1px solid ${row.isWinner ? 'rgba(255,215,0,0.4)' : colors.neon300}`,
                        fontFamily: fonts.mono,
                        fontSize: '9px',
                        letterSpacing: '1px',
                        color: row.isWinner ? colors.gold500 : colors.neon500,
                      }}>
                        {row.isWinner ? (
                          <>
                            <Crown size={11} /> WINNER
                          </>
                        ) : (
                          'RANK'
                        )}
                      </div>
                      <button
                        onClick={() => removeRankingRow(index)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          border: `1px solid rgba(255,68,68,0.35)`,
                          backgroundColor: 'transparent',
                          color: colors.red500,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: '16px',
                  padding: '18px',
                }}
              >
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '10px' }}>
                  EXISTING QUESTS
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {organizerEvents.length === 0 && (
                    <div style={{ fontSize: '12px', color: colors.textMuted, padding: '10px', border: `1px dashed ${colors.borderSubtle}`, borderRadius: '10px' }}>
                      No organizer quests yet.
                    </div>
                  )}

                  {organizerEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => loadEventForEditing(event.id)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left',
                        backgroundColor: editingEventId === event.id ? 'rgba(0,255,65,0.08)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${editingEventId === event.id ? colors.neon300 : colors.borderSubtle}`,
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        color: colors.textPrimary,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{event.eventName}</div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>
                          {formatDateTime(event.eventDateTime)} • Premium NFT: {event.premiumNftCategory}
                        </div>
                      </div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '1px', color: colors.neon500 }}>
                        {event.rankings.length} ranks
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {eventMessage && (
                <div style={{ marginTop: '10px', fontFamily: fonts.mono, fontSize: '11px', color: colors.blue500 }}>
                  {eventMessage}
                </div>
              )}
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

              <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '16px', marginBottom: '14px' }}>
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.neon500, marginBottom: '8px' }}>
                  ADMIN USER ACCESS HUB
                </div>
                <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '12px', lineHeight: 1.6 }}>
                  Admins can access any user's operational info by username from this section. Access is role-gated and each lookup is audit logged.
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    value={userLookup}
                    onChange={(event) => setUserLookup(event.target.value)}
                    placeholder="Enter username (example: algo_phoenix)"
                    style={{
                      flex: 1,
                      minWidth: '260px',
                      height: '38px',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${colors.borderSubtle}`,
                      borderRadius: '10px',
                      color: colors.textPrimary,
                      fontFamily: fonts.outfit,
                      fontSize: '13px',
                      padding: '0 12px',
                      outline: 'none',
                    }}
                  />
                  <button onClick={handleLookupUser} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 16px' }}>
                    <Search size={14} /> Lookup User
                  </button>
                </div>

                {lookupMessage && (
                  <div style={{ marginTop: '10px', fontFamily: fonts.mono, fontSize: '10px', color: colors.blue500, letterSpacing: '1px' }}>
                    {lookupMessage}
                  </div>
                )}

                {selectedUserInfo && (
                  <div style={{ marginTop: '12px', backgroundColor: 'rgba(0,255,65,0.05)', border: `1px solid ${colors.neon300}`, borderRadius: '12px', padding: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(120px, 1fr))', gap: '10px' }}>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>USERNAME</div>
                        <div style={{ fontSize: '13px', color: colors.textPrimary }}>{selectedUserInfo.username}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>EMAIL</div>
                        <div style={{ fontSize: '13px', color: colors.textPrimary }}>{selectedUserInfo.email}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>WALLET</div>
                        <div style={{ fontSize: '13px', color: colors.textPrimary }}>{selectedUserInfo.walletAddress.slice(0, 10)}...{selectedUserInfo.walletAddress.slice(-4)}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>ROLE</div>
                        <div style={{ fontSize: '13px', color: selectedUserInfo.role === 'admin' ? colors.orange500 : colors.neon500 }}>{selectedUserInfo.role.toUpperCase()}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>XP / RANK</div>
                        <div style={{ fontSize: '13px', color: colors.neon500 }}>⚡ {selectedUserInfo.totalXp.toLocaleString()} · #{selectedUserInfo.rank}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.mono, fontSize: '9px', color: colors.textMuted }}>LAST ACTIVE</div>
                        <div style={{ fontSize: '13px', color: colors.textPrimary }}>{selectedUserInfo.lastActive}</div>
                      </div>
                    </div>
                    {selectedUserInfo.flags.length > 0 && (
                      <div style={{ marginTop: '10px', fontFamily: fonts.mono, fontSize: '10px', color: colors.orange500 }}>
                        Flags: {selectedUserInfo.flags.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

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


