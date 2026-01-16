
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18nContext';
import { collection, onSnapshot, doc, getDoc, query, where } from "firebase/firestore";

import Header from './components/Header';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RestaurantPage } from './components/RestaurantPage';
import { VendorDashboard } from './components/VendorDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ConsumerOrderPage } from './components/ConsumerOrderPage';
import { CheckoutPage } from './components/CheckoutPage';
import { DatabaseSeeder } from './components/DatabaseSeeder';
import { ProtectedRoute } from './components/ProtectedRoute';

import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Restaurant, Order, UserRole, CartItem } from './types';

const App: React.FC = () => {
    return (
        <I18nextProvider i18n={i18n}>
            <Router>
                <MainApp />
            </Router>
        </I18nextProvider>
    );
};

const MainApp: React.FC = () => {
    const { t } = useTranslation();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const role = userDoc.data().role as UserRole;
                    setUserRole(role);
                    if (location.pathname === '/login') {
                        if (role === 'superadmin') navigate('/superadmin-dashboard');
                        else if (role === 'vendor' || role === 'restaurant_admin') navigate('/vendor-dashboard');
                    }
                }
            } else {
                setUserRole(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [navigate, location.pathname]);

    useEffect(() => {
        const q = query(collection(db, "restaurants"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const restaurantList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Restaurant);
            setRestaurants(restaurantList);
        });
        return () => unsubscribe();
    }, []);

     useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Order);
            setOrders(ordersList);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'rejected');

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">{t('loading')}</div>;
    }

    return (
        <div className="antialiased text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen">
            <Header 
                currentUser={currentUser} 
                userRole={userRole} 
                cart={cart} 
                activeOrderCount={activeOrders.length} 
            />
            <main className="p-4">
                <Routes>
                    <Route path="/" element={<HomePage restaurants={restaurants} />} />
                    <Route path="/restaurant/:id" element={<RestaurantPage restaurants={restaurants} cart={cart} setCart={setCart} />} />
                    <Route path="/order/:id" element={<ConsumerOrderPage />} />
                    <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
                    
                    <Route path="/login" element={<LoginPage />} />

                    <Route 
                        path="/vendor-dashboard" 
                        element={
                            <ProtectedRoute user={currentUser} role={userRole} allowedRoles={['vendor', 'restaurant_admin', 'superadmin']}>
                                <VendorDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/superadmin-dashboard" 
                        element={
                            <ProtectedRoute user={currentUser} role={userRole} allowedRoles={['superadmin']}>
                                <SuperAdminDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="/seed-database" element={<DatabaseSeeder />} />
                </Routes>
            </main>
        </div>
    );
};

export default App;
