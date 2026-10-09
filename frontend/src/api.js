const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  const data = await response.json();
  return data && data.data !== undefined ? data.data : data;
}

export const expensesApi = {
  list: () => request('/expenses'),
  get: (id) => request(`/expenses/${id}`),
  create: (expense) =>
    request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
  update: (id, expense) =>
    request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),
  remove: (id) =>
    request(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};
