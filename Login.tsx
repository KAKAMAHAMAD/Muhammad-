import React, { useState } from 'react';
import { useStore } from '../store';
import { LogIn, ShoppingCart, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const { loginWithGoogle } = useStore();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.message?.includes('auth/unauthorized-domain') || err?.code === 'auth/unauthorized-domain') {
        setError('unauthorized-domain');
      } else {
        setError(err?.message || 'هەڵەیەک ڕوویدا لە کاتی چوونە ژوورەوە');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-emerald-600" size={40} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">بەخێربێیت</h1>
            <p className="text-slate-500">تکایە بە ئەکاونتی گوگڵەکەت بچۆرە ژوورەوە بۆ بەکارهێنانی سیستەمەکە</p>
          </div>

          {error === 'unauthorized-domain' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-right border border-red-200">
              <div className="flex items-center gap-2 mb-2 font-bold">
                <AlertCircle size={18} />
                <span>پێویستە دۆمەینەکە زیاد بکەیت!</span>
              </div>
              <p className="mb-2">بۆ چارەسەرکردنی ئەم کێشەیە، بڕۆ بۆ فایەربەیس (Firebase Console) و ئەم دۆمەینانە زیاد بکە لە بەشی <strong>Authentication &gt; Settings &gt; Authorized domains</strong>:</p>
              <ul className="list-disc list-inside font-mono text-xs text-left space-y-1 bg-white p-2 rounded border border-red-100 mt-2 select-all">
                <li>ais-dev-mkejsvgermvsigkij7t6v5-136278195383.europe-west3.run.app</li>
                <li>ais-pre-mkejsvgermvsigkij7t6v5-136278195383.europe-west3.run.app</li>
              </ul>
            </div>
          )}

          {error && error !== 'unauthorized-domain' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm text-right border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 font-bold py-4 px-6 rounded-xl transition-all group mt-8"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-lg">چوونە ژوورەوە بە گوگڵ</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
