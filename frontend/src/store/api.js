// Simple API client to talk to the Spring Boot backend

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function http(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Users
  listUsers: () => http('GET', '/users'),
  createUser: (id, name) => http('POST', '/users', { id: Number(id), name: String(name) }),

  // Balances
  getUserOwed: (userId) => http('GET', `/users/${Number(userId)}/owed`),

  // Expenses
  splitEqual: (paidByUserId, totalAmount) =>
    http('POST', '/expenses/split', { paidByUserId: Number(paidByUserId), totalAmount: Number(totalAmount) }),
  splitArbitrary: (paidByUserId, totalAmount, splits) =>
    http('POST', '/expenses/split-arbitrary', {
      paidByUserId: Number(paidByUserId),
      totalAmount: Number(totalAmount),
      splits: splits.map((s) => ({ userId: Number(s.userId), percentage: Number(s.percentage) })),
    }),

  // Payments
  recordPayment: (fromUserId, toUserId, amount) =>
    http('POST', '/payments', { fromUserId: Number(fromUserId), toUserId: Number(toUserId), amount: Number(amount) }),
  settlePayment: (fromUserId, toUserId) =>
    http('POST', '/payments/settle', { fromUserId: Number(fromUserId), toUserId: Number(toUserId) }),
};
