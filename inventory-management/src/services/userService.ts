import api from "./authService";
import type { AxiosResponse } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: string | number;
  username: string;
  email: string;
  accountStatus: "active" | "inactive" | "suspended" | "pending";
  status?: "active" | "inactive" | "suspended" | "pending";
  createdAt?: string;
  lastLogin?: string;
  profile?: {
    id: number;
    names: string;
    phoneNumber: string;
    address: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  roles?: Array<{
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
  }>;
  tinNumber?: string;
  licenseNumber?: string;
  district?: string;
  sector?: string;
  cell?: string;
  blockerId?: string;
  scaleMonitorId?: string;
  salerId?: string;
  driverId?: string;
  supplierId?: string;
  productManagerId?: string;
  cashierId?: string;
  stockKeeperId?: string;
  clientId?: string;
  role?: string;
}

// Cashier interface
export interface Cashier {
  id: number;
  cashierId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    accountStatus: string;
    isDefaultPassword: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    profile: {
      id: number;
      names: string;
      phoneNumber: string;
      address: string;
      status: string;
      userId: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      user_id: number;
    };
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}



const extractData = (response: AxiosResponse): any => {
  if (response.data && typeof response.data === "object") {
    if ("data" in response.data) {
      return response.data.data || [];
    }
    if ("rows" in response.data) {
      return response.data.rows;
    }
  }

  if (
    response?.config?.url?.includes("/users") &&
    !response?.config?.url?.includes("/users/")
  ) {
    return response.data?.rows || response.data || [];
  }

  if (response?.data) {
    return response.data;
  }
  return response;
};

const mapUserData = (user: any) => {
  return {
    ...user,
    username: user.username,
    status: user.accountStatus,
    role: user.role || "admin",
  };
};

