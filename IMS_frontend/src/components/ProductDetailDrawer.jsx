import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, DollarSign, Package } from "lucide-react";

const ProductDetailDrawer = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OUT_OF_STOCK":
        return <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-100 rounded-full text-xs font-semibold">Out of Stock</span>;
      case "LOW_STOCK":
        return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-full text-xs font-semibold">Low Stock</span>;
      default:
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-xs font-semibold">In Stock</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Product Details</h3>
              <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.sku}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Main Stats Card */}
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{product.name}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{product.category || "Uncategorized"}</p>
                </div>
                {getStatusBadge(product.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Current Stock</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{product.quantityInStock} <span className="text-sm text-slate-400 font-normal">{product.unit || "pcs"}</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Reorder Level</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{product.reorderLevel} <span className="text-sm text-slate-400 font-normal">{product.unit || "pcs"}</span></p>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Financial Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Purchase Price</p>
                    <p className="text-base font-bold text-slate-800">${product.purchasePrice?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <DollarSign size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Selling Price</p>
                    <p className="text-base font-bold text-slate-800">${product.sellingPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Profit margin */}
              {product.sellingPrice && product.purchasePrice && (
                <div className="p-4 bg-emerald-50/20 border border-emerald-100/50 rounded-xl flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Estimated Gross Margin:</span>
                  <span className="text-emerald-700 font-bold">
                    +${(product.sellingPrice - product.purchasePrice).toFixed(2)} (
                    {(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            {/* Audit Log */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Audit Logs</h4>
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Created Date</p>
                    <p className="font-semibold text-slate-800">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Last Modified Date</p>
                    <p className="font-semibold text-slate-800">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailDrawer;
