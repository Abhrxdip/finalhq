"use client";

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { Zap, ExternalLink } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackteraService, type MarketplaceItemView } from '@/lib/services/hacktera.service';
import { PremiumEventsService, type PrimeArtifactItem } from '@/lib/services/premium-events.service';

const categoryTabs = ['All', 'Quest Rewards', 'Event Exclusive', 'Team Rewards', 'Limited Edition'];

const rarityConfig: Record<string, { bg: string; border: string; color: string }> = {
  LEGENDARY: { bg: colors.gold100, border: 'rgba(255,215,0,0.3)', color: colors.gold500 },
  EPIC: { bg: colors.purple100, border: 'rgba(123,47,255,0.3)', color: colors.purple500 },
  RARE: { bg: colors.blue100, border: 'rgba(0,149,255,0.3)', color: colors.blue500 },
};

type ConfirmStep = 'idle' | 'confirm' | 'processing' | 'success';
type MarketplaceItem = MarketplaceItemView;

const shortenValue = (value: string): string => {
  if (value.length <= 14) {
    return value;
  }
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

const extractTotalXp = (payload: unknown): number | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const result = (payload as Record<string, unknown>).result;
  if (!result || typeof result !== 'object') {
    return null;
  }

  const record = result as Record<string, unknown>;
  const value = Number(record.totalXp ?? record.total_xp);
  return Number.isFinite(value) ? value : null;
};

const extractTxId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const result = (payload as Record<string, unknown>).result;
  if (!result || typeof result !== 'object') {
    return null;
  }

  const txId = (result as Record<string, unknown>).txId;
  if (typeof txId === 'string' && txId.length > 0) {
    return txId;
  }

  return null;
};

