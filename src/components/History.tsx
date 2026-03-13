import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency, parseKurdishFloat } from '../utils';
import { Clock, ArrowDownLeft, ShoppingBag, CreditCard, PackagePlus, Trash2, RotateCcw, User, Filter } from 'lucide-react';
import { ConfirmModal, PromptModal, AlertModal } from './Modals';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from '../types';

export const History = () => {
  const { transactions, customers, products, undoTransaction, returnItem, deleteAllTransactions, setTransactions } = useStore();
  const [activeTab, setActiveTab] = useState<'customers' | 'inventory'>('customers');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void } | null>(null);

  const customerTransactions = useMemo(() => {
    let filtered = transactions
      .filter((t) => ['SALE', 'RETURN', 'PAYMENT'].includes(t.type))
      .sort((a, b) => b.createdAt - a.createdAt);

    if (selectedCustomer !== 'all') {
      filtered = filtered.filter((t) => t.customerId === selectedCustomer);
    } else if (customerSearch.trim()) {
      const searchLower = customerSearch.toLowerCase();
      const matchingCustomerIds = customers
        .filter((c) => c.name.toLowerCase().includes(searchLower) || c.phone.includes(searchLower))
        .map((c) => c.id);
      
      filtered = filtered.filter((t) => 
        (t.customerId && matchingCustomerIds.includes(t.customerId)) || 
        (!t.customerId && 'کڕیاری گشتی'.includes(searchLower))
      );
    }

    return filtered;
  }, [transactions, selectedCustomer, customerSearch, customers]);

  const inventoryTransactions = useMemo(() => {
    return transactions
      .filter((t) => ['ADD_PRODUCT', 'DELETE_PRODUCT'].includes(t.type))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions]);

  const handleDeleteAll = () => {
    setConfirmModal({
      isOpen: true,
      message: 'ئایا دڵنیای لە سڕینەوەی هەموو مێژووەکان؟ ئەم کردارە پاشگەزبوونەوەی نییە!',
      onConfirm: async () => {
        try {
          await deleteAllTransactions();
        } catch (error: any) {
          console.error("Error deleting all transactions:", error);
          alert("کێشەیەک ڕوویدا لە کاتی سڕینەوەی هەموو مێژووەکان: " + (error.message || ""));
        }
        setConfirmModal(null);
      }
    });
  };

  const getCustomerName = (id?: string) => {
    if (!id) return 'کڕیاری گشتی';
    return customers.find((c) => c.id === id)?.name || 'کڕیاری نەناسراو';
  };

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.name || 'کاڵای نەناسراو';
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('ku-IQ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-colors flex-1 sm:flex-none ${
              activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            مێژووی کڕیارەکان
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl font-medium transition-colors flex-1 sm:flex-none ${
              activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            مێژووی کۆگا
          </button>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-medium transition-colors border border-red-100 w-full sm:w-auto justify-center"
          >
            <Trash2 size={20} />
            <span>سڕینەوەی هەموو مێژوو</span>
          </button>
        )}
      </div>

      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 w-full sm:w-1/2">
              <Filter size={20} className="text-slate-400" />
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value);
                  if (e.target.value !== 'all') setCustomerSearch('');
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-colors appearance-none"
              >
                <option value="all">هەموو کڕیارەکان</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="گەڕان بەدوای ناوی کڕیار..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  if (e.target.value) setSelectedCustomer('all');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {customerTransactions.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  customerName={getCustomerName(t.customerId)}
                  getProductName={getProductName}
                  formatDate={formatDate}
                  onUndo={async () => {
                    try {
                      await undoTransaction(t.id);
                    } catch (error: any) {
                      console.error("Error undoing transaction:", error);
                      alert("کێشەیەک ڕوویدا لە کاتی گەڕاندنەوە: " + (error.message || ""));
                    }
                  }}
                  onReturn={async (productId, qty) => {
                    try {
                      await returnItem(t.id, productId, qty);
                    } catch (error: any) {
                      console.error("Error returning item:", error);
                      alert("کێشەیەک ڕوویدا لە کاتی گەڕاندنەوەی کاڵا: " + (error.message || ""));
                    }
                  }}
                  allTransactions={transactions}
                />
              ))}
              {customerTransactions.length === 0 && (
                <div className="text-center py-12 text-slate-400">هیچ مێژوویەک نەدۆزرایەوە</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <AnimatePresence>
            {inventoryTransactions.map((t) => (
              <InventoryTransactionCard
                key={t.id}
                transaction={t}
                getProductName={getProductName}
                formatDate={formatDate}
                onUndo={async () => {
                  try {
                    await undoTransaction(t.id);
                  } catch (error: any) {
                    console.error("Error undoing inventory transaction:", error);
                    alert("کێشەیەک ڕوویدا لە کاتی گەڕاندنەوە: " + (error.message || ""));
                  }
                }}
              />
            ))}
            {inventoryTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-400">هیچ مێژوویەک نەدۆزرایەوە</div>
            )}
          </AnimatePresence>
        </div>
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

const TransactionCard: React.FC<{
  transaction: Transaction;
  customerName: string;
  getProductName: (id: string) => string;
  formatDate: (ts: number) => string;
  onUndo: () => void;
  onReturn: (productId: string, qty: number) => void;
  allTransactions: Transaction[];
}> = ({
  transaction,
  customerName,
  getProductName,
  formatDate,
  onUndo,
  onReturn,
  allTransactions,
}) => {
  const isDeleted = !!transaction.deletedAt;
  const [promptModal, setPromptModal] = useState<{ isOpen: boolean; message: string; defaultValue: string; onConfirm: (val: string) => void } | null>(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; message: string; onConfirm: () => void } | null>(null);
  
  const getIcon = () => {
    switch (transaction.type) {
      case 'SALE': return <ShoppingBag size={20} className="text-emerald-600" />;
      case 'RETURN': return <ArrowDownLeft size={20} className="text-amber-600" />;
      case 'PAYMENT': return <CreditCard size={20} className="text-indigo-600" />;
      default: return <Clock size={20} />;
    }
  };

  const getTitle = () => {
    switch (transaction.type) {
      case 'SALE': return 'فرۆشتن';
      case 'RETURN': return 'گەڕانەوە';
      case 'PAYMENT': return (transaction.amount || 0) < 0 ? 'پێدانی پارە بە کڕیار' : 'وەرگرتنی قەرز';
      default: return 'نەناسراو';
    }
  };

  const getBgColor = () => {
    if (isDeleted) return 'bg-slate-50 border-slate-200 opacity-60';
    switch (transaction.type) {
      case 'SALE': return 'bg-emerald-50/50 border-emerald-100';
      case 'RETURN': return 'bg-amber-50/50 border-amber-100';
      case 'PAYMENT': return 'bg-indigo-50/50 border-indigo-100';
      default: return 'bg-white border-slate-100';
    }
  };

  const getReturnedQuantity = (productId: string) => {
    if (transaction.type !== 'SALE') return 0;
    return allTransactions
      .filter((t) => t.type === 'RETURN' && t.originalTransactionId === transaction.id && !t.deletedAt)
      .reduce((sum, t) => {
        const item = t.items?.find((i) => i.productId === productId);
        return sum + (item?.quantity || 0);
      }, 0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-5 rounded-2xl border shadow-sm transition-all ${getBgColor()}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-lg">{getTitle()}</h3>
              {isDeleted && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">پاشگەزبووەوە</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User size={14} />
              <span>{customerName}</span>
              <span className="text-slate-300">•</span>
              <Clock size={14} />
              <span dir="ltr">{formatDate(transaction.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-left">
          <div className="font-black text-xl text-slate-800" dir="ltr">
            {formatCurrency(Math.abs(transaction.amount || 0))}
          </div>
          {transaction.type === 'SALE' && (
            <div className="text-sm text-slate-500">
              دراو: {formatCurrency(transaction.paidAmount || 0)}
            </div>
          )}
        </div>
      </div>

      {transaction.items && transaction.items.length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[500px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-medium">کاڵا</th>
                <th className="px-4 py-3 font-medium">بڕ</th>
                <th className="px-4 py-3 font-medium">نرخ</th>
                <th className="px-4 py-3 font-medium">کۆ</th>
                {!isDeleted && transaction.type === 'SALE' && <th className="px-4 py-3 font-medium text-center">کردار</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.items.map((item, idx) => {
                const returnedQty = getReturnedQuantity(item.productId);
                const remainingQty = item.quantity - returnedQty;
                
                return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {getProductName(item.productId)}
                    {returnedQty > 0 && <span className="text-xs text-amber-600 block">({returnedQty} گەڕاوەتەوە)</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-slate-600" dir="ltr">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 font-bold text-slate-800" dir="ltr">{formatCurrency(item.price * item.quantity)}</td>
                  {!isDeleted && transaction.type === 'SALE' && (
                    <td className="px-4 py-3 text-center">
                      {remainingQty > 0 ? (
                        <button
                          onClick={() => {
                            setPromptModal({
                              isOpen: true,
                              message: `چەند دانە دەگەڕێنیتەوە لە کۆی ${remainingQty}؟`,
                              defaultValue: '1',
                              onConfirm: (qty) => {
                                const parsedQty = parseKurdishFloat(qty || '0');
                                if (parsedQty > 0 && parsedQty <= remainingQty) {
                                  onReturn(item.productId, parsedQty);
                                } else if (parsedQty > remainingQty) {
                                  setAlertMessage('ناتوانیت لە بڕی ماوە زیاتر بگەڕێنیتەوە!');
                                }
                                setPromptModal(null);
                              }
                            });
                          }}
                          className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg font-medium transition-colors text-xs"
                        >
                          گەڕانەوە
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">گەڕاوەتەوە</span>
                      )}
                    </td>
                  )}
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {transaction.note && (
        <div className="mt-4 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
          <strong>تێبینی:</strong> {transaction.note}
        </div>
      )}

      {!isDeleted && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                message: 'دڵنیای لە پاشگەزبوونەوە لەم کردارە؟ گۆڕانکارییەکانی کۆگا و قەرز پێچەوانە دەبنەوە.',
                onConfirm: () => {
                  onUndo();
                  setConfirmModal(null);
                }
              });
            }}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-colors text-sm"
          >
            <RotateCcw size={16} />
            <span>پاشگەزبوونەوە لەم کردارە</span>
          </button>
        </div>
      )}

      {promptModal && (
        <PromptModal
          isOpen={promptModal.isOpen}
          message={promptModal.message}
          defaultValue={promptModal.defaultValue}
          onConfirm={promptModal.onConfirm}
          onCancel={() => setPromptModal(null)}
        />
      )}

      <AlertModal
        isOpen={!!alertMessage}
        message={alertMessage}
        onClose={() => setAlertMessage('')}
      />

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </motion.div>
  );
};

const InventoryTransactionCard: React.FC<{
  transaction: Transaction;
  getProductName: (id: string) => string;
  formatDate: (ts: number) => string;
  onUndo: () => void;
}> = ({
  transaction,
  getProductName,
  formatDate,
  onUndo,
}) => {
  const isDeleted = !!transaction.deletedAt;
  const isAdd = transaction.type === 'ADD_PRODUCT';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-5 rounded-2xl border shadow-sm transition-all flex items-center justify-between ${
        isDeleted ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl shadow-sm border ${isAdd ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {isAdd ? <PackagePlus size={24} /> : <Trash2 size={24} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">
              {isAdd ? 'زیادکردنی کاڵا' : 'سڕینەوەی کاڵا'}
            </h3>
            {isDeleted && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">پاشگەزبووەوە</span>}
          </div>
          <div className="text-slate-500 text-sm mt-1">
            {transaction.items?.map(i => getProductName(i.productId)).join(', ')}
          </div>
          <div className="text-slate-400 text-xs mt-1 flex items-center gap-1">
            <Clock size={12} />
            <span dir="ltr">{formatDate(transaction.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* {!isDeleted && (
        <button
          onClick={() => {
            if (confirm('دڵنیای لە پاشگەزبوونەوە؟')) {
              onUndo();
            }
          }}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="پاشگەزبوونەوە"
        >
          <RotateCcw size={20} />
        </button>
      )} */}
    </motion.div>
  );
};
