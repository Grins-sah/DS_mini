import { useState, useEffect } from 'react';
import { dataStore } from '../store/dataStore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ id: '', name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    try {
      setLoading(true);
      const allUsers = dataStore.getUsers();
      setUsers(allUsers);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.id || !newUser.name.trim()) {
      setError('ID and Name are required');
      return;
    }

    try {
      setLoading(true);
      dataStore.addUser(newUser.id, newUser.name);
      setNewUser({ id: '', name: '' });
      setError('');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>User Management</h2>

      <form onSubmit={handleCreateUser} style={{ marginBottom: '2rem' }}>
        <div className="form-grid">
          <div className="form-group">
            <label>User ID</label>
            <input
              type="number"
              value={newUser.id}
              onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
              placeholder="Enter user ID"
              required
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter user name"
              required
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      <div>
        <h3>All Users ({users.length})</h3>
        {loading && users.length === 0 ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users yet. Add your first user above!</div>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-card-id">ID: {user.id}</div>
                <div className="user-card-name">{user.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
