import React from "react";
import { X } from "lucide-react";

interface RoleFormProps {
  role: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  initialData?: Partial<FormData>;
  isSubmitting: boolean;
  mode: "add" | "edit";
}

interface FormData {
  id?: string | number;
  blockerId?: string;
  scaleMonitorId?: string;
  salerId?: string;
  driverId?: string;
  supplierId?: string;
  productManagerId?: string;
  cashierId?: string;
  stockKeeperId?: string;
  clientId?: string;
  tinNumber?: string;
  names: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: "active" | "inactive" | "suspended" | "pending" | undefined;
  district?: string;
  sector?: string;
  cell?: string;
  licenseNumber?: string;
  role?: string;
}

const defaultFormData: FormData = {
  names: "",
  username: "",
  email: "",
  phoneNumber: "",
  address: "",
  status: "active",
};

const RoleForm: React.FC<RoleFormProps> = ({
  role,
  onClose,
  onSubmit,
  initialData = {},
  isSubmitting,
  mode,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Log props for debugging
  console.log("RoleForm props:", { role, initialData, mode });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper to determine the effective role
  const getEffectiveRole = (): string => {
    // If a role is explicitly provided, use it
    if (role) {
      return role.toLowerCase();
    }
    
    // If we're in edit mode and have initialData with a role, use that
    if (mode === "edit" && initialData && initialData.role) {
      return String(initialData.role).toLowerCase();
    }
    
    // As a fallback, check if there are specific IDs in the initialData
    if (initialData) {
      if (initialData.blockerId) return "blocker";
      if (initialData.scaleMonitorId) return "scaleMonitor";
      if (initialData.salerId) return "saler";
      if (initialData.driverId) return "driver";
      if (initialData.supplierId) return "supplier";
      if (initialData.productManagerId) return "productionManager";
      if (initialData.cashierId) return "cashier";
      if (initialData.stockKeeperId) return "stockKeeper";
      if (initialData.clientId) return "client";
    }
    
    // Last resort, return the original role or an empty string
    return role?.toLowerCase() || "";
  };

  const effectiveRole = getEffectiveRole();
  console.log("Effective role determined:", effectiveRole);

  const renderForm = () => {
    switch (effectiveRole) {
      case "blocker":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Names
              </label>
              <input
                type="text"
                required
                value={formData.names || ""}
                onChange={(e) => handleChange("names", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Full names"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                required
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                required
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Blocker" : "Save Blocker")}
              </button>
            </div>
          </form>
        );

      case "scalemonitor":
      case "scaleMonitor":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                full Name
              </label>
              <input
                type="text"
                required
                value={formData.names || ""}
                onChange={(e) => handleChange("names", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                required
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="scale@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                required
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter address"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Scale Monitor" : "Save Scale Monitor")}
              </button>
            </div>
          </form>
        );

      case "saler":
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Names
              </label>
              <input
                type="text"
                required
                value={formData.names || ""}
                onChange={(e) => handleChange("names", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Name
              </label>
              <input
                type="text"
                required
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber || ""}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="sale@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tin Number
              </label>
              <input
                type="text"
                required
                value={formData.tinNumber || ""}
                onChange={(e) => handleChange("tinNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter TIN number"
              />
              </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Saler" : "Save Saler")}
  </button>
</div>
</form>
);

case "stockkeeper":
case "stockKeeper":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    full name
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter full name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter user name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="stock@example.com"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Stock Keeper" : "Save Stock Keeper")}
  </button>
</div>
</form>
);

case "client":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Full Name
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter full Name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter user name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="client@example.com"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Client" : "Save Client")}
  </button>
</div>
</form>
);

case "driver":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    full Name
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter full name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter user name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="driver@example.com"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Driving licence
  </label>
  <input
    type="text"
    required
    value={formData.licenseNumber || ""}
    onChange={(e) => handleChange("licenseNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter license number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Driver" : "Save Driver")}
  </button>
</div>
</form>
);

case "supplier":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Full Name
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter full names"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter user name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="email@example.com"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Tin Number
  </label>
  <input
    type="text"
    required
    value={formData.tinNumber || ""}
    onChange={(e) => handleChange("tinNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter TIN number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    District
  </label>
  <input
    type="text"
    required
    value={formData.district || ""}
    onChange={(e) => handleChange("district", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter district"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Sector
  </label>
  <input
    type="text"
    required
    value={formData.sector || ""}
    onChange={(e) => handleChange("sector", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter sector"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Cell
  </label>
  <input
    type="text"
    required
    value={formData.cell || ""}
    onChange={(e) => handleChange("cell", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter cell"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Supplier" : "Save Supplier")}
  </button>
</div>
</form>
);

case "productionManager":
case "productionmanager":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Full Name
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter full name"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="email@example.com"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="User Name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Production Manager" : "Save Production Manager")}
  </button>
</div>
</form>
);

case "cashier":
return (
<form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Names
  </label>
  <input
    type="text"
    required
    value={formData.names || ""}
    onChange={(e) => handleChange("names", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter Full Names"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    User Name
  </label>
  <input
    type="text"
    required
    value={formData.username || ""}
    onChange={(e) => handleChange("username", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="User Name"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input
    type="email"
    required
    value={formData.email || ""}
    onChange={(e) => handleChange("email", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="email@example.com"
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="tel"
    required
    value={formData.phoneNumber || ""}
    onChange={(e) => handleChange("phoneNumber", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter phone number"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Address
  </label>
  <textarea
    required
    value={formData.address || ""}
    onChange={(e) => handleChange("address", e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter address"
    rows={3}
  />
</div>
<div className="flex justify-end space-x-3 pt-4">
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Saving..." : (mode === "edit" ? "Update Cashier" : "Save Cashier")}
  </button>
</div>
</form>
);

default:
return (
<div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
<p>No form available for role: {effectiveRole || "unknown"}</p>
<p className="mt-2">
  Available roles: blocker, scaleMonitor, saler, stockKeeper, client, driver, supplier, productionManager, cashier
</p>
<p className="mt-4">Current props:</p>
<pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
  {JSON.stringify({ role, mode, initialData: Object.keys(initialData) }, null, 2)}
</pre>
<div className="mt-4 flex justify-end">
  <button
    onClick={onClose}
    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
  >
    Close
  </button>
</div>
</div>
);
}
};

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
<div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
<div className="flex justify-between items-center mb-4">
<h2 className="text-xl font-semibold">
{mode === "edit" ? "Edit User" : "Add New User"}
</h2>
<button
onClick={onClose}
className="text-gray-500 hover:text-gray-700"
>
<X size={24} />
</button>
</div>
{renderForm()}
</div>
</div>
);
};

export default RoleForm;