
import React from 'react';
import { User, UserRole, CartItem, Order } from '../types';
import { ShoppingCartIcon, UserIcon } from './Shared';
import { useLanguage } from '../i18nContext';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onAdminLogin: () => void;
  onExitToGuestView: () => void;
  cart: CartItem[];
  onNavigate: (view: 'home' | 'vendorDashboard' | 'superAdminDashboard' | 'orderStatus') => void;
  onCartToggle: () => void;
  onFindOrder: () => void;
  activeOrderCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onAdminLogin, onExitToGuestView, cart, onNavigate, onCartToggle, onFindOrder, activeOrderCount }) => {
  const { t, language, setLanguage } = useLanguage();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const getDashboardView = () => {
    if (!currentUser) return 'home';
    if (currentUser.role === UserRole.Vendor || currentUser.role === UserRole.RestaurantAdmin) return 'vendorDashboard';
    if (currentUser.role === UserRole.SuperAdmin) return 'superAdminDashboard';
    return 'home';
  }
  
  const isGuest = currentUser?.role === UserRole.Consumer;

  const toggleLanguage = () => {
      setLanguage(language === 'en' ? 'es' : 'en');
  }

  return (
    <header className="bg-secondary text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex flex-col sm:flex-row sm:items-end cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <span className="text-2xl font-bold text-primary leading-none group-hover:text-accent transition-colors">FlowApp</span>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 sm:ml-2 sm:mb-1 group-hover:text-white transition-colors">by FlowSync</span>
          </div>
          <div className="flex items-center space-x-4">
            
            {/* Language Switcher */}
            <button 
                onClick={toggleLanguage}
                className="px-2 py-1 rounded border border-gray-500 text-xs font-bold hover:bg-white hover:text-secondary transition-colors"
            >
                {language === 'en' ? 'ES' : 'EN'}
            </button>

            {currentUser && !isGuest && (
              <button
                onClick={() => onNavigate(getDashboardView())}
                className="px-3 py-2 text-sm font-medium rounded-md hover:bg-primary/20 transition-colors"
              >
                {t('dashboard')}
              </button>
            )}

            {currentUser && !isGuest ? (
                <div className="flex items-center space-x-4">
                    <button onClick={onExitToGuestView} className="text-sm font-medium hover:text-primary transition-colors">{t('exit_guest')}</button>
                    <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1.5 rounded-md">
                        <UserIcon className="w-5 h-5 text-accent"/>
                        <span className="text-sm font-medium">{currentUser.name}</span>
                    </div>
                    <button onClick={onLogout} className="text-sm font-medium hover:text-primary transition-colors">{t('logout')}</button>
                </div>
            ) : (
                 <div className="flex items-center space-x-4">
                    {activeOrderCount > 0 && (
                       <button
                        onClick={() => onNavigate('orderStatus')}
                        className="px-3 py-2 text-sm font-medium rounded-md bg-primary/80 hover:bg-primary transition-colors flex items-center space-x-2"
                      >
                        <span>{t('follow_orders')}</span>
                        <span className="bg-white text-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{activeOrderCount}</span>
                      </button>
                    )}
                    <button onClick={onCartToggle} className="relative p-2 rounded-full hover:bg-primary/20 transition-colors" aria-label={`Shopping cart with ${cartItemCount} items`}>
                      <ShoppingCartIcon className="w-6 h-6"/>
                      {cartItemCount > 0 && (
                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center" aria-hidden="true">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                    <button onClick={onFindOrder} className="text-sm font-medium hover:text-primary transition-colors">{t('find_order')}</button>
                    <button onClick={onAdminLogin} className="text-sm font-medium bg-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-600 transition-colors">{t('admin_login')}</button>
                 </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
