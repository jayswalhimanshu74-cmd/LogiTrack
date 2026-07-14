import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Plus, Trash2, PlusCircle, AlertCircle } from "lucide-react";
import productApi from "../api/productApi";

const schema = z.object({
  saleNo: z.string().min(1, "Order number is required").max(30, "Max 30 characters"),
  customerName: z.string().min(1, "Customer name is required").max(150, "Max 150 characters"),
  customerPhone: z.string().min(1, "Customer phone is required").max(20, "Max 20 characters"),
  customerEmail: z.string().email("Invalid email format").max(100).or(z.literal("")),
  status: z.string().min(1, "Status is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().max(1000).optional(),
  saleDate: z.string().min(1, "Date is required"),
  items: z.array(z.object({
    productId: z.coerce.number().min(1, "Please select a product"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0.01, "Price must be greater than 0")
  })).min(1, "At least one product item is required")
});

const SalesOrderFormModal = ({ isOpen, onClose, onSubmit, sale, isLoading }) => {
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [stockMap, setStockMap] = useState({}); // productId -> stockLevel
  const [skuMap, setSkuMap] = useState({}); // productId -> sku
  const [nameMap, setNameMap] = useState({}); // productId -> name

  // Initialize Form
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      saleNo: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "CASH",
      notes: "",
      saleDate: new Date().toISOString().split("T")[0],
      items: [{ productId: "", quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");

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
          const names = {};
          productsList.forEach(p => {
            stocks[p.id] = p.quantityInStock;
            skus[p.id] = p.sku;
            names[p.id] = p.name;
          });
          setStockMap(stocks);
          setSkuMap(skus);
          setNameMap(names);
        } catch (err) {
          console.error("Failed to load catalog products:", err);
        }
      };
      fetchCatalog();
    }
  }, [isOpen]);

  // Set default values when editing a sale
  useEffect(() => {
    if (sale) {
      reset({
        saleNo: sale.saleNo,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone || "",
        customerEmail: sale.customerEmail || "",
        status: sale.status || "PENDING",
        paymentStatus: sale.paymentStatus || "PENDING",
        paymentMethod: sale.paymentMethod || "CASH",
        notes: sale.notes || "",
        saleDate: sale.saleDate || new Date().toISOString().split("T")[0],
        items: sale.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })) || [{ productId: "", quantity: 1, unitPrice: 0 }]
      });
    } else {
      reset({
        saleNo: `SO-${Date.now().toString().slice(-8)}`, // Auto-generate order number
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "CASH",
        notes: "",
        saleDate: new Date().toISOString().split("T")[0],
        items: [{ productId: "", quantity: 1, unitPrice: 0 }]
      });
    }
  }, [sale, reset, isOpen]);

  // Product Selection Handlers
  const handleProductSelect = (index, productId) => {
    const selectedProd = catalogProducts.find(p => p.id === Number(productId));
    if (selectedProd) {
      setValue(`items.${index}.unitPrice`, selectedProd.sellingPrice);
      setValue(`items.${index}.productId`, selectedProd.id);
    }
  };

  // Grand Total calculation
  const grandTotal = watchedItems?.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + (qty * price);
  }, 0) || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto font-sans antialiased">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/85 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-full shadow-sm">
              {sale ? "Order Edit Workspace" : "New Order Entry"}
            </span>
            <h2 className="text-base font-bold text-slate-800 mt-2">
              {sale ? `Edit Sales Order: ${sale.saleNo}` : "Create New Sales Order"}
            </h2>
            <p className="text-xs text-slate-450 text-slate-400 mt-0.5">Configure transaction attributes, quantities, and customer metadata details.</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Customer Metadata Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Order Number *</label>
              <input
                type="text"
                {...register("saleNo")}
                className="input-premium"
              />
              {errors.saleNo && <p className="text-rose-505 text-rose-600 text-[10px] mt-1 font-semibold">{errors.saleNo.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                {...register("customerName")}
                className="input-premium"
              />
              {errors.customerName && <p className="text-rose-505 text-rose-600 text-[10px] mt-1 font-semibold">{errors.customerName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Customer Phone *</label>
              <input
                type="text"
                placeholder="e.g. +1 555 0199"
                {...register("customerPhone")}
                className="input-premium"
              />
              {errors.customerPhone && <p className="text-rose-505 text-rose-600 text-[10px] mt-1 font-semibold">{errors.customerPhone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Customer Email</label>
              <input
                type="text"
                placeholder="e.g. john@example.com"
                {...register("customerEmail")}
                className="input-premium"
              />
              {errors.customerEmail && <p className="text-rose-505 text-rose-600 text-[10px] mt-1 font-semibold">{errors.customerEmail.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Order Date *</label>
              <input
                type="date"
                {...register("saleDate")}
                className="input-premium cursor-pointer"
              />
              {errors.saleDate && <p className="text-rose-505 text-rose-600 text-[10px] mt-1 font-semibold">{errors.saleDate.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Payment Method *</label>
              <select
                {...register("paymentMethod")}
                className="input-premium cursor-pointer py-2 bg-white"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Order Status *</label>
              <select
                {...register("status")}
                className="input-premium cursor-pointer py-2 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Payment Status *</label>
              <select
                {...register("paymentStatus")}
                className="input-premium cursor-pointer py-2 bg-white"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          {/* Product Items Table grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Order Items List</h3>
              <button
                type="button"
                onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100/50 transition-all shadow-sm"
              >
                <PlusCircle size={12} />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-250 border-slate-200">
                    <th className="th-premium py-2 w-[40%]">Product</th>
                    <th className="th-premium py-2 w-[15%]">Stock Info</th>
                    <th className="th-premium py-2 w-[15%]">Quantity</th>
                    <th className="th-premium py-2 w-[15%]">Unit Price</th>
                    <th className="th-premium py-2 w-[10%] text-right">Subtotal</th>
                    <th className="th-premium py-2 w-[5%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, index) => {
                    const selectedId = watchedItems?.[index]?.productId;
                    const stock = stockMap[selectedId] !== undefined ? stockMap[selectedId] : 0;
                    
                    // Original quantity calculation if editing this specific order
                    let originalQuantity = 0;
                    if (sale) {
                      const origItem = sale.items?.find(it => it.productId === Number(selectedId));
                      if (origItem) originalQuantity = origItem.quantity;
                    }
                    
                    // Effective stock is actual stock in DB + original quantity (since we are replacing it on submit)
                    const effectiveStock = stock + originalQuantity;
                    const requestedQty = watchedItems?.[index]?.quantity || 0;
                    const isOverStock = requestedQty > effectiveStock && watch("status") !== "CANCELLED";

                    return (
                      <tr key={field.id} className="hover:bg-slate-50/20">
                        {/* Dropdown */}
                        <td className="p-3">
                          <select
                            {...register(`items.${index}.productId`)}
                            onChange={(e) => handleProductSelect(index, e.target.value)}
                            className="input-premium py-1.5 text-xs bg-white cursor-pointer"
                          >
                            <option value="">Select Product...</option>
                            {catalogProducts.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Stock status indicator */}
                        <td className="p-3 text-slate-500 text-xs font-semibold">
                          {selectedId ? (
                            <span className={effectiveStock <= 5 ? "text-amber-600 font-bold" : "text-slate-400"}>
                              {effectiveStock} available
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">No product</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="p-3">
                          <input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity`)}
                            className={`input-premium py-1.5 text-xs ${isOverStock ? "border-rose-300 bg-rose-50/50 focus:ring-rose-100" : ""}`}
                          />
                          {isOverStock && (
                            <p className="text-rose-600 text-[9px] mt-1 font-bold flex items-center gap-0.5 animate-pulse">
                              <AlertCircle size={9} />
                              Over Stock!
                            </p>
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="p-3">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-450 text-xs font-bold pointer-events-none">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`items.${index}.unitPrice`)}
                              className="input-premium pl-6 py-1.5 text-xs"
                            />
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td className="p-3 text-right text-slate-800 font-extrabold text-xs">
                          ${((Number(watchedItems?.[index]?.quantity) || 0) * (Number(watchedItems?.[index]?.unitPrice) || 0)).toFixed(2)}
                        </td>

                        {/* Action buttons */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            className="btn-icon hover:bg-rose-50 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {errors.items && <p className="text-rose-600 text-xs mt-1 font-semibold">{errors.items.message}</p>}
          </div>

          {/* Notes & Grand Total card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100 items-start">
            <div className="md:col-span-2 space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Remarks / Internal Notes</label>
              <textarea
                rows="3"
                placeholder="Enter any customer notes or transaction details..."
                {...register("notes")}
                className="input-premium"
              />
            </div>

            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 flex flex-col justify-between shadow-sm min-h-[96px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total Amount</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                ${grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-2.5 px-5 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="btn-primary py-2.5 px-6 font-bold text-xs shadow-md shadow-blue-500/10"
          >
            {isLoading ? "Saving..." : sale ? "Update Order" : "Submit Order"}
          </button>
        </div>
    </div>
    </div>

  );
};

export default SalesOrderFormModal;
