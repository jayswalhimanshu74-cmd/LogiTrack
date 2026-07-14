import { motion } from "framer-motion";
import { X, User, Phone, Mail, Calendar, CreditCard, Tag, FileText, ShoppingBag, Clock } from "lucide-react";

const SalesOrderDetailsDrawer = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  // Status Badge Colors Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "CANCELLED":
        return "badge-error text-[10px] py-0.5 px-2.5";
      case "COMPLETED":
        return "badge-success text-[10px] py-0.5 px-2.5";
      case "CONFIRMED":
        return "badge-info text-[10px] py-0.5 px-2.5";
      default:
        return "badge-warning text-[10px] py-0.5 px-2.5"; // PENDING
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "badge-success text-[10px] py-0.5 px-2.5";
      case "REFUNDED":
        return "badge-error text-[10px] py-0.5 px-2.5";
      default:
        return "badge-warning text-[10px] py-0.5 px-2.5"; // PENDING
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "BANK_TRANSFER": return "Bank Transfer";
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans antialiased">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Slideout Sheet */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200/80 flex flex-col z-10"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100/80 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail View</span>
            <h3 className="text-base font-bold text-slate-800 mt-0.5">Sales Order Details</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-block">Order Ref: {sale.saleNo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-slate-100 hover:bg-slate-50 text-slate-450 hover:text-slate-600 rounded-lg cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Indicators */}
          <div className="flex gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Order Status</span>
              <div>
                <span className={getStatusStyle(sale.status)}>
                  {sale.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Payment Status</span>
              <div>
                <span className={getPaymentStatusStyle(sale.paymentStatus)}>
                  {sale.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User size={12} className="text-slate-400" />
              <span>Customer Information</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold text-slate-800">{sale.customerName}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="font-bold text-slate-850 text-slate-800">{sale.customerPhone || "N/A"}</span>
              </div>
              {sale.customerEmail && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Email</span>
                  <span className="font-bold text-slate-800">{sale.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Order Metadata */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar size={12} className="text-slate-400" />
              <span>Order Parameters</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Order Date</span>
                <span className="font-bold text-slate-800">{sale.saleDate}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-bold text-slate-800">{getPaymentMethodLabel(sale.paymentMethod)}</span>
              </div>
              {sale.createdByFullName && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Logged By</span>
                  <span className="font-bold text-slate-800" title={sale.createdByEmail}>{sale.createdByFullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Items Table */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <ShoppingBag size={12} className="text-slate-400" />
              <span>Items Breakdown</span>
            </h4>
            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="th-premium py-2 font-bold text-slate-500">Product Name</th>
                    <th className="th-premium py-2 font-bold text-slate-500 text-center">Qty</th>
                    <th className="th-premium py-2 font-bold text-slate-500 text-right">Price</th>
                    <th className="th-premium py-2 font-bold text-slate-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/20">
                      <td className="p-2.5 font-bold text-slate-800">
                        <div>{item.productName}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-0.5 font-normal">SKU: {item.productSku}</div>
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-semibold">{item.quantity}</td>
                      <td className="p-2.5 text-right text-slate-450 text-slate-500 font-semibold">${item.unitPrice?.toFixed(2)}</td>
                      <td className="p-2.5 text-right text-slate-850 text-slate-800 font-bold">${item.lineTotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Remarks / Notes */}
          {sale.notes && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText size={12} className="text-slate-400" />
                <span>Remarks</span>
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/60 p-3 rounded-xl leading-relaxed whitespace-pre-wrap shadow-sm">
                {sale.notes}
              </p>
            </div>
          )}

          {/* Section 5: System Auditing */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Clock size={12} className="text-slate-400" />
              <span>System Audit Logs</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-[11px] text-slate-500">
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-400">Created Date</span>
                <span className="font-semibold text-slate-700">{new Date(sale.createdAt).toLocaleString()}</span>
              </div>
              {sale.updatedAt && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="font-medium text-slate-400">Last Modified</span>
                  <span className="font-semibold text-slate-700">{new Date(sale.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Grand Total Display */}
        <div className="p-6 border-t border-slate-100/80 bg-slate-50/50 shrink-0 flex justify-between items-center shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">${sale.totalAmount?.toFixed(2)}</span>
        </div>

      </motion.div>
    </div>
  );
};

export default SalesOrderDetailsDrawer;
