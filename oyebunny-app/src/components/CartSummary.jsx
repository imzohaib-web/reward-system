'use client';

import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

export default function CartSummary() {
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

  if (items.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <span style={{ fontSize: '2.5rem' }}>🛒</span>
        <h4 style={{ margin: '8px 0', color: '#4a5568' }}>Your Cart is Empty</h4>
        <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: 0 }}>
          Add food products from the catalog to build your order.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Order Summary</h3>
        <button onClick={clearCart} style={styles.clearBtn}>
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div style={styles.itemsList}>
        {items.map(({ product, quantity }) => (
          <div key={product.id} style={styles.itemRow}>
            <div style={styles.itemMeta}>
              <span style={styles.itemEmoji}>{product.image}</span>
              <div>
                <div style={styles.itemName}>{product.name}</div>
                <div style={styles.itemIdTag}>{product.id}</div>
              </div>
            </div>

            <div style={styles.quantityControls}>
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

            <div style={styles.itemPrice}>
              {formatCurrency(product.price * quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Distinction Metrics Dashboard */}
      <div style={styles.metricsBox}>
        <div style={styles.metricRow}>
          <span>Total Item Quantity:</span>
          <strong>{totalQuantity} items</strong>
        </div>

        <div style={styles.metricRow}>
          <span>Distinct Products Count:</span>
          <strong style={{ color: distinctProductsCount >= 3 ? '#2b6cb0' : '#c53030' }}>
            {distinctProductsCount} distinct ID(s)
          </strong>
        </div>

        <div style={styles.subtotalRow}>
          <span>Subtotal:</span>
          <span style={styles.subtotalVal}>{formatCurrency(subtotal)}</span>
        </div>
      </div>

      {/* Reward Rules Indicator */}
      <div
        style={{
          ...styles.rewardBanner,
          backgroundColor: qualifiesFor3ProductReward ? '#f0fff4' : '#fffaf0',
          borderColor: qualifiesFor3ProductReward ? '#9ae6b4' : '#fbd38d',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>
          {qualifiesFor3ProductReward ? '🎉' : '💡'}
        </span>
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
              : 'Add 3 Distinct Products for Reward'}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: qualifiesFor3ProductReward ? '#2f855a' : '#975a16',
            }}
          >
            {qualifiesFor3ProductReward
              ? `You have selected ${distinctProductsCount} distinct products in this single order.`
              : `Currently: ${distinctProductsCount} / 3 distinct products required. (Repeating the same product increases quantity, not distinct count).`}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  emptyCart: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px border-dashed #cbd5e0',
    padding: '30px',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    borderBottom: '1px solid #edf2f7',
    paddingBottom: '10px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#2d3748',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#e53e3e',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #edf2f7',
  },
  itemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  itemEmoji: {
    fontSize: '1.5rem',
  },
  itemName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2d3748',
  },
  itemIdTag: {
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    color: '#a0aec0',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 16px',
  },
  qtyBtn: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #cbd5e0',
    background: '#edf2f7',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  qtyVal: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    minWidth: '16px',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#2d3748',
    minWidth: '80px',
    textAlign: 'right',
  },
  metricsBox: {
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#4a5568',
  },
  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#1a202c',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '8px',
    marginTop: '4px',
  },
  subtotalVal: {
    color: '#dd6b20',
  },
  rewardBanner: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
};
