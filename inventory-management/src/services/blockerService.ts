import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Blocker {
  id: string | number;
  title: string;
  description: string;
  status: 'active' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  // Additional fields from backend
  category?: string;
  dueDate?: string;
  tags?: string[];
  attachments?: string[];
  comments?: {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
  }[];
  history?: {
    id: string;
    action: string;
    userId: string;
    timestamp: string;
    details: string;
  }[];
  relatedBlockers?: string[];
  impact?: 'low' | 'medium' | 'high';
  resolution?: string;
  resolutionDate?: string;
  estimatedTime?: string;
  actualTime?: string;
  dependencies?: string[];
}

interface PaginatedResponse<T> {
  count: number;
  rows: T[];
}

// Helper function to extract data from API response
const extractData = (response: any): any => {
  if (response?.data?.rows) {
    return response.data.rows;
  }
  if (response?.data) {
    return response.data;
  }
  if (response?.rows) {
    return response.rows;
  }
  return response;
};

export const blockerService = {
  // Get all blockers
  getAllBlockers: async () => {
    try {
      const response = await axios.get<PaginatedResponse<Blocker>>(`${API_BASE_URL}/blockers`);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching blockers:', error);
      return [];
    }
  },

  // Get a single blocker by ID
  getBlockerById: async (blockerId: string | number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockers/${blockerId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching blocker ${blockerId}:`, error);
      return null;
    }
  },

  // Create a new blocker
  createBlocker: async (blockerData: Omit<Blocker, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/blockers`, blockerData);
      return extractData(response);
    } catch (error) {
      console.error('Error creating blocker:', error);
      throw error;
    }
  },

  // Update an existing blocker
  updateBlocker: async (blockerId: string | number, blockerData: Partial<Blocker>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/blockers/${blockerId}`, blockerData);
      return extractData(response);
    } catch (error) {
      console.error(`Error updating blocker ${blockerId}:`, error);
      throw error;
    }
  },

  // Delete a blocker
  deleteBlocker: async (blockerId: string | number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/blockers/${blockerId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting blocker ${blockerId}:`, error);
      throw error;
    }
  },

  // Get blockers by status
  getBlockersByStatus: async (status: 'active' | 'resolved') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockers/status/${status}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching blockers by status ${status}:`, error);
      return [];
    }
  },

  // Get blockers by priority
  getBlockersByPriority: async (priority: 'low' | 'medium' | 'high') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockers/priority/${priority}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching blockers by priority ${priority}:`, error);
      return [];
    }
  },

  // Get blockers by category
  getBlockersByCategory: async (category: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockers/category/${category}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching blockers by category ${category}:`, error);
      return [];
    }
  },

  // Add comment to blocker
  addComment: async (blockerId: string | number, comment: { text: string; userId: string }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/blockers/${blockerId}/comments`, comment);
      return extractData(response);
    } catch (error) {
      console.error(`Error adding comment to blocker ${blockerId}:`, error);
      throw error;
    }
  },

  // Add attachment to blocker
  addAttachment: async (blockerId: string | number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_BASE_URL}/blockers/${blockerId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return extractData(response);
    } catch (error) {
      console.error(`Error adding attachment to blocker ${blockerId}:`, error);
      throw error;
    }
  },

  // Get blocker history
  getBlockerHistory: async (blockerId: string | number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockers/${blockerId}/history`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching history for blocker ${blockerId}:`, error);
      return [];
    }
  }
}; 