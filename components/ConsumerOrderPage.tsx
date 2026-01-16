
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, onSnapshot } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Order, OrderStatus } from '../types';

export const ConsumerOrderPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError(t('no_order_id'));
      setIsLoading(false);
      return;
    }

    const orderRef = doc(db, "orders", id);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      } else {
        setError(t('order_not_found'));
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [id, t]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-yellow-500';
      case OrderStatus.Preparing: return 'bg-blue-500';
      case OrderStatus.Ready: return 'bg-green-500';
      case OrderStatus.Completed: return 'bg-gray-500';
      case OrderStatus.Rejected: return 'bg-red-500';
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
    return null; // Should be handled by error state
  }

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-2xl text-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t('order_status')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('order_id')}: {order.id}</p>

            <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg ${getStatusColor(order.status)}`}>
                {t(order.status.toLowerCase())}
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
        </div>
    </div>
  );
};
