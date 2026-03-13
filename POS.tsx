import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Trash2, Plus, Minus, User, CreditCard, ShoppingCart, CheckCircle2, Search, Printer } from 'lucide-react';
import { formatCurrency, parseKurdishFloat } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export const POS = () => {
  const { products, cart, addToCart, updateCartItem, removeFromCart, clearCart, customers, selectedCustomerId, setSelectedCustomerId, exchangeRate, checkout, transactions, addCustomer } = useStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptTransactionId, setReceiptTransactionId] = useState<string | null>(null);

  const totalAmount = cart.reduce(
    (sum, item) => {
      let price = parseKurdishFloat(item.isWholesale ? item.product.wholesalePrice : item.product.retailPrice);
      if (item.product.currency === 'IQD') {
        price = price / exchangeRate;
      }
      return sum + price * item.quantity;
    },
    0
  );

  const filteredProducts = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(s) || p.code.toLowerCase().includes(s)
    );
  }, [products, searchTerm]);

  const handleCheckout = (paidAmount: number, note: string) => {
    const transactionId = checkout(paidAmount, note);
    if (transactionId) {
      setReceiptTransactionId(transactionId);
    }
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Inventory Catalog */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print min-h-[50vh] lg:min-h-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="گەڕان بۆ کاڵا بەپێی ناو یان کۆد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-lg" />
                ) : (
                  <div className="w-full h-24 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
                    <ShoppingCart size={24} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{product.name}</h3>
                  <div className="text-xs text-slate-500 mt-1">کۆد: {product.code}</div>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <div className="text-indigo-600 font-bold text-sm" dir="ltr">
                    {product.retailPrice} {product.currency === 'IQD' ? 'د.ع' : '$'}
                  </div>
                  <div className="text-xs text-slate-500">ماوە: {product.quantity}</div>
                </div>
                <button
                  onClick={() => addToCart({ product, quantity: 1, isWholesale: false })}
                  disabled={
                    parseKurdishFloat(product.quantity) <= 0 ||
                    (cart.find((c) => c.product.id === product.id)?.quantity || 0) >= parseKurdishFloat(product.quantity)
                  }
                  className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={16} />
                  زیادکردن
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                هیچ کاڵایەک نەدۆزرایەوە
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[60vh] lg:h-full shrink-0 no-print">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">کڕیار (ئارەزوومەندانە)</label>
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
            >
              <Plus size={14} />
              کڕیاری نوێ
            </button>
          </div>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value || null)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors appearance-none shadow-sm"
            >
              <option value="">کڕیاری گشتی (نەناسراو)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <ShoppingCart size={48} className="text-slate-200" />
              <p className="text-sm">سەبەتەکە خاڵییە</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.product.id}
                  className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-slate-800 text-sm">{item.product.name}</div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity, !item.isWholesale)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          !item.isWholesale ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        تاک
                      </button>
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity, !item.isWholesale)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.isWholesale ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        کۆ
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.product.id, Math.max(1, item.quantity - 1), item.isWholesale)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-100 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.product.id, item.quantity + 1, item.isWholesale)}
                        disabled={item.quantity >= parseKurdishFloat(item.product.quantity)}
                        className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-left font-bold text-indigo-600 mt-1" dir="ltr">
                    {formatCurrency(parseKurdishFloat(item.isWholesale ? item.product.wholesalePrice : item.product.retailPrice) * item.quantity, item.product.currency === 'IQD' ? 'IQD' : 'USD')}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex justify-between items-center text-slate-500 text-sm">
            <span>ژمارەی کاڵاکان:</span>
            <span className="font-bold text-slate-800">{cart.reduce((sum, item) => sum + item.quantity, 0)} دانە</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 text-sm">
            <span>کۆی گشتی (دینار):</span>
            <span className="font-bold text-slate-800">{formatCurrency(totalAmount * exchangeRate, 'IQD')}</span>
          </div>
          <div className="flex justify-between items-end pt-2 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-800">کۆی گشتی ($):</span>
            <span className="text-2xl font-black text-indigo-600" dir="ltr">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-xl font-medium transition-colors"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              disabled={cart.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
            >
              <CreditCard size={20} />
              <span>پارەدان</span>
            </button>
          </div>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <CheckoutModal
          totalAmount={totalAmount}
          exchangeRate={exchangeRate}
          customer={customers.find((c) => c.id === selectedCustomerId)}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirm={handleCheckout}
        />
      )}

      {isNewCustomerModalOpen && (
        <NewCustomerModal
          onClose={() => setIsNewCustomerModalOpen(false)}
          onSave={(customerData) => {
            const newId = addCustomer(customerData);
            setSelectedCustomerId(newId);
            setIsNewCustomerModalOpen(false);
          }}
        />
      )}

      {receiptTransactionId && (
        <ReceiptModal
          transactionId={receiptTransactionId}
          onClose={() => setReceiptTransactionId(null)}
        />
      )}
    </div>
  );
};

