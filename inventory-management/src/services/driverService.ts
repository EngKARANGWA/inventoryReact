import api  from './authService';

export interface Driver {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
      phoneNumber: string;
      address: string;
    };
    roles: {
      id: number;
      name: string;
      description: string;
    }[];
  };
}


export const driverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await api.get('/drivers');
      return response.data; // Assuming the API returns an array directly
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },
};