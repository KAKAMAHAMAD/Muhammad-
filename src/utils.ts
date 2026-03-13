export const normalizeNumber = (str: string | number): string => {
  if (str === undefined || str === null) return '';
  const s = str.toString();
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let result = s;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(arabicNumbers[i], i.toString());
    result = result.replaceAll(persianNumbers[i], i.toString());
  }
  return result;
};

export const parseKurdishFloat = (str: string | number): number => {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  
  const normalized = normalizeNumber(str).replace(/,/g, '.');
  const match = normalized.match(/-?\d+(\.\d+)?/);
  
  if (!match) return 0;

  let parsed = parseFloat(match[0]);
  
  if (normalized.includes('هەزار') || normalized.toLowerCase().includes('k')) {
    parsed *= 1000;
  } else if (normalized.includes('ملیۆن') || normalized.toLowerCase().includes('m')) {
    parsed *= 1000000;
  }
  
  return isNaN(parsed) ? 0 : parsed;
};

export const updateQuantityString = (qtyStr: string | number, amount: number): string => {
  const str = qtyStr?.toString() || '';
  if (!str) return amount.toString();
  
  const regex = /[-]?[\d٠-٩۰-۹]+([.,][\d٠-٩۰-۹]+)?/;
  const match = str.match(regex);
  
  if (match) {
    const currentNum = parseKurdishFloat(match[0]);
    const newNum = currentNum + amount;
    return str.replace(match[0], newNum.toString());
  }
  
  return amount.toString();
};

export const formatCurrency = (amount: number | string, currency: 'USD' | 'IQD' = 'USD'): string => {
  const num = typeof amount === 'string' ? parseKurdishFloat(amount) : amount;
  if (currency === 'IQD') {
    return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', maximumFractionDigits: 0 }).format(num);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export const compressImage = (file: File, maxWidth = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const removeUndefined = <T extends Record<string, any>>(obj: T): T => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};
