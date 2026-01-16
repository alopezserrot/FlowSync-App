
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { UserRole, CartItem } from '../types';
import { ShoppingCartIcon, UserIcon } from './Shared';

interface HeaderProps {
  currentUser: User | null;
  userRole: UserRole | null;
  cart: CartItem[];
  activeOrderCount: number; 
}

const Header: React.FC<HeaderProps> = ({ currentUser, userRole, cart, activeOrderCount }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (userRole === 'superadmin') return '/superadmin-dashboard';
    if (userRole === 'vendor' || userRole === 'restaurant_admin') return '/vendor-dashboard';
    return '/';
  };
  
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
  };

  return (
    <header className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex flex-col sm:flex-row sm:items-end cursor-pointer group">
            <span className="text-2xl font-bold text-blue-400 leading-none group-hover:text-blue-300 transition-colors">FlowApp</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button 
                onClick={toggleLanguage}
                className="px-2 py-1 rounded border border-gray-500 text-xs font-bold hover:bg-white hover:text-gray-800 transition-colors"
            >
                {i18n.language === 'en' ? 'ES' : 'EN'}
            </button>

            {currentUser && userRole && userRole !== 'consumer' ? (
              // Logged-in Admin/Vendor View
              <div className="flex items-center space-x-4">
                <Link to={getDashboardPath()} className="px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">
                  {t('dashboard')}
                </Link>
                <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1.5 rounded-md">
                  <UserIcon className="w-5 h-5 text-blue-400"/>
                  <span className="text-sm font-medium">{currentUser.displayName || currentUser.email || 'Admin'}</span>
                </div>
                <button onClick={handleLogout} className="text-sm font-medium hover:text-blue-300 transition-colors">{t('logout')}</button>
              </div>
            ) : (
              // Guest/Consumer View
              <div className="flex items-center space-x-4">
                 {activeOrderCount > 0 && (
                   <Link
                    to="/order-status"
                    className="px-3 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-500 transition-colors flex items-center space-x-2"
                  >
                    <span>{t('follow_orders')}</span>
                    <span className="bg-white text-blue-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeOrderCount}</span>
                  </Link>
                )}
                <Link to="/checkout" className="relative p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label={`Shopping cart with ${cartItemCount} items`}>
                  <ShoppingCartIcon className="w-6 h-6"/>
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center" aria-hidden="true">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="text-sm font-medium bg-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-600 transition-colors">
                  {t('admin_login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
