import { motion } from "framer-motion";
import { X, User, Phone, Mail, Calendar, Tag, FileText, ShoppingBag, Clock, Receipt } from "lucide-react";

const InvoiceDetailsDrawer = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  // Status Style Helper
  const getStatusStyle = (status) => {
    switch (status) {
      case "CANCELLED":
        return "bg-red-50 text-red-800 border-red-100";
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case "ISSUED":
        return "bg-blue-50 text-blue-800 border-blue-100";
      default:
        return "bg-amber-50 text-amber-800 border-amber-100"; // DRAFT
    }
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case "PARTIALLY_PAID":
        return "bg-purple-50 text-purple-800 border-purple-100";
      case "REFUNDED":
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Details</span>
            <h3 className="text-lg font-bold text-slate-800 mt-0.5">{invoice.invoiceNo}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border text-center ${getStatusStyle(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border text-center ${getPaymentStatusStyle(invoice.paymentStatus)}`}>
                {invoice.paymentStatus}
              </span>
            </div>
          </div>

          {/* Customer details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <User size={13} />
              <span>Customer Details</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-800">{invoice.customerPhone}</span>
              </div>
              {invoice.customerEmail && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="font-semibold text-slate-800">{invoice.customerEmail}</span>
                </div>
              )}
              {invoice.billingAddress && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Address</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[60%] truncate" title={invoice.billingAddress}>
                    {invoice.billingAddress}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Parameters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar size={13} />
              <span>Invoice parameters</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Date</span>
                <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-semibold text-slate-800">{getPaymentMethodLabel(invoice.paymentMethod)}</span>
              </div>
              {invoice.saleNo && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Order Ref</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">{invoice.saleNo}</span>
                </div>
              )}
              {invoice.createdByFullName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Logged By</span>
                  <span className="font-semibold text-slate-800" title={invoice.createdByEmail}>{invoice.createdByFullName}</span>
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
                  {invoice.items?.map((item) => (
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
          {invoice.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                <FileText size={13} />
                <span>Remarks</span>
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap">
                {invoice.notes}
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
                <span>{new Date(invoice.createdAt).toLocaleString()}</span>
              </div>
              {invoice.updatedAt && (
                <div className="flex justify-between">
                  <span>Last Modified</span>
                  <span>{new Date(invoice.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0 space-y-2 text-sm font-semibold text-slate-500">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-slate-700">${invoice.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (+)</span>
            <span className="text-slate-750 text-slate-700">${invoice.tax?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount (-)</span>
            <span className="text-red-650 text-red-650 text-red-650 text-red-600">-${invoice.discount?.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Grand Total</span>
            <span className="text-2xl font-extrabold text-slate-900">${invoice.grandTotal?.toFixed(2)}</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default InvoiceDetailsDrawer;
