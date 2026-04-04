"use client";

import React, { useState, useEffect } from 'react';

interface Player {
  id: number;
  rank: number;
  handle: string;
  wallet: string;
  quest: string;
  xp: number;
  move: 'up' | 'down' | 'same';
  avatar: string;
  streak: number;
  level: number;
  isYou?: boolean;
}

interface FeedItem {
  id: number;
  icon: string;
  iconBg: string;
  actor: string;
  action: string;
  target: string;
  targetColor: string;
  time: string;
  xpGain: string;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 1, rank: 1, handle: 'crypto_sage', wallet: '7xKXtg...Hs', quest: 'Serum v3 AMM Rebuild', xp: 4247, move: 'same', avatar: '🦊', streak: 21, level: 34 },
  { id: 2, rank: 2, handle: 'neon_hacker', wallet: '4vJ9wd...Qz', quest: 'Jupiter Swap Integration', xp: 3891, move: 'up', avatar: '🐉', streak: 8, level: 31 },
  { id: 3, rank: 3, handle: 'zk_wizard', wallet: '9mNKpL...Rw', quest: 'ZK Proof Verifier', xp: 3640, move: 'up', avatar: '🧙', streak: 15, level: 29 },
  { id: 4, rank: 4, handle: 'sol_runner', wallet: '3pXcQt...Yb', quest: 'Orca CLMM Pool', xp: 3214, move: 'down', avatar: '🚀', streak: 5, level: 27 },
  { id: 5, rank: 5, handle: 'byte_queen', wallet: '8hFGmW...Lx', quest: 'Wormhole Bridge v2', xp: 2987, move: 'up', avatar: '👑', streak: 12, level: 25 },
  { id: 6, rank: 6, handle: 'ghost_coder', wallet: '2kBCnd...Pv', quest: 'Anchor TS Tooling', xp: 2753, move: 'down', avatar: '👻', streak: 3, level: 22 },
  { id: 7, rank: 7, handle: 'alex_dev', wallet: '5rEHjT...Mm', quest: 'Solana Pay Integration', xp: 1247, move: 'up', avatar: '👾', streak: 7, level: 14, isYou: true },
];

const FEED_ITEMS: FeedItem[] = [
  { id: 1, icon: '⚡', iconBg: 'rgba(0,255,65,0.12)', actor: 'crypto_sage', action: 'completed', target: 'Serum AMM Mastery', targetColor: '#00FF41', time: '23s', xpGain: '+180 XP' },
  { id: 2, icon: '🏆', iconBg: 'rgba(255,215,0,0.1)', actor: 'neon_hacker', action: 'minted', target: 'Speed Demon NFT', targetColor: '#FFD700', time: '1m', xpGain: '+50 XP' },
  { id: 3, icon: '🔮', iconBg: 'rgba(123,47,255,0.12)', actor: 'zk_wizard', action: 'unlocked', target: 'Zero Knowledge', targetColor: '#7B2FFF', time: '2m', xpGain: '+340 XP' },
  { id: 4, icon: '🚀', iconBg: 'rgba(0,255,65,0.1)', actor: 'sol_runner', action: 'deployed to', target: 'Solana Mainnet', targetColor: '#00FF41', time: '3m', xpGain: '+120 XP' },
  { id: 5, icon: '💎', iconBg: 'rgba(255,215,0,0.1)', actor: 'byte_queen', action: 'earned', target: 'Protocol Wizard', targetColor: '#FFD700', time: '5m', xpGain: '+200 XP' },
  { id: 6, icon: '🛡️', iconBg: 'rgba(255,107,0,0.1)', actor: 'ghost_coder', action: 'squashed', target: '12 critical bugs', targetColor: '#FF6B00', time: '8m', xpGain: '+95 XP' },
  { id: 7, icon: '⚡', iconBg: 'rgba(0,255,65,0.1)', actor: 'alex_dev', action: 'submitted', target: 'Solana Pay QST-0087', targetColor: '#00FF41', time: '11m', xpGain: '+60 XP' },
  { id: 8, icon: '🌐', iconBg: 'rgba(123,47,255,0.12)', actor: 'neon_hacker', action: 'bridged', target: '42.5 SOL cross-chain', targetColor: '#7B2FFF', time: '14m', xpGain: '+75 XP' },
];

