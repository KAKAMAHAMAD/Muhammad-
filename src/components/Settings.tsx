import React, { useState } from 'react';
import { useStore } from '../store';
import { Save, DollarSign, LogOut, User } from 'lucide-react';
import { ConfirmModal } from './Modals';
import { motion } from 'motion/react';

export const Settings = () => {
  const { exchangeRate, setExchangeRate, user, logout } = useStore();
  const [rate, setRate] = useState(exchangeRate.toString());
  const [isSaved, setIsSaved] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title?: string; message: string; onConfirm: () => void } | null>(null);

  const handleSave = async () => {
    const parsed = parseFloat(rate);
    if (!isNaN(parsed) && parsed > 0) {
      try {
        await setExchangeRate(parsed);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      } catch (error: any) {
        console.error("Error saving exchange rate:", error);
        alert("کێشەیەک ڕوویدا لە کاتی پاشەکەوتکردن: " + (error.message || ""));
      }
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      message: 'ئایا دڵنیای دەتەوێت بچیتە دەرەوە؟',
      onConfirm: async () => {
        try {
          await logout();
        } catch (error: any) {
          console.error("Error logging out:", error);
          alert("کێشەیەک ڕوویدا لە کاتی چوونە دەرەوە: " + (error.message || ""));
        }
        setConfirmModal(null);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <User className="text-blue-600 bg-blue-100 p-1.5 rounded-lg" size={32} />
            <span>هەژمار</span>
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">ئیمەیڵ</p>
              <p className="text-lg font-bold text-slate-800" dir="ltr">{user?.email}</p>
            </div>
            {user?.photoURL && (
              <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full border-2 border-slate-200" />
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
          >
            <LogOut size={24} />
            <span>چوونە دەرەوە</span>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <DollarSign className="text-emerald-600 bg-emerald-100 p-1.5 rounded-lg" size={32} />
            <span>ڕێکخستنی دراو</span>
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            نرخی ١٠٠ دۆلار بەرامبەر بە دیناری عێراقی دیاری بکە بۆ هەژمارکردنی دروست لە کاتی فرۆشتن.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">نرخی ١٠٠ دۆلار (بە دینار)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">IQD</span>
              <input
                type="text"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors text-xl font-bold text-left"
                dir="ltr"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-md ${
              isSaved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Save size={24} />
            <span>{isSaved ? 'پاشەکەوت کرا' : 'پاشەکەوتکردن'}</span>
          </button>
        </div>
      </motion.div>

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
