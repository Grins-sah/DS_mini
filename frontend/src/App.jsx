import { useState } from 'react';
import UserManagement from './components/UserManagement';
import ExpenseSplit from './components/ExpenseSplit';
import Balances from './components/Balances';

function App() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'expenses', name: 'Expenses', icon: '💰' },
    { id: 'balances', name: 'Balances', icon: '💳' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>Splitwise</h1>
          <p>Split expenses and manage bills with ease</p>
        </header>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <main>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'expenses' && <ExpenseSplit />}
          {activeTab === 'balances' && <Balances />}
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>Expense Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
