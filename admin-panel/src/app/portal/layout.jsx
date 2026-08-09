'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isCustomerLoggedIn, clearAllTokens, setCustomerToken } from '@/lib/auth';
import { customerApi } from '@/lib/api';

export default function PortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === '/portal' || pathname === '/portal/register';

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace('/portal');
    }
  }, [router]);

  const handleLogout = async () => {
    setCustomerToken(null);
    router.replace('/portal');
  };

  return (
    <div>
      {!isAuthPage && (
        <nav
          style={{
            background: '#0f766e',
            color: '#fff',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 18 }}>Customer Portal</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link
              href="/portal/dashboard"
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              My Wallet
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      )}
      <main style={{ paddingBottom: 40 }}>{children}</main>
    </div>
  );
}
