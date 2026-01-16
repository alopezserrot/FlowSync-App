
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Restaurant, Order, User } from '../types';

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
);

export const SuperAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      
      const unsubRestaurants = onSnapshot(collection(db, "restaurants"), (snapshot) => {
        const restaurantList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Restaurant);
        setRestaurants(restaurantList);
      });

      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
      const unsubOrders = onSnapshot(q, (snapshot) => {
        const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
        setRecentOrders(ordersList);
      });

      const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
        setUsers(usersList);
      });
      
      // Set initial loading state to false after first fetch
      Promise.all([
          getDocs(collection(db, "restaurants")),
          getDocs(q),
          getDocs(collection(db, "users")),
      ]).then(() => setIsLoading(false)).catch(() => setIsLoading(false));

      return () => {
        unsubRestaurants();
        unsubOrders();
        unsubUsers();
      };
    };

    fetchAllData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>{t('loading')}</p></div>;
  }

  const totalRevenue = recentOrders.reduce((acc, order) => acc + order.total, 0);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{t('superadmin_dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('total_restaurants')} value={restaurants.length} />
        <StatCard title={t('total_orders')} value={recentOrders.length} />
        <StatCard title={t('total_users')} value={users.length} />
        <StatCard title={t('total_revenue')} value={`$${totalRevenue.toFixed(2)}`} />
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">{t('admin_tools')}</h2>
        <div className="flex space-x-4">
            <Link to="/seed-database" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                {t('manage_database')}
            </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">{t('recent_orders')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('order_id')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('restaurant')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {recentOrders.map(order => {
                  const restaurantName = restaurants.find(r => r.id === order.restaurantId)?.name || 'N/A';
                  return (
                    <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{restaurantName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                {t(order.status.toLowerCase())}
                            </span>
                        </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
