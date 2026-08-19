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
      case "CANCELLED": return "badge-error text-[10px] py-0.5 px-2.5";
      case "PAID": return "badge-success text-[10px] py-0.5 px-2.5";
      case "ISSUED": return "badge-info text-[10px] py-0.5 px-2.5";
      default: return "badge-warning text-[10px] py-0.5 px-2.5";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans antialiased">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Receipt className="text-blue-600" size={16} />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Invoice Preview</span>
          </div>
          <div className="flex items-center gap-2.5">
            {invoice.customerEmail && (
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
                title={`Send invoice to ${invoice.customerEmail}`}
              >
                {isSendingEmail ? (
                  <Loader2 className="animate-spin text-slate-500" size={13} />
                ) : (
                  <Mail size={13} />
                )}
                <span>Email Invoice</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin text-slate-500" size={13} />
              ) : (
                <Download size={13} />
              )}
              <span>Download PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 border border-slate-100 hover:bg-slate-100 text-slate-450 hover:text-slate-600 rounded-lg transition-colors cursor-pointer ml-1">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Invoice Document Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-6 print:p-0 bg-white"
        
        id="invoice-print-area">
          
          {/* Company Branding */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-premium-gradient flex items-center justify-center text-white font-extrabold text-xs shadow-sm">LT</div>
                <span className="text-base font-extrabold text-slate-900 tracking-tight">LogiTrack IMS</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium leading-relaxed">
                100 Enterprise Way, Suite 400<br />
                Silicon Valley, CA 94025<br />
                support@LogiTrack.com
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">INVOICE</h2>
              <p className="font-mono text-xs text-slate-650 font-bold mt-1 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded inline-block">{invoice.invoiceNo}</p>
              <div className="mt-2.5">
                <span className={getStatusStyle(invoice.status)}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Customer and parameters grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To</h4>
              <div className="font-bold text-slate-800 text-sm">{invoice.customerName}</div>
              <div className="text-slate-500 font-medium mt-1.5 space-y-0.5">
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
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Invoice Parameters</h4>
                <div className="text-slate-500 font-medium space-y-1">
                  <div>Date: <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span></div>
                  <div>Payment Method: <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span></div>
                  <div>Payment Status: <span className="font-semibold text-slate-800">{invoice.paymentStatus}</span></div>
                  {invoice.saleNo && (
                    <div>Sale Ref: <span className="font-semibold text-slate-800 font-mono text-[10px] bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{invoice.saleNo}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="th-premium font-bold text-slate-500">Product Line Item</th>
                  <th className="th-premium font-bold text-slate-500 text-center w-[12%]">Quantity</th>
                  <th className="th-premium font-bold text-slate-500 text-right w-[18%]">Unit Price</th>
                  <th className="th-premium font-bold text-slate-500 text-right w-[18%]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/10">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">SKU: {item.productSku}</div>
                    </td>
                    <td className="p-3 text-center text-slate-600 font-semibold">{item.quantity}</td>
                    <td className="p-3 text-right text-slate-550 text-slate-500 font-semibold">${item.unitPrice?.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-850 text-slate-800 font-bold">${item.lineTotal?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Aggregate card */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
            <div className="max-w-md text-xs text-slate-400 font-medium leading-relaxed">
              {invoice.notes && (
                <div className="space-y-1.5 bg-slate-50/50 border border-slate-200/60 rounded-xl p-3.5 shadow-sm">
                  <h5 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Remarks / Terms</h5>
                  <p className="text-slate-600 whitespace-pre-wrap text-[11px] leading-relaxed">{invoice.notes}</p>
                </div>
              )}
            </div>

            <div className="w-full md:w-64 bg-slate-50/50 p-4 rounded-xl border border-slate-205 border-slate-200/60 shadow-sm space-y-2.5 text-xs font-semibold text-slate-550 text-slate-500 ml-auto">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-800 font-bold">${invoice.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tax (+)</span>
                <span className="text-slate-850 text-slate-700 font-bold">${invoice.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount (-)</span>
                <span className="text-rose-600 font-bold">-${invoice.discount?.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-450">Grand Total</span>
                <span className="text-base text-slate-900 font-extrabold tracking-tight">${invoice.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePreviewModal;
