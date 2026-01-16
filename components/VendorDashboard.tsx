
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Order, OrderStatus, User } from '../types';

interface VendorDashboardProps {
  currentUser: User;
}

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
      const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantIds]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await updateDoc(orderRef, { status, updatedAt: new Date() });
    } catch (error) {
      console.error("Error updating order status: ", error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.Pending: return 'border-yellow-500';
        case OrderStatus.Preparing: return 'border-blue-500';
        case OrderStatus.Ready: return 'border-green-500';
        case OrderStatus.Completed: return 'border-gray-500';
        case OrderStatus.Rejected: return 'border-red-500';
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
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{t('vendor_dashboard')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.map(order => (
            <div key={order.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-md border-l-4 ${getStatusColor(order.status)} p-6`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{t('order')} #{order.id.substring(0, 5)}</h2>
                    <span className="text-sm text-gray-500">{new Date(order.createdAt.seconds * 1000).toLocaleTimeString()}</span>
                </div>
                <div className="mb-4">
                    <p><strong>{t('customer')}:</strong> {order.customerName}</p>
                    <p><strong>{t('table')}:</strong> {order.tableNumber}</p>
                </div>
                <ul className="space-y-1 text-sm mb-4">
                    {order.items.map(item => (
                        <li key={item.cartItemId}>{item.name} x {item.quantity}</li>
                    ))}
                </ul>
                <div className="border-t pt-4 font-bold flex justify-between">
                    <span>{t('total')}</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="mt-4">
                    <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="w-full p-2 border rounded-md bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{t(status.toLowerCase())}</option>
                        ))}
                    </select>
                </div>
            </div>
        ))}
        </div>
    </div>
  );
};
