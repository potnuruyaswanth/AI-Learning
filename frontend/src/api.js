// In production, use the deployed backend URL; in development, use proxy
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Get stored token
const getToken = () => localStorage.getItem('token');

// Set stored token
const setToken = (token) => localStorage.setItem('token', token);

// Remove stored token
const removeToken = () => localStorage.removeItem('token');

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Try to parse JSON, handle empty responses
    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse response:', text);
      throw new Error('Invalid response from server');
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () => apiRequest('/auth/profile'),
};

// Files API
export const filesAPI = {
  upload: (fileName, content, mimeType = 'text/plain') =>
    apiRequest('/files/upload', {
      method: 'POST',
      body: JSON.stringify({ fileName, content, mimeType }),
    }),

  list: () => apiRequest('/files'),

  get: (id) => apiRequest(`/files/${id}`),
};

// AI API
export const aiAPI = {
  summarize: (fileId) =>
    apiRequest(`/ai/summarize/${fileId}`, { method: 'POST' }),

  bulletPoints: (fileId, maxPoints = 10) =>
    apiRequest(`/ai/bullet-points/${fileId}`, {
      method: 'POST',
      body: JSON.stringify({ maxPoints }),
    }),

  generateQuiz: (fileId, numberOfQuestions = 5) =>
    apiRequest(`/ai/quiz/${fileId}`, {
      method: 'POST',
      body: JSON.stringify({ numberOfQuestions }),
    }),

  keyInsights: (fileId) =>
    apiRequest(`/ai/insights/${fileId}`, { method: 'POST' }),

  flashcards: (fileId, count = 10) =>
    apiRequest(`/ai/flashcards/${fileId}?count=${count}`, { method: 'POST' }),

  glossary: (fileId) =>
    apiRequest(`/ai/glossary/${fileId}`, { method: 'POST' }),

  relatedTopics: (fileId) =>
    apiRequest(`/ai/related-topics/${fileId}`, { method: 'POST' }),

  askQuestion: (fileId, question) =>
    apiRequest(`/ai/ask/${fileId}`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
};

// Activities API
export const activitiesAPI = {
  list: () => apiRequest('/activities'),
};

export { getToken, setToken, removeToken };
