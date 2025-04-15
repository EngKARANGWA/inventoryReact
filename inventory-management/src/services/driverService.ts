import axios from 'axios';

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export type Driver = {
  id: number;
  driverId: string;
  licenseNumber: string;
  userId: number;
  user: {
    profile: {
      names: string;
    };
  };
};

export const driverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },
} as const; 