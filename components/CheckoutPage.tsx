
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/firebaseService';
import { CartItem, PaymentMethod } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCurrentView: (view: string) => void;
  setLastOrder: (order: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, setCart, setCurrentView, setLastOrder }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const restaurantId = cart[0].restaurantId;
      
      // Create the order using the centralized service function
      const newOrder = await createOrder({
        restaurantId,
        items: cart,
        total,
        customerPhoneNumber,
        paymentMethod,
      });

      setCart([]);
      setLastOrder(newOrder);
      // Navigate to a generic order status view
      setCurrentView('orderStatus');

    } catch (error) {
      console.error("Error placing order: ", error);
      // Optionally, show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
        <div className="text-center p-10">
            <p className="mb-4">{t('empty_cart_checkout')}</p>
            <button onClick={() => setCurrentView('home')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                {t('back_to_menu')}
            </button>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg p-4 sm:p-6 lg:p-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{t('checkout')}</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">{t('order_summary')}</h2>
          <div className="space-y-2">
              {cart.map(item => (
                  <div key={item.cartItemId} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
              ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>{t('total')}</span>
              <span>${total.toFixed(2)}</span>
          </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">{t('your_information')}</h2>
          <div>
              <label htmlFor="customerPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phone_label')}</label>
              <input 
                type="tel" 
                id="customerPhoneNumber" 
                value={customerPhoneNumber} 
                onChange={e => setCustomerPhoneNumber(e.target.value)} 
                required 
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-slate-700" 
                placeholder="+1234567890"
              />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4">{t('payment_method')}</h2>
            <div className="flex space-x-4">
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.Cash)} className={`px-4 py-2 rounded-lg border ${paymentMethod === PaymentMethod.Cash ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent'}`}>{t('cash')}</button>
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.CreditCard)} className={`px-4 py-2 rounded-lg border ${paymentMethod === PaymentMethod.CreditCard ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent'}`}>{t('credit_card')}</button>
            </div>
        </div>

        <div>
          <button type="submit" disabled={isProcessing || cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
            {isProcessing ? t('processing_order') : t('place_order')}
          </button>
        </div>
      </form>
    </div>
  );
};
