"use client";

import React, { useEffect, useState } from 'react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackteraService } from '@/lib/services/hacktera.service';
import { PremiumEventsService, type PrimeArtifactItem } from '@/lib/services/premium-events.service';

export function InventoryPage() {
  const [inventory, setInventory] = useState<PrimeArtifactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      const profile = await HackteraService.getCurrentUserProfile();
      const playerId = String(profile.username || '').trim().toLowerCase();

      if (!playerId) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      const items = await PremiumEventsService.getInventoryForOwner(playerId);

      if (!active) {
        return;
      }

      setOwnerId(playerId);
      setInventory(items);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>
          INVENTORY
        </div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '30px', fontWeight: 700, color: '#fff', margin: 0 }}>
          My Premium NFTs
        </h1>
        <p style={{ marginTop: '6px', color: colors.textMuted, fontSize: '13px' }}>
          Owner ID: <span style={{ color: colors.neon500 }}>{ownerId || 'Not available'}</span>
        </p>
      </div>

      {loading && (
        <div
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: '14px',
            padding: '22px',
            fontSize: '13px',
            color: colors.textMuted,
          }}
        >
          Loading inventory...
        </div>
      )}

      {!loading && inventory.length === 0 && (
        <div
          style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.borderDefault}`,
            borderRadius: '14px',
            padding: '22px',
            fontSize: '13px',
            color: colors.textMuted,
          }}
        >
          No claimed Premium NFTs yet.
        </div>
      )}

      {!loading && inventory.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {inventory.map((item) => (
            <div key={item.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '3 / 4', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{item.name}</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.purple500, letterSpacing: '1px', marginBottom: '6px' }}>
                  {item.category.toUpperCase()}
                </div>
                <div style={{ fontSize: '11px', color: colors.neon500, lineHeight: 1.6 }}>
                  Claimed on {new Date(item.claimedAt || item.createdAt).toLocaleString('en-US')} by Player ID: {item.ownerId}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
