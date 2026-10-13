export const CATEGORY_LABELS = {
  ELECTRONICS: 'Electronics',
  ID_CARD: 'ID card',
  BOOKS: 'Books',
  CLOTHING: 'Clothing',
  KEYS: 'Keys',
  BAGS: 'Bags',
  OTHER: 'Other',
};

export const STATUS_LABELS = {
  LOST: 'Lost',
  FOUND: 'Found',
  CLAIMED: 'Claimed',
};

const BASE_URL = '/api';

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = 'An error occurred. Please try again.';
    if (response.status === 409) {
      message = (data && data.detail) || 'Claimed items cannot be reopened.';
    } else if (response.status === 404) {
      message = (data && data.detail) || 'Item not found.';
    } else if (response.status === 422) {
      if (data && Array.isArray(data.detail)) {
        message = data.detail.map((err) => err.msg || err.message).join(', ');
      } else {
        message = (data && data.detail) || 'Invalid form input.';
      }
    } else if (data && data.detail) {
      message = data.detail;
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function fetchItems({ status, category, q } = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') {
    params.set('status', status);
  }
  if (category) {
    params.set('category', category);
  }
  if (q && q.trim()) {
    params.set('q', q.trim());
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${BASE_URL}/items${query}`);
  return handleResponse(response);
}

export async function fetchStats() {
  const response = await fetch(`${BASE_URL}/items/stats`);
  return handleResponse(response);
}

export async function createItem(payload) {
  const response = await fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateItem(id, payload) {
  const response = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/items/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}
