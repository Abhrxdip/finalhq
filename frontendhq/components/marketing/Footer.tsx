"use client";

import React from 'react';

export function Footer() {
  return (
    <footer
      style={{
        background: '#050A05',
        borderTop: '1px solid rgba(0,255,65,0.08)',
        padding: '52px 80px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '200px',
        background: 'radial-gradient(ellipse 100% 100% at 50% 100%, rgba(0,255,65,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Top row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px',
          marginBottom: '40px',
        }}>
          {/* Logo + tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'rgba(0,255,65,0.08)',
                border: '1px solid rgba(0,255,65,0.25)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, sans-serif', fontSize: '11px',
                fontWeight: 700, color: '#00FF41',
              }}>
                HQ
              </div>
              <div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: '14px',
                  fontWeight: 700, color: '#00FF41', letterSpacing: '2px',
                }}>
                  HACKTERA
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '8.5px',
                  letterSpacing: '2px', color: '#2A4A2A',
                }}>
                  POWERED BY SOLANA
                </div>
              </div>
            </div>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '13px',
              color: '#3A5A3A', maxWidth: '220px', lineHeight: 1.6,
            }}>
              The hackathon meta-game. Turn your code into conquest.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            {[
              { title: 'PLATFORM', links: ['Quests', 'Leaderboard', 'Achievements', 'Activity'] },
              { title: 'RESOURCES', links: ['Docs', 'SDK', 'API Reference', 'Changelog'] },
              { title: 'COMMUNITY', links: ['Discord', 'GitHub', '𝕏 / Twitter', 'Blog'] },
            ].map((col) => (
              <div key={col.title}>
                <div style={{
                  fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
                  letterSpacing: '2px', color: '#2A4A2A', marginBottom: '14px',
                }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: '13px',
                        color: '#3A5A3A', textDecoration: 'none',
                        transition: 'color 0.18s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#00FF41')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#3A5A3A')}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(0,255,65,0.07)', marginBottom: '24px' }} />

        {/* Bottom row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        }}>
          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
            letterSpacing: '0.8px', color: '#1A2A1A',
          }}>
            © 2026 HACKTERA · ALL RIGHTS RESERVED
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {['Privacy', 'Terms', 'Security'].map((l) => (
              <a key={l} href="#" style={{
                fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
                color: '#2A3A2A', textDecoration: 'none', letterSpacing: '0.5px',
                transition: 'color 0.18s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4A6A4A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#2A3A2A')}
              >
                {l}
              </a>
            ))}
          </div>

          <span style={{
            fontFamily: 'Share Tech Mono, monospace', fontSize: '9.5px',
            letterSpacing: '1px', color: '#1A2A1A',
          }}>
            v1.4.2-alpha · MAINNET · slot 312,847,201
          </span>
        </div>
      </div>
    </footer>
  );
}


