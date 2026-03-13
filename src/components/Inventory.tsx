import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { parseKurdishFloat, compressImage, formatCurrency } from '../utils';
import { ConfirmModal, AlertModal } from './Modals';
import { motion, AnimatePresence } from 'motion/react';

export const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, addToCart, setProducts } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void } | null>(null);

  const filteredProducts = useMemo(() => {
    const s = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.code.toLowerCase().includes(s) ||
        (p.quantity?.toString() || '').includes(s)
    );
  }, [products, search]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'دڵنیای لە سڕینەوەی ئەم کاڵایە؟',
      onConfirm: () => {
        deleteProduct(id);
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      message: 'ئایا دڵنیای لە سڕینەوەی هەموو کاڵاکان؟ ئەم کردارە پاشگەزبوونەوەی نییە!',
      onConfirm: () => {
        setProducts([]);
        setConfirmModal(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="گەڕان بەپێی ناو، کۆد، بڕ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          {products.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-medium transition-colors border border-red-100 justify-center"
            >
              <Trash2 size={20} />
              <span>سڕینەوەی هەموو</span>
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span>زیادکردنی کاڵا</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                  {product.code}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">{product.name}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">بڕی ماوە:</span>
                  <span className={`font-bold ${parseKurdishFloat(product.quantity) <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {product.quantity}
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">نرخی تاک:</span>
                    <span className="font-semibold text-slate-700" dir="ltr">
                      {product.retailPrice} {product.currency === 'IQD' ? 'د.ع' : '$'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">نرخی کۆ:</span>
                    <span className="font-semibold text-slate-700" dir="ltr">
                      {product.wholesalePrice} {product.currency === 'IQD' ? 'د.ع' : '$'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => addToCart({ product, quantity: 1, isWholesale: false })}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 rounded-lg font-medium transition-colors"
                  >
                    <ShoppingCart size={18} />
                    <span>فرۆشتن</span>
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={(p) => {
            if (editingProduct) {
              updateProduct(editingProduct.id, p);
            } else {
              addProduct(p);
            }
            setIsModalOpen(false);
          }}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
};

const ProductModal = ({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Omit<Product, 'id' | 'createdAt'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    code: product?.code || '',
    quantity: product?.quantity?.toString() || '',
    retailPrice: product?.retailPrice?.toString() || '',
    wholesalePrice: product?.wholesalePrice?.toString() || '',
    currency: product?.currency || 'USD',
    image: product?.image || '',
    locationNote: product?.locationNote || '',
    locationImage: product?.locationImage || '',
  });

  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name || 'بێ ناو',
      code: formData.code || '-',
      quantity: formData.quantity || '0',
      retailPrice: formData.retailPrice || '0',
      wholesalePrice: formData.wholesalePrice || '0',
      currency: formData.currency as 'USD' | 'IQD',
      image: formData.image,
      locationNote: formData.locationNote,
      locationImage: formData.locationImage,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'locationImage') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await compressImage(file);
        setFormData((prev) => ({ ...prev, [field]: base64 }));
      } catch (error) {
        setAlertMessage('کێشەیەک هەیە لە وێنەکەدا');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {product ? 'دەستکاری کاڵا' : 'زیادکردنی کاڵای نوێ'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">جۆری دراو</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'USD' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.currency === 'USD' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  دۆلار ($)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'IQD' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${formData.currency === 'IQD' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  دینار (IQD)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">ناوی کاڵا (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder="بۆ نمونە: مۆبایلی ئایفۆن"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">کۆدی کاڵا (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder="بۆ نمونە: A-123"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">بڕ (عەدەد) (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder="بۆ نمونە: 100"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">نرخی تاک ({formData.currency === 'IQD' ? 'دینار' : '$'}) (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={formData.retailPrice}
                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder={formData.currency === 'IQD' ? 'بۆ نمونە: 25000' : 'بۆ نمونە: 15.5'}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">نرخی کۆ ({formData.currency === 'IQD' ? 'دینار' : '$'}) (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder={formData.currency === 'IQD' ? 'بۆ نمونە: 20000' : 'بۆ نمونە: 12.0'}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">وێنەی کاڵا (ئارەزوومەندانە)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'image')}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {formData.image && (
                <img src={formData.image} alt="Preview" className="h-20 w-20 object-cover rounded-lg mt-2" />
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-6">
            <h3 className="text-lg font-medium text-slate-800 mb-4">زانیاری شوێن (ئارەزوومەندانە)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">تێبینی شوێن</label>
                <textarea
                  value={formData.locationNote}
                  onChange={(e) => setFormData({ ...formData, locationNote: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors h-24 resize-none"
                  placeholder="بۆ نمونە: ڕەفی سێیەم، لای ڕاست"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">وێنەی شوێن / نەخشە</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'locationImage')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {formData.locationImage && (
                  <img src={formData.locationImage} alt="Location Preview" className="h-20 w-20 object-cover rounded-lg mt-2" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-slate-100 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              پاشەکەوتکردن
            </button>
          </div>
        </form>
      </motion.div>

      <AlertModal
        isOpen={!!alertMessage}
        message={alertMessage}
        onClose={() => setAlertMessage('')}
      />
    </div>
  );
};
