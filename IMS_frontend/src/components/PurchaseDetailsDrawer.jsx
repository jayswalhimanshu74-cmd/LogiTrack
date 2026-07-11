import { motion } from "framer-motion";
import { X, User, Phone, Mail, Calendar, Tag, FileText, ShoppingBag, Clock } from "lucide-react";

const PurchaseDetailsDrawer = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  // Status Style Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-100";
      case "RECEIVED":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      default:
        return "bg-amber-50 text-amber-800 border-amber-100"; // PENDING
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-100";
      default:
        return "bg-amber-50 text-amber-800 border-amber-100"; // PENDING
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "BANK_TRANSFER": return "Bank Transfer";
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Slideout Sheet */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Log</span>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5">{purchase.purchaseNo}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border text-center ${getStatusStyle(purchase.status)}`}>
                {purchase.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border text-center ${getPaymentStatusStyle(purchase.paymentStatus)}`}>
                {purchase.paymentStatus}
              </span>
            </div>
          </div>

          {/* Supplier details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User size={13} />
              <span>Supplier Information</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier Name</span>
                <span className="font-semibold text-slate-800">{purchase.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Supplier Phone</span>
                <span className="font-semibold text-slate-800">{purchase.supplierPhone}</span>
              </div>
              {purchase.supplierEmail && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier Email</span>
                  <span className="font-semibold text-slate-800">{purchase.supplierEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Logistics Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar size={13} />
              <span>Logistics & Payments</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Purchase Date</span>
                <span className="font-semibold text-slate-800">{purchase.purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-800">{getPaymentMethodLabel(purchase.paymentMethod)}</span>
              </div>
              {purchase.invoiceNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Number</span>
                  <span className="font-semibold text-slate-850 text-slate-800">{purchase.invoiceNo}</span>
                </div>
              )}
              {purchase.createdByFullName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Logged By</span>
                  <span className="font-semibold text-slate-800" title={purchase.createdByEmail}>{purchase.createdByFullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <ShoppingBag size={13} />
              <span>Items Breakdown</span>
            </h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-2.5 font-bold text-slate-500">Product Name</th>
                    <th className="p-2.5 font-bold text-slate-500 text-center">Qty</th>
                    <th className="p-2.5 font-bold text-slate-500 text-right">Price</th>
                    <th className="p-2.5 font-bold text-slate-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {purchase.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40">
                      <td className="p-2.5 font-medium text-slate-800">
                        <div>{item.productName}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{item.productSku}</div>
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-semibold">{item.quantity}</td>
                      <td className="p-2.5 text-right text-slate-500">${item.unitPrice?.toFixed(2)}</td>
                      <td className="p-2.5 text-right text-slate-800 font-bold">${item.lineTotal?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText size={13} />
                <span>Remarks</span>
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                {purchase.notes}
              </p>
            </div>
          )}

          {/* Audit Logs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Clock size={13} />
              <span>System Audit Logs</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Created Date</span>
                <span>{new Date(purchase.createdAt).toLocaleString()}</span>
              </div>
              {purchase.updatedAt && (
                <div className="flex justify-between">
                  <span>Last Modified</span>
                  <span>{new Date(purchase.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Grand Total Cost</span>
          <span className="text-2xl font-extrabold text-slate-900">${purchase.totalAmount?.toFixed(2)}</span>
        </div>

      </motion.div>
    </div>
  );
};

export default PurchaseDetailsDrawer;
