
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, where, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Order, User } from '../types';

interface VendorDashboardProps {
  currentUser: User;
}

// Correct status list as derived from the project context
const STATUSES = ['pending', 'accepted', 'in-progress', 'ready-for-pickup', 'completed', 'rejected'];

// Helper to get the correct translation key for a status
const getStatusTranslationKey = (status: string) => {
    return `status_${status.replace('-', '_')}`;
};

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const restaurantIds = currentUser.linkedRestaurantIds || [];

  useEffect(() => {
    if (restaurantIds.length === 0) {
        setIsLoading(false);
        return;
    }

    const q = query(collection(db, "orders"), where("restaurantId", "in", restaurantIds));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => {
        const data = doc.data();
        // Correctly convert Firestore Timestamps to JS Dates
        return {
            id: doc.id,
            ...data,
            orderTime: (data.orderTime as Timestamp).toDate(),
            lastUpdateTime: (data.lastUpdateTime as Timestamp).toDate(),
        } as Order;
      });
      
      // Sort by the correct date property
      setOrders(ordersList.sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime()));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantIds]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, { status, lastUpdateTime: new Date() });
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'border-yellow-500';
        case 'accepted': return 'border-blue-400';
        case 'in-progress': return 'border-blue-600';
        case 'ready-for-pickup': return 'border-green-500';
        case 'completed': return 'border-gray-500';
        case 'rejected': return 'border-red-500';
        default: return 'border-gray-300';
    }
  };

  if (isLoading) {
    return <div className="text-center p-10">{t('loading')}</div>;
  }
  
  if (restaurantIds.length === 0) {
      return <div className="text-center p-10">{t('no_restaurant_linked')}</div>
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{t('dashboard')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map(order => (
            <div key={order.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border-l-4 ${getStatusColor(order.status)} p-6 flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{t('order_id')} #{order.id.substring(0, 5)}</h2>
                    {/* Display using the correct 'orderTime' property */}
                    <span className="text-sm text-gray-500">{order.orderTime.toLocaleTimeString()}</span>
                </div>
                <div className="mb-4 flex-grow">
                    {/* Use existing data like customerPhoneNumber */}
                    {order.customerPhoneNumber && <p><strong>{t('phone')}:</strong> {order.customerPhoneNumber}</p>}
                    <ul className="space-y-1 text-sm mt-2">
                        {order.items.map(item => (
                            <li key={item.cartItemId}>{item.name} x {item.quantity}</li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4 font-bold flex justify-between">
                    <span>{t('total')}</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="mt-4">
                    <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        {STATUSES.map(status => (
                            <option key={status} value={status}>{t(getStatusTranslationKey(status))}</option>
                        ))}
                    </select>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
};
