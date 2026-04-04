"use client";

import React, { useRef } from 'react';

interface NFTCard {
  id: number;
  icon: string;
  name: string;
  edition: string;
  rarity: 'LEGENDARY' | 'EPIC' | 'RARE' | 'LOCKED';
  solanaNote: string;
  solValue?: string;
  equipped?: boolean;
  locked?: boolean;
}

const RARITY_CONFIG: Record<
  string,
  { color: string; dimColor: string; bg: string; border: string; glowColor: string; shimmer: boolean }
> = {
  LEGENDARY: {
    color: '#FFD700',
    dimColor: '#B89500',
    bg: 'rgba(255,215,0,0.07)',
    border: 'rgba(255,215,0,0.22)',
    glowColor: 'rgba(255,215,0,0.18)',
    shimmer: true,
  },
  EPIC: {
    color: '#9B4FFF',
    dimColor: '#6B2FBF',
    bg: 'rgba(123,47,255,0.07)',
    border: 'rgba(123,47,255,0.22)',
    glowColor: 'rgba(123,47,255,0.18)',
    shimmer: true,
  },
  RARE: {
    color: '#3B82F6',
    dimColor: '#1D4FBF',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.2)',
    glowColor: 'rgba(59,130,246,0.12)',
    shimmer: false,
  },
  LOCKED: {
    color: '#2A4A2A',
    dimColor: '#1A2A1A',
    bg: 'rgba(0,0,0,0.1)',
    border: 'rgba(74,106,74,0.12)',
    glowColor: 'transparent',
    shimmer: false,
  },
};

const NFT_CARDS: NFTCard[] = [
  { id: 1, icon: '🏆', name: 'Genesis Builder', edition: '#001 / 247', rarity: 'LEGENDARY', solanaNote: 'Minted Apr 1 · mainnet', solValue: '0.85 ◎', equipped: true },
  { id: 2, icon: '🔥', name: 'Speed Runner', edition: '#088 / 500', rarity: 'EPIC', solanaNote: 'Minted Mar 28 · mainnet', solValue: '0.32 ◎' },
  { id: 3, icon: '💎', name: 'Protocol Wizard', edition: '#003 / 247', rarity: 'LEGENDARY', solanaNote: 'Minted Mar 21 · mainnet', solValue: '1.20 ◎' },
  { id: 4, icon: '🚀', name: 'Mainnet Deployer', edition: '#412 / 1000', rarity: 'RARE', solanaNote: 'Minted Mar 15 · mainnet', solValue: '0.08 ◎' },
  { id: 5, icon: '⚡', name: 'Flash Hacker', edition: '#156 / 500', rarity: 'EPIC', solanaNote: 'Minted Feb 28 · mainnet', solValue: '0.45 ◎' },
  { id: 6, icon: '🌐', name: 'Solana OG', edition: '#007 / 50', rarity: 'LEGENDARY', solanaNote: 'Minted Jan 12 · mainnet', solValue: '2.40 ◎' },
  { id: 7, icon: '🛡️', name: 'Bug Bounty', edition: '#328 / 1000', rarity: 'RARE', solanaNote: 'Minted Mar 3 · mainnet', solValue: '0.12 ◎' },
  { id: 8, icon: '🔮', name: 'Phantom Caller', edition: '??? / ???', rarity: 'LOCKED', solanaNote: 'Complete 5 more quests', locked: true },
];

