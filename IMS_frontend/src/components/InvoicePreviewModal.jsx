import { useState } from "react";
import { X, Printer, Download, Receipt, Mail, Loader2 } from "lucide-react";
import invoiceApi from "../api/invoiceApi";

const InvoicePreviewModal = ({ isOpen, onClose, invoice }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await invoiceApi.downloadInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice.invoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Invoice PDF downloaded successfully!", type: 'success' } }));
    } catch (error) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Failed to download invoice PDF.", type: 'error' } }));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice.customerEmail) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Customer email is missing for this invoice.", type: 'error' } }));
      return;
    }
    setIsSendingEmail(true);
    try {
      await invoiceApi.sendInvoiceEmail(invoice.id);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Invoice successfully emailed to ${invoice.customerEmail}!`, type: 'success' } }));
    } catch (error) {
      console.error(error);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Failed to send invoice email.", type: 'error' } }));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CANCELLED": return "text-red-600 bg-red-50 border-red-100";
      case "PAID": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "ISSUED": return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-amber-600 bg-amber-50 border-amber-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[95vh] flex flex-col">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Receipt className="text-blue-600" size={20} />
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Invoice Document Preview</span>
          </div>
          <div className="flex items-center gap-3">
            {invoice.customerEmail && (
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                title={`Send invoice to ${invoice.customerEmail}`}
              >
                {isSendingEmail ? (
                  <Loader2 className="animate-spin text-slate-500" size={14} />
                ) : (
                  <Mail size={14} />
                )}
                <span>Email Invoice</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin text-slate-500" size={14} />
              ) : (
                <Download size={14} />
              )}
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-650 rounded-lg transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Document Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 print:p-0" id="invoice-print-area">
          
          {/* Company Branding */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-premium-gradient flex items-center justify-center text-white font-extrabold text-sm shadow-sm">LT</div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">LogiTrack IMS</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                100 Enterprise Way, Suite 400<br />
                Silicon Valley, CA 94025<br />
                support@logitrack.com
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">INVOICE</h2>
              <p className="font-mono text-sm text-slate-600 font-bold mt-1">{invoice.invoiceNo}</p>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border mt-2 ${getStatusStyle(invoice.status)}`}>
                {invoice.status}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Customer and parameters grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
              <div className="font-bold text-slate-800 text-base">{invoice.customerName}</div>
              <div className="text-slate-500 font-medium mt-1 space-y-0.5">
                <div>Phone: {invoice.customerPhone}</div>
                {invoice.customerEmail && <div>Email: {invoice.customerEmail}</div>}
                {invoice.billingAddress && (
                  <div className="mt-1 leading-relaxed">
                    Address: {invoice.billingAddress}
                  </div>
                )}
              </div>
            </div>

            <div className="md:text-right flex flex-col md:items-end justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Parameters</h4>
                <div className="text-slate-500 font-medium space-y-1">
                  <div>Date: <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span></div>
                  <div>Payment Method: <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span></div>
                  <div>Payment Status: <span className="font-semibold text-slate-800">{invoice.paymentStatus}</span></div>
                  {invoice.saleNo && (
                    <div>Sale Ref: <span className="font-semibold text-slate-850 font-mono text-xs">{invoice.saleNo}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3.5 font-bold text-slate-600">Product Line Item</th>
                  <th className="p-3.5 font-bold text-slate-600 text-center w-[12%]">Quantity</th>
                  <th className="p-3.5 font-bold text-slate-600 text-right w-[18%]">Unit Price</th>
                  <th className="p-3.5 font-bold text-slate-600 text-right w-[18%]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-850 text-slate-800">{item.productName}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{item.productSku}</div>
                    </td>
                    <td className="p-3.5 text-center text-slate-600 font-medium">{item.quantity}</td>
                    <td className="p-3.5 text-right text-slate-500 font-medium">${item.unitPrice?.toFixed(2)}</td>
                    <td className="p-3.5 text-right text-slate-800 font-bold">${item.lineTotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aggregate card */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="max-w-md text-xs text-slate-400 font-medium leading-relaxed">
              {invoice.notes && (
                <div>
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider mb-1">Remarks / Terms</h5>
                  <p className="text-slate-500 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm font-semibold text-slate-500 ml-auto">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-800">${invoice.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (+)</span>
                <span className="text-slate-700">${invoice.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount (-)</span>
                <span className="text-red-650 text-red-650 text-red-600">-${invoice.discount?.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-base">
                <span className="text-slate-800">Grand Total</span>
                <span className="text-lg text-slate-900 font-extrabold">${invoice.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePreviewModal;
