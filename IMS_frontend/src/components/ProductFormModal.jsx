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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto font-sans"
        >
          {/* Close Header Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          <h3 className="text-xl font-bold text-slate-800 mb-6">
            {product ? "Edit Product Workspace" : "Create New Product Catalog"}
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Logitech MX Master 3S"
                  {...register("name")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.name ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  placeholder="e.g. LOGI-MX3S-BLK"
                  disabled={!!product}
                  {...register("sku")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    product ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" :
                    errors.sku ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.sku && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.sku.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics"
                  {...register("category")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500`}
                />
                {errors.category && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.category.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Unit of Measurement</label>
                <input
                  type="text"
                  placeholder="e.g. pcs, boxes, kgs"
                  {...register("unit")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500`}
                />
                {errors.unit && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.unit.message}</p>}
              </div>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Purchase Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("purchasePrice")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.purchasePrice ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.purchasePrice && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.purchasePrice.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Selling Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("sellingPrice")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.sellingPrice ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.sellingPrice && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.sellingPrice.message}</p>}
              </div>
            </div>

            {/* Stock Levels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Quantity in Stock *</label>
                <input
                  type="number"
                  placeholder="0"
                  {...register("quantityInStock")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.quantityInStock ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.quantityInStock && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.quantityInStock.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Reorder Level *</label>
                <input
                  type="number"
                  placeholder="10"
                  {...register("reorderLevel")}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                    errors.reorderLevel ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-blue-100 focus:border-blue-500"
                  }`}
                />
                {errors.reorderLevel && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={12}/>{errors.reorderLevel.message}</p>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-premium-gradient hover:bg-premium-gradient-dark text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
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