function NFTCardComponent({ card }: { card: NFTCard }) {
  const cfg = RARITY_CONFIG[card.rarity];
  const rarityClass = `hq-nft-card hq-rarity-${card.rarity.toLowerCase()}`;

  return (
    <div
      className={rarityClass}
      style={{
        flexShrink: 0,
        width: '176px',
        background: card.locked ? 'rgba(0,0,0,0.15)' : `rgba(0,0,0,0.45)`,
        border: `1px solid ${cfg.border}`,
        borderStyle: card.locked ? 'dashed' : 'solid',
        borderRadius: '14px',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        opacity: card.locked ? 0.38 : 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Holographic shimmer */}
      {cfg.shimmer && !card.locked && (
        <div className="hq-shimmer" style={{ zIndex: 3 }} />
      )}

      {/* Card top bg */}
      <div
        style={{
          height: '100px',
          background: card.locked
            ? 'rgba(0,0,0,0.2)'
            : `radial-gradient(ellipse 80% 80% at 50% 60%, ${cfg.bg} 0%, rgba(0,0,0,0.3) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Holographic bg layer */}
        {cfg.shimmer && !card.locked && (
          <div
            className="hq-holographic-bg"
            style={{
              position: 'absolute', inset: 0,
              opacity: 0.4,
            }}
          />
        )}

        {/* Grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(${cfg.dimColor}22 1px, transparent 1px), linear-gradient(90deg, ${cfg.dimColor}22 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.5,
          pointerEvents: 'none',
        }} />

        <span
          style={{
            fontSize: '38px', lineHeight: 1,
            filter: card.locked ? 'grayscale(1) blur(2px)' : 'none',
            position: 'relative', zIndex: 1,
            textShadow: cfg.shimmer ? `0 0 20px ${cfg.color}55` : 'none',
          }}
        >
          {card.icon}
        </span>

        {/* Equipped badge */}
        {card.equipped && (
          <div style={{
            position: 'absolute', top: '8px', right: '8px',
            background: 'rgba(0,255,65,0.12)', border: '1px solid rgba(0,255,65,0.3)',
            borderRadius: '4px', padding: '2px 6px',
            fontFamily: 'Share Tech Mono, monospace', fontSize: '7.5px',
            letterSpacing: '0.5px', color: '#00FF41',
          }}>
            EQUIPPED
          </div>
        )}

        {/* Edition in top left */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          fontFamily: 'Share Tech Mono, monospace', fontSize: '7.5px',
          color: card.locked ? '#2A3A2A' : `${cfg.color}77`,
          letterSpacing: '0.3px',
        }}>
          {card.edition}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px 14px', flex: 1 }}>
        {/* Name */}
        <div style={{
          fontFamily: 'Outfit, sans-serif', fontSize: '13px',
          fontWeight: 700, color: card.locked ? '#2A4A2A' : '#E8F5E8',
          marginBottom: '7px', lineHeight: 1.2,
        }}>
          {card.name}
        </div>

        {/* Rarity pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: '20px', padding: '2px 10px',
          fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
          letterSpacing: '1.2px', color: cfg.color,
          marginBottom: '9px',
        }}>
          {!card.locked && (
            <div style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: cfg.color, flexShrink: 0,
            }} />
          )}
          {card.rarity}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: `${cfg.border}`, marginBottom: '8px' }} />

        {/* Solana note + value */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
            letterSpacing: '0.3px', color: '#2A4A2A', lineHeight: 1.4,
          }}>
            {card.solanaNote}
          </div>
          {card.solValue && (
            <div style={{
              fontFamily: 'Orbitron, monospace', fontSize: '10px',
              fontWeight: 700, color: cfg.color, letterSpacing: '0.5px',
            }}>
              {card.solValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NFTGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section style={{ background: '#080D08', padding: '80px' }}>
      {/* Section header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '10px',
            letterSpacing: '4px', color: '#2A4A2A', marginBottom: '6px',
          }}>
            // NFT_ACHIEVEMENTS · ON-CHAIN
          </div>
          <h2 style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '26px',
            fontWeight: 700, letterSpacing: '1px', color: '#E8F5E8',
          }}>
            ACHIEVEMENT GALLERY
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              letterSpacing: '1px', color: '#2A4A2A', marginBottom: '2px',
            }}>
              FLOOR VALUE
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '16px',
              fontWeight: 700, color: '#FFD700',
            }}>
              5.42 ◎
            </div>
          </div>
          <div style={{ width: '1px', height: '32px', background: 'rgba(0,255,65,0.1)' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'Share Tech Mono, monospace', fontSize: '9px',
              letterSpacing: '1px', color: '#2A4A2A', marginBottom: '2px',
            }}>
              UNLOCKED
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '16px',
              fontWeight: 700, color: '#00FF41',
            }}>
              7 / 8
            </div>
          </div>
          <div style={{
            background: 'rgba(0,255,65,0.06)', border: '1px solid rgba(0,255,65,0.18)',
            borderRadius: '8px', padding: '7px 16px',
            fontFamily: 'Outfit, sans-serif', fontSize: '12px',
            fontWeight: 600, color: '#00FF41', cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            View on-chain →
          </div>
        </div>
      </div>

      {/* Rarity legend */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['LEGENDARY', 'EPIC', 'RARE'] as const).map((r) => {
          const cfg = RARITY_CONFIG[r];
          return (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: cfg.color, boxShadow: `0 0 6px ${cfg.color}88`,
              }} />
              <span style={{
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
                letterSpacing: '1px', color: '#3A5A3A',
              }}>
                {r}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scroll row */}
      <div
        ref={scrollRef}
        className="hq-scroll-hidden"
        style={{
          display: 'flex', gap: '14px',
          overflowX: 'auto', paddingBottom: '8px',
        }}
      >
        {NFT_CARDS.map((card) => (
          <NFTCardComponent key={card.id} card={card} />
        ))}
      </div>

      {/* Scroll indicator dots */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '18px', gap: '5px' }}>
        {NFT_CARDS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === 0 ? '18px' : '5px',
              height: '3px', borderRadius: '2px',
              background: i === 0 ? '#00FF41' : 'rgba(0,255,65,0.15)',
            }}
          />
        ))}
      </div>
    </section>
  );
}


