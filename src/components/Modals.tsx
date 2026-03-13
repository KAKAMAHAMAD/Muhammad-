import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, HelpCircle, Info } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'بەڵێ',
  cancelText = 'نەخێر',
  isDanger = true
}: {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isDanger ? <AlertCircle size={24} /> : <HelpCircle size={24} />}
          </div>
          {title && <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>}
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 transition-colors border-l border-slate-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 font-bold transition-colors ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const PromptModal = ({
  isOpen,
  title,
  message,
  defaultValue = '',
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title?: string;
  message: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-6">
          {title && <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>}
          <p className="text-slate-600 mb-4">{message}</p>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-center font-bold text-lg"
            autoFocus
            dir="ltr"
          />
        </div>
        <div className="flex border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 transition-colors border-l border-slate-100"
          >
            پاشگەزبوونەوە
          </button>
          <button
            onClick={() => onConfirm(value)}
            className="flex-1 py-3 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
          >
            پەسەندکردن
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const AlertModal = ({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
            <Info size={24} />
          </div>
          {title && <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>}
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
          >
            باشە
          </button>
        </div>
      </motion.div>
    </div>
  );
};
