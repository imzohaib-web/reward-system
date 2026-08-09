'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

export default function CartDrawer({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            🛒 Your Food Cart ({totalQuantity})
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Distinct Product Badge Indicator */}
        <div
          style={{
            ...styles.distinctBadge,
            backgroundColor: qualifiesFor3ProductReward ? '#f0fff4' : '#fffaf0',
            borderColor: qualifiesFor3ProductReward ? '#9ae6b4' : '#fbd38d',
          }}
        >
          <div style={styles.badgeHeader}>
            <span>{qualifiesFor3ProductReward ? '🎉 Reward Ready!' : '⭐ Reward Milestone'}</span>
            <strong style={{ color: qualifiesFor3ProductReward ? '#276749' : '#c05621' }}>
              Distinct Products: {distinctProductsCount}
            </strong>
          </div>
          <p style={styles.badgeSub}>
            {qualifiesFor3ProductReward
              ? 'Order qualifies for +20 Reward Points (3+ distinct items).'
              : 'Add 3 distinct products to earn +20 Reward Points on completion.'}
          </p>
        </div>

        {/* Cart Body */}
        <div style={styles.body}>
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={{ fontSize: '3rem' }}>🍟</span>
              <h4>Your Cart is Empty</h4>
              <p>Add some delicious burgers, pizzas, or drinks from the menu!</p>
            </div>
          ) : (
            <div style={styles.itemsList}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} style={styles.itemRow}>
                  <span style={styles.emoji}>{product.image}</span>

                  <div style={styles.itemInfo}>
                    <div style={styles.itemName}>{product.name}</div>
                    <div style={styles.idTag}>{product.id}</div>
                    <div style={styles.unitPrice}>{formatCurrency(product.price)}</div>
                  </div>

                  <div style={styles.controls}>
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
                    <button
                      onClick={() => removeFromCart(product.id)}
                      style={styles.removeBtn}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div style={styles.footer}>
            <div style={styles.summaryRow}>
              <span>Distinct Items:</span>
              <strong>{distinctProductsCount} distinct IDs</strong>
            </div>

            <div style={styles.summaryRow}>
              <span>Total Quantity:</span>
              <strong>{totalQuantity} items</strong>
            </div>

            <div style={styles.totalRow}>
              <span>Subtotal:</span>
              <span style={styles.totalVal}>{formatCurrency(subtotal)}</span>
            </div>

            <div style={styles.actionButtons}>
              <button onClick={clearCart} style={styles.clearBtn}>
                Clear Cart
              </button>

              <Link
                href="/checkout"
                onClick={onClose}
                style={styles.checkoutBtn}
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '420px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2d3748',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#718096',
  },
  distinctBadge: {
    margin: '12px 16px 4px 16px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid',
  },
  badgeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  badgeSub: {
    margin: '4px 0 0 0',
    fontSize: '0.75rem',
    color: '#4a5568',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#718096',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f7fafc',
    border: '1px solid #edf2f7',
  },
  emoji: {
    fontSize: '2rem',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#2d3748',
  },
  idTag: {
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    color: '#718096',
  },
  unitPrice: {
    fontSize: '0.8rem',
    color: '#dd6b20',
    fontWeight: '600',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  qtyBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #cbd5e0',
    background: '#ffffff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  qtyVal: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    minWidth: '14px',
    textAlign: 'center',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginLeft: '4px',
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#718096',
    marginBottom: '4px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '8px 0 16px 0',
    paddingTop: '8px',
    borderTop: '1px dashed #cbd5e0',
  },
  totalVal: {
    color: '#dd6b20',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  clearBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    background: '#ffffff',
    color: '#e53e3e',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  checkoutBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    background: '#dd6b20',
    color: '#ffffff',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};
