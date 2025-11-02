import { useState, useEffect } from 'react';
import { api } from '../store/api';

const ExpenseSplit = () => {
  const [users, setUsers] = useState([]);
  const [splitType, setSplitType] = useState('equal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [equalSplit, setEqualSplit] = useState({
    paidByUserId: '',
    totalAmount: '',
  });

  const [arbitrarySplit, setArbitrarySplit] = useState({
    paidByUserId: '',
    totalAmount: '',
    splits: [{ userId: '', percentage: '' }],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = await api.listUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEqualSplit = async (e) => {
    e.preventDefault();
    if (!equalSplit.paidByUserId || !equalSplit.totalAmount) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.splitEqual(
        parseInt(equalSplit.paidByUserId),
        parseFloat(equalSplit.totalAmount)
      );
      setSuccess('Expense split equally among all users!');
      setEqualSplit({ paidByUserId: '', totalAmount: '' });
    } catch (err) {
      setError(err.message || 'Failed to split expense');
    } finally {
      setLoading(false);
    }
  };

  const handleArbitrarySplit = async (e) => {
    e.preventDefault();
    if (!arbitrarySplit.paidByUserId || !arbitrarySplit.totalAmount) {
      setError('Paid by and total amount are required');
      return;
    }

    const validSplits = arbitrarySplit.splits.filter(
      (s) => s.userId && s.percentage
    );
    if (validSplits.length === 0) {
      setError('At least one split is required');
      return;
    }

    const totalPercentage = validSplits.reduce(
      (sum, s) => sum + parseFloat(s.percentage || 0),
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(`Percentages must sum to 100% (current: ${totalPercentage.toFixed(2)}%)`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.splitArbitrary(
        parseInt(arbitrarySplit.paidByUserId),
        parseFloat(arbitrarySplit.totalAmount),
        validSplits.map((s) => ({
          userId: parseInt(s.userId),
          percentage: parseFloat(s.percentage),
        }))
      );
      setSuccess('Expense split successfully!');
      setArbitrarySplit({
        paidByUserId: '',
        totalAmount: '',
        splits: [{ userId: '', percentage: '' }],
      });
    } catch (err) {
      setError(err.message || 'Failed to split expense');
    } finally {
      setLoading(false);
    }
  };

  const addSplitRow = () => {
    setArbitrarySplit({
      ...arbitrarySplit,
      splits: [...arbitrarySplit.splits, { userId: '', percentage: '' }],
    });
  };

  const removeSplitRow = (index) => {
    setArbitrarySplit({
      ...arbitrarySplit,
      splits: arbitrarySplit.splits.filter((_, i) => i !== index),
    });
  };

  const updateSplit = (index, field, value) => {
    const newSplits = [...arbitrarySplit.splits];
    newSplits[index][field] = value;
    setArbitrarySplit({ ...arbitrarySplit, splits: newSplits });
  };

  const getTotalPercentage = () => {
    return arbitrarySplit.splits.reduce(
      (sum, s) => sum + parseFloat(s.percentage || 0),
      0
    );
  };

  return (
    <div className="card">
      <h2>Split Expense</h2>

      <div style={{ marginBottom: '2rem' }}>
        <div className="split-type-toggle">
          <button
            onClick={() => {
              setSplitType('equal');
              setError('');
              setSuccess('');
            }}
            className={`btn ${splitType === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ marginRight: '1rem' }}
          >
            Equal Split
          </button>
          <button
            onClick={() => {
              setSplitType('arbitrary');
              setError('');
              setSuccess('');
            }}
            className={`btn ${splitType === 'arbitrary' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Arbitrary Split
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {splitType === 'equal' && (
        <form onSubmit={handleEqualSplit}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="form-group">
              <label>Paid By</label>
              <select
                value={equalSplit.paidByUserId}
                onChange={(e) =>
                  setEqualSplit({ ...equalSplit, paidByUserId: e.target.value })
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
              <label>Total Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={equalSplit.totalAmount}
                onChange={(e) =>
                  setEqualSplit({ ...equalSplit, totalAmount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: '#6b7280' }}>
            The expense will be split equally among all {users.length} users.
          </p>
          <button
            type="submit"
            disabled={loading || users.length === 0}
            className="btn btn-primary"
          >
            {loading ? 'Splitting...' : 'Split Equally'}
          </button>
        </form>
      )}

      {splitType === 'arbitrary' && (
        <form onSubmit={handleArbitrarySplit}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
            <div className="form-group">
              <label>Paid By</label>
              <select
                value={arbitrarySplit.paidByUserId}
                onChange={(e) =>
                  setArbitrarySplit({
                    ...arbitrarySplit,
                    paidByUserId: e.target.value,
                  })
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
              <label>Total Amount</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={arbitrarySplit.totalAmount}
                onChange={(e) =>
                  setArbitrarySplit({
                    ...arbitrarySplit,
                    totalAmount: e.target.value,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: '500', color: '#374151' }}>
                Split Distribution (%)
              </label>
              <button
                type="button"
                onClick={addSplitRow}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                + Add Split
              </button>
            </div>
            {arbitrarySplit.splits.map((split, index) => (
              <div key={index} className="split-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    value={split.userId}
                    onChange={(e) => updateSplit(index, 'userId', e.target.value)}
                    required
                  >
                    <option value="">Select user</option>
                    {users
                      .filter(
                        (u) =>
                          u.id !== parseInt(arbitrarySplit.paidByUserId) &&
                          !arbitrarySplit.splits.some(
                            (s, i) => i !== index && s.userId === u.id.toString()
                          )
                      )
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} (ID: {user.id})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={split.percentage}
                    onChange={(e) =>
                      updateSplit(index, 'percentage', e.target.value)
                    }
                    placeholder="Percentage %"
                    required
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {arbitrarySplit.splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSplitRow(index)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className={`split-total ${Math.abs(getTotalPercentage() - 100) > 0.01 ? 'error' : ''}`}>
              Total: <span>{getTotalPercentage().toFixed(2)}%</span>
              {Math.abs(getTotalPercentage() - 100) > 0.01 && (
                <span style={{ marginLeft: '0.5rem' }}>(Must be 100%)</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || users.length === 0}
            className="btn btn-primary"
          >
            {loading ? 'Splitting...' : 'Split Expense'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ExpenseSplit;
