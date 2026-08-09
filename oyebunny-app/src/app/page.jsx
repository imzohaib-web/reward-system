'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProductCard from '@/components/ProductCard';
import CartSummary from '@/components/CartSummary';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { formatCurrency } from '@/utils/formatters';

export default function FoodMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const { pointsBalance, freeDeliveryTokens, discountEquivalentRupees } = useWallet();

  // Filter products by Category AND Search Query
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.id.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        {/* Customer Welcome & Wallet Summary Banner */}
        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.bannerTitle}>Welcome, {user?.name || 'Customer'}! 🐰</h1>
            <p style={styles.bannerSub}>
              Browse our fresh food catalog below. Add 3 distinct products to earn +20 Reward Points!
            </p>
          </div>

          <div style={styles.walletBox}>
            <div style={styles.walletItem}>
              <span style={styles.walletVal}>{pointsBalance}</span>
              <span style={styles.walletLbl}>Points ({formatCurrency(discountEquivalentRupees)})</span>
            </div>
            <div style={styles.walletDivider} />
            <div style={styles.walletItem}>
              <span style={styles.walletVal}>{freeDeliveryTokens}</span>
              <span style={styles.walletLbl}>Free Delivery Tokens</span>
            </div>
          </div>
        </div>

        {/* Filter Controls: Search & Category Navigation */}
        <div style={styles.filterSection}>
          {/* Search Box */}
          <div style={styles.searchBox}>
            <span style={{ fontSize: '1.1rem' }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search burgers, pizzas, drinks, desserts..."
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div style={styles.categoryBar}>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.catTab,
                  backgroundColor: selectedCategory === cat ? '#dd6b20' : '#ffffff',
                  color: selectedCategory === cat ? '#ffffff' : '#4a5568',
                  borderColor: selectedCategory === cat ? '#dd6b20' : '#cbd5e0',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div style={styles.mainGrid}>
          {/* Left Column: Product Cards Grid */}
          <div>
            {filteredProducts.length === 0 ? (
              <div style={styles.noResultsBox}>
                <span style={{ fontSize: '3rem' }}>🔍</span>
                <h3 style={{ margin: '10px 0 6px 0', color: '#2d3748' }}>No Products Found</h3>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                  No items matched your search query "{searchQuery}". Try searching for burgers, pizzas, or drinks!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  style={styles.resetFilterBtn}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Cart Summary */}
          <div style={styles.cartColumn}>
            <CartSummary />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  welcomeBanner: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px 24px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  bannerTitle: {
    margin: '0 0 4px 0',
    fontSize: '1.5rem',
    color: '#dd6b20',
  },
  bannerSub: {
    margin: 0,
    color: '#718096',
    fontSize: '0.9rem',
  },
  walletBox: {
    backgroundColor: '#fffaf0',
    border: '1px solid #feebc8',
    borderRadius: '10px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  walletItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  walletVal: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#c05621',
  },
  walletLbl: {
    fontSize: '0.75rem',
    color: '#744210',
    fontWeight: '600',
  },
  walletDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#cbd5e0',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e0',
    borderRadius: '10px',
    padding: '10px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '0.95rem',
    color: '#2d3748',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#a0aec0',
    fontSize: '1rem',
  },
  categoryBar: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  catTab: {
    padding: '8px 18px',
    borderRadius: '20px',
    border: '1px solid',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '16px',
  },
  noResultsBox: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px dashed #cbd5e0',
    padding: '40px 20px',
    textAlign: 'center',
  },
  resetFilterBtn: {
    marginTop: '16px',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  cartColumn: {
    position: 'sticky',
    top: '80px',
  },
};
