"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { appNavItems, type AppNavItem } from '@/components/layout/navigation';
import { colors, fonts } from '@/lib/design-tokens';

const LANDING_MENU_ORDER = [
  'Dashboard',
  'Quests',
  'Event',
  'Wallet',
  'Team',
  'Leaderboard',
  'Profile',
  'Marketplace',
  'Activity',
  'Notifications',
  'Settings',
  'Admin',
];

const LANDING_MENU_ITEMS: AppNavItem[] = LANDING_MENU_ORDER
  .map((label) => appNavItems.find((item) => item.label === label))
  .filter((item): item is AppNavItem => Boolean(item));

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '68px',
        background: scrolled ? 'rgba(5,10,5,0.92)' : 'rgba(5,10,5,0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,255,65,0.1)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center',
        padding: '0 48px',
        transition: 'background 0.3s',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 0 auto', marginRight: '48px' }}>
        <div style={{
          width: '34px', height: '34px',
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid rgba(0,255,65,0.3)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Orbitron, sans-serif', fontSize: '12px',
          fontWeight: 700, color: '#00FF41',
          animation: 'glow-pulse 3.5s ease-in-out infinite',
        }}>
          HQ
        </div>
        <div>
          <div style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: '15px',
            fontWeight: 700, color: '#00FF41', letterSpacing: '2px', lineHeight: 1,
          }}>
            HACKTERA
          </div>
          <div style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '8px',
            color: '#2A4A2A', letterSpacing: '2px',
          }}>
            POWERED BY SOLANA
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link
          href="/login"
          style={{
            textDecoration: 'none',
            color: '#9BC79B',
            fontFamily: fonts.outfit,
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: '10px',
            padding: '8px 12px',
            background: 'rgba(0,255,65,0.03)',
          }}
        >
          Login
        </Link>

        <Link
          href="/signup"
          style={{
            textDecoration: 'none',
            color: '#9BC79B',
            fontFamily: fonts.outfit,
            fontSize: '13px',
            fontWeight: 500,
            border: '1px solid rgba(0,255,65,0.15)',
            borderRadius: '10px',
            padding: '8px 12px',
            background: 'rgba(0,255,65,0.03)',
          }}
        >
          Signup
        </Link>

        <Link
          href="/auth/wallet"
          style={{
            textDecoration: 'none',
            color: '#031003',
            fontFamily: fonts.outfit,
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid rgba(0,255,65,0.45)',
            borderRadius: '10px',
            padding: '8px 14px',
            background: '#00FF41',
          }}
        >
          Connect Wallet
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                border: '1px solid rgba(0,255,65,0.2)',
                background: 'rgba(0,255,65,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: '18px', height: '2px', background: '#00FF41', borderRadius: '2px' }} />
              <span style={{ width: '18px', height: '2px', background: '#00FF41', borderRadius: '2px' }} />
              <span style={{ width: '18px', height: '2px', background: '#00FF41', borderRadius: '2px' }} />
            </button>
          </SheetTrigger>
        <SheetContent
          side="right"
          style={{
            backgroundColor: colors.bgSurface,
            borderLeft: `1px solid ${colors.borderDefault}`,
            width: 'min(360px, 85vw)',
            padding: 0,
          }}
        >
          <SheetHeader
            style={{
              padding: '22px 20px 14px',
              borderBottom: `1px solid ${colors.borderSubtle}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: colors.neon500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: fonts.orbitron,
                  fontSize: '13px',
                  fontWeight: 900,
                  color: colors.bgBase,
                  flexShrink: 0,
                }}
              >
                HQ
              </div>
              <div>
                <div
                  style={{
                    fontFamily: fonts.orbitron,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: colors.neon500,
                    letterSpacing: '2px',
                  }}
                >
                  HACKTERA
                </div>
                <div style={{ fontFamily: fonts.mono, fontSize: '10px', color: colors.textMuted, letterSpacing: '1px' }}>
                  NAVIGATION
                </div>
              </div>
            </div>
            <SheetTitle style={{ position: 'absolute', left: '-9999px' }}>Navigation Menu</SheetTitle>
          </SheetHeader>

          <nav style={{ padding: '12px' }}>
            {LANDING_MENU_ITEMS.map((item) => {
              const active = isActive(item.path, item.exact);
              const Icon = item.icon;
              const accentColor = item.accent || colors.neon500;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: '4px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: active ? colors.neon100 : 'transparent',
                      borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Icon size={16} style={{ color: active ? accentColor : colors.textMuted, flexShrink: 0 }} />
                    <span
                      style={{
                        fontFamily: fonts.outfit,
                        fontSize: '14px',
                        fontWeight: active ? 600 : 400,
                        color: active ? accentColor : colors.textSecondary,
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span
                        style={{
                          backgroundColor: colors.neon500,
                          color: colors.bgBase,
                          borderRadius: '10px',
                          padding: '1px 7px',
                          fontSize: '10px',
                          fontWeight: 700,
                          fontFamily: fonts.mono,
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}


