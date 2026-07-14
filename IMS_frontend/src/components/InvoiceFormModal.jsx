import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Trash2, PlusCircle, AlertCircle } from "lucide-react";
import productApi from "../api/productApi";

const schema = z.object({
  invoiceNo: z.string().max(30, "Max 30 characters").optional().or(z.literal("")),
  customerName: z.string().min(1, "Customer name is required").max(150, "Max 150 characters"),
  customerPhone: z.string().min(1, "Customer phone is required").max(20, "Max 20 characters"),
  customerEmail: z.string().email("Invalid email format").max(100).or(z.literal("")),
  billingAddress: z.string().max(500).optional().or(z.literal("")),
  status: z.string().min(1, "Status is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  tax: z.coerce.number().min(0, "Tax cannot be negative"),
  discount: z.coerce.number().min(0, "Discount cannot be negative"),
  invoiceDate: z.string().min(1, "Date is required"),
  items: z.array(z.object({
    productId: z.coerce.number().min(1, "Please select a product"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0.01, "Price must be greater than 0")
  })).min(1, "At least one product item is required")
});

const InvoiceFormModal = ({ isOpen, onClose, onSubmit, invoice, isLoading }) => {
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [skuMap, setSkuMap] = useState({});

  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      invoiceNo: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      billingAddress: "",
      status: "DRAFT",
      paymentStatus: "PENDING",
      paymentMethod: "CASH",
      notes: "",
      tax: 0,
      discount: 0,
      invoiceDate: new Date().toISOString().split("T")[0],
      items: [{ productId: "", quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedTax = watch("tax") || 0;
  const watchedDiscount = watch("discount") || 0;

  // Load Products list for dropdown selection
  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        try {
          const res = await productApi.getProducts({ page: 0, size: 1000 });
          const productsList = res.content || [];
          setCatalogProducts(productsList);

          const stocks = {};
          const skus = {};
          productsList.forEach(p => {
            stocks[p.id] = p.quantityInStock;
            skus[p.id] = p.sku;
          });
          setStockMap(stocks);
          setSkuMap(skus);
        } catch (err) {
          console.error("Failed to load catalog products:", err);
        }
      };
      fetchCatalog();
    }
  }, [isOpen]);

  // Set default values when editing or creating
  useEffect(() => {
    if (invoice) {
      reset({
        invoiceNo: invoice.invoiceNo || "",
        customerName: invoice.customerName || "",
        customerPhone: invoice.customerPhone || "",
        customerEmail: invoice.customerEmail || "",
        billingAddress: invoice.billingAddress || "",
        status: invoice.status || "DRAFT",
        paymentStatus: invoice.paymentStatus || "PENDING",
        paymentMethod: invoice.paymentMethod || "CASH",
        notes: invoice.notes || "",
        tax: invoice.tax || 0,
        discount: invoice.discount || 0,
        invoiceDate: invoice.invoiceDate || new Date().toISOString().split("T")[0],
        items: invoice.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })) || [{ productId: "", quantity: 1, unitPrice: 0 }]
      });
    } else {
      reset({
        invoiceNo: "", // Leave blank for backend auto-generation
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        billingAddress: "",
        status: "DRAFT",
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        notes: "",
        tax: 0,
        discount: 0,
        invoiceDate: new Date().toISOString().split("T")[0],
        items: [{ productId: "", quantity: 1, unitPrice: 0 }]
      });
    }
  }, [invoice, reset, isOpen]);

  // Product Selection Handlers
  const handleProductSelect = (index, productId) => {
    const selectedProd = catalogProducts.find(p => p.id === Number(productId));
    if (selectedProd) {
      setValue(`items.${index}.unitPrice`, selectedProd.sellingPrice || 0);
      setValue(`items.${index}.productId`, selectedProd.id);
    }
  };

  // Grand Total calculation
  const subtotal = watchedItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0) || 0;

  const grandTotal = Math.max(0, subtotal + Number(watchedTax) - Number(watchedDiscount));

  if (!isOpen) return null;

  const isReadOnly = invoice && invoice.status === "PAID";

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans antialiased">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-4xl w-full max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Log</span>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">
              {invoice ? `Edit Invoice: ${invoice.invoiceNo}` : "Log New Invoice"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 border border-slate-100 hover:bg-slate-50 text-slate-450 hover:text-slate-600 rounded-lg cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice Number</label>
              <input
                type="text"
                placeholder="[Auto Generated if Blank]"
                disabled={isReadOnly}
                {...register("invoiceNo")}
                className="input-premium"
              />
              {errors.invoiceNo && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.invoiceNo.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                disabled={isReadOnly}
                {...register("customerName")}
                className="input-premium"
              />
              {errors.customerName && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Phone *</label>
              <input
                type="text"
                placeholder="e.g. +1 555 9812"
                disabled={isReadOnly}
                {...register("customerPhone")}
                className="input-premium"
              />
              {errors.customerPhone && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.customerPhone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer Email</label>
              <input
                type="text"
                placeholder="e.g. john@email.com"
                disabled={isReadOnly}
                {...register("customerEmail")}
                className="input-premium"
              />
              {errors.customerEmail && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.customerEmail.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice Date *</label>
              <input
                type="date"
                disabled={isReadOnly}
                {...register("invoiceDate")}
                className="input-premium py-1.5"
              />
              {errors.invoiceDate && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.invoiceDate.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method *</label>
              <select
                disabled={isReadOnly}
                {...register("paymentMethod")}
                className="input-premium py-2 cursor-pointer bg-white"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice Status *</label>
              <select
                disabled={isReadOnly}
                {...register("status")}
                className="input-premium py-2 cursor-pointer bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Status *</label>
              <select
                disabled={isReadOnly}
                {...register("paymentStatus")}
                className="input-premium py-2 cursor-pointer bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Address</label>
              <input
                type="text"
                placeholder="e.g. 123 Main St, NY"
                disabled={isReadOnly}
                {...register("billingAddress")}
                className="input-premium"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Invoice Items</h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-1.5 text-xs font-semibold"
                >
                  <PlusCircle size={13} />
                  <span>Add Line Item</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="th-premium w-[40%] font-bold text-slate-500">Product</th>
                    <th className="th-premium w-[15%] font-bold text-slate-500">Available Stock</th>
                    <th className="th-premium w-[15%] font-bold text-slate-500">Quantity</th>
                    <th className="th-premium w-[15%] font-bold text-slate-500">Unit Price</th>
                    <th className="th-premium w-[10%] font-bold text-slate-500 text-right">Subtotal</th>
                    <th className="th-premium w-[5%] font-bold text-slate-500 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, index) => {
                    const selectedId = watchedItems?.[index]?.productId;
                    const stock = stockMap[selectedId] !== undefined ? stockMap[selectedId] : 0;

                    return (
                      <tr key={field.id} className="hover:bg-slate-50/20">
                        {/* Product Dropdown */}
                        <td className="p-2.5">
                          <select
                            disabled={isReadOnly}
                            {...register(`items.${index}.productId`)}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            className="input-premium py-1.5 cursor-pointer bg-white text-xs"
                          >
                            <option value="">Select Product...</option>
                            {catalogProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Current Stock */}
                        <td className="p-2.5 text-slate-500 text-xs font-semibold">
                          {selectedId ? `${stock} available` : <span className="text-slate-400 font-normal">-</span>}
                        </td>

                        {/* Quantity */}
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            disabled={isReadOnly}
                            {...register(`items.${index}.quantity`)}
                            className="input-premium py-1.5 text-xs"
                          />
                        </td>

                        {/* Price */}
                        <td className="p-2.5">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs font-bold">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              disabled={isReadOnly}
                              {...register(`items.${index}.unitPrice`)}
                              className="input-premium pl-6 py-1.5 text-xs"
                            />
                          </div>
                        </td>

                        {/* Line Total */}
                        <td className="p-2.5 text-right text-slate-800 font-bold text-xs">
                          ${((Number(watchedItems?.[index]?.quantity) || 0) * (Number(watchedItems?.[index]?.unitPrice) || 0)).toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center">
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                              className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {errors.items && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.items.message}</p>}
          </div>

          {/* Notes, tax, discount, grand total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 items-start">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Remarks / Remarks</label>
              <textarea
                rows="4"
                placeholder="Supplier instructions, warranty tags, logistics notes..."
                disabled={isReadOnly}
                {...register("notes")}
                className="input-premium"
              />
            </div>

            <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-205 border-slate-200/60 shadow-sm space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-800 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Tax (+)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isReadOnly}
                  {...register("tax")}
                  className="w-20 px-2 py-1 text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs disabled:bg-slate-50 disabled:cursor-not-allowed bg-white"
                />
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Discount (-)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={isReadOnly}
                  {...register("discount")}
                  className="w-20 px-2 py-1 text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs disabled:bg-slate-50 disabled:cursor-not-allowed bg-white"
                />
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 px-5 font-semibold text-xs"
          >
            Cancel
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="btn-primary py-2.5 px-6 font-bold text-xs shadow-md shadow-blue-500/10"
            >
              {isLoading ? "Saving..." : invoice ? "Update Invoice" : "Log Invoice"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