export const userService = {
  getAllUsers: async (
    params: {
      page?: number;
      pageSize?: number;
      includeDeleted?: boolean;
      role?: string;
      status?: string;
    } = {}
  ) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params.includeDeleted)
        queryParams.append("includeDeleted", params.includeDeleted.toString());
      if (params.role) queryParams.append("role", params.role);
      if (params.status) queryParams.append("status", params.status);

      const url = `${API_BASE_URL}/users${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await api.get(url);

      // Handle different response structures
      let usersData = [];
      let paginationData = {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      };

      if (response.data) {
        // Case 1: Response has data.rows (your expected structure)
        if (response.data.rows) {
          usersData = response.data.rows;
          paginationData = {
            total: response.data.total || 0,
            page: response.data.page || 1,
            pageSize: response.data.pageSize || 10,
            totalPages: response.data.totalPages || 0,
          };
        }
        // Case 2: Response has data.data (common paginated structure)
        else if (response.data.data) {
          usersData = response.data.data;
          paginationData = {
            total: response.data.total || response.data.count || 0,
            page: response.data.page || 1,
            pageSize: response.data.pageSize || response.data.limit || 10,
            totalPages: response.data.totalPages || 0,
          };
        }
        // Case 3: Response is a direct array
        else if (Array.isArray(response.data)) {
          usersData = response.data;
          paginationData = {
            total: response.data.length,
            page: 1,
            pageSize: response.data.length,
            totalPages: 1,
          };
        }
      }

      return {
        ...paginationData,
        data: usersData.map(mapUserData),
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        data: [],
      };
    }
  },

  // Get a single user by ID
  getUserById: async (userId: string | number) => {
    try {
      const response = await api.get(`${API_BASE_URL}/users/${userId}`);
      const user = extractData(response);
      return mapUserData(user);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  },

  // Create a new user - with role-specific endpoint handling
  createUser: async (userData: any) => {
    try {
      // Determine the correct endpoint based on role
      const role = userData.role?.toLowerCase();
      let endpoint = "/auth/register"; // default endpoint for user registration

      if (role === "cashier") {
        endpoint = "/cashier";
      } else if (role === "blocker") {
        endpoint = "/blockers";
      } else if (role === "saler") {
        endpoint = "/saler";
      } else if (role === "driver") {
        endpoint = "/drivers";
      } else if (role === "client") {
        endpoint = "/clients";
      } else if (role === "scalemonitor") {
        endpoint = "/sm";
      } else if (role === "stockkeeper") {
        endpoint = "/stock-keepers";
      } else if (role === "supplier") {
        endpoint = "/supplier";
      } else if (role === "productionmanager") {
        endpoint = "/pm";
      } else if (role === "admin") {
        endpoint = "/admins";
      }

      console.log("Creating user with role:", role);
      console.log("Using endpoint:", endpoint);
      console.log("User data:", userData);

      const response = await api.post(`${API_BASE_URL}${endpoint}`, userData);
      return extractData(response);
    } catch (error: unknown) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: async (
    userId: string | number,
    userData: Partial<User>,
    role?: string
  ) => {
    try {
      // Create a clean copy of userData to send
      const dataToSend = { ...userData };

      // Make sure accountStatus is properly set
      if (userData.status && !userData.accountStatus) {
        dataToSend.accountStatus = userData.status;
      }

      // Determine the correct ID and endpoint based on role
      let endpoint = `${API_BASE_URL}/users/${userId}`;
      let idToUse = userId;

      if (role) {
        const roleSpecificIdMap: Record<string, string | undefined> = {
          driver: userData.driverId,
          cashier: userData.cashierId,
          client: userData.clientId,
          blocker: userData.blockerId,
          supplier: userData.supplierId,
          saler: userData.salerId,
          stockkeeper: userData.stockKeeperId,
          scalemonitor: userData.scaleMonitorId,
          productionmanager: userData.productManagerId,
        };

        const roleKey = role.toLowerCase();
        const roleSpecificId = roleSpecificIdMap[roleKey];

        // Log what we're doing for debugging
        console.log(
          `Role: ${role}, User ID: ${userId}, Role-specific ID: ${roleSpecificId}`
        );

        // If we have a role-specific ID, use it instead of the user ID
        if (roleSpecificId) {
          idToUse = roleSpecificId;
          console.log(
            `Using role-specific ID: ${idToUse} instead of user ID: ${userId}`
          );
        }

        // Now construct the endpoint
        switch (roleKey) {
          case "cashier":
            endpoint = `${API_BASE_URL}/cashier/${idToUse}`;
            break;
          case "blocker":
            endpoint = `${API_BASE_URL}/blockers/${idToUse}`;
            break;
          case "driver":
            endpoint = `${API_BASE_URL}/drivers/${idToUse}`;
            break;
          case "supplier":
            endpoint = `${API_BASE_URL}/supplier/${idToUse}`;
            break;
          case "client":
            endpoint = `${API_BASE_URL}/clients/${idToUse}`;
            break;
          case "saler":
            endpoint = `${API_BASE_URL}/saler/${idToUse}`;
            break;
          case "stockkeeper":
            endpoint = `${API_BASE_URL}/stock-keepers/${idToUse}`;
            break;
          case "scalemonitor":
            endpoint = `${API_BASE_URL}/sm/${idToUse}`;
            break;
          case "productionmanager":
            endpoint = `${API_BASE_URL}/pm/${idToUse}`;
            break;
          default:
            endpoint = `${API_BASE_URL}/users/${idToUse}`;
        }
      }

      console.log(
        `Updating user at endpoint: ${endpoint} using ID: ${idToUse}`,
        dataToSend
      );
      const response = await api.put(endpoint, dataToSend);
      return extractData(response);
    } catch (error: unknown) {
      console.error(`Error updating user:`, error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred");
    }
  },

  // Delete a user - with role-specific endpoint handling
  deleteUser: async (userId: string | number, role?: string) => {
    try {
      // Determine which endpoint to use based on the role
      let endpoint = `${API_BASE_URL}/users/${userId}`;

      if (role) {
        switch (role.toLowerCase()) {
          case "cashier":
            endpoint = `${API_BASE_URL}/cashier/${userId}`;
            break;
          case "blocker":
            endpoint = `${API_BASE_URL}/blockers/${userId}`;
            break;
          case "driver":
            endpoint = `${API_BASE_URL}/drivers/${userId}`;
            break;
          case "supplier":
            endpoint = `${API_BASE_URL}/supplier/${userId}`;
            break;
          case "client":
            endpoint = `${API_BASE_URL}/clients/${userId}`;
            break;
          case "saler":
            endpoint = `${API_BASE_URL}/saler/${userId}`;
            break;
          case "stockkeeper":
            endpoint = `${API_BASE_URL}/stock-keepers/${userId}`;
            break;
          case "scalemonitor":
            endpoint = `${API_BASE_URL}/sm/${userId}`;
            break;
          case "productionmanager":
            endpoint = `${API_BASE_URL}/pm/${userId}`;
            break;
          default:
            endpoint = `${API_BASE_URL}/users/${userId}`;
        }
      }

      console.log(`Deleting user with role ${role} at endpoint: ${endpoint}`);
      const response = await api.delete(endpoint);
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role: string) => {
    try {
      // Determine which endpoint to use based on the role
      let endpoint = `${API_BASE_URL}/users/role/${role}`;

      switch (role.toLowerCase()) {
        case "cashier":
          endpoint = `${API_BASE_URL}/cashier`;
          break;
        case "blocker":
          endpoint = `${API_BASE_URL}/blockers`;
          break;
        case "driver":
          endpoint = `${API_BASE_URL}/drivers`;
          break;
        case "supplier":
          endpoint = `${API_BASE_URL}/supplier`;
          break;
        case "client":
          endpoint = `${API_BASE_URL}/clients`;
          break;
        case "saler":
          endpoint = `${API_BASE_URL}/saler`;
          break;
        case "stockkeeper":
          endpoint = `${API_BASE_URL}/stock-keepers`;
          break;
        case "scalemonitor":
          endpoint = `${API_BASE_URL}/sm`;
          break;
        case "productionmanager":
          endpoint = `${API_BASE_URL}/pm`;
          break;
        default:
          endpoint = `${API_BASE_URL}/users/role/${role}`;
      }

      console.log(
        `Fetching users with role ${role} from endpoint: ${endpoint}`
      );
      const response = await api.get(endpoint);
      const users = extractData(response);
      return users.map(mapUserData);
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      return [];
    }
  },

  updateProfile: async (profileId: string | number, profileData: any) => {
    try {
      const response = await api.put(
        `${API_BASE_URL}/profiles/${profileId}`,
        profileData
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error updating profile ${profileId}:`, error);
      throw error;
    }
  },

  getProfileById: async (profileId: string | number) => {
    try {
      const response = await api.get(`${API_BASE_URL}/profiles/${profileId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching profile ${profileId}:`, error);
      return null;
    }
  },

  // Reset user password
  resetUserPassword: async (userId: string | number) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/users/${userId}/reset-password`
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error resetting password for user ${userId}:`, error);
      throw error;
    }
  },

  // Update user status (activate/deactivate)
  updateUserStatus: async (
    userId: string | number,
    status: "active" | "inactive" | "suspended" | "pending"
  ) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/users/${userId}/status`,
        { status }
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error updating status for user ${userId}:`, error);
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (userId: string | number) => {
    try {
      const response = await api.get(`${API_BASE_URL}/users/${userId}/roles`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
      throw error;
    }
  },

  // Assign roles to user
  assignRolesToUser: async (
    userId: string | number,
    roles: (string | number)[]
  ) => {
    try {
      const response = await api.post(`${API_BASE_URL}/users/${userId}/roles`, {
        roles,
      });
      return extractData(response);
    } catch (error) {
      console.error(`Error assigning roles to user ${userId}:`, error);
      throw error;
    }
  },

  // Remove roles from user
  removeRolesFromUser: async (
    userId: string | number,
    roles: (string | number)[]
  ) => {
    try {
      // Since Axios doesn't support body in DELETE requests by default,
      // we need to use this workaround
      const response = await api.delete(
        `${API_BASE_URL}/users/${userId}/roles`,
        {
          data: { roles },
        }
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error removing roles from user ${userId}:`, error);
      throw error;
    }
  },

  // Restore a user
  restoreUser: async (userId: string | number) => {
    try {
      const response = await api.post(
        `${API_BASE_URL}/users/${userId}/restore`
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error restoring user ${userId}:`, error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/users/stats`);
      return extractData(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return {};
    }
  },

  // Cashier API methods
  // Get all cashiers
  getAllCashiers: async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/cashier`);
      return extractData(response);
    } catch (error) {
      console.error("Error fetching cashiers:", error);
      return [];
    }
  },

  // Get a single cashier by ID
  getCashierById: async (cashierId: string | number) => {
    try {
      const response = await api.get(`${API_BASE_URL}/cashier/${cashierId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching cashier ${cashierId}:`, error);
      return null;
    }
  },

  // Create a new cashier
  createCashier: async (
    cashierData: Omit<
      Cashier,
      "id" | "createdAt" | "updatedAt" | "deletedAt" | "user"
    >
  ) => {
    try {
      const response = await api.post(`${API_BASE_URL}/cashier`, cashierData);
      return extractData(response);
    } catch (error) {
      console.error("Error creating cashier:", error);
      throw error;
    }
  },

  // Update an existing cashier
  updateCashier: async (
    cashierId: string | number,
    cashierData: Partial<Cashier>
  ) => {
    try {
      const response = await api.put(
        `${API_BASE_URL}/cashier/${cashierId}`,
        cashierData
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error updating cashier ${cashierId}:`, error);
      throw error;
    }
  },

  // Delete a cashier
  deleteCashier: async (cashierId: string | number) => {
    try {
      const response = await api.delete(
        `${API_BASE_URL}/cashier/${cashierId}`
      );
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting cashier ${cashierId}:`, error);
      throw error;
    }
  },
};