export function MarketplacePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [confirmModal, setConfirmModal] = useState<MarketplaceItem | null>(null);
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>('idle');
  const [marketItems, setMarketItems] = useState<MarketplaceItem[]>([]);
  const [availableXp, setAvailableXp] = useState(0);
  const [walletAddress, setWalletAddress] = useState(HackteraService.getCurrentWalletAddress() || '');
  const [profilePath, setProfilePath] = useState('/profile/player');
  const [mintTxId, setMintTxId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [primeArtifacts, setPrimeArtifacts] = useState<PrimeArtifactItem[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [primeStatus, setPrimeStatus] = useState<string | null>(null);
  const [claimingPrimeId, setClaimingPrimeId] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    (async () => {
      const [remoteItems, profile] = await Promise.all([
        HackteraService.getMarketplaceItems(),
        HackteraService.getCurrentUserProfile(),
      ]);

      const premiumItems = await PremiumEventsService.getPrimeArtifactsMarketplace();

      if (!active) return;

      setMarketItems(remoteItems);
      setPrimeArtifacts(premiumItems);

      if (profile) {
        setAvailableXp(profile.totalXp);
        if (profile.walletAddress) {
          setWalletAddress(profile.walletAddress);
        }
        setProfilePath(`/profile/${profile.username}`);
        setCurrentPlayerId(String(profile.username || '').trim().toLowerCase());
      }

      const resolvedWallet = profile?.walletAddress || HackteraService.getCurrentWalletAddress();
      if (!resolvedWallet) {
        return;
      }

      const xpPayload = await HackteraService.getUserXp(resolvedWallet);
      if (!active) return;

      const onChainXp = extractTotalXp(xpPayload);
      if (onChainXp !== null) {
        setAvailableXp(onChainXp);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleRedeem = (nft: MarketplaceItem) => {
    setConfirmModal(nft);
    setConfirmStep('confirm');
    setMintError(null);
    setMintTxId(null);
  };

  const handleConfirm = async () => {
    if (!confirmModal) {
      return;
    }

    setConfirmStep('processing');

    const resolvedWallet = walletAddress || HackteraService.getCurrentWalletAddress();
    if (!resolvedWallet) {
      setConfirmStep('confirm');
      setMintError('Connect a wallet before minting NFTs.');
      return;
    }

    const mintPayload = await HackteraService.mintNft({
      userWallet: resolvedWallet,
      nftName: confirmModal.name,
    });

    const txId = extractTxId(mintPayload);
    if (!txId) {
      setConfirmStep('confirm');
      setMintError('Mint request failed. Check backend/blockchain connectivity and try again.');
      return;
    }

    setMintTxId(txId);
    setConfirmStep('success');
    setAvailableXp((prev) => Math.max(0, prev - confirmModal.price));
    setMarketItems((prev) =>
      prev.map((item) =>
        item.id === confirmModal.id
          ? {
              ...item,
              owned: true,
              txHash: shortenValue(txId),
              earnedDate: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            }
          : item
      )
    );
  };

  const featuredItem = marketItems.find((item) => item.rarity === 'LEGENDARY') ?? marketItems[0] ?? null;

  const handleClaimPrimeArtifact = async (artifact: PrimeArtifactItem) => {
    if (artifact.ownerId) {
      return;
    }

    if (!currentPlayerId) {
      setPrimeStatus('Login required to claim a Prime Artifact.');
      return;
    }

    try {
      setClaimingPrimeId(artifact.id);
      await PremiumEventsService.claimPrimeArtifact(artifact.id, currentPlayerId);
      const refreshed = await PremiumEventsService.getPrimeArtifactsMarketplace();
      setPrimeArtifacts(refreshed);
      setPrimeStatus(`Claimed ${artifact.name} as ${currentPlayerId}.`);
    } catch (error) {
      setPrimeStatus(error instanceof Error ? error.message : 'Failed to claim Prime Artifact.');
    } finally {
      setClaimingPrimeId(null);
    }
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>NFT MARKETPLACE</div>
          <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Reward Store</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '20px', padding: '6px 14px' }}>
            <Zap size={12} style={{ color: colors.neon500 }} />
            <span style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>{availableXp.toLocaleString()} XP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: colors.gold100, border: '1px solid rgba(255,215,0,0.3)', borderRadius: '20px', padding: '6px 14px' }}>
            <span style={{ color: colors.gold500, fontSize: '12px' }}>◆</span>
            <span style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.gold500 }}>420 TOKENS</span>
          </div>
        </div>
      </div>

      {/* Featured banner */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.gold500}44`, borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(0,0,0,0) 100%)' }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.gold500, marginBottom: '6px' }}>⭐ LIMITED EDITION</div>
          <div style={{ fontFamily: fonts.orbitron, fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Genesis Hacker Badge</div>
          <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '12px' }}>Only 12 remaining — Season 01 exclusive NFT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} style={{ color: colors.neon500 }} />
            <span style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: colors.neon500 }}>800 XP</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: colors.gold100, border: '1px solid rgba(255,215,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🎮</div>
          <button onClick={() => featuredItem && handleRedeem(featuredItem)} style={{ height: '40px', backgroundColor: colors.gold500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'pointer', padding: '0 20px', whiteSpace: 'nowrap' }}>Redeem Now →</button>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categoryTabs.map((tab) => (
          <button key={tab} onClick={() => setActiveCategory(tab)} style={{ padding: '7px 16px', borderRadius: '20px', border: `1px solid ${activeCategory === tab ? colors.neon300 : colors.borderSubtle}`, backgroundColor: activeCategory === tab ? colors.neon100 : 'transparent', color: activeCategory === tab ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.15s' }}>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {marketItems.map((nft) => {
          const rc = rarityConfig[nft.rarity] || rarityConfig.RARE;
          const canAfford = availableXp >= nft.price;
          return (
            <div key={nft.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.neon300; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,255,65,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderDefault; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Badge area */}
              <div style={{ height: '140px', backgroundColor: rc.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {[{ top: '8px', left: '8px' }, { top: '8px', right: '8px' }, { bottom: '8px', left: '8px' }, { bottom: '8px', right: '8px' }].map((pos, i) => (
                  <div key={i} style={{ position: 'absolute', ...pos, width: '12px', height: '12px', borderTop: i < 2 ? `2px solid ${colors.neon500}` : 'none', borderBottom: i >= 2 ? `2px solid ${colors.neon500}` : 'none', borderLeft: i % 2 === 0 ? `2px solid ${colors.neon500}` : 'none', borderRight: i % 2 !== 0 ? `2px solid ${colors.neon500}` : 'none' }} />
                ))}
                <span style={{ fontSize: '56px' }}>{nft.icon}</span>
                {nft.owned && <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: colors.neon500, borderRadius: '6px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: colors.bgBase }}>OWNED</div>}
              </div>

              {/* Card body */}
              <div style={{ padding: '16px' }}>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{nft.name}</div>
                <span style={{ backgroundColor: rc.bg, border: `1px solid ${rc.border}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '2px', color: rc.color }}>{nft.rarity}</span>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px' }}>From: <span style={{ color: colors.neon500 }}>{nft.questFrom}</span></div>
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginTop: '3px' }}>Earned: {nft.earnedDate}</div>

                {/* Price section */}
                <div style={{ borderTop: `1px solid ${colors.borderSubtle}`, marginTop: '12px', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Zap size={12} style={{ color: colors.neon500 }} />
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '16px', fontWeight: 700, color: colors.neon500 }}>{nft.price} XP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ height: '4px', width: `${(nft.stock / 500) * 60}px`, backgroundColor: colors.neon500, borderRadius: '2px' }} />
                      <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted }}>{nft.stock} left</span>
                    </div>
                    {!canAfford && !nft.owned && <span style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.orange500 }}>Need {nft.price - availableXp} more XP</span>}
                  </div>
                  {nft.owned ? (
                    <button style={{ width: '100%', height: '38px', backgroundColor: 'rgba(0,255,65,0.06)', color: colors.neon500, borderRadius: '8px', border: `1px solid ${colors.neon300}`, fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: 'default' }}>✓ Owned</button>
                  ) : (
                    <button
                      onClick={() => handleRedeem(nft)}
                      disabled={!canAfford}
                      style={{ width: '100%', height: '38px', backgroundColor: canAfford ? colors.neon500 : 'transparent', color: canAfford ? colors.bgBase : colors.orange500, borderRadius: '8px', border: canAfford ? 'none' : `1px solid ${colors.orange500}44`, fontFamily: fonts.outfit, fontSize: '13px', fontWeight: 700, cursor: canAfford ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
                    >
                      {canAfford ? 'Redeem →' : 'Insufficient XP'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prime Artifacts */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.purple500, marginBottom: '14px' }}>
          PRIME ARTIFACTS
        </div>
        {primeStatus && (
          <div style={{ fontSize: '12px', color: colors.blue500, marginBottom: '10px' }}>{primeStatus}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {primeArtifacts.map((artifact) => (
            <div key={artifact.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '3 / 4', overflow: 'hidden', borderBottom: `1px solid ${colors.borderSubtle}` }}>
                <img src={artifact.imageUrl} alt={artifact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: '#fff' }}>{artifact.name}</div>
                  <span style={{ fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '1px', color: colors.purple500 }}>
                    {artifact.category.toUpperCase()}
                  </span>
                </div>
                {artifact.ownerId ? (
                  <div style={{ fontSize: '11px', color: colors.neon500, lineHeight: 1.6 }}>
                    Claimed on {new Date(artifact.claimedAt || artifact.createdAt).toLocaleString('en-US')} by Player ID: {artifact.ownerId}
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '8px' }}>Available in marketplace</div>
                    <button
                      onClick={() => handleClaimPrimeArtifact(artifact)}
                      disabled={claimingPrimeId === artifact.id}
                      style={{
                        width: '100%',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: colors.neon500,
                        color: colors.bgBase,
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: claimingPrimeId === artifact.id ? 'not-allowed' : 'pointer',
                        opacity: claimingPrimeId === artifact.id ? 0.7 : 1,
                      }}
                    >
                      {claimingPrimeId === artifact.id ? 'Claiming...' : 'Claim Artifact'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && confirmStep !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '520px', maxWidth: '95vw', backgroundColor: colors.bgSurface, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', overflow: 'hidden' }}>
            {confirmStep === 'confirm' && (
              <div>
                <div style={{ backgroundColor: colors.neon100, borderBottom: `1px solid ${colors.neon300}`, padding: '16px 32px', textAlign: 'center' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500 }}>⚡ XP REDEMPTION</span>
                </div>
                <div style={{ padding: '32px' }}>
                  <h2 style={{ fontFamily: fonts.orbitron, fontSize: '22px', fontWeight: 700, color: '#fff', textAlign: 'center', margin: '0 0 24px' }}>Confirm Redemption</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.borderSubtle}`, borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '40px' }}>{confirmModal.icon}</span>
                    <div>
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{confirmModal.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: (rarityConfig[confirmModal.rarity] || rarityConfig.RARE).color }}>{confirmModal.rarity}</div>
                      <div style={{ fontFamily: fonts.orbitron, fontSize: '14px', fontWeight: 700, color: colors.neon500, marginTop: '4px' }}>⚡ {confirmModal.price} XP</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, textAlign: 'center', marginBottom: '16px' }}>Deducting from your balance</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: colors.textMuted }}>Current balance</span>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>{availableXp.toLocaleString()} XP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontSize: '13px', color: colors.textMuted }}>After redemption</span>
                    <span style={{ fontFamily: fonts.orbitron, fontSize: '13px', fontWeight: 700, color: colors.neon500 }}>{(availableXp - confirmModal.price).toLocaleString()} XP</span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center', marginBottom: '20px' }}>NFT will be minted to {walletAddress ? shortenValue(walletAddress) : 'your connected wallet'}.</div>
                  {mintError && <div style={{ fontSize: '12px', color: colors.red500, textAlign: 'center', marginBottom: '16px' }}>{mintError}</div>}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => { setConfirmModal(null); setConfirmStep('idle'); }} style={{ flex: 1, height: '48px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleConfirm} style={{ flex: 2, height: '48px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>Confirm →</button>
                  </div>
                </div>
              </div>
            )}

            {confirmStep === 'processing' && (
              <div style={{ padding: '56px 32px', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 24px' }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ position: 'absolute', inset: `${i * 10}px`, borderRadius: '50%', border: `2px solid ${colors.neon500}`, opacity: 1 - i * 0.25, animation: `spin ${1 + i * 0.3}s linear infinite` }} />
                  ))}
                </div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Minting on Algorand...</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px' }}>Your NFT is being minted on-chain</div>
                <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>TX: ALGO7XK3...pending</div>
              </div>
            )}

            {confirmStep === 'success' && (
              <div style={{ padding: '48px 32px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: colors.neon500, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 30px rgba(0,255,65,0.4)' }}>
                  <span style={{ fontSize: '32px' }}>✓</span>
                </div>
                <div style={{ fontFamily: fonts.orbitron, fontSize: '24px', fontWeight: 700, color: colors.neon500, marginBottom: '8px' }}>NFT Minted!</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>{confirmModal.name} has been added to your collection</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '24px' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{walletAddress ? shortenValue(walletAddress) : 'Wallet connected'}</span>
                  <ExternalLink size={12} style={{ color: colors.blue500 }} />
                  <span style={{ fontSize: '12px', color: colors.blue500 }}>{mintTxId ? shortenValue(mintTxId) : 'View on AlgoExplorer'}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => navigate(profilePath)} style={{ flex: 1, height: '44px', backgroundColor: colors.neon500, color: colors.bgBase, borderRadius: '10px', border: 'none', fontFamily: fonts.outfit, fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>View Inventory →</button>
                  <button onClick={() => { setConfirmModal(null); setConfirmStep('idle'); }} style={{ flex: 1, height: '44px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '14px', cursor: 'pointer' }}>Keep Shopping</button>
                </div>
              </div>
            )}
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}


