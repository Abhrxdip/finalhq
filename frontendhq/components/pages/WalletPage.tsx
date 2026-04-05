"use client";

import React, { useState } from 'react';
import { Copy, ExternalLink, Send, Download, RefreshCw, LogOut } from 'lucide-react';
import { colors, fonts } from '@/lib/design-tokens';
import { HackquestService, type MarketplaceItemView, type WalletTransactionView } from '@/lib/services/hackquest.service';
import { OnChainCounterPanel } from '@/components/pages/OnChainCounterPanel';

const txFilters = ['All', 'XP Rewards', 'NFT Mints', 'Transfers'];

const typeConfig: Record<string, { bg: string; border: string; color: string }> = {
  'XP Reward': { bg: colors.neon100, border: colors.neon300, color: colors.neon500 },
  'NFT Mint': { bg: colors.purple100, border: 'rgba(123,47,255,0.3)', color: colors.purple500 },
  'Transfer': { bg: colors.blue100, border: 'rgba(0,149,255,0.3)', color: colors.blue500 },
};

const shortenValue = (value: string): string => {
  if (value.length <= 14) {
    return value;
  }
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};

const extractResult = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const result = (payload as Record<string, unknown>).result;
  if (!result || typeof result !== 'object') {
    return null;
  }

  return result as Record<string, unknown>;
};

const extractXpValue = (payload: unknown): number | null => {
  const result = extractResult(payload);
  if (!result) {
    return null;
  }

  const value = Number(result.totalXp ?? result.total_xp);
  return Number.isFinite(value) ? value : null;
};

const extractAssetsData = (payload: unknown): { count: number; network: string | null; algoBalance: number | null } => {
  const result = extractResult(payload);
  if (!result) {
    return { count: 0, network: null, algoBalance: null };
  }

  const assets = Array.isArray(result.assets) ? result.assets : [];
  const network = typeof result.network === 'string' ? result.network : null;

  const raw = result.raw;
  if (!raw || typeof raw !== 'object') {
    return { count: assets.length, network, algoBalance: null };
  }

  const rawObj = raw as Record<string, unknown>;
  const balanceCandidate = Number(rawObj.algo_balance ?? rawObj.balance ?? rawObj.micro_algos ?? rawObj.microAlgos);

  if (!Number.isFinite(balanceCandidate)) {
    return { count: assets.length, network, algoBalance: null };
  }

  const normalized = balanceCandidate > 100000 ? balanceCandidate / 1_000_000 : balanceCandidate;
  return { count: assets.length, network, algoBalance: normalized };
};

