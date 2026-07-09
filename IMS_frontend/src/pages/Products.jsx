import { useState, useEffect, useCallback } from "react";
import { 
  Search, Plus, Edit2, Trash2, Eye, Filter, ArrowUpDown, 
  ChevronLeft, ChevronRight, Package, AlertTriangle, X, 
  RefreshCw, DollarSign, CheckCircle2, AlertCircle, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import productApi from "../api/productApi";
import apiClient from "../api/apiClient";
import ProductFormModal from "../components/ProductFormModal";
import ProductDetailDrawer from "../components/ProductDetailDrawer";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

const Products = () => {
  // Products & Filter State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalCategories: 0
  });

  // Query Params
  const [searchVal, setSearchVal] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("checking"); // checking | connected | demo

  // Modals & Drawer States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Toast States
  const [toasts, setToasts] = useState([]);

  // Toast Emitter
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Listen to Global Axios Error Event
  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type } = e.detail;
      showToast(message, type);
    };
    window.addEventListener("app-toast", handleToastEvent);
    return () => window.removeEventListener("app-toast", handleToastEvent);
  }, [showToast]);

  // Fetch Stats Data
  const loadStats = useCallback(async () => {
    try {
      // 1. Fetch main dashboard counters (contains total products, low stock, categories)
      const dbStatsResponse = await apiClient.get("/api/dashboard/stats");
      const dbStats = dbStatsResponse.data;

      // 2. Fetch out-of-stock items (calculated by page querying)
      const outOfStockRes = await productApi.getProducts({ page: 0, size: 1, status: "OUT_OF_STOCK" });
      
      setStats({
        totalProducts: dbStats.totalProductsCount || 0,
        lowStockCount: dbStats.lowStockAlertCount || 0,
        outOfStockCount: outOfStockRes.totalElements || 0,
        totalCategories: dbStats.categoryStockBreakdown?.length || 0
      });
      setConnectionStatus("connected");
    } catch (err) {
      console.warn("Unable to fetch stats, using dynamic fallback:", err);
      setConnectionStatus("demo");
      // Fallback calculation for demo mode
      loadMockStats();
    }
  }, []);

  // Load Mock Stats for Demo fallback
  const loadMockStats = () => {
    setStats({
      totalProducts: 124,
      lowStockCount: 4,
      outOfStockCount: 2,
      totalCategories: 4
    });
  };

  // Main Paginated Products Fetch
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const sortQuery = `${sortField},${sortOrder}`;
      const data = await productApi.getProducts({
        page: currentPage,
        size: pageSize,
        sort: sortQuery,
        search: searchVal,
        category: categoryFilter,
        status: statusFilter
      });

      setProducts(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
      setConnectionStatus("connected");
    } catch (err) {
      console.error("Fetch products error, triggering demo mode fallback:", err);
      setConnectionStatus("demo");
      loadMockProducts();
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, sortField, sortOrder, searchVal, categoryFilter, statusFilter]);

  // Mock Products Loader
  const loadMockProducts = () => {
    const mockData = [
      { id: 1, sku: "LOGI-MX3S-BLK", name: "Logitech MX Master 3S Wireless Mouse", category: "Electronics", unit: "pcs", purchasePrice: 45.00, sellingPrice: 99.99, quantityInStock: 25, reorderLevel: 5, status: "IN_STOCK", createdAt: "2026-07-01", updatedAt: "2026-07-08" },
      { id: 2, sku: "ASUS-RT-AX86U", name: "ASUS RT-AX86U Dual-Band WiFi 6 Router", category: "Electronics", unit: "pcs", purchasePrice: 110.00, sellingPrice: 249.99, quantityInStock: 3, reorderLevel: 5, status: "LOW_STOCK", createdAt: "2026-07-02", updatedAt: "2026-07-07" },
      { id: 3, sku: "OFF-CHAIR-ERG", name: "Ergonomic Mesh Swivel Office Chair", category: "Office Supplies", unit: "pcs", purchasePrice: 85.00, sellingPrice: 189.99, quantityInStock: 0, reorderLevel: 2, status: "OUT_OF_STOCK", createdAt: "2026-07-03", updatedAt: "2026-07-05" },
      { id: 4, sku: "KEUR-KSLM-SGL", name: "Keurig K-Slim Single Serve Coffee Maker", category: "Home Appliances", unit: "pcs", purchasePrice: 38.50, sellingPrice: 79.99, quantityInStock: 12, reorderLevel: 3, status: "IN_STOCK", createdAt: "2026-07-04", updatedAt: "2026-07-09" }
    ];

    // Filter mocks client-side
    let filtered = mockData;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort mocks client-side
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setProducts(filtered);
    setTotalPages(1);
    setTotalElements(filtered.length);
  };

  // Fetch Unique Categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await productApi.getCategories();
      setCategories(data || []);
    } catch {
      // Fallback unique categories
      setCategories(["Electronics", "Home Appliances", "Office Supplies"]);
    }
  }, []);

  // Initialize
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    loadStats();
  }, [fetchProducts, fetchCategories, loadStats]);

  // Form Modal Submit Handler (Supports both Create and Update)
  const handleFormSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (selectedProduct) {
        // Edit flow
        await productApi.updateProduct(selectedProduct.id, data);
        showToast("Product updated successfully!");
      } else {
        // Create flow
        await productApi.createProduct(data);
        showToast("Product created successfully!");
      }
      setIsFormOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      loadStats();
      fetchCategories();
    } catch (err) {
      console.error("Save product failed:", err);
      // Fallback simulation in demo mode
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated save action for "${data.name}"`, "info");
        setIsFormOpen(false);
        setSelectedProduct(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await productApi.deleteProduct(selectedProduct.id);
      showToast("Product deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      loadStats();
      fetchCategories();
    } catch (err) {
      console.error("Delete failed:", err);
      if (connectionStatus === "demo") {
        showToast(`Demo Mode: Simulated deletion of "${selectedProduct.name}"`, "info");
        setIsDeleteOpen(false);
        setSelectedProduct(null);
      }
    }
  };

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(0);
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return <span className="inline-block px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Out of Stock</span>;
      case "LOW_STOCK":
        return <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold animate-pulse">Low Stock</span>;
      default:
        return <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">In Stock</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar activeTab="products" />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl text-slate-800 font-semibold">Products Catalog Workspace</h2>
          </div>
          <div className="flex items-center gap-4">
            {connectionStatus === "connected" ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                Demo Mode
              </span>
            )}
            <button 
              onClick={() => { fetchProducts(); loadStats(); }} 
              className="p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Refresh Catalog"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-[1600px] w-full mx-auto">
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Catalog Products</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalProducts}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Package size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Low Stock Warnings</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats.lowStockCount > 0 ? "text-amber-600" : "text-slate-900"}`}>{stats.lowStockCount}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.lowStockCount > 0 ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"}`}>
                <AlertTriangle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Out of Stock Items</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats.outOfStockCount > 0 ? "text-red-600" : "text-slate-900"}`}>{stats.outOfStockCount}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.outOfStockCount > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-500"}`}>
                <AlertCircle size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Product Categories</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalCategories}</h3>
              </div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          {/* Catalog Operations bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search input */}
              <div className="relative w-full md:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search SKU, name, category..."
                  value={searchVal}
                  onChange={(e) => { setSearchVal(e.target.value); setCurrentPage(0); }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-lg text-sm transition-all"
                />
              </div>

              {/* Filtering & Add Action */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white">
                  <Filter size={16} className="text-slate-500" />
                  <select 
                    value={categoryFilter} 
                    onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(0); }}
                    className="text-sm text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg bg-white">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
                    className="text-sm text-slate-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <button
                  onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
                  className="bg-premium-gradient hover:bg-premium-gradient-dark text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Product Grid Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Image</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("sku")}>
                      <div className="flex items-center gap-1">
                        <span>SKU</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("name")}>
                      <div className="flex items-center gap-1">
                        <span>Product Name</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("purchasePrice")}>
                      <div className="flex items-center gap-1">
                        <span>Cost</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("sellingPrice")}>
                      <div className="flex items-center gap-1">
                        <span>Price</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort("quantityInStock")}>
                      <div className="flex items-center gap-1">
                        <span>Stock Level</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reorder</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    // Skeleton loaders
                    Array.from({ length: pageSize }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="p-4"><div className="w-10 h-10 bg-slate-100 rounded-lg"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-36"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-10"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-10"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-12"></div></td>
                        <td className="p-4"><div className="h-4 bg-slate-100 rounded w-8"></div></td>
                        <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-24 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan="10" className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                          <Package size={28} />
                        </div>
                        <p className="text-slate-800 font-semibold text-base">No Products Found</p>
                        <p className="text-slate-500 text-xs mt-1">Try resetting your filter variables or search term to discover inventory entries.</p>
                      </td>
                    </tr>
                  ) : (
                    // Table Rows
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
                            <Package size={20} className="stroke-[1.5]" />
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs bg-slate-100 border border-slate-200/60 px-2 py-1 rounded text-slate-700 font-semibold whitespace-nowrap">
                            {product.sku}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-800 text-sm max-w-[200px] truncate" title={product.name}>
                          {product.name}
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{product.category || "N/A"}</td>
                        <td className="p-4 text-slate-800 font-medium text-sm">${product.purchasePrice?.toFixed(2)}</td>
                        <td className="p-4 text-slate-800 font-semibold text-sm">${product.sellingPrice?.toFixed(2)}</td>
                        <td className="p-4 font-bold text-slate-800 text-sm">
                          {product.quantityInStock} <span className="text-slate-400 font-normal text-xs">{product.unit || "pcs"}</span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {product.reorderLevel} <span className="text-slate-400 text-xs">{product.unit || "pcs"}</span>
                        </td>
                        <td className="p-4">{getStatusBadge(product.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setSelectedProduct(product); setIsDrawerOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedProduct(product); setIsFormOpen(true); }}
                              className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => { setSelectedProduct(product); setIsDeleteOpen(true); }}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  Showing <span className="font-semibold text-slate-800">{currentPage * pageSize + 1}</span> to <span className="font-semibold text-slate-800">{Math.min(totalElements, (currentPage + 1) * pageSize)}</span> of <span className="font-semibold text-slate-800">{totalElements}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`px-3 py-1 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                        currentPage === idx
                          ? "bg-premium-gradient text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Slideouts */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        isLoading={isSaving}
      />

      <ProductDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedProduct(null); }}
        onConfirm={handleDeleteConfirm}
        productName={selectedProduct?.name || ""}
      />

      {/* Slide-in Toast Notifications Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 font-sans">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 max-w-sm ${
                t.type === "error"
                  ? "bg-red-50 text-red-800 border-red-100"
                  : t.type === "info"
                  ? "bg-blue-50 text-blue-800 border-blue-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100"
              }`}
            >
              {t.type === "error" ? (
                <AlertCircle className="text-red-500 shrink-0" size={18} />
              ) : t.type === "info" ? (
                <AlertTriangle className="text-blue-500 shrink-0" size={18} />
              ) : (
                <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
              )}
              <div className="text-xs font-semibold leading-relaxed pr-6">{t.message}</div>
              <button 
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
                className="text-slate-400 hover:text-slate-600 absolute top-2 right-2 cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Products;
