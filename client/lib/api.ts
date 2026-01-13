import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const api = {
  // Auth
  syncUser: (userData: any) => apiClient.post('/auth/sync', userData),

  // Tickets
  createTicket: (data: any) => apiClient.post('/tickets', data),
  getTickets: (filters?: any) => apiClient.get('/tickets', { params: filters }),
  getTicketById: (id: string) => apiClient.get(`/tickets/${id}`),
  replyTicket: (id: string, data: any) => apiClient.post(`/tickets/${id}/reply`, data),
  summarizeTicket: (id: string) => apiClient.post(`/tickets/${id}/summarize`),
  generateDraft: (id: string, data: any) => apiClient.post(`/tickets/${id}/generate-draft`, data),

  // Knowledge Base
  uploadKnowledge: (formData: FormData) => apiClient.post('/knowledge-base/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getKnowledgeBase: () => apiClient.get('/knowledge-base'),
  deleteKnowledge: (id: string) => apiClient.delete(`/knowledge-base/${id}`),

  // Analytics
  getAnalytics: () => apiClient.get('/analytics/stats'),
};
