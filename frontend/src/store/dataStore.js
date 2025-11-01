// Simple in-memory data store for standalone frontend

let users = [];
let balances = {}; // { userId: { owedBy: { otherUserId: amount } } }

export const dataStore = {
  // Users
  getUsers: () => users,
  
  addUser: (id, name) => {
    if (users.find(u => u.id === id)) {
      throw new Error('User with this ID already exists');
    }
    users.push({ id: parseInt(id), name: name.trim() });
    balances[id] = {};
    return { id: parseInt(id), name: name.trim() };
  },
  
  // Balances - balances[userId][owedByUserId] = amount owed by owedByUserId to userId
  getOwedAmounts: (userId) => {
    const userBalances = balances[userId] || {};
    const result = [];
    for (const [owedByUserId, amount] of Object.entries(userBalances)) {
      if (amount > 0) {
        result.push({ userId: parseInt(owedByUserId), amount });
      }
    }
    return result;
  },
  
  // Split expense equally among all users
  splitExpenseEqual: (paidByUserId, totalAmount) => {
    const numUsers = users.length;
    if (numUsers === 0) throw new Error('No users available');
    
    const splitAmount = totalAmount / numUsers;
    
    users.forEach(user => {
      if (user.id !== paidByUserId) {
        if (!balances[paidByUserId]) balances[paidByUserId] = {};
        if (!balances[paidByUserId][user.id]) balances[paidByUserId][user.id] = 0;
        balances[paidByUserId][user.id] += splitAmount;
      }
    });
  },
  
  // Split expense arbitrarily by percentage
  splitExpenseArbitrary: (paidByUserId, totalAmount, splits) => {
    if (!balances[paidByUserId]) balances[paidByUserId] = {};
    
    splits.forEach(split => {
      const userId = split.userId;
      const percentage = split.percentage;
      const amount = (percentage / 100) * totalAmount;
      
      if (userId !== paidByUserId) {
        if (!balances[paidByUserId][userId]) balances[paidByUserId][userId] = 0;
        balances[paidByUserId][userId] += amount;
      }
    });
  },
  
  // Record a payment
  recordPayment: (fromUserId, toUserId, amount) => {
    if (!balances[toUserId]) balances[toUserId] = {};
    if (!balances[toUserId][fromUserId]) balances[toUserId][fromUserId] = 0;
    
    balances[toUserId][fromUserId] = Math.max(0, balances[toUserId][fromUserId] - amount);
    
    // Remove if balance is 0 or very small
    if (Math.abs(balances[toUserId][fromUserId]) < 0.01) {
      delete balances[toUserId][fromUserId];
    }
  },
  
  // Settle all debt
  settlePayment: (fromUserId, toUserId) => {
    if (balances[toUserId] && balances[toUserId][fromUserId]) {
      delete balances[toUserId][fromUserId];
    }
  },
  
  // Reset all data (for testing)
  reset: () => {
    users = [];
    balances = {};
  }
};

