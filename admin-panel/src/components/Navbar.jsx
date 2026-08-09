import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAllTokens } from '@/lib/auth';

export default function Navbar({ onLogout }) {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/rules', label: 'Reward Rules' },
    { href: '/wallet', label: 'Wallet View' },
  ];

  const handleLogout = () => {
    clearAllTokens();
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  return (
    <nav
      style={{
        background: '#1f2937',
        color: '#fff',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18 }}>
        Reward &amp; Wallet Admin
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: pathname === l.href ? '#60a5fa' : '#d1d5db',
              textDecoration: 'none',
              fontWeight: pathname === l.href ? 700 : 400,
            }}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          style={{
            background: '#ef4444',
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
  );
}
