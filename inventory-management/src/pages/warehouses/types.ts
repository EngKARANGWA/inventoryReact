import { Warehouse } from "../../services/warehouseServices";

export interface StockKeeper {
  id: number;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
    };
  };
}

export interface WarehouseFilters {
  page: number;
  pageSize: number;
  status: string;
}

export interface SortConfig {
  key: keyof WarehouseType;
  direction: "ascending" | "descending";
}

export interface WarehouseManagementProps {
  warehouses: WarehouseType[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  showFilters: boolean;
  showAddForm: boolean;
  showManagerForm: boolean;
  editingWarehouse: WarehouseType | null;
  isSubmitting: boolean;
  selectedWarehouseId: number | null;
  newManagerId: string;
  isSubmittingManager: boolean;
  stockKeepers: StockKeeper[];
  loadingStockKeepers: boolean;
  viewType: "table" | "cards";
  showConfirmDelete: number | null;
  sortConfig: SortConfig | null;
  filters: WarehouseFilters;
  formData: {
    name: string;
    location: string;
    capacity: string;
    status: string;
    description: string;
  };
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedWarehouses: WarehouseType[];
  filteredWarehouses: WarehouseType[];
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onAddClick: () => void;
  onEditClick: (warehouse: WarehouseType) => void;
  onDeleteConfirm: (warehouseId: number) => void;
  onDeleteWarehouse: (warehouseId: number) => void;
  onChangeManagerClick: (warehouseId: number) => void;
  onChangeManagerSubmit: (e: React.FormEvent) => void;
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPageChange: (newPage: number) => void;
  onRequestSort: (key: keyof WarehouseType) => void;
  onRefresh: () => void;
  onToggleViewType: () => void;
  onExportData: () => void;
  onCloseAddForm: () => void;
  onCloseManagerForm: () => void;
  onCloseDeleteConfirm: () => void;
  setNewManagerId: React.Dispatch<React.SetStateAction<string>>;
}


export interface DeleteConfirmationProps {
    isSubmitting: boolean;
    onConfirm: () => void;
    onClose: () => void;
  }
  
  export interface ManagerFormProps {
    stockKeepers: StockKeeper[];
    loadingStockKeepers: boolean;
    newManagerId: string;
    isSubmittingManager: boolean;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
  }
  
  export interface WarehouseCardsProps {
    warehouses: Warehouse[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    onEditClick: (warehouse: Warehouse) => void;
    onDeleteConfirm: (warehouseId: number) => void;
    onChangeManagerClick: (warehouseId: number) => void;
  }
  
  export interface WarehouseControlsProps {
    searchTerm: string;
    showFilters: boolean;
    viewType: "table" | "cards";
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onToggleFilters: () => void;
    onToggleViewType: () => void;
    onExportData: () => void;
    onRefresh: () => void;
    onAddClick: () => void;
  }
  
  export interface WarehouseFiltersProps {
    filters: WarehouseFilters;
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onApplyFilters: () => void;
  }
  
  export interface WarehouseFormProps {
    editingWarehouse: Warehouse | null;
    formData: {
      name: string;
      location: string;
      capacity: string;
      status: string;
      description: string;
    };
    isSubmitting: boolean;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
  }
  
  export interface WarehouseStatsProps {
    loading: boolean;
    warehouses: Warehouse[];
  }
  
  export interface WarehouseTableProps {
    warehouses: Warehouse[];
    loading: boolean;
    error: string | null;
    sortConfig: SortConfig | null;
    onRequestSort: (key: keyof Warehouse) => void;
    onEditClick: (warehouse: Warehouse) => void;
    onDeleteConfirm: (warehouseId: number) => void;
    onChangeManagerClick: (warehouseId: number) => void;
  }
  
  // Make sure this is at the top of your types.ts file
  import { Warehouse as WarehouseType } from "../../services/warehouseServices";
  
  export interface StockKeeper {
    id: number;
    userId: number;
    user: {
      id: number;
      username: string;
      email: string;
      profile?: {
        names: string;
      };
    };
  }
  
  export interface WarehouseFilters {
    page: number;
    pageSize: number;
    status: string;
  }
  
  export interface SortConfig {
    key: keyof WarehouseType;
    direction: "ascending" | "descending";
  }
  
  export interface WarehouseManagementProps {
    warehouses: WarehouseType[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    showFilters: boolean;
    showAddForm: boolean;
    showManagerForm: boolean;
    editingWarehouse: WarehouseType | null;
    isSubmitting: boolean;
    selectedWarehouseId: number | null;
    newManagerId: string;
    isSubmittingManager: boolean;
    stockKeepers: StockKeeper[];
    loadingStockKeepers: boolean;
    viewType: "table" | "cards";
    showConfirmDelete: number | null;
    sortConfig: SortConfig | null;
    filters: WarehouseFilters;
    formData: {
      name: string;
      location: string;
      capacity: string;
      status: string;
      description: string;
    };
    currentPage: number;
    pageSize: number;
    totalPages: number;
    paginatedWarehouses: WarehouseType[];
    filteredWarehouses: WarehouseType[];
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
    onAddClick: () => void;
    onEditClick: (warehouse: WarehouseType) => void;
    onDeleteConfirm: (warehouseId: number) => void;
    onDeleteWarehouse: (warehouseId: number) => void;
    onChangeManagerClick: (warehouseId: number) => void;
    onChangeManagerSubmit: (e: React.FormEvent) => void;
    onFormChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    onFormSubmit: (e: React.FormEvent) => void;
    onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onPageChange: (newPage: number) => void;
    onRequestSort: (key: keyof WarehouseType) => void;
    onRefresh: () => void;
    onToggleViewType: () => void;
    onExportData: () => void;
    onCloseAddForm: () => void;
    onCloseManagerForm: () => void;
    onCloseDeleteConfirm: () => void;
    setNewManagerId: React.Dispatch<React.SetStateAction<string>>;
  }