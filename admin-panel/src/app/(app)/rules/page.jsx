'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rewardApi } from '@/lib/api';
import { isLoggedIn, getRewardToken } from '@/lib/auth';
import styles from '@/styles/global.module.css';

export default function RulesPage() {
  const router = useRouter();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({ value: '', expiryDays: '', status: '' });

  useEffect(() => {
    if (!isLoggedIn()) return router.replace('/');
    if (!getRewardToken()) return router.replace('/');
    loadRules();
  }, [router]);

  async function loadRules() {
    setLoading(true);
    try {
      const res = await rewardApi.getRules();
      setRules(res.data);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(false);
    }
  }

  function startEdit(rule) {
    setEditingKey(rule.ruleKey);
    setEditForm({
      value: rule.value,
      expiryDays: rule.expiryDays,
      status: rule.status,
    });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingKey(null);
    setMessage(null);
  }

  async function saveEdit(ruleKey) {
    const updates = {};
    if (editForm.value !== '' && editForm.value !== null) updates.value = Number(editForm.value);
    if (editForm.expiryDays !== '' && editForm.expiryDays !== null) updates.expiryDays = Number(editForm.expiryDays);
    if (editForm.status) updates.status = editForm.status;

    try {
      await rewardApi.updateRule(ruleKey, updates);
      setMessage({ type: 'success', text: `Rule "${ruleKey}" updated.` });
      setEditingKey(null);
      loadRules();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  async function toggleStatus(rule) {
    const newStatus = rule.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await rewardApi.updateRule(rule.ruleKey, { status: newStatus });
      setMessage({ type: 'success', text: `Rule "${rule.ruleKey}" ${newStatus}.` });
      loadRules();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  if (loading) return <div className={styles.loadingBox}>Loading reward rules...</div>;

  return (
    <div className={styles.page}>
      <h1 style={{ fontSize: 24, margin: '24px 0 8px 0' }}>Reward Rules</h1>
      <p style={{ color: '#6b7280', marginTop: 0 }}>
        View, update points/values, change expiry days, and enable/disable rules.
      </p>

      {message && (
        <div
          className={message.type === 'error' ? styles.errorBox : styles.successBox}
        >
          {message.text}
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Type</th>
            <th>Reward</th>
            <th>Value</th>
            <th>Expiry (days)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.ruleKey}>
              {editingKey === r.ruleKey ? (
                <>
                  <td>{r.ruleName}</td>
                  <td>{r.ruleType}</td>
                  <td>{r.rewardType}</td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      min="0"
                      value={editForm.value}
                      onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>
                    <input
                      className={styles.input}
                      type="number"
                      min="1"
                      value={editForm.expiryDays}
                      onChange={(e) => setEditForm({ ...editForm, expiryDays: e.target.value })}
                      style={{ width: 80 }}
                    />
                  </td>
                  <td>
                    <select
                      className={styles.input}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <button className={styles.smallBtn} onClick={() => saveEdit(r.ruleKey)}>
                      Save
                    </button>
                    <button className={styles.smallBtn} onClick={cancelEdit}>
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{r.ruleName}</td>
                  <td>{r.ruleType}</td>
                  <td>{r.rewardType}</td>
                  <td>{r.value}</td>
                  <td>{r.expiryDays}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        r.status === 'Active' ? styles.badgeActive : styles.badgeInactive
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.smallBtn} onClick={() => startEdit(r)}>
                      Edit
                    </button>
                    <button
                      className={styles.smallBtn}
                      onClick={() => toggleStatus(r)}
                    >
                      {r.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}