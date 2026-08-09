'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalQuantity,
    distinctProductsCount,
    subtotal,
    qualifiesFor3ProductReward,
  } = useCart();

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>
            ← Back to Food Menu
          </Link>
          <h1 style={styles.title}>🛒 Your Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '3.5rem' }}>🍟</span>
            <h2 style={{ color: '#2d3748', margin: '12px 0 6px 0' }}>Your Cart is Empty</h2>
            <p style={{ color: '#718096', margin: '0 0 20px 0' }}>
              Explore our food menu and add your favorite items!
            </p>
            <Link href="/" style={styles.browseBtn}>
              Browse Food Menu
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Left Column: Cart Items List */}
            <div style={styles.itemsCard}>
              <div style={styles.cardHeader}>
                <span style={{ fontWeight: 'bold', color: '#2d3748' }}>
                  Selected Items ({items.length})
                </span>
                <button onClick={clearCart} style={styles.clearBtn}>
                  Clear Cart
                </button>
              </div>

              <div style={styles.itemList}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} style={styles.itemRow}>
                    <span style={styles.emoji}>{product.image}</span>

                    <div style={styles.itemDetails}>
                      <div style={styles.itemName}>{product.name}</div>
                      <div style={styles.itemMeta}>
                        <span style={styles.idTag}>{product.id}</span>
                        <span style={styles.catTag}>{product.category}</span>
                      </div>
                      <div style={styles.price}>{formatCurrency(product.price)} each</div>
                    </div>

                    <div style={styles.qtyControls}>
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        style={styles.qtyBtn}
                      >
                        -
                      </button>
                      <span style={styles.qtyVal}>{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        style={styles.qtyBtn}
                      >
                        +
                      </button>
                    </div>

                    <div style={styles.totalPrice}>
                      {formatCurrency(product.price * quantity)}
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      style={styles.removeBtn}
                      title="Remove product"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary & Distinct Product Verification */}
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>

              <div style={styles.summaryRow}>
                <span>Total Quantity:</span>
                <strong>{totalQuantity} items</strong>
              </div>

              <div style={styles.summaryRow}>
                <span>Distinct Product IDs:</span>
                <strong style={{ color: distinctProductsCount >= 3 ? '#276749' : '#c05621' }}>
                  {distinctProductsCount} distinct item(s)
                </strong>
              </div>

              {/* Distinct Product Reward Indicator */}
              <div
                style={{
                  ...styles.rewardBox,
                  backgroundColor: qualifiesFor3ProductReward ? '#f0fff4' : '#fffaf0',
                  borderColor: qualifiesFor3ProductReward ? '#9ae6b4' : '#fbd38d',
                }}
              >
                <div style={{ fontSize: '1.1rem' }}>
                  {qualifiesFor3ProductReward ? '🎉' : '💡'}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: qualifiesFor3ProductReward ? '#22543d' : '#744210',
                    }}
                  >
                    {qualifiesFor3ProductReward
                      ? 'Qualifies for +20 Reward Points!'
                      : 'Reward Condition Notice'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: qualifiesFor3ProductReward ? '#2f855a' : '#975a16',
                      marginTop: '2px',
                    }}
                  >
                    {qualifiesFor3ProductReward
                      ? `Selected ${distinctProductsCount} distinct products. Reward will be generated upon order completion.`
                      : `Currently: ${distinctProductsCount}/3 distinct items. Adding duplicates of the same product increases quantity, not distinct count.`}
                  </div>
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.totalRow}>
                <span>Subtotal Amount:</span>
                <span style={styles.subtotalVal}>{formatCurrency(subtotal)}</span>
              </div>

              <Link href="/checkout" style={styles.checkoutBtn}>
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
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
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  backLink: {
    color: '#dd6b20',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  title: {
    margin: 0,
    fontSize: '1.6rem',
    color: '#2d3748',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '50px 20px',
    textAlign: 'center',
  },
  browseBtn: {
    display: 'inline-block',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  itemsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #edf2f7',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#e53e3e',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #edf2f7',
  },
  emoji: {
    fontSize: '2.5rem',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#2d3748',
  },
  itemMeta: {
    display: 'flex',
    gap: '6px',
    margin: '2px 0 4px 0',
  },
  idTag: {
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    backgroundColor: '#feebc8',
    color: '#744210',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  catTag: {
    fontSize: '0.65rem',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  price: {
    fontSize: '0.8rem',
    color: '#718096',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  qtyVal: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center',
  },
  totalPrice: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#dd6b20',
    minWidth: '85px',
    textAlign: 'right',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#a0aec0',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '4px',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
  },
  summaryTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.1rem',
    color: '#2d3748',
    paddingBottom: '10px',
    borderBottom: '1px solid #edf2f7',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#4a5568',
    marginBottom: '8px',
  },
  rewardBox: {
    margin: '12px 0',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    gap: '10px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '14px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '16px',
  },
  subtotalVal: {
    color: '#dd6b20',
  },
  checkoutBtn: {
    display: 'block',
    width: '100%',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    textDecoration: 'none',
    textAlign: 'center',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
  },
};
