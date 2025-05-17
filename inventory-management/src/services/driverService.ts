import api  from './authService';

export interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: {
    id: number;
    username: string;
    email: string;
    profile: {
      names: string;
      phoneNumber: string;
      address: string;
    };
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