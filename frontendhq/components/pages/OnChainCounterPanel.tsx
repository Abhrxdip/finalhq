"use client";

import React, { useState } from "react";
import { ExternalLink, Plus, RefreshCw, Rocket, ShieldCheck } from "lucide-react";
import { colors, fonts } from "@/lib/design-tokens";
import { HackteraService } from "@/lib/services/hacktera.service";

type OnChainCounterPanelProps = {
  title: string;
  subtitle: string;
};

const extractResult = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const result = (payload as Record<string, unknown>).result;
  if (!result || typeof result !== "object") {
    return null;
  }

  return result as Record<string, unknown>;
};

const shorten = (value: string) => {
  if (!value) {
    return "";
  }

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
};

export function OnChainCounterPanel({ title, subtitle }: OnChainCounterPanelProps) {
  const [appIdInput, setAppIdInput] = useState("");
  const [counterValue, setCounterValue] = useState<number | null>(null);
  const [latestTxId, setLatestTxId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const walletInfo = {
    walletAddress: HackteraService.getCurrentWalletAddress() || "",
    walletProvider: HackteraService.getCurrentWalletProvider() || "Not selected",
  };

  const handleDeploy = async () => {
    if (!walletInfo.walletAddress) {
      setStatusMessage("Connect Pera Wallet first from auth wallet step.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Deploying counter contract on TestNet...");

    const payload = await HackteraService.deployCounterContract({
      senderAddress: walletInfo.walletAddress,
    });

    const result = extractResult(payload);
    if (!result) {
      setStatusMessage("Counter deployment failed.");
      setIsBusy(false);
      return;
    }

    const error = result.error;
    if (typeof error === "string" && error) {
      setStatusMessage(error);
      setIsBusy(false);
      return;
    }

    const appId = Number(result.appId ?? 0);
    const txId = typeof result.txId === "string" ? result.txId : null;
    const value = Number(result.counterValue ?? 0);

    if (appId > 0) {
      setAppIdInput(String(appId));
    }
    if (txId) {
      setLatestTxId(txId);
    }
    if (Number.isFinite(value)) {
      setCounterValue(value);
    }

    setStatusMessage(`Counter contract deployed on TestNet${appId > 0 ? ` · app ${appId}` : ""}.`);
    setIsBusy(false);
  };

  const handleIncrement = async () => {
    const appId = Number(appIdInput);
    if (!Number.isInteger(appId) || appId <= 0) {
      setStatusMessage("Enter a valid App ID before increment.");
      return;
    }

    if (!walletInfo.walletAddress) {
      setStatusMessage("Connect Pera Wallet first from auth wallet step.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Sending increment transaction...");

    const payload = await HackteraService.incrementCounterContract({
      appId,
      senderAddress: walletInfo.walletAddress,
    });

    const result = extractResult(payload);
    if (!result) {
      setStatusMessage("Counter increment failed.");
      setIsBusy(false);
      return;
    }

    const error = result.error;
    if (typeof error === "string" && error) {
      setStatusMessage(error);
      setIsBusy(false);
      return;
    }

    const txId = typeof result.txId === "string" ? result.txId : null;
    const value = Number(result.counterValue ?? 0);

    if (txId) {
      setLatestTxId(txId);
    }
    if (Number.isFinite(value)) {
      setCounterValue(value);
    }

    setStatusMessage("Counter increment confirmed on-chain.");
    setIsBusy(false);
  };

  const handleRefresh = async () => {
    const appId = Number(appIdInput);
    if (!Number.isInteger(appId) || appId <= 0) {
      setStatusMessage("Enter a valid App ID to refresh counter value.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Refreshing on-chain counter value...");

    const payload = await HackteraService.getCounterContractState(appId);
    const result = extractResult(payload);

    if (!result) {
      setStatusMessage("Counter refresh failed.");
      setIsBusy(false);
      return;
    }

    const error = result.error;
    if (typeof error === "string" && error) {
      setStatusMessage(error);
      setIsBusy(false);
      return;
    }

    const value = Number(result.counterValue ?? 0);
    if (Number.isFinite(value)) {
      setCounterValue(value);
    }

    setStatusMessage("Counter value synced from blockchain.");
    setIsBusy(false);
  };

  const handleVerifyLatest = async () => {
    if (!latestTxId) {
      setStatusMessage("No transaction available to verify yet.");
      return;
    }

    setIsBusy(true);
    setStatusMessage("Verifying latest transaction...");

    const payload = await HackteraService.verifyTransaction(latestTxId);
    const result = extractResult(payload);

    if (!result) {
      setStatusMessage("Verification failed.");
      setIsBusy(false);
      return;
    }

    const confirmed = Boolean(result.confirmed);
    const round = Number(result.confirmedRound ?? result.confirmed_round ?? 0);

    setStatusMessage(confirmed ? `Transaction confirmed at round ${round}.` : "Transaction still pending.");
    setIsBusy(false);
  };

  return (
    <div
      style={{
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.borderDefault}`,
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
        <div>
          <div style={{ fontFamily: fonts.mono, fontSize: "10px", letterSpacing: "2px", color: colors.neon500, marginBottom: "6px" }}>
            ON-CHAIN COUNTER
          </div>
          <div style={{ fontFamily: fonts.orbitron, fontSize: "18px", fontWeight: 700, color: colors.textPrimary }}>{title}</div>
          <div style={{ fontSize: "13px", color: colors.textMuted, marginTop: "4px" }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: colors.blue500 }}>
          <ShieldCheck size={14} />
          <span style={{ fontFamily: fonts.mono, fontSize: "10px", letterSpacing: "1px" }}>TESTNET / PERA SIGNED</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "12px", marginBottom: "12px" }}>
        <input
          value={appIdInput}
          onChange={(event) => setAppIdInput(event.target.value)}
          placeholder="Counter App ID"
          style={{
            height: "40px",
            backgroundColor: "rgba(255,255,255,0.03)",
            border: `1px solid ${colors.borderSubtle}`,
            borderRadius: "10px",
            color: colors.textPrimary,
            fontFamily: fonts.outfit,
            fontSize: "13px",
            padding: "0 12px",
            outline: "none",
          }}
        />

        <div
          style={{
            height: "40px",
            borderRadius: "10px",
            border: `1px solid ${colors.borderSubtle}`,
            backgroundColor: "rgba(0,255,65,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.orbitron,
            fontSize: "14px",
            fontWeight: 700,
            color: colors.neon500,
          }}
        >
          COUNT: {counterValue === null ? "--" : counterValue}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button
          type="button"
          onClick={handleDeploy}
          disabled={isBusy}
          style={{
            height: "38px",
            backgroundColor: colors.blue500,
            color: "#fff",
            borderRadius: "9px",
            border: "none",
            fontFamily: fonts.outfit,
            fontSize: "13px",
            fontWeight: 700,
            cursor: isBusy ? "not-allowed" : "pointer",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isBusy ? 0.75 : 1,
          }}
        >
          <Rocket size={13} /> Deploy Contract
        </button>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={isBusy}
          style={{
            height: "38px",
            backgroundColor: colors.purple500,
            color: "#fff",
            borderRadius: "9px",
            border: "none",
            fontFamily: fonts.outfit,
            fontSize: "13px",
            fontWeight: 700,
            cursor: isBusy ? "not-allowed" : "pointer",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isBusy ? 0.75 : 1,
          }}
        >
          <Plus size={13} /> Increment
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isBusy}
          style={{
            height: "38px",
            backgroundColor: "transparent",
            color: colors.textPrimary,
            borderRadius: "9px",
            border: `1px solid ${colors.borderDefault}`,
            fontFamily: fonts.outfit,
            fontSize: "13px",
            cursor: isBusy ? "not-allowed" : "pointer",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isBusy ? 0.75 : 1,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>

        <button
          type="button"
          onClick={handleVerifyLatest}
          disabled={isBusy}
          style={{
            height: "38px",
            backgroundColor: "transparent",
            color: colors.neon500,
            borderRadius: "9px",
            border: `1px solid ${colors.neon300}`,
            fontFamily: fonts.outfit,
            fontSize: "13px",
            cursor: isBusy ? "not-allowed" : "pointer",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isBusy ? 0.75 : 1,
          }}
        >
          <ExternalLink size={13} /> Verify TX
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "6px" }}>
        <div style={{ fontFamily: fonts.mono, fontSize: "10px", color: colors.textMuted, letterSpacing: "1px" }}>
          Wallet: {walletInfo.walletAddress ? shorten(walletInfo.walletAddress) : "not connected"} · {walletInfo.walletProvider}
        </div>

        {latestTxId && (
          <a
            href={`https://lora.algokit.io/testnet/tx/${latestTxId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontFamily: fonts.mono,
              fontSize: "10px",
              color: colors.blue500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            Latest TX: {shorten(latestTxId)}
            <ExternalLink size={11} />
          </a>
        )}

        {statusMessage && (
          <div style={{ fontFamily: fonts.mono, fontSize: "10px", color: colors.textSecondary }}>{statusMessage}</div>
        )}
      </div>
    </div>
  );
}
