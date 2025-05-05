import React from "react";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface UserStatsCardsProps {
  users: any[];
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ users }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const inactiveUsers = users.filter((user) => user.status === "inactive").length;
  const recentLogins = users.filter((user) => user.role !== "Driver").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Users</p>
            <p className="text-2xl font-bold text-gray-800">{activeUsers}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Inactive Users</p>
            <p className="text-2xl font-bold text-gray-800">{inactiveUsers}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Recent Logins</p>
            <p className="text-2xl font-bold text-gray-800">{recentLogins}</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;