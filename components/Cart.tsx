
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartItem } from '../types';
import { XIcon } from './Shared';

interface CartProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Cart: React.FC<CartProps> = ({ cart, setCart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 w-full max-w-4xl mx-auto mt-10 animate-fade-in">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('your_order')}</h2>
          <button onClick={() => navigate('/')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-gray-600 dark:text-gray-400"/>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">{t('empty_cart')}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {cart.map(item => (
              <div key={item.cartItemId} className="flex items-center space-x-4 py-4">
                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-md object-cover flex-shrink-0"/>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)}</p>
                  {item.removedIngredients && item.removedIngredients.length > 0 && (
                      <p className="text-xs text-red-500">No: {item.removedIngredients.join(', ')}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.cartItemId, parseInt(e.target.value))}
                    className="w-20 p-2 border rounded-md text-center bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                  <button onClick={() => handleRemoveItem(item.cartItemId)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                    <XIcon className="w-5 h-5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between font-bold text-lg text-slate-800 dark:text-slate-100">
              <span>{t('subtotal')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              {t('go_to_checkout')}
            </button>
          </div>
        )}
    </div>
  );
};
