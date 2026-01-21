
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Order } from '../types';

interface ConsumerOrderPageProps {
  order: Order | null;
  setCurrentView: (view: string) => void;
}

// Helper to get the correct translation key for a status
const getStatusTranslationKey = (status: string) => {
    return `status_${status.replace('-', '_')}`;
};

export const ConsumerOrderPage: React.FC<ConsumerOrderPageProps> = ({ order: initialOrder, setCurrentView }) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialOrder?.id) {
      setError(t('no_order_id'));
      return;
    }

    setIsLoading(true);
    const orderRef = doc(db, "orders", initialOrder.id);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Convert Timestamps to Dates
        setOrder({
            id: doc.id,
            ...data,
            orderTime: (data.orderTime as Timestamp).toDate(),
            lastUpdateTime: (data.lastUpdateTime as Timestamp).toDate(),
        } as Order);
      } else {
        setError(t('order_not_found'));
        setOrder(null); // Clear order data if not found
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [initialOrder?.id, t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-400';
      case 'in-progress': return 'bg-blue-600';
      case 'ready-for-pickup': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">{t('loading')}</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!order) {
    return (
        <div className="text-center p-10">
            <p>{t('order_not_found')}</p>
            <button onClick={() => setCurrentView('home')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
                {t('back_to_menu')}
            </button>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('order_status')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('order_id')}: #{order.id.substring(0,5)}</p>

            <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${getStatusColor(order.status)}`}>
                {t(getStatusTranslationKey(order.status))}
            </div>

            <div className="mt-8 text-left">
                <h2 className="font-bold text-xl mb-4">{t('order_summary')}</h2>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map(item => (
                        <li key={item.cartItemId} className="py-2 flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t mt-4 pt-4 font-bold text-lg flex justify-between">
                    <span>{t('total')}</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>
             <button onClick={() => setCurrentView('home')} className="mt-8 bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-6 py-2 rounded-lg">
                {t('back_to_restaurants')}
            </button>
        </div>
    </div>
  );
};
