import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../store';
import { Package, Users, DollarSign, TrendingUp, AlertCircle, ArrowUpRight, Quote, RefreshCw } from 'lucide-react';
import { formatCurrency, parseKurdishFloat } from '../utils';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const FALLBACK_WISDOM = [
  "ئەگەر دەتەوێت جیهان بگۆڕیت، لە خۆتەوە دەست پێ بکە.",
  "کات بەنرخترین شتە کە مرۆڤ هەیبێت.",
  "ڕێز لە خۆت بگرە، ئەوانی تریش ڕێزت لێ دەگرن.",
  "زانست ڕووناکییە و نەزانی تاریکییە.",
  "هاوڕێی باش وەک ئەستێرە وایە، هەمیشە نایانبینیت بەڵام دەزانیت هەن.",
  "سەرکەوتن کۆتایی نییە، شکستیش کوشندە نییە؛ ئەوەی گرنگە بوێری بەردەوامبوونە.",
  "باشترین ڕێگە بۆ پێشبینیکردنی داهاتوو، دروستکردنیەتی.",
  "ژیان کورتە، بەڵام هونەر درێژخایەنە.",
  "ئەوەی بە دوایدا دەگەڕێیت، ئەویش بە دوای تۆدا دەگەڕێت.",
  "هەموو شتێک کاتی خۆی هەیە، تەنها سەبرت هەبێت.",
  "مرۆڤ بە ئەقڵ گەورەیە نەک بە تەمەن.",
  "باشترین وتە ئەوەیە کە کەم بێت و مانا زۆر بێت.",
  "هەرگیز بێ هیوا مەبە، چونکە کلیلی کۆتایی هەمیشە دەرگاکە دەکاتەوە.",
  "ئەگەر دەتەوێت بفڕیت، دەبێت دەستبەرداری ئەو شتانە بیت کە قورست دەکەن.",
  "ژیان وەک ئاوێنە وایە، ئەگەر پێبکەنیت ئەویش پێتدەکەنێتەوە.",
  "گەورەترین جەنگ، جەنگی مرۆڤە لەگەڵ نەفسی خۆیدا.",
  "ئەزموون باشترین مامۆستایە، بەڵام کرێیەکەی زۆرە.",
  "هەموو کەسێک دەتوانێت قسە بکات، بەڵام هەموو کەسێک ناتوانێت کردار بکات.",
  "ڕاستگۆیی باشترین سیاسەتە.",
  "ئەوەی ئەمڕۆ دەیچێنیت، بەیانی دەیدووریتەوە.",
  "سەرکەوتنی ڕاستەقینە ئەوەیە کە دوای هەر کەوتنێک هەستیتەوە.",
  "ژیان تاقیکردنەوەیە، نەک پێشبڕکێ.",
  "بەخشندەیی نیشانەی دەوڵەمەندی دڵە.",
  "ئەگەر دەتەوێت ڕێزت لێ بگیرێت، ڕێز لە خەڵک بگرە.",
  "خەندە زمانێکە هەموو جیهان تێی دەگات.",
  "کات وەک شمشێر وایە، ئەگەر نەیبڕیت دەتبرێت.",
  "هیچ شتێک مەحاڵ نییە بۆ ئەو کەسەی هەوڵ دەدات.",
  "باشترین هاوڕێ ئەو کەسەیە کە لە کاتی تەنگانەدا لەگەڵت بێت.",
  "ئارامی کلیلی هەموو سەرکەوتنێکە.",
  "هەرگیز مەڵێ ناتوانم، بڵێ هەوڵ دەدەم.",
  "جوانی لە ناوەوەدایە، نەک لە دەرەوە.",
  "ئەقڵ چرای مرۆڤە.",
  "نەزانی گەورەترین دوژمنی مرۆڤە.",
  "هەموو ڕۆژێک دەرفەتێکی نوێیە بۆ فێربوون.",
  "ژیان بە بێ ئامانج وەک کەشتی بێ سوکان وایە.",
  "سەرکەوتن بە ماندووبوون بەدەست دێت."
];

