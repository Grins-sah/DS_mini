import { useState, useEffect } from 'react';
import { api } from '../store/api';

const Balances = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [owedAmounts, setOwedAmounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [payment, setPayment] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchOwedAmounts(selectedUserId);
    } else {
      setOwedAmounts([]);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const allUsers = await api.listUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOwedAmounts = async (userId) => {
    try {
      setLoading(true);
      setError('');
      const amounts = await api.getUserOwed(userId);
      setOwedAmounts(amounts);
    } catch (err) {
      setError(err.message || 'Failed to fetch owed amounts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payment.fromUserId || !payment.toUserId || !payment.amount) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.recordPayment(
        parseInt(payment.fromUserId),
        parseInt(payment.toUserId),
        parseFloat(payment.amount)
      );
      setSuccess('Payment recorded successfully!');
      setPayment({ fromUserId: '', toUserId: '', amount: '' });
      if (selectedUserId) {
        await fetchOwedAmounts(selectedUserId);
      }
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSettlePayment = async (fromUserId, toUserId) => {
    if (!window.confirm('Are you sure you want to settle all debt between these users?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.settlePayment(fromUserId, toUserId);
      setSuccess('Payment settled successfully!');
      if (selectedUserId) await fetchOwedAmounts(selectedUserId);
    } catch (err) {
      setError(err.message || 'Failed to settle payment');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : `User ${userId}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h2>View Balances</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Select User to View Owed Amounts</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ maxWidth: '400px' }}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading && !owedAmounts.length ? (
          <div className="loading">Loading...</div>
        ) : selectedUserId && owedAmounts.length === 0 ? (
          <div className="empty-state">No amounts owed to this user.</div>
        ) : selectedUserId ? (
          <div style={{ marginTop: '1rem' }}>
            <h3>Amounts owed to {getUserName(parseInt(selectedUserId))}</h3>
            <div className="balance-list">
              {owedAmounts.map((entry) => (
                <div key={entry.userId} className="balance-item">
                  <div className="balance-info">
                    <div className="balance-name">{getUserName(entry.userId)}</div>
                    <div className="balance-user-id">User ID: {entry.userId}</div>
                  </div>
                  <div className="balance-actions">
                    <div className="balance-amount">${entry.amount.toFixed(2)}</div>
                    <button
                      onClick={() =>
                        handleSettlePayment(entry.userId, parseInt(selectedUserId))
                      }
                      disabled={loading}
                      className="btn btn-success"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2>Record Payment</h2>

        <form onSubmit={handleRecordPayment}>
          <div className="form-grid">
            <div className="form-group">
              <label>From User</label>
              <select
                value={payment.fromUserId}
                onChange={(e) =>
                  setPayment({ ...payment, fromUserId: e.target.value })
                }
                required
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>To User</label>
              <select
                value={payment.toUserId}
                onChange={(e) =>
                  setPayment({ ...payment, toUserId: e.target.value })
                }
                required
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} (ID: {user.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={payment.amount}
                onChange={(e) =>
                  setPayment({ ...payment, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Balances;
