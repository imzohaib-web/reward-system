'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { pointsBalance, freeDeliveryTokens, discountEquivalentRupees } = useWallet();
  const { totalQuantity, distinctProductsCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Brand Logo */}
          <Link href="/" style={styles.logo}>
            🐰 <span style={styles.logoText}>OyeBunny</span> Food App
          </Link>

          {/* Header Controls */}
          <div style={styles.navRight}>
            {isAuthenticated ? (
              <>
                {/* Wallet Balance Link/Badge */}
                <Link href="/wallet" style={styles.walletBadgeLink} title="View Wallet & History">
                  <div style={styles.walletItem}>
                    <span style={styles.badgeLabel}>⭐ Points</span>
                    <span style={styles.badgeValue}>{pointsBalance}</span>
                    <span style={styles.conversionSub}>({formatCurrency(discountEquivalentRupees)})</span>
                  </div>
                  <div style={styles.divider} />
                  <div style={styles.walletItem}>
                    <span style={styles.badgeLabel}>🎟️ Free Delivery</span>
                    <span style={styles.badgeValue}>{freeDeliveryTokens}</span>
                  </div>
                </Link>

                {/* User Profile info & Logout */}
                <div style={styles.userInfo}>
                  <Link href="/wallet" style={styles.userName} title="My Profile & History">
                    👤 {user?.name || 'Customer'}
                  </Link>
                  <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.authButtons}>
                <Link href="/login" style={styles.loginBtn}>
                  Login
                </Link>
                <Link href="/register" style={styles.registerBtn}>
                  Register
                </Link>
              </div>
            )}

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={styles.cartBadgeBtn}
            >
              🛒 <span style={styles.cartCount}>{totalQuantity}</span>
              <span style={styles.distinctSub}>({distinctProductsCount} distinct)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  logo: {
    textDecoration: 'none',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    color: '#dd6b20',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  walletBadgeLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#fffaf0',
    border: '1px solid #feebc8',
    padding: '6px 12px',
    borderRadius: '20px',
    textDecoration: 'none',
    transition: 'background 0.15s ease',
  },
  walletItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
  },
  badgeLabel: {
    color: '#744210',
    fontWeight: '600',
  },
  badgeValue: {
    color: '#c05621',
    fontWeight: 'bold',
  },
  conversionSub: {
    color: '#718096',
    fontSize: '0.75rem',
  },
  divider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#cbd5e0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#2d3748',
    textDecoration: 'none',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #cbd5e0',
    padding: '4px 8px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    color: '#e53e3e',
    fontWeight: '600',
  },
  authButtons: {
    display: 'flex',
    gap: '8px',
  },
  loginBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #dd6b20',
    color: '#dd6b20',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  registerBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    background: '#dd6b20',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  cartBadgeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#edf2f7',
    border: '1px solid #cbd5e0',
    padding: '6px 12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: '#2d3748',
  },
  cartCount: {
    color: '#dd6b20',
  },
  distinctSub: {
    fontSize: '0.75rem',
    color: '#718096',
    fontWeight: 'normal',
  },
};