export const Dashboard = () => {
  const { products, customers, transactions } = useStore();
  const [wisdom, setWisdom] = useState(FALLBACK_WISDOM[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const fetchWisdom = async () => {
    setIsRefreshing(true);
    try {
      // Use Gemini for truly infinite and unique wisdom
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const randomTopics = ["ژیان", "سەرکەوتن", "هیوا", "ئارامگرتن", "خۆشەویستی", "هاوڕێیەتی", "کات", "ئەزموون", "زانست", "دڵسۆزی", "کارکردن", "ئامانج", "بوێری", "ڕاستگۆیی", "بەخشندەیی", "خێزان", "سروشت", "ئەقڵ", "دڵ", "بڕوا"];
      const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `بۆم بنووسە وتەیەکی جوان یان حیکەمەتێکی قووڵ و مانادار بە زمانی کوردی (سۆرانی) دەربارەی (${randomTopic}). تەنها وتەکە بنووسە بە بێ هیچ دەقێکی زیادە و بە بێ نیشانەی وتە ("). با وتەکە کورت و کاریگەر بێت و جیاواز بێت لەوانەی پێشوو.`,
        config: {
          temperature: 0.9,
        }
      });
      
      const generatedWisdom = response.text?.trim();
      
      if (generatedWisdom && !history.includes(generatedWisdom)) {
        setWisdom(generatedWisdom);
        setHistory(prev => [generatedWisdom, ...prev].slice(0, 100));
        setIsRefreshing(false);
        return;
      }
      throw new Error('Fallback to static');
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback to static list if AI fails
      let nextWisdom;
      let attempts = 0;
      do {
        nextWisdom = FALLBACK_WISDOM[Math.floor(Math.random() * FALLBACK_WISDOM.length)];
        attempts++;
      } while (history.includes(nextWisdom) && attempts < 50);

      setWisdom(nextWisdom);
      setHistory(prev => [nextWisdom, ...prev].slice(0, 100));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWisdom();
  }, []);

  const stats = useMemo(() => {
    const activeTransactions = transactions.filter((t) => !t.deletedAt);
    
    let totalSales = 0;
    let totalReturns = 0;
    let totalDebt = 0;
    let todaySales = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    activeTransactions.forEach((t) => {
      if (t.type === 'SALE') {
        totalSales += t.amount || 0;
        totalDebt += (t.amount || 0) - (t.paidAmount || 0);
        
        if (t.createdAt >= today.getTime()) {
          todaySales += t.amount || 0;
        }
      } else if (t.type === 'RETURN') {
        totalReturns += t.amount || 0;
        totalDebt -= t.amount || 0;
        
        if (t.createdAt >= today.getTime()) {
          todaySales -= t.amount || 0;
        }
      } else if (t.type === 'PAYMENT') {
        totalDebt -= t.amount || 0;
      }
    });

    return {
      totalProducts: products.length,
      lowStock: products.filter((p) => parseKurdishFloat(p.quantity) <= 5).length,
      totalCustomers: customers.length,
      totalSales,
      totalReturns,
      totalDebt,
      todaySales,
    };
  }, [products, customers, transactions]);

  const cards = [
    {
      title: 'فرۆشتنی ئەمڕۆ',
      value: formatCurrency(stats.todaySales),
      icon: <TrendingUp size={24} className="text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'کۆی قەرزەکان',
      value: formatCurrency(stats.totalDebt),
      icon: <AlertCircle size={24} className="text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      title: 'کۆی فرۆشتنەکان',
      value: formatCurrency(stats.totalSales),
      icon: <DollarSign size={24} className="text-indigo-600" />,
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
    {
      title: 'کۆی کاڵاکان',
      value: stats.totalProducts.toString(),
      icon: <Package size={24} className="text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote size={120} />
        </div>
        <div className="relative z-10">
          <div className="text-indigo-100 text-sm font-medium mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Quote size={16} />
              <span>حیکەمەت و وتەی جوان</span>
            </div>
            <button 
              onClick={fetchWisdom}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-indigo-200 text-xs bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
              <span>گۆڕین</span>
            </button>
          </div>
          <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
            <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
              "{wisdom}"
            </h2>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className={`p-6 rounded-3xl border shadow-sm ${card.bg} ${card.border} flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                {card.icon}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">{card.title}</div>
              <div className="text-2xl font-black text-slate-800" dir="ltr">{card.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={24} />
            <span>کاڵا کەمبووەکان</span>
          </h3>
          
          {stats.lowStock > 0 ? (
            <div className="space-y-4">
              {products
                .filter((p) => parseKurdishFloat(p.quantity) <= 5)
                .slice(0, 5)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500">کۆد: {p.code}</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">ماوە</div>
                      <div className="font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg">{p.quantity}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              هیچ کاڵایەک کەم نەبووەتەوە
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={24} />
            <span>دوایین فرۆشتنەکان</span>
          </h3>
          
          <div className="space-y-4">
            {transactions
              .filter((t) => t.type === 'SALE' && !t.deletedAt)
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 5)
              .map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">
                        {t.customerId ? customers.find(c => c.id === t.customerId)?.name || 'نەناسراو' : 'کڕیاری گشتی'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(t.createdAt).toLocaleTimeString('ku-IQ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-slate-800" dir="ltr">{formatCurrency(t.amount || 0)}</div>
                    <div className="text-xs text-slate-500">{t.items?.length || 0} کاڵا</div>
                  </div>
                </div>
              ))}
            {transactions.filter((t) => t.type === 'SALE' && !t.deletedAt).length === 0 && (
              <div className="text-center py-12 text-slate-400">
                هیچ فرۆشتنێک نییە
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
