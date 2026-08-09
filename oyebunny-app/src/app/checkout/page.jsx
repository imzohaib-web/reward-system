'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { walletService } from '@/services/walletService';
import { rewardService } from '@/services/rewardService';
import { formatCurrency, formatDate } from '@/utils/formatters';

export default function CheckoutPage() {
  const { user } = useAuth();
  const {
    items,
    totalQuantity,
    distinctProductsCount,
    subtotal,
    qualifiesFor3ProductReward,
    clearCart,
  } = useCart();

  const {
    pointsBalance,
    freeDeliveryTokens,
    discountEquivalentRupees,
    refreshWallet,
    refreshHistory,
  } = useWallet();

  // Stable Order ID per checkout session
  const [orderId, setOrderId] = useState('');
  useEffect(() => {
    setOrderId(`ORD_OYE_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  // Points Discount state
  const [applyPoints, setApplyPoints] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  // Conversion calculations (2 Points = Rs. 1)
  const pointsNeededForFullCover = Math.ceil(subtotal * 2);
  const usablePoints = applyPoints
    ? Math.min(pointsBalance, pointsNeededForFullCover)
    : 0;
  const discountRupees = usablePoints / 2;
  const finalPayable = Math.max(0, subtotal - discountRupees);

  // Handle Order Completion Flow
  const handleCompleteOrder = async () => {
    if (submitting) return;
    setErrorMsg('');
    setSubmitting(true);

    try {
      let redeemedPointsData = null;

      // 1. Redeem points via Wallet API if toggle enabled & usable points > 0
      if (applyPoints && usablePoints > 0) {
        try {
          const walletRes = await walletService.useReward({
            rewardType: 'Points',
            amount: usablePoints,
            referenceId: orderId,
            referenceType: 'ORDER',
            description: `Points discount applied to order ${orderId}`,
          });
          redeemedPointsData = walletRes.data;
        } catch (err) {
          throw new Error(err.message || 'Failed to redeem wallet points for discount');
        }
      }

      // 2. Prepare Order Payload for Reward Service
      const orderPayload = {
        orderId,
        userId: user?.id || user?._id,
        status: 'COMPLETED',
        source: 'FOOD_APP',
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
      };

      // 3. Process Order for Reward via Reward Service API
      const rewardRes = await rewardService.processOrder(orderPayload);
      const rewardData = rewardRes.data;

      // 4. Refresh authoritative Wallet Balance & History from Backend
      await refreshWallet();
      await refreshHistory();

      // 5. Set Order Confirmation Result
      setOrderResult({
        orderId,
        items: [...items],
        subtotal,
        pointsRedeemed: usablePoints,
        discountRupees,
        finalPayable,
        rewardResult: rewardData,
        redeemedData: redeemedPointsData,
        completedAt: new Date().toISOString(),
      });

      // 6. Clear Cart
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'An error occurred while processing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- CONFIRMATION SCREEN ---
  if (orderResult) {
    const earnedRewards = orderResult.rewardResult?.rewards || [];
    const pointsGranted = earnedRewards
      .filter((r) => r.rewardType === 'Points')
      .reduce((sum, r) => sum + r.amount, 0);

    const tokensGranted = earnedRewards
      .filter((r) => r.rewardType === 'Free Delivery Token')
      .reduce((sum, r) => sum + r.amount, 0);

    return (
      <ProtectedRoute>
        <div style={styles.container}>
          <div style={styles.successCard}>
            <div style={styles.successHeader}>
              <span style={{ fontSize: '3rem' }}>🎉</span>
              <h2 style={styles.successTitle}>Order Confirmed & Completed!</h2>
              <p style={styles.successSub}>
                Order ID: <code style={styles.orderIdTag}>{orderResult.orderId}</code>
              </p>
            </div>

            {/* Backend Reward Granted Notification */}
            {pointsGranted > 0 ? (
              <div style={styles.rewardGrantedBox}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#276749', fontSize: '0.95rem' }}>
                    Congratulations! You earned +{pointsGranted} Reward Points!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#2f855a' }}>
                    Granted by Reward Engine for purchasing {distinctProductsCount} distinct products in order {orderResult.orderId}.
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.rewardIgnoredBox}>
                <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#744210', fontSize: '0.85rem' }}>
                    Order Completed
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#975a16' }}>
                    This order contained {distinctProductsCount} distinct product(s). 3 distinct products are required to earn +20 Reward Points.
                  </div>
                </div>
              </div>
            )}

            {tokensGranted > 0 && (
              <div style={{ ...styles.rewardGrantedBox, marginTop: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🎟️</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#276749', fontSize: '0.95rem' }}>
                    Milestone Reached! +{tokensGranted} Free Delivery Token Granted!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#2f855a' }}>
                    Congratulations on completing 10 successful orders!
                  </div>
                </div>
              </div>
            )}

            {/* Receipt Details */}
            <div style={styles.receiptBox}>
              <h4 style={styles.receiptTitle}>Order Receipt Summary</h4>
              <div style={styles.receiptList}>
                {orderResult.items.map(({ product, quantity }) => (
                  <div key={product.id} style={styles.receiptRow}>
                    <span>
                      {product.image} {product.name} × {quantity}
                    </span>
                    <strong>{formatCurrency(product.price * quantity)}</strong>
                  </div>
                ))}
              </div>

              <div style={styles.receiptDivider} />

              <div style={styles.receiptRow}>
                <span>Subtotal:</span>
                <span>{formatCurrency(orderResult.subtotal)}</span>
              </div>

              {orderResult.pointsRedeemed > 0 && (
                <div style={{ ...styles.receiptRow, color: '#c53030' }}>
                  <span>Points Discount Applied ({orderResult.pointsRedeemed} pts):</span>
                  <span>-{formatCurrency(orderResult.discountRupees)}</span>
                </div>
              )}

              <div style={styles.receiptTotalRow}>
                <span>Final Paid Amount:</span>
                <span style={{ color: '#dd6b20' }}>{formatCurrency(orderResult.finalPayable)}</span>
              </div>
            </div>

            {/* Updated Real Wallet Summary */}
            <div style={styles.updatedWalletBox}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#2c5282' }}>
                Updated Real Wallet Balance
              </h4>
              <div style={styles.updatedWalletGrid}>
                <div>
                  <span style={styles.updatedVal}>{pointsBalance}</span>
                  <span style={styles.updatedLbl}>Reward Points</span>
                </div>
                <div>
                  <span style={styles.updatedVal}>{freeDeliveryTokens}</span>
                  <span style={styles.updatedLbl}>Free Delivery Tokens</span>
                </div>
              </div>
            </div>

            <div style={styles.actionRow}>
              <Link href="/" style={styles.continueBtn}>
                Return to Food Menu
              </Link>
              <Link href="/wallet" style={styles.walletHistoryBtn}>
                View Wallet & History →
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // --- CHECKOUT FORM SCREEN ---
  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <div style={styles.header}>
          <Link href="/cart" style={styles.backLink}>
            ← Back to Cart
          </Link>
          <h1 style={styles.title}>Checkout & Order Payment</h1>
        </div>

        {items.length === 0 ? (
          <div style={styles.emptyCard}>
            <h3>No items in cart to checkout!</h3>
            <p>Please add food items from our catalog first.</p>
            <Link href="/" style={styles.browseBtn}>
              Browse Food Menu
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {/* Left Column: Order Items Breakdown */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>1. Order Items ({items.length})</h3>
              <div style={styles.itemList}>
                {items.map(({ product, quantity }) => (
                  <div key={product.id} style={styles.itemRow}>
                    <span style={{ fontSize: '2rem' }}>{product.image}</span>
                    <div style={{ flex: 1 }}>
                      <div style={styles.itemName}>{product.name}</div>
                      <div style={styles.itemMeta}>
                        ID: <code>{product.id}</code> | Price: {formatCurrency(product.price)}
                      </div>
                    </div>
                    <div style={styles.itemQtyBadge}>Qty: {quantity}</div>
                    <div style={styles.itemTotal}>
                      {formatCurrency(product.price * quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Payment & Wallet Discount Controls */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>2. Payment & Points Discount</h3>

              {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

              {/* Real Wallet Balance Box */}
              <div style={styles.walletBox}>
                <div style={styles.walletBoxHeader}>
                  <span>💳 Customer Wallet Balance</span>
                  <span style={styles.tokenTag}>🎟️ {freeDeliveryTokens} Tokens</span>
                </div>
                <div style={styles.walletPointsRow}>
                  <span style={styles.walletPtsVal}>{pointsBalance} Points</span>
                  <span style={styles.walletCashVal}>= {formatCurrency(discountEquivalentRupees)}</span>
                </div>
              </div>

              {/* Points Discount Toggle Control */}
              <div style={styles.discountToggleBox}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={applyPoints}
                    onChange={(e) => setApplyPoints(e.target.checked)}
                    disabled={pointsBalance <= 0 || submitting}
                    style={styles.checkbox}
                  />
                  <span>
                    <strong>Apply Reward Points Discount</strong>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                      Conversion: 2 Points = Rs. 1 (Max usable: {pointsNeededForFullCover} pts)
                    </div>
                  </span>
                </label>

                {applyPoints && (
                  <div style={styles.appliedDetails}>
                    <div style={styles.appliedRow}>
                      <span>Points Redeemed:</span>
                      <strong>{usablePoints} pts</strong>
                    </div>
                    <div style={styles.appliedRow}>
                      <span>Discount Received:</span>
                      <strong style={{ color: '#2b6cb0' }}>-{formatCurrency(discountRupees)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Distinct Product Reward Indicator */}
              <div
                style={{
                  ...styles.rewardBanner,
                  backgroundColor: qualifiesFor3ProductReward ? '#f0fff4' : '#fffaf0',
                  borderColor: qualifiesFor3ProductReward ? '#9ae6b4' : '#fbd38d',
                }}
              >
                <span>{qualifiesFor3ProductReward ? '🎉' : '💡'}</span>
                <div>
                  <div
                    style={{
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      color: qualifiesFor3ProductReward ? '#22543d' : '#744210',
                    }}
                  >
                    {qualifiesFor3ProductReward
                      ? 'Order qualifies for +20 Reward Points!'
                      : 'Reward Eligibility Notice'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: qualifiesFor3ProductReward ? '#2f855a' : '#975a16',
                    }}
                  >
                    {qualifiesFor3ProductReward
                      ? `${distinctProductsCount} distinct products detected. Reward Service will credit +20 points on completion.`
                      : `${distinctProductsCount}/3 distinct items. Repeat items increase quantity, not distinct product count.`}
                  </div>
                </div>
              </div>

              {/* Order Total Calculations */}
              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {applyPoints && (
                  <div style={{ ...styles.summaryRow, color: '#2b6cb0' }}>
                    <span>Points Discount:</span>
                    <span>-{formatCurrency(discountRupees)}</span>
                  </div>
                )}

                <div style={styles.totalRow}>
                  <span>Total Payable:</span>
                  <span style={{ color: '#dd6b20' }}>{formatCurrency(finalPayable)}</span>
                </div>
              </div>

              {/* Complete Order Button (Idempotent Submit) */}
              <button
                onClick={handleCompleteOrder}
                disabled={submitting}
                style={{
                  ...styles.completeBtn,
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Processing Order...' : 'Complete Order'}
              </button>
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
    gap: '6px',
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
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  browseBtn: {
    display: 'inline-block',
    marginTop: '12px',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px',
  },
  cardTitle: {
    margin: '0 0 16px 0',
    fontSize: '1.1rem',
    color: '#2d3748',
    paddingBottom: '10px',
    borderBottom: '1px solid #edf2f7',
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #edf2f7',
  },
  itemName: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#2d3748',
  },
  itemMeta: {
    fontSize: '0.75rem',
    color: '#718096',
  },
  itemQtyBadge: {
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: '#edf2f7',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  itemTotal: {
    fontWeight: 'bold',
    color: '#2d3748',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    border: '1px solid #feb2b2',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '16px',
  },
  walletBox: {
    backgroundColor: '#fffaf0',
    border: '1px solid #feebc8',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  walletBoxHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#744210',
    marginBottom: '4px',
  },
  tokenTag: {
    fontSize: '0.75rem',
    color: '#c05621',
  },
  walletPointsRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  walletPtsVal: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#c05621',
  },
  walletCashVal: {
    fontSize: '0.85rem',
    color: '#744210',
  },
  discountToggleBox: {
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#2d3748',
  },
  checkbox: {
    marginTop: '3px',
    cursor: 'pointer',
  },
  appliedDetails: {
    marginTop: '10px',
    paddingTop: '8px',
    borderTop: '1px dashed #cbd5e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.8rem',
  },
  appliedRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  rewardBanner: {
    margin: '12px 0',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  summaryBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#4a5568',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.15rem',
    fontWeight: 'bold',
    color: '#1a202c',
    paddingTop: '8px',
    borderTop: '1px dashed #cbd5e0',
  },
  completeBtn: {
    width: '100%',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  // Success Confirmation Card Styles
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '30px',
    maxWidth: '650px',
    margin: '0 auto',
    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
  },
  successHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  successTitle: {
    margin: '8px 0 4px 0',
    color: '#22543d',
    fontSize: '1.5rem',
  },
  successSub: {
    margin: 0,
    color: '#718096',
    fontSize: '0.85rem',
  },
  orderIdTag: {
    fontFamily: 'monospace',
    backgroundColor: '#edf2f7',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#2d3748',
  },
  rewardGrantedBox: {
    backgroundColor: '#f0fff4',
    border: '1px solid #9ae6b4',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  rewardIgnoredBox: {
    backgroundColor: '#fffaf0',
    border: '1px solid #fbd38d',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  receiptBox: {
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
  },
  receiptTitle: {
    margin: '0 0 12px 0',
    fontSize: '0.9rem',
    color: '#2d3748',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '6px',
  },
  receiptList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.85rem',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#4a5568',
  },
  receiptDivider: {
    height: '1px',
    backgroundColor: '#cbd5e0',
    margin: '10px 0',
  },
  receiptTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    color: '#1a202c',
  },
  updatedWalletBox: {
    backgroundColor: '#ebf8ff',
    border: '1px solid #bee3f8',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '20px',
  },
  updatedWalletGrid: {
    display: 'flex',
    gap: '24px',
  },
  updatedVal: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#2b6cb0',
    marginRight: '6px',
  },
  updatedLbl: {
    fontSize: '0.8rem',
    color: '#2c5282',
    fontWeight: '600',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
  },
  continueBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    backgroundColor: '#ffffff',
    color: '#2d3748',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  walletHistoryBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#dd6b20',
    color: '#ffffff',
    textDecoration: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
};
