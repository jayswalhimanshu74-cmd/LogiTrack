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
        return <span className="badge-error text-[10px] py-0.5 px-2.5">Out of Stock</span>;
      case "LOW_STOCK":
        return <span className="badge-warning text-[10px] py-0.5 px-2.5 animate-pulse">Low Stock</span>;
      default:
        return <span className="badge-success text-[10px] py-0.5 px-2.5">In Stock</span>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end antialiased">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 220 }}
          className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col z-10 border-l border-slate-200/80 font-sans"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail View</span>
              <h3 className="text-base font-bold text-slate-800 mt-0.5">Product Information</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-block">SKU: {product.sku}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Main Stats Card */}
            <div className="bg-slate-50/50 border border-slate-200/60 p-5 rounded-xl space-y-4 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-850 text-slate-800">{product.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-1 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full inline-block">{product.category || "Uncategorized"}</p>
                </div>
                {getStatusBadge(product.status)}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Stock</p>
                  <p className="text-xl font-bold text-slate-850 text-slate-800 mt-1">{product.quantityInStock} <span className="text-xs text-slate-400 font-normal">{product.unit || "pcs"}</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reorder Level</p>
                  <p className="text-xl font-bold text-slate-850 text-slate-800 mt-1">{product.reorderLevel} <span className="text-xs text-slate-400 font-normal">{product.unit || "pcs"}</span></p>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financial Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-blue-50 text-blue-650 text-blue-600 rounded-lg border border-blue-100/50 shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 text-slate-400 font-bold uppercase tracking-wider">Purchase Price</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">${product.purchasePrice?.toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-emerald-50 text-emerald-650 text-emerald-600 rounded-lg border border-emerald-100/50 shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 text-slate-400 font-bold uppercase tracking-wider">Selling Price</p>
                    <p className="text-sm font-bold text-slate-850 text-slate-800 mt-0.5">${product.sellingPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Profit margin */}
              {product.sellingPrice && product.purchasePrice && (
                <div className="p-3 bg-emerald-50/20 border border-emerald-100/40 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-slate-550 text-slate-500 font-bold uppercase tracking-wider text-[9px]">Estimated Gross Margin:</span>
                  <span className="text-emerald-700 font-bold">
                    +${(product.sellingPrice - product.purchasePrice).toFixed(2)} ({(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            {/* Audit Log */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Audit Logs</h4>
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3.5 text-xs text-slate-650 shadow-sm">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created Date</p>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-3.5">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last Modified Date</p>
                    <p className="font-bold text-slate-800 mt-0.5">{formatDate(product.updatedAt)}</p>
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
