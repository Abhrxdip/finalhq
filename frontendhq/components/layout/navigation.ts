import {
  Activity,
  Bell,
  Home,
  Map,
  Settings,
  Shield,
  ShoppingBag,
  Trophy,
  User,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { colors } from '@/lib/design-tokens';

export type AppNavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  exact?: boolean;
  badge?: number;
  accent?: string;
};

function resolveProfileUsername(profileUsername: string) {
  const trimmed = profileUsername.trim();
  if (!trimmed) {
    return 'player';
  }

  return encodeURIComponent(trimmed);
}

export function getAppNavItems(profileUsername = 'player'): AppNavItem[] {
  const resolvedUsername = resolveProfileUsername(profileUsername);

  return [
    { path: '/dashboard', label: 'Dashboard', icon: Home, exact: true },
    { path: '/quests', label: 'Quests', icon: Zap },
    { path: '/event', label: 'Event', icon: Map },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: `/profile/${resolvedUsername}`, label: 'Profile', icon: User },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { path: '/activity', label: 'Activity', icon: Activity },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: 3 },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/admin', label: 'Admin', icon: Shield, accent: colors.orange500 },
  ];
}

export const appNavItems: AppNavItem[] = getAppNavItems();
