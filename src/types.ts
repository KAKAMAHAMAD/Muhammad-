export type Product = {
  id: string;
  code: string;
  name: string;
  quantity: string;
  retailPrice: string;
  wholesalePrice: string;
  currency?: 'USD' | 'IQD';
  image: string;
  locationNote: string;
  locationImage: string;
  createdAt: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
};

export type TransactionType = 'SALE' | 'RETURN' | 'PAYMENT' | 'ADD_PRODUCT' | 'DELETE_PRODUCT';

export type TransactionItem = {
  productId: string;
  quantity: number;
  price: number;
  isWholesale: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  customerId?: string;
  items?: TransactionItem[];
  amount?: number; // Total amount for SALE/RETURN, Paid amount for PAYMENT
  paidAmount?: number; // How much was paid at the time of SALE
  currency: 'USD' | 'IQD';
  exchangeRate: number;
  note?: string;
  createdAt: number;
  deletedAt?: number;
  originalTransactionId?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  isWholesale: boolean;
};
