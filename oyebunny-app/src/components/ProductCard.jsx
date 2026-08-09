'use client';

import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/formatters';

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart();

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentQuantity = cartItem ? cartItem.quantity : 0;

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <span style={styles.emoji}>{product.image}</span>
        <span style={styles.categoryBadge}>{product.category}</span>
      </div>

      <div style={styles.body}>
        <div style={styles.headerRow}>
          <h3 style={styles.title}>{product.name}</h3>
          <span style={styles.productIdTag}>{product.id}</span>
        </div>

        <p style={styles.description}>{product.description}</p>

        <div style={styles.footer}>
          <span style={styles.price}>{formatCurrency(product.price)}</span>

          <button
            onClick={() => addToCart(product)}
            style={styles.addBtn}
          >
            {currentQuantity > 0 ? `In Cart (${currentQuantity}) +` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s ease',
  },
  imageContainer: {
    height: '120px',
    backgroundColor: '#f7fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: '4rem',
  },
  categoryBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#2d3748',
    margin: 0,
  },
  productIdTag: {
    fontSize: '0.65rem',
    fontFamily: 'monospace',
    backgroundColor: '#feebc8',
    color: '#744210',
    padding: '2px 6px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: '0.85rem',
    color: '#718096',
    margin: '0 0 16px 0',
    lineHeight: '1.4',
    flex: 1,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#dd6b20',
  },
  addBtn: {
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
