"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { CalendarDays, Crown } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { PremiumEventsService, type OrganizerEvent } from '@/lib/services/premium-events.service';
import { HackquestService } from '@/lib/services/hackquest.service';

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

export function QuestPage() {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<OrganizerEvent[]>([]);
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);
  const [joiningEventId, setJoiningEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      const [session, createdQuests, joinedIds] = await Promise.all([
        HackquestService.getAuthMe(),
        PremiumEventsService.getOrganizerEvents(),
        PremiumEventsService.getCurrentUserJoinedEventIds(),
      ]);

      if (!active) {
        return;
      }

      setIsPrivileged(
        session.authUser?.role === 'admin' || session.authUser?.role === 'organizer'
      );
      setQuests(createdQuests);
      setJoinedEventIds(joinedIds);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleJoinQuest = async (eventId: string, eventName: string) => {
    if (isPrivileged || joiningEventId) {
      return;
    }

    setJoiningEventId(eventId);
    setJoinMessage(null);

    try {
      const result = await PremiumEventsService.joinQuest(eventId);
      setJoinedEventIds((previous) =>
        previous.includes(eventId) ? previous : [...previous, eventId]
      );
      setJoinMessage(
        result.alreadyJoined
          ? `You already joined ${eventName}.`
          : `You joined ${eventName}.`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to join quest right now.';
      setJoinMessage(message);
    } finally {
      setJoiningEventId(null);
    }
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>
            QUEST
          </div>
          <h1 style={{ margin: 0, fontFamily: fonts.orbitron, fontSize: '30px', fontWeight: 700, color: '#fff' }}>
            Created Quests
          </h1>
          <p style={{ marginTop: '8px', fontSize: '13px', color: colors.textMuted }}>
            Players can join quests created by organizers. Joined quests are visible in admin panel.
          </p>
        </div>

        {isPrivileged && (
          <button
            onClick={() => navigate('/admin')}
            style={{
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: colors.neon500,
              color: colors.bgBase,
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '0 16px',
            }}
          >
            Manage in Admin
          </button>
        )}
      </div>

      {joinMessage && (
        <div
          style={{
            backgroundColor: 'rgba(0,255,65,0.06)',
            border: `1px solid ${colors.neon300}`,
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '14px',
            fontSize: '12px',
            color: colors.neon500,
            fontFamily: fonts.mono,
            letterSpacing: '0.4px',
          }}
        >
          {joinMessage}
        </div>
      )}

      {loading && (
        <div
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: '14px',
            padding: '18px',
            fontSize: '13px',
            color: colors.textMuted,
          }}
        >
          Loading created quests...
        </div>
      )}

      {!loading && quests.length === 0 && (
        <div
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: '14px',
            padding: '18px',
            fontSize: '13px',
            color: colors.textMuted,
          }}
        >
          No quests have been created yet by organizer.
        </div>
      )}

      {!loading && quests.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {quests.map((quest) => {
            const winner = quest.rankings.find((item) => item.rank === 1);
            const isJoined = joinedEventIds.includes(quest.id);
            const isJoining = joiningEventId === quest.id;
            return (
              <article
                key={quest.id}
                style={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.borderDefault}`,
                  borderRadius: '14px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '100%', aspectRatio: '3 / 4', borderBottom: `1px solid ${colors.borderSubtle}`, overflow: 'hidden' }}>
                  {quest.posterUrl ? (
                    <img src={quest.posterUrl} alt={quest.eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: '12px' }}>
                      No poster
                    </div>
                  )}
                </div>

                <div style={{ padding: '14px' }}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#fff' }}>{quest.eventName}</h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.textSecondary, fontSize: '12px', marginBottom: '8px' }}>
                    <CalendarDays size={14} />
                    {formatDateTime(quest.eventDateTime)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', color: colors.purple500 }}>
                      Premium NFT: {quest.premiumNftCategory}
                    </span>
                    <span style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', color: colors.neon500 }}>
                      {quest.rankings.length} ranks
                    </span>
                  </div>

                  {winner ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.35)', borderRadius: '8px', padding: '4px 9px', color: colors.gold500, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px' }}>
                      <Crown size={12} /> Winner: {winner.playerId}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>Rankings pending</div>
                  )}

                  {!isPrivileged && (
                    <button
                      onClick={() => handleJoinQuest(quest.id, quest.eventName)}
                      disabled={isJoined || isJoining}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        height: '36px',
                        borderRadius: '10px',
                        border: isJoined ? `1px solid ${colors.neon300}` : 'none',
                        backgroundColor: isJoined ? 'rgba(0,255,65,0.08)' : colors.neon500,
                        color: isJoined ? colors.neon500 : colors.bgBase,
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: isJoined || isJoining ? 'default' : 'pointer',
                        opacity: isJoining ? 0.75 : 1,
                      }}
                    >
                      {isJoined ? 'Joined' : isJoining ? 'Joining...' : 'Join Quest'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
