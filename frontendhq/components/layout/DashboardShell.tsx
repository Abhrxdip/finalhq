"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Background } from "@/components/layout/Background";
import { Sidebar } from "@/components/layout/Sidebar";
import { colors } from "@/lib/design-tokens";
import { HackteraService } from "@/lib/services/hacktera.service";
import { useNavigate } from "@/lib/router-compat";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!HackteraService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const session = await HackteraService.getAuthMe();
      if (!active) {
        return;
      }

      if (!session.authUser) {
        HackteraService.clearAuthSession();
        navigate("/login");
        return;
      }

      setIsReady(true);
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (!isReady) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.textMuted,
          backgroundColor: colors.bgBase,
          fontFamily: "Outfit, sans-serif",
        }}
      >
        Checking session...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
      <Background />
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <main
          style={{
            flex: 1,
            padding: "32px",
            overflowY: "auto",
            color: colors.textPrimary,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