function PodiumBlock({
  position, player, height, borderColor, glowColor, size, isFirst,
}: {
  position: number;
  player: Player;
  height: number;
  borderColor: string;
  glowColor: string;
  size: number;
  isFirst?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <div style={{
          width: `${size}px`, height: `${size}px`,
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          background: isFirst
            ? `radial-gradient(circle at 40% 40%, ${glowColor}22 0%, rgba(0,0,0,0.4) 100%)`
            : 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 6px',
          fontSize: `${size * 0.42}px`,
          animation: isFirst ? 'podium-glow 2.5s ease-in-out infinite' : 'none',
        }}>
          {player.avatar}
        </div>
        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: '12px',
          fontWeight: 700, color: '#E8F5E8', marginBottom: '1px',
        }}>
          {player.handle}
        </div>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '11px',
          fontWeight: 700, color: borderColor,
        }}>
          {player.xp.toLocaleString()} XP
        </div>
      </div>
      <div style={{
        width: '76px', height: `${height}px`,
        borderRadius: '5px 5px 0 0',
        background: `linear-gradient(180deg, ${glowColor}18 0%, ${glowColor}06 100%)`,
        border: `1px solid ${borderColor}38`, borderBottom: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '32px',
          fontWeight: 900, color: `${glowColor}14`, lineHeight: 1,
        }}>
          {position}
        </span>
      </div>
    </div>
  );
}

// Mini spark bars per player
function MiniXPBar({ xp, max }: { xp: number; max: number }) {
  return (
    <div style={{ width: '56px', height: '3px', background: 'rgba(0,255,65,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: '2px',
        width: `${(xp / max) * 100}%`,
        background: 'linear-gradient(90deg, #009930, #00FF41)',
      }} />
    </div>
  );
}

