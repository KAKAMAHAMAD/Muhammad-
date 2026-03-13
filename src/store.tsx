import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Transaction, CartItem } from './types';
import { updateQuantityString, parseKurdishFloat, removeUndefined } from './utils';
import { db, auth, googleProvider } from './firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

type AppState = {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  exchangeRate: number;
  cart: CartItem[];
  selectedCustomerId: string | null;
  isLoaded: boolean;
  user: User | null;
  isAuthReady: boolean;
};

type AppContextType = AppState & {
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, quantity: number, isWholesale: boolean) => void;
  clearCart: () => void;
  setSelectedCustomerId: (id: string | null) => void;
  setExchangeRate: (rate: number) => Promise<void>;
  setProducts: (products: Product[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  checkout: (paidAmount: number, note?: string) => Promise<string | undefined>;
  returnItem: (transactionId: string, productId: string, quantity: number) => Promise<void>;
  receivePayment: (customerId: string, amount: number, note?: string) => Promise<void>;
  undoTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    products: [],
    customers: [],
    transactions: [],
    exchangeRate: 1500,
    cart: [],
    selectedCustomerId: null,
    isLoaded: false,
    user: null,
    isAuthReady: false,
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setState(prev => ({ ...prev, user, isAuthReady: true }));
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!state.user) {
      setState(prev => ({
        ...prev,
        products: [],
        customers: [],
        transactions: [],
        isLoaded: false
      }));
      return;
    }

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setState(prev => ({ ...prev, products }));
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setState(prev => ({ ...prev, customers }));
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setState(prev => ({ ...prev, transactions }));
    });

    const settingsRef = doc(db, 'settings', 'general');
    const unsubSettings = onSnapshot(settingsRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setState(prev => ({ ...prev, exchangeRate: docSnapshot.data().exchangeRate || 1500 }));
      } else {
        setDoc(settingsRef, { exchangeRate: 1500 });
      }
    });

    // Mark as loaded after initial fetch
    setState(prev => ({ ...prev, isLoaded: true }));

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubTransactions();
      unsubSettings();
    };
  }, [state.user]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newDocRef = doc(collection(db, 'products'));
    const newProduct = removeUndefined({ ...product, id: newDocRef.id, createdAt: Date.now() });
    
    const transactionRef = doc(collection(db, 'transactions'));
    const newTransaction = removeUndefined({
      id: transactionRef.id,
      type: 'ADD_PRODUCT',
      items: [{ productId: newProduct.id, quantity: parseKurdishFloat(newProduct.quantity), price: 0, isWholesale: false }],
      currency: 'USD',
      exchangeRate: state.exchangeRate,
      createdAt: Date.now(),
    });

    const batch = writeBatch(db);
    batch.set(newDocRef, newProduct);
    batch.set(transactionRef, newTransaction);
    await batch.commit();
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), removeUndefined(product));
  };

  const deleteProduct = async (id: string) => {
    const transactionRef = doc(collection(db, 'transactions'));
    const newTransaction = removeUndefined({
      id: transactionRef.id,
      type: 'DELETE_PRODUCT',
      items: [{ productId: id, quantity: 0, price: 0, isWholesale: false }],
      currency: 'USD',
      exchangeRate: state.exchangeRate,
      createdAt: Date.now(),
    });

    const batch = writeBatch(db);
    batch.delete(doc(db, 'products', id));
    batch.set(transactionRef, newTransaction);
    await batch.commit();
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newDocRef = doc(collection(db, 'customers'));
    const newCustomer = removeUndefined({ ...customer, id: newDocRef.id, createdAt: Date.now() });
    await setDoc(newDocRef, newCustomer);
    return newCustomer.id;
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    await updateDoc(doc(db, 'customers', id), removeUndefined(customer));
  };

  const deleteCustomer = async (id: string) => {
    await deleteDoc(doc(db, 'customers', id));
  };

  const addToCart = (item: CartItem) => {
    setState((prev) => {
      const existing = prev.cart.find((c) => c.product.id === item.product.id);
      const maxQuantity = parseKurdishFloat(item.product.quantity);
      
      if (existing) {
        const newQuantity = Math.min(existing.quantity + item.quantity, maxQuantity);
        return {
          ...prev,
          cart: prev.cart.map((c) =>
            c.product.id === item.product.id
              ? { ...c, quantity: newQuantity, isWholesale: item.isWholesale }
              : c
          ),
        };
      }
      
      const initialQuantity = Math.min(item.quantity, maxQuantity);
      if (initialQuantity <= 0) return prev;
      
      return { ...prev, cart: [...prev.cart, { ...item, quantity: initialQuantity }] };
    });
  };

  const removeFromCart = (productId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((c) => c.product.id !== productId),
    }));
  };

  const updateCartItem = (productId: string, quantity: number, isWholesale: boolean) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((c) =>
        c.product.id === productId ? { ...c, quantity, isWholesale } : c
      ),
    }));
  };

  const clearCart = () => {
    setState((prev) => ({ ...prev, cart: [] }));
  };

  const setSelectedCustomerId = (id: string | null) => {
    setState((prev) => ({ ...prev, selectedCustomerId: id }));
  };

  const setExchangeRate = async (rate: number) => {
    await setDoc(doc(db, 'settings', 'general'), { exchangeRate: rate }, { merge: true });
  };

  const setProducts = (products: Product[]) => {
    setState((prev) => ({ ...prev, products }));
  };

  const setCustomers = (customers: Customer[]) => {
    setState((prev) => ({ ...prev, customers }));
  };

  const setTransactions = (transactions: Transaction[]) => {
    setState((prev) => ({ ...prev, transactions }));
  };

  const checkout = async (paidAmount: number, note?: string) => {
    if (state.cart.length === 0) return undefined;

    const totalAmount = state.cart.reduce(
      (sum, item) => {
        let price = parseKurdishFloat(item.isWholesale ? item.product.wholesalePrice : item.product.retailPrice);
        if (item.product.currency === 'IQD') {
          price = price / state.exchangeRate;
        }
        return sum + price * item.quantity;
      },
      0
    );

    const transactionRef = doc(collection(db, 'transactions'));
    const transactionId = transactionRef.id;

    const transaction = removeUndefined({
      id: transactionId,
      type: 'SALE',
      customerId: state.selectedCustomerId || undefined,
      items: state.cart.map((item) => {
        let price = parseKurdishFloat(item.isWholesale ? item.product.wholesalePrice : item.product.retailPrice);
        if (item.product.currency === 'IQD') {
          price = price / state.exchangeRate;
        }
        return {
          productId: item.product.id,
          quantity: item.quantity,
          price: price,
          isWholesale: item.isWholesale,
        };
      }),
      amount: totalAmount,
      paidAmount: paidAmount,
      currency: 'USD',
      exchangeRate: state.exchangeRate,
      note,
      createdAt: Date.now(),
    });

    const batch = writeBatch(db);
    batch.set(transactionRef, transaction);

    // Update product quantities
    state.cart.forEach((item) => {
      const productRef = doc(db, 'products', item.product.id);
      batch.update(productRef, {
        quantity: updateQuantityString(item.product.quantity, -item.quantity)
      });
    });

    await batch.commit();
    clearCart();
    return transactionId;
  };

  const returnItem = async (transactionId: string, productId: string, quantity: number) => {
    const originalTransaction = state.transactions.find((t) => t.id === transactionId);
    if (!originalTransaction || originalTransaction.type !== 'SALE') return;

    const originalItem = originalTransaction.items?.find((i) => i.productId === productId);
    if (!originalItem) return;

    const returnTransactionRef = doc(collection(db, 'transactions'));
    const returnTransaction = removeUndefined({
      id: returnTransactionRef.id,
      type: 'RETURN',
      customerId: originalTransaction.customerId,
      originalTransactionId: transactionId,
      items: [
        {
          productId,
          quantity,
          price: originalItem.price,
          isWholesale: originalItem.isWholesale,
        },
      ],
      amount: originalItem.price * quantity,
      currency: 'USD',
      exchangeRate: state.exchangeRate,
      createdAt: Date.now(),
    });

    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const batch = writeBatch(db);
    batch.set(returnTransactionRef, returnTransaction);
    
    const productRef = doc(db, 'products', productId);
    batch.update(productRef, {
      quantity: updateQuantityString(product.quantity, quantity)
    });

    await batch.commit();
  };

  const receivePayment = async (customerId: string, amount: number, note?: string) => {
    const transactionRef = doc(collection(db, 'transactions'));
    const transaction = removeUndefined({
      id: transactionRef.id,
      type: 'PAYMENT',
      customerId,
      amount,
      currency: 'USD',
      exchangeRate: state.exchangeRate,
      note,
      createdAt: Date.now(),
    });

    await setDoc(transactionRef, transaction);
  };

  const undoTransaction = async (id: string) => {
    const transaction = state.transactions.find((t) => t.id === id);
    if (!transaction || transaction.deletedAt) return;

    const batch = writeBatch(db);
    
    // Reverse product quantities if it was a SALE or RETURN
    if (transaction.type === 'SALE') {
      transaction.items?.forEach((item) => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(db, 'products', item.productId);
          batch.update(productRef, {
            quantity: updateQuantityString(product.quantity, item.quantity)
          });
        }
      });
    } else if (transaction.type === 'RETURN') {
      transaction.items?.forEach((item) => {
        const product = state.products.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(db, 'products', item.productId);
          batch.update(productRef, {
            quantity: updateQuantityString(product.quantity, -item.quantity)
          });
        }
      });
    }

    const transactionRef = doc(db, 'transactions', id);
    batch.update(transactionRef, { deletedAt: Date.now() });

    await batch.commit();
  };

  const deleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, 'transactions', id));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        setSelectedCustomerId,
        setExchangeRate,
        setProducts,
        setCustomers,
        setTransactions,
        checkout,
        returnItem,
        receivePayment,
        undoTransaction,
        deleteTransaction,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
