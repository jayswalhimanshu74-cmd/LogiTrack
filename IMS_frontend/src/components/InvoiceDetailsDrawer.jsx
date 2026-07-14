import { motion } from "framer-motion";
import { X, User, Phone, Mail, Calendar, Tag, FileText, ShoppingBag, Clock, Receipt } from "lucide-react";

const InvoiceDetailsDrawer = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  // Status Style Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "CANCELLED":
        return "badge-error text-[10px] py-0.5 px-2.5";
      case "PAID":
        return "badge-success text-[10px] py-0.5 px-2.5";
      case "ISSUED":
        return "badge-info text-[10px] py-0.5 px-2.5";
      default:
        return "badge-warning text-[10px] py-0.5 px-2.5"; // DRAFT
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "badge-success text-[10px] py-0.5 px-2.5";
      case "PARTIALLY_PAID":
        return "badge-info text-[10px] py-0.5 px-2.5";
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
      {/* Backdrop */}
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
            <h3 className="text-base font-bold text-slate-800 mt-0.5">Invoice Details</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-block">Invoice Ref: {invoice.invoiceNo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-slate-100 hover:bg-slate-50 text-slate-455 hover:text-slate-600 rounded-lg cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Indicators */}
          <div className="flex gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 shadow-sm">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Invoice Status</span>
              <div>
                <span className={getStatusStyle(invoice.status)}>
                  {invoice.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Payment Status</span>
              <div>
                <span className={getPaymentStatusStyle(invoice.paymentStatus)}>
                  {invoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Customer details */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User size={12} className="text-slate-400" />
              <span>Customer Details</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-bold text-slate-800">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                <span className="text-slate-500 font-medium">Phone</span>
                <span className="font-bold text-slate-850 text-slate-800">{invoice.customerPhone || "N/A"}</span>
              </div>
              {invoice.customerEmail && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Email</span>
                  <span className="font-bold text-slate-800">{invoice.customerEmail}</span>
                </div>
              )}
              {invoice.billingAddress && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Billing Address</span>
                  <span className="font-bold text-slate-800 text-right max-w-[60%] truncate" title={invoice.billingAddress}>
                    {invoice.billingAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Parameters */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar size={12} className="text-slate-400" />
              <span>Invoice parameters</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Invoice Date</span>
                <span className="font-bold text-slate-800">{invoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <span className="font-bold text-slate-800">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
              </div>
              {invoice.saleNo && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Sales Order Ref</span>
                  <span className="font-mono text-[10px] bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded text-slate-700 font-bold">{invoice.saleNo}</span>
                </div>
              )}
              {invoice.createdByFullName && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="text-slate-500 font-medium">Logged By</span>
                  <span className="font-bold text-slate-800" title={invoice.createdByEmail}>{invoice.createdByFullName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items breakdown */}
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
                  {invoice.items?.map((item) => (
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

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText size={12} className="text-slate-400" />
                <span>Remarks</span>
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200/60 p-3 rounded-xl leading-relaxed whitespace-pre-wrap shadow-sm">
                {invoice.notes}
              </p>
            </div>
          )}

          {/* Audit Logs */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Clock size={12} className="text-slate-400" />
              <span>System Audit Logs</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-[11px] text-slate-500">
              <div className="flex justify-between items-center py-0.5">
                <span className="font-medium text-slate-400">Created Date</span>
                <span className="font-semibold text-slate-700">{new Date(invoice.createdAt).toLocaleString()}</span>
              </div>
              {invoice.updatedAt && (
                <div className="flex justify-between items-center py-0.5 border-t border-slate-50 pt-2">
                  <span className="font-medium text-slate-400">Last Modified</span>
                  <span className="font-semibold text-slate-700">{new Date(invoice.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-150 border-slate-100/80 bg-slate-50/50 shrink-0 space-y-2 text-xs font-semibold text-slate-550 text-slate-500 shadow-sm">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-450 font-medium">Subtotal</span>
            <span className="text-slate-800 font-bold">${invoice.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-450 font-medium">Tax (+)</span>
            <span className="text-slate-800 font-bold">${invoice.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-450 font-medium">Discount (-)</span>
            <span className="text-rose-600 font-bold">-${invoice.discount?.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">${invoice.grandTotal?.toFixed(2)}</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default InvoiceDetailsDrawer;
