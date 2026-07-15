import { apiClient } from './client';

export interface KnowledgeItem {
  id: string;
  question: string;
  aliases?: string[];
  answer: string;
  created_at?: string;
  updated_at?: string;
}

export interface KnowledgeListResponse {
  items: KnowledgeItem[];
  total: number;
  page: number;
  page_size: number;
}

export const knowledgeApi = {
  getAll: async (userId: string): Promise<KnowledgeListResponse> => {
    const response = await apiClient.get('/knowledge', {
      params: { user_id: userId }
    });
    return response.data;
  },
  
  getById: async (id: string): Promise<KnowledgeItem> => {
    const response = await apiClient.get(`/knowledge/${id}`);
    return response.data;
  },
  
  create: async (userId: string, data: Partial<KnowledgeItem>): Promise<KnowledgeItem> => {
    const response = await apiClient.post('/knowledge', data, {
      params: { user_id: userId }
    });
    return response.data;
  },
  
  update: async (id: string, data: Partial<KnowledgeItem>): Promise<KnowledgeItem> => {
    const response = await apiClient.put(`/knowledge/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/knowledge/${id}`);
    return response.data;
  }
}
