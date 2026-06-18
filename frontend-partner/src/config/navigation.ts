import type { PartnerRole } from '../types/auth';

// ── Navigation item type ────────────────────────────────────────────────────
export interface NavItem {
  to: string;
  label: string;
  roles: PartnerRole[];
}

// ── Single source of truth for partner navigation ───────────────────────────
const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard',   roles: ['Partner_Owner'] },
  { to: '/vouchers',  label: 'Vouchers',    roles: ['Partner_Owner'] },
  { to: '/validate',  label: 'Validate',    roles: ['Partner_Owner', 'Partner_Cashier'] },
  { to: '/branches',  label: 'Chi nhánh',   roles: ['Partner_Owner'] },
  { to: '/reports',   label: 'Báo cáo',     roles: ['Partner_Owner'] },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Get visible nav items for a given role */
export function getNavItems(role: PartnerRole): NavItem[] {
  return NAV_ITEMS.filter(item => item.roles.includes(role));
}

/** Get the default landing route for a role */
export function getDefaultRoute(role: PartnerRole): string {
  switch (role) {
    case 'Partner_Owner':   return '/dashboard';
    case 'Partner_Cashier': return '/validate';
  }
}

/** Check if a role can access a given path */
export function canAccess(role: PartnerRole, path: string): boolean {
  // Settings is always accessible for logged-in users
  if (path === '/settings' || path.startsWith('/settings')) return true;

  // Check against nav items
  return NAV_ITEMS.some(
    item => item.roles.includes(role) && path.startsWith(item.to)
  );
}
