import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, AlertCircle } from "lucide-react";

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(150, 'Product name must not exceed 150 characters'),
  sku: z.string().trim().min(1, 'SKU is required').max(50, 'SKU must not exceed 50 characters'),
  category: z.string().trim().max(80, 'Category must not exceed 80 characters').optional().or(z.literal('')),
  unit: z.string().trim().max(20, 'Unit must not exceed 20 characters').default('pcs'),
  purchasePrice: z.coerce.number().positive('Purchase price must be greater than zero'),
  sellingPrice: z.coerce.number().positive('Selling price must be greater than zero'),
  quantityInStock: z.coerce.number().nonnegative('Quantity in stock cannot be negative'),
  reorderLevel: z.coerce.number().nonnegative('Reorder level cannot be negative'),
}).refine((data) => data.sellingPrice > data.purchasePrice, {
  message: 'Selling price must be greater than purchase price',
  path: ['sellingPrice'],
});

const ProductFormModal = ({ isOpen, onClose, onSubmit, product, isLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      unit: "pcs",
      purchasePrice: "",
      sellingPrice: "",
      quantityInStock: "",
      reorderLevel: "10",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || "",
        unit: product.unit || "pcs",
        purchasePrice: product.purchasePrice || "",
        sellingPrice: product.sellingPrice || "",
        quantityInStock: product.quantityInStock || 0,
        reorderLevel: product.reorderLevel || 10,
      });
    } else {
      reset({
        name: "",
        sku: "",
        category: "",
        unit: "pcs",
        purchasePrice: "",
        sellingPrice: "",
        quantityInStock: "",
        reorderLevel: "10",
      });
    }
  }, [product, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto antialiased">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 10 }}
          className="relative bg-white rounded-xl border border-slate-200/80 shadow-2xl max-w-2xl w-full p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto font-sans"
        >
          {/* Close Header Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="mb-6">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-full shadow-sm">
              {product ? "Update Product" : "New Catalog Entry"}
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-3">
              {product ? "Edit Product Workspace" : "Create New Product Catalog"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Configure product specifications, tracking metrics, and cost details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Logitech MX Master 3S"
                  {...register("name")}
                  className={`input-premium ${
                    errors.name ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  placeholder="e.g. LOGI-MX3S-BLK"
                  disabled={!!product}
                  {...register("sku")}
                  className={`input-premium ${
                    product ? "bg-slate-50/80 border-slate-200 text-slate-400 cursor-not-allowed font-semibold" :
                    errors.sku ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.sku && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.sku.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  {...register("category")}
                  className="input-premium"
                />
                {errors.category && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unit of Measurement</label>
                <input
                  type="text"
                  placeholder="e.g. pcs, boxes, kgs"
                  {...register("unit")}
                  className="input-premium"
                />
                {errors.unit && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.unit.message}</p>}
              </div>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Purchase Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("purchasePrice")}
                  className={`input-premium ${
                    errors.purchasePrice ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.purchasePrice && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.purchasePrice.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Selling Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("sellingPrice")}
                  className={`input-premium ${
                    errors.sellingPrice ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.sellingPrice && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.sellingPrice.message}</p>}
              </div>
            </div>

            {/* Stock Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity in Stock *</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("quantityInStock")}
                  className={`input-premium ${
                    errors.quantityInStock ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.quantityInStock && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.quantityInStock.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reorder Level *</label>
                <input
                  type="number"
                  placeholder="10"
                  {...register("reorderLevel")}
                  className={`input-premium ${
                    errors.reorderLevel ? "border-rose-300 focus:ring-rose-100" : ""
                  }`}
                />
                {errors.reorderLevel && <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-semibold"><AlertCircle size={12}/>{errors.reorderLevel.message}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-secondary py-2.5 px-5 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary py-2.5 px-5 font-semibold text-xs flex items-center gap-2 shadow-md shadow-blue-500/10"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductFormModal;