const NewCustomerModal = ({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (customer: { name: string; phone: string; address: string }) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name.trim() || 'بێ ناو',
      phone: formData.phone.trim(),
      address: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User size={24} />
            <span>کڕیاری نوێ</span>
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">ناوی کڕیار (ئارەزوومەندانە)</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              placeholder="ناوی کڕیار لێرە بنووسە..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">ژمارەی مۆبایل (ئارەزوومەندانە)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-left"
              dir="ltr"
              placeholder="0750 000 0000"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md"
          >
            <Plus size={24} />
            <span>زیادکردن و هەڵبژاردن</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CheckoutModal = ({
  totalAmount,
  exchangeRate,
  customer,
  onClose,
  onConfirm,
}: {
  totalAmount: number;
  exchangeRate: number;
  customer?: { name: string };
  onClose: () => void;
  onConfirm: (paidAmount: number, note: string) => void;
}) => {
  const [paidAmountStr, setPaidAmountStr] = useState(totalAmount.toString());
  const [paidAmountIqdStr, setPaidAmountIqdStr] = useState((totalAmount * exchangeRate).toString());
  const [note, setNote] = useState('');

  const handleUsdChange = (val: string) => {
    setPaidAmountStr(val);
    if (val === '') {
      setPaidAmountIqdStr('');
      return;
    }
    const parsed = parseKurdishFloat(val);
    setPaidAmountIqdStr((parsed * exchangeRate).toString());
  };

  const handleIqdChange = (val: string) => {
    setPaidAmountIqdStr(val);
    if (val === '') {
      setPaidAmountStr('');
      return;
    }
    const parsed = parseKurdishFloat(val);
    const usdVal = parsed / exchangeRate;
    setPaidAmountStr(Number.isInteger(usdVal) ? usdVal.toString() : usdVal.toFixed(2));
  };

  const paidAmount = parseKurdishFloat(paidAmountStr);
  const remainingDebt = totalAmount - paidAmount;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 size={24} />
            <span>کۆتاییهێنان بە فرۆشتن</span>
          </h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl text-center space-y-1">
            <div className="text-sm text-slate-500">کۆی گشتی داواکراو</div>
            <div className="text-3xl font-black text-indigo-700" dir="ltr">{formatCurrency(totalAmount)}</div>
            <div className="text-sm font-medium text-slate-600" dir="ltr">{formatCurrency(totalAmount * exchangeRate, 'IQD')}</div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">بڕی دراو ($)</label>
                <input
                  type="text"
                  value={paidAmountStr}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-xl font-bold text-center"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">بڕی دراو (دینار)</label>
                <input
                  type="text"
                  value={paidAmountIqdStr}
                  onChange={(e) => handleIqdChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-xl font-bold text-center"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-4 rounded-xl border-2 border-dashed border-slate-200">
              <span className="font-medium text-slate-600">ماوە (قەرز):</span>
              <div className="text-left">
                <div className={`text-xl font-bold ${remainingDebt > 0 ? 'text-red-600' : 'text-emerald-600'}`} dir="ltr">
                  {formatCurrency(remainingDebt)}
                </div>
                {remainingDebt > 0 && (
                  <div className="text-sm text-red-500" dir="ltr">{formatCurrency(remainingDebt * exchangeRate, 'IQD')}</div>
                )}
              </div>
            </div>

            {remainingDebt > 0 && !customer && (
              <div className="p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
                <strong>ئاگاداری:</strong> ئەم فرۆشتنە قەرزی تێدایە بەڵام هیچ کڕیارێک دیاری نەکراوە.
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">تێبینی (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder="تێبینی..."
              />
            </div>
          </div>

          <button
            onClick={() => onConfirm(paidAmount, note)}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md"
          >
            <CheckCircle2 size={24} />
            <span>پەسەندکردن</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ReceiptModal = ({
  transactionId,
  onClose,
}: {
  transactionId: string;
  onClose: () => void;
}) => {
  const { transactions, customers, products, exchangeRate } = useStore();
  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) return null;

  const customer = customers.find((c) => c.id === transaction.customerId);
  const remainingDebt = (transaction.amount || 0) - (transaction.paidAmount || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 no-print">
          <h2 className="text-lg font-bold text-slate-800">وەسڵی فرۆشتن</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
        </div>

        <div id="receipt-content" className="p-6 overflow-y-auto bg-white text-slate-800 text-sm">
          <div className="text-center mb-6 border-b border-dashed border-slate-300 pb-4">
            <h1 className="text-2xl font-black mb-1">وەسڵی فرۆشتن</h1>
            <div className="text-slate-500 text-xs" dir="ltr">
              {new Date(transaction.createdAt).toLocaleString('ku-IQ')}
            </div>
            <div className="text-slate-500 text-xs mt-1">
              ژمارە: {transaction.id.slice(0, 8).toUpperCase()}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-slate-500">کڕیار:</span>
              <span className="font-bold">{customer ? customer.name : 'کڕیاری گشتی'}</span>
            </div>
            {customer?.phone && (
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">مۆبایل:</span>
                <span className="font-bold" dir="ltr">{customer.phone}</span>
              </div>
            )}
          </div>

          <table className="w-full mb-6 text-right">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">کاڵا</th>
                <th className="py-2 font-medium">بڕ</th>
                <th className="py-2 font-medium">نرخ</th>
                <th className="py-2 font-medium">کۆ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200">
              {transaction.items?.map((item, idx) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <tr key={idx}>
                    <td className="py-2 font-medium">{product?.name || 'نەناسراو'}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2" dir="ltr">{formatCurrency(item.price)}</td>
                    <td className="py-2 font-bold" dir="ltr">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="space-y-2 border-t border-slate-800 pt-4">
            <div className="flex justify-between items-center text-base">
              <span>کۆی گشتی:</span>
              <span className="font-bold" dir="ltr">{formatCurrency(transaction.amount || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>بە دینار:</span>
              <span dir="ltr">{formatCurrency((transaction.amount || 0) * exchangeRate, 'IQD')}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-600 pt-2 border-t border-dashed border-slate-200">
              <span>دراو:</span>
              <span className="font-bold" dir="ltr">{formatCurrency(transaction.paidAmount || 0)}</span>
            </div>
            {remainingDebt > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>ماوە (قەرز):</span>
                <span className="font-bold" dir="ltr">{formatCurrency(remainingDebt)}</span>
              </div>
            )}
          </div>

          <div className="text-center mt-8 text-slate-500 text-xs border-t border-dashed border-slate-300 pt-4">
            سوپاس بۆ سەردانتان
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 no-print">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            داخستن
          </button>
        </div>
      </motion.div>
    </div>
  );
};