export function WalletPage() {
  const [txFilter, setTxFilter] = useState('All');
  const [addressCopied, setAddressCopied] = useState(false);
  const [transactionList, setTransactionList] = useState<WalletTransactionView[]>([]);
  const [walletNfts, setWalletNfts] = useState<MarketplaceItemView[]>([]);
  const [walletAddress, setWalletAddress] = useState(HackquestService.getCurrentWalletAddress() || '');
  const [walletProvider, setWalletProvider] = useState(HackquestService.getCurrentWalletProvider() || 'Pera Wallet');
  const [onChainXp, setOnChainXp] = useState(0);
  const [algoBalance, setAlgoBalance] = useState(124.37);
  const [network, setNetwork] = useState('Mainnet');
  const [assetCount, setAssetCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const loadWalletState = React.useCallback(async () => {
    setIsRefreshing(true);

    const profile = await HackquestService.getCurrentUserProfile();
    const resolvedWallet = profile?.walletAddress || HackquestService.getCurrentWalletAddress() || '';
    const resolvedProvider = HackquestService.getCurrentWalletProvider() || 'Pera Wallet';

    if (resolvedWallet) {
      setWalletAddress(resolvedWallet);
    }
    setWalletProvider(resolvedProvider);

    const [remoteTransactions, remoteMarketplaceItems] = await Promise.all([
      HackquestService.getWalletTransactions(resolvedWallet || undefined),
      HackquestService.getMarketplaceItems(),
    ]);

    setTransactionList(remoteTransactions);
    setWalletNfts(remoteMarketplaceItems);

    if (profile) {
      setOnChainXp(profile.totalXp);
      const ownedNfts = profile.backendUserId ? await HackquestService.getUserNfts(profile.backendUserId) : [];
      if (ownedNfts.length > 0) {
        setWalletNfts(ownedNfts);
      }
    }

    if (resolvedWallet) {
      const [xpPayload, assetsPayload] = await Promise.all([
        HackquestService.getUserXp(resolvedWallet),
        HackquestService.getUserAssets(resolvedWallet),
      ]);

      const xpValue = extractXpValue(xpPayload);
      if (xpValue !== null) {
        setOnChainXp(xpValue);
      }

      const assetsData = extractAssetsData(assetsPayload);
      setAssetCount(assetsData.count);
      if (assetsData.network) {
        setNetwork(assetsData.network);
      }
      if (assetsData.algoBalance !== null) {
        setAlgoBalance(assetsData.algoBalance);
      }
    }

    setIsRefreshing(false);
  }, []);

  React.useEffect(() => {
    let active = true;

    (async () => {
      await loadWalletState();

      if (!active) return;
    })();

    return () => {
      active = false;
    };
  }, [loadWalletState]);

  const handleCopy = (type: 'address' | 'code') => {
    const copyValue = type === 'address' ? walletAddress : 'ALGO7XK3BN2MQ9PQVXZL12ABJ4WE9RTY88KSLMNO3QWERTPZXCVBN';
    navigator.clipboard.writeText(copyValue);
    if (type === 'address') { setAddressCopied(true); setTimeout(() => setAddressCopied(false), 2000); }
  };

  const filteredTx = txFilter === 'All' ? transactionList : transactionList.filter(t => {
    if (txFilter === 'XP Rewards') return t.type === 'XP Reward';
    if (txFilter === 'NFT Mints') return t.type === 'NFT Mint';
    if (txFilter === 'Transfers') return t.type === 'Transfer';
    return true;
  });

  const handleVerifyLatest = async () => {
    const latestTx = transactionList[0]?.hash;
    if (!latestTx || latestTx.includes('...')) {
      setVerificationMessage('Latest transaction id is not available for verification yet.');
      return;
    }

    const verificationPayload = await HackquestService.verifyTransaction(latestTx);
    const result = extractResult(verificationPayload);

    if (!result) {
      setVerificationMessage('Verification request failed.');
      return;
    }

    const confirmed = Boolean(result.confirmed);
    const confirmedRound = Number(result.confirmedRound ?? result.confirmed_round ?? 0);

    if (confirmed) {
      setVerificationMessage(`Latest tx verified at round ${confirmedRound}.`);
      return;
    }

    setVerificationMessage('Latest tx is pending confirmation.');
  };

  return (
    <div style={{ fontFamily: fonts.outfit }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '8px' }}>ALGORAND WALLET</div>
        <h1 style={{ fontFamily: fonts.orbitron, fontSize: '32px', fontWeight: 700, color: '#fff', margin: 0 }}>Wallet Dashboard</h1>
      </div>

      {/* Wallet hero card */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', padding: '32px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,149,255,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          {/* Left - Address & status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: colors.blue500, fontSize: '20px' }}>◆</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted }}>ALGORAND WALLET</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontFamily: fonts.mono, fontSize: '13px', color: colors.textSecondary }}>{shortenValue(walletAddress)}</span>
              <button onClick={() => handleCopy('address')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: 0 }}><Copy size={14} /></button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.blue500, padding: 0 }}><ExternalLink size={14} /></button>
            </div>
            {addressCopied && <div style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.neon500 }}>Address copied!</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.neon500 }} />
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '2px', color: colors.neon500 }}>CONNECTED</span>
              <span style={{ fontSize: '12px', color: colors.textMuted }}>· {walletProvider}</span>
            </div>
          </div>

          {/* Center - Balance */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.textMuted, marginBottom: '6px' }}>ALGO BALANCE</div>
            <div style={{ fontFamily: fonts.orbitron, fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              <span style={{ fontSize: '48px' }}>{Math.floor(algoBalance)}</span>
              <span style={{ fontSize: '24px', color: colors.textMuted }}>.{String(Math.round((algoBalance % 1) * 100)).padStart(2, '0')}</span>
            </div>
            <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '6px' }}>≈ ${(algoBalance * 1.99).toFixed(2)} USD</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.neon500 }}>▲ +2.4% (24h)</span>
            </div>
          </div>

          {/* Right - Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 14px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer' }}>
                <Send size={14} /> Send
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 14px', backgroundColor: 'transparent', color: colors.textPrimary, borderRadius: '10px', border: `1px solid ${colors.borderDefault}`, fontFamily: fonts.outfit, fontSize: '13px', cursor: 'pointer' }}>
                <Download size={14} /> Receive
              </button>
            </div>
            <button disabled={isRefreshing} onClick={loadWalletState} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 14px', backgroundColor: 'transparent', color: colors.textMuted, borderRadius: '8px', border: `1px solid ${colors.borderSubtle}`, fontFamily: fonts.outfit, fontSize: '12px', cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}>
              <RefreshCw size={12} /> {isRefreshing ? 'Syncing...' : 'Reconnect'}
            </button>
            <button onClick={handleVerifyLatest} style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 14px', backgroundColor: 'transparent', color: colors.blue500, borderRadius: '8px', border: `1px solid ${colors.blue500}55`, fontFamily: fonts.outfit, fontSize: '12px', cursor: 'pointer' }}>
              <ExternalLink size={12} /> Verify Latest TX
            </button>
            <button onClick={async () => { await HackquestService.disconnectWalletProvider(); setWalletAddress(''); setWalletProvider('Wallet disconnected'); }} style={{ background: 'none', border: 'none', color: colors.red500, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={12} /> Disconnect
            </button>
          </div>
        </div>
      </div>

      {verificationMessage && (
        <div style={{ marginBottom: '16px', fontFamily: fonts.mono, fontSize: '11px', color: colors.blue500 }}>
          {verificationMessage}
        </div>
      )}

      <OnChainCounterPanel
        title="User Counter Controls"
        subtitle="Deploy, increment, and verify your TestNet counter contract using your connected wallet."
      />

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'TOTAL NFTs', value: String(walletNfts.filter(n => n.owned).length), color: colors.purple500, sub: `${assetCount} on-chain assets` },
          { label: 'XP ON-CHAIN', value: onChainXp.toLocaleString(), color: colors.neon500, sub: 'Verified' },
          { label: 'TRANSACTIONS', value: String(transactionList.length), color: colors.textPrimary, sub: 'All time' },
          { label: 'NETWORK', value: network, color: colors.blue500, sub: '◆ Algorand' },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted, marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: fonts.orbitron, fontSize: '22px', fontWeight: 700, color: s.color, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.textMuted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '20px', marginBottom: '24px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.borderSubtle}`, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500 }}>TRANSACTION HISTORY</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {txFilters.map((f) => (
              <button key={f} onClick={() => setTxFilter(f)} style={{ padding: '4px 12px', borderRadius: '12px', border: `1px solid ${txFilter === f ? colors.neon300 : colors.borderSubtle}`, backgroundColor: txFilter === f ? colors.neon100 : 'transparent', color: txFilter === f ? colors.neon500 : colors.textMuted, fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '1px', cursor: 'pointer' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px 120px 100px', padding: '12px 24px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
          {['TX HASH', 'TYPE', 'AMOUNT', 'DATE', 'STATUS'].map((h) => (
            <span key={h} style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '2px', color: colors.textMuted }}>{h}</span>
          ))}
        </div>

          {filteredTx.map((tx, index) => {
          const tc = typeConfig[tx.type] || typeConfig['Transfer'];
          return (
            <div key={`${tx.hash}-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 160px 120px 100px', padding: '14px 24px', borderBottom: `1px solid ${colors.borderSubtle}`, alignItems: 'center', transition: 'background-color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.bgCardHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: colors.blue500, cursor: 'pointer' }}>{shortenValue(tx.hash)}</span>
                <ExternalLink size={10} style={{ color: colors.blue500 }} />
              </div>
              <span style={{ backgroundColor: tc.bg, border: `1px solid ${tc.border}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '1px', color: tc.color, display: 'inline-block' }}>{tx.type}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '12px', color: tx.type === 'XP Reward' ? colors.neon500 : tx.type === 'NFT Mint' ? colors.purple500 : colors.textPrimary }}>{tx.amount}</span>
              <span style={{ fontFamily: fonts.mono, fontSize: '11px', color: colors.textMuted }}>{tx.date}</span>
              <span style={{ backgroundColor: colors.neon100, border: `1px solid ${colors.neon300}`, borderRadius: '8px', padding: '2px 8px', fontFamily: fonts.mono, fontSize: '9px', letterSpacing: '1px', color: colors.neon500, display: 'inline-block' }}>{tx.status}</span>
            </div>
          );
        })}
      </div>

      {/* NFTs on-chain */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontFamily: fonts.mono, fontSize: '11px', letterSpacing: '3px', color: colors.neon500, marginBottom: '16px' }}>ON-CHAIN NFT COLLECTION</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {walletNfts.filter(n => n.owned).map((nft) => (
            <div key={nft.id} style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderDefault}`, borderRadius: '14px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: colors.purple100, border: '1px solid rgba(123,47,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{nft.icon}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{nft.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.purple500 }}>{nft.rarity}</div>
                </div>
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textDisabled, marginBottom: '4px' }}>TX: {nft.txHash}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, marginBottom: '8px' }}>Block: #38,204,117</div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: colors.blue500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <ExternalLink size={10} /> View on AlgoExplorer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