export function LeaderboardSection() {
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const maxXP = INITIAL_PLAYERS[0].xp;

  // Stagger feed items on mount
  useEffect(() => {
    FEED_ITEMS.forEach((item, i) => {
      setTimeout(() => setFeedItems((prev) => [...prev, item]), i * 180);
    });
  }, []);

  // Animate leaderboard swaps
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prev) => {
        const next = [...prev];
        const swappable = [1, 2, 3, 4]; // don't touch rank 1 or "you"
        const idx = swappable[Math.floor(Math.random() * (swappable.length - 1))];
        const [a, b] = [{ ...next[idx] }, { ...next[idx + 1] }];
        next[idx] = { ...b, rank: a.rank, move: 'up' };
        next[idx + 1] = { ...a, rank: b.rank, move: 'down' };
        return next;
      });
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  const cardBase: React.CSSProperties = {
    background: 'rgba(0,255,65,0.025)',
    border: '1px solid rgba(0,255,65,0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  return (
    <section style={{ background: '#050A05', padding: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            letterSpacing: '4px', color: '#2A4A2A', marginBottom: '6px',
          }}>
            // GLOBAL_RANKINGS · SOLANA_SUMMER_HACK_2026
          </div>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '26px',
            fontWeight: 700, letterSpacing: '1px', color: '#E8F5E8',
          }}>
            LEADERBOARD
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: '8px', padding: '6px 14px',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            color: '#4A6A4A', letterSpacing: '1px',
          }}>
            247 PLAYERS
          </div>
          <div style={{
            background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: '8px', padding: '6px 14px',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            color: '#00FF41', letterSpacing: '1px',
          }}>
            ● UPDATING LIVE
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* ── LEFT: Leaderboard ─────────────────────────── */}
        <div style={cardBase}>
          {/* Podium */}
          <div style={{
            padding: '28px 32px 0',
            background: 'linear-gradient(180deg, rgba(0,255,65,0.025) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(0,255,65,0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Grid bg */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: `linear-gradient(rgba(0,255,65,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.025) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px',
            }}>
              <PodiumBlock position={2} player={INITIAL_PLAYERS[1]} height={52} borderColor="#9DA0A8" glowColor="#C8C8D8" size={50} />
              <PodiumBlock position={1} player={INITIAL_PLAYERS[0]} height={76} borderColor="#FFD700" glowColor="#FFD700" size={62} isFirst />
              <PodiumBlock position={3} player={INITIAL_PLAYERS[2]} height={36} borderColor="#CD7F32" glowColor="#CD7F32" size={46} />
            </div>
          </div>

          {/* Ranked rows */}
          <div style={{ padding: '12px' }}>
            {players.map((p) => (
              <div
                key={p.id}
                className="hq-leaderboard-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '9px', marginBottom: '4px',
                  background: p.isYou ? 'rgba(0,255,65,0.05)' : 'transparent',
                  border: p.isYou ? '1px solid rgba(0,255,65,0.3)' : '1px solid transparent',
                }}
              >
                {/* Rank */}
                <span style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: 700,
                  color: p.rank <= 3 ? '#FFD700' : '#2A4A2A',
                  width: '20px', flexShrink: 0, textAlign: 'center',
                }}>
                  {p.rank}
                </span>

                {/* Avatar */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(0,255,65,0.07)',
                  border: `1px solid ${p.isYou ? 'rgba(0,255,65,0.3)' : 'rgba(0,255,65,0.12)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', flexShrink: 0,
                }}>
                  {p.avatar}
                </div>

                {/* Name + quest + bar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                    <span style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 600,
                      color: p.isYou ? '#00FF41' : '#E8F5E8',
                    }}>
                      {p.handle}
                    </span>
                    {p.isYou && (
                      <span style={{
                        fontFamily: 'Share Tech Mono, monospace', fontSize: '8px', letterSpacing: '1px',
                        color: '#00FF41', background: 'rgba(0,255,65,0.1)',
                        border: '1px solid rgba(0,255,65,0.25)', borderRadius: '4px', padding: '1px 5px',
                      }}>YOU</span>
                    )}
                    <span style={{
                      fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
                      color: '#2A3A2A', letterSpacing: '0.3px',
                    }}>
                      Lv.{p.level}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
                      color: '#2A3A2A', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px',
                    }}>
                      {p.quest}
                    </span>
                    <MiniXPBar xp={p.xp} max={maxXP} />
                  </div>
                </div>

                {/* Wallet */}
                <span style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
                  color: '#2A3A2A', flexShrink: 0,
                  display: 'none',
                }}>
                  {p.wallet}
                </span>

                {/* Streak */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  flexShrink: 0, minWidth: '30px',
                }}>
                  <span style={{ fontSize: '11px' }}>🔥</span>
                  <span style={{
                    fontFamily: 'Share Tech Mono, monospace', fontSize: '8px',
                    color: '#FF6B00',
                  }}>{p.streak}d</span>
                </div>

                {/* XP */}
                <span style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '12px', fontWeight: 700,
                  color: '#00FF41', flexShrink: 0, minWidth: '68px', textAlign: 'right',
                }}>
                  {p.xp.toLocaleString()} XP
                </span>

                {/* Move */}
                <span style={{
                  fontSize: '10px', flexShrink: 0, width: '12px', textAlign: 'center',
                  color:
                    p.move === 'up' ? '#00FF41' :
                    p.move === 'down' ? '#FF4444' : '#2A3A2A',
                }}>
                  {p.move === 'up' ? '▲' : p.move === 'down' ? '▼' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Live Feed ──────────────────────── */}
        <div style={{ ...cardBase, padding: '20px', overflow: 'visible' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#00FF41', flexShrink: 0,
              animation: 'pulseDot 1.5s ease-in-out infinite',
            }} />
            <h4 style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '14px',
              fontWeight: 700, letterSpacing: '1.5px', color: '#E8F5E8',
              flex: 1,
            }}>
              LIVE FEED
            </h4>
            <span style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              color: '#2A3A2A', letterSpacing: '1px',
            }}>
              MAINNET
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(0,255,65,0.07)', marginBottom: '14px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {feedItems.map((item, i) => (
              <div
                key={item.id}
                className="hq-feed-item"
                style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', animationDelay: `${i * 0.1}s` }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: item.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'Outfit, sans-serif', fontSize: '11.5px',
                    color: '#E8F5E8', lineHeight: 1.4,
                  }}>
                    <span style={{ fontWeight: 600 }}>{item.actor}</span>{' '}
                    <span style={{ color: '#3A5A3A' }}>{item.action}</span>{' '}
                    <span style={{ color: item.targetColor }}>{item.target}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{
                      fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
                      color: '#1A2A1A', letterSpacing: '0.5px',
                    }}>
                      {item.time} ago
                    </span>
                    <span style={{
                      fontFamily: 'Orbitron, sans-serif', fontSize: '8.5px',
                      fontWeight: 700, color: '#00FF4155',
                    }}>
                      {item.xpGain}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          <div style={{
            marginTop: '14px', paddingTop: '12px',
            borderTop: '1px solid rgba(0,255,65,0.07)',
            textAlign: 'center',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
            letterSpacing: '2px', color: '#2A4A2A', cursor: 'pointer',
          }}>
            VIEW ALL ACTIVITY →
          </div>
        </div>
      </div>
    </section>
  );
}


