import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Plus, Search, Edit, Trash2, User, Phone, DollarSign, ShoppingBag, ArrowDownLeft, CreditCard } from 'lucide-react';
import { Customer } from '../types';
import { formatCurrency, parseKurdishFloat } from '../utils';
import { ConfirmModal } from './Modals';
import { motion, AnimatePresence } from 'motion/react';

export const Customers = () => {
  const { customers, transactions, addCustomer, updateCustomer, deleteCustomer, deleteAllCustomers, receivePayment, setCustomers } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<Customer | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void } | null>(null);

  const getCustomerStats = (customerId: string) => {
    const customerTransactions = transactions.filter((t) => t.customerId === customerId && !t.deletedAt);
    let totalBought = 0;
    let totalReturned = 0;
    let totalDebt = 0;

    customerTransactions.forEach((t) => {
      if (t.type === 'SALE') {
        totalBought += t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        totalDebt += (t.amount || 0) - (t.paidAmount || 0);
      } else if (t.type === 'RETURN') {
        totalReturned += t.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        totalDebt -= t.amount || 0;
      } else if (t.type === 'PAYMENT') {
        totalDebt -= t.amount || 0;
      }
    });

    return { totalBought, totalReturned, totalDebt };
  };

  const filteredCustomers = useMemo(() => {
    const s = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(s) || c.phone.toLowerCase().includes(s)
    );
  }, [customers, search]);

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'دڵنیای لە سڕینەوەی ئەم کڕیارە؟',
      onConfirm: async () => {
        try {
          await deleteCustomer(id);
        } catch (error: any) {
          console.error("Error deleting customer:", error);
          alert("کێشەیەک ڕوویدا لە کاتی سڕینەوەی کڕیار: " + (error.message || ""));
        }
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      message: 'ئایا دڵنیای لە سڕینەوەی هەموو کڕیارەکان؟ ئەم کردارە پاشگەزبوونەوەی نییە!',
      onConfirm: async () => {
        try {
          await deleteAllCustomers();
        } catch (error: any) {
          console.error("Error deleting all customers:", error);
          alert("کێشەیەک ڕوویدا لە کاتی سڕینەوەی هەموو کڕیارەکان: " + (error.message || ""));
        }
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
              placeholder="گەڕان بەپێی ناو، ژمارە تەلەفۆن..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
          {customers.length > 0 && (
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
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          <span>زیادکردنی کڕیار</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer) => {
            const stats = getCustomerStats(customer.id);
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={customer.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{customer.name}</h3>
                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <Phone size={14} />
                          <span dir="ltr">{customer.phone || 'بێ ژمارە'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <ShoppingBag size={16} />
                        <span>کڕدراو</span>
                      </div>
                      <div className="font-bold text-slate-800">{stats.totalBought} دانە</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                        <ArrowDownLeft size={16} />
                        <span>گەڕاوە</span>
                      </div>
                      <div className="font-bold text-slate-800">{stats.totalReturned} دانە</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        {stats.totalDebt > 0 ? 'قەرزی کڕیار' : stats.totalDebt < 0 ? 'قەرزی ئێمە (بۆ کڕیار)' : 'کۆی قەرز'}
                      </div>
                      <div className={`text-lg font-black ${stats.totalDebt > 0 ? 'text-red-600' : stats.totalDebt < 0 ? 'text-indigo-600' : 'text-emerald-600'}`} dir="ltr">
                        {formatCurrency(Math.abs(stats.totalDebt))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCustomerForPayment(customer);
                        setIsPaymentModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
                    >
                      <CreditCard size={18} />
                      <span>وەسڵ</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => setIsModalOpen(false)}
          onSave={async (c) => {
            try {
              if (editingCustomer) {
                await updateCustomer(editingCustomer.id, c);
              } else {
                await addCustomer(c);
              }
              setIsModalOpen(false);
            } catch (error: any) {
              console.error("Error saving customer:", error);
              alert("کێشەیەک ڕوویدا لە کاتی پاشەکەوتکردن: " + (error.message || ""));
            }
          }}
        />
      )}

      {isPaymentModalOpen && selectedCustomerForPayment && (
        <PaymentModal
          customer={selectedCustomerForPayment}
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={async (amount, note) => {
            try {
              await receivePayment(selectedCustomerForPayment.id, amount, note);
              setIsPaymentModalOpen(false);
            } catch (error: any) {
              console.error("Error saving payment:", error);
              alert("کێشەیەک ڕوویدا لە کاتی پاشەکەوتکردن: " + (error.message || ""));
            }
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

const PaymentModal = ({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer;
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
}) => {
  const [amount, setAmount] = useState('');
  const [amountIqd, setAmountIqd] = useState('');
  const [note, setNote] = useState('');
  const [isGivingMoney, setIsGivingMoney] = useState(false);
  const { exchangeRate } = useStore();

  const handleUsdChange = (val: string) => {
    setAmount(val);
    if (val === '') {
      setAmountIqd('');
      return;
    }
    const parsed = parseKurdishFloat(val);
    setAmountIqd((parsed * exchangeRate).toString());
  };

  const handleIqdChange = (val: string) => {
    setAmountIqd(val);
    if (val === '') {
      setAmount('');
      return;
    }
    const parsed = parseKurdishFloat(val);
    const usdVal = parsed / exchangeRate;
    setAmount(Number.isInteger(usdVal) ? usdVal.toString() : usdVal.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseKurdishFloat(amount);
    if (val > 0) {
      onSave(isGivingMoney ? -val : val, note);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className={`p-6 border-b border-slate-100 flex justify-between items-center text-white ${isGivingMoney ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard size={24} />
            <span>{isGivingMoney ? 'پێدانی پارە بە کڕیار' : 'وەسڵکردنی قەرز'}</span>
          </h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className={`p-4 rounded-xl ${isGivingMoney ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
            <div className={`text-sm mb-1 ${isGivingMoney ? 'text-indigo-700' : 'text-emerald-700'}`}>بۆ کڕیار:</div>
            <div className={`font-bold text-lg ${isGivingMoney ? 'text-indigo-900' : 'text-emerald-900'}`}>{customer.name}</div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsGivingMoney(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!isGivingMoney ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              وەرگرتنی پارە
            </button>
            <button
              type="button"
              onClick={() => setIsGivingMoney(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${isGivingMoney ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              پێدانی پارە
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">بڕی پارە ($)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => handleUsdChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-xl font-bold text-center"
                  dir="ltr"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">بڕی پارە (دینار)</label>
                <input
                  type="text"
                  value={amountIqd}
                  onChange={(e) => handleIqdChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-xl font-bold text-center"
                  dir="ltr"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">تێبینی (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
                placeholder="تێبینی..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 text-white rounded-xl font-medium transition-colors shadow-sm ${isGivingMoney ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              پەسەندکردن
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const CustomerModal = ({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSave: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
}) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name || 'بێ ناو',
      phone: formData.phone || '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {customer ? 'دەستکاری کڕیار' : 'زیادکردنی کڕیاری نوێ'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">ناوی کڕیار</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                placeholder="بۆ نمونە: ئەحمەد"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">ژمارە تەلەفۆن (ئارەزوومەندانە)</label>
              <input
                type="text"
                dir="ltr"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-right"
                placeholder="0750 000 0000"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
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
    </div>
  );
};


