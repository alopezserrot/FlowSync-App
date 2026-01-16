
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { CartItem, OrderStatus, PaymentMethod } from '../types';

interface CheckoutPageProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, setCart }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CreditCard);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const restaurantId = cart[0].restaurantId;
      const orderData = {
        restaurantId,
        items: cart,
        customerName,
        tableNumber,
        paymentMethod,
        status: OrderStatus.Pending,
        subtotal,
        tax,
        total,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setCart([]);
      navigate(`/order/${docRef.id}`);

    } catch (error) {
      console.error("Error placing order: ", error);
      // Here you could show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
        <div className="text-center p-10">
            <p className="mb-4">{t('empty_cart_checkout')}</p>
            <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
                {t('back_to_menu')}
            </button>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{t('checkout')}</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('your_information')}</h2>
          <div className="space-y-4">
             <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('customer_name')}</label>
                <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-slate-700"/>
            </div>
            <div>
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('table_number')}</label>
                <input type="text" id="tableNumber" value={tableNumber} onChange={e => setTableNumber(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-50 dark:bg-slate-700"/>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t('order_summary')}</h2>
            <div className="space-y-2">
                {cart.map(item => (
                    <div key={item.cartItemId} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between"><span>{t('subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{t('tax')}</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>{t('total')}</span><span>${total.toFixed(2)}</span></div>
            </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{t('payment_method')}</h2>
            <div className="flex space-x-4">
                {/* Simplified Payment Options */}
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.CreditCard)} className={`px-4 py-2 rounded-lg border ${paymentMethod === PaymentMethod.CreditCard ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent'}`}>{t('credit_card')}</button>
                <button type="button" onClick={() => setPaymentMethod(PaymentMethod.Cash)} className={`px-4 py-2 rounded-lg border ${paymentMethod === PaymentMethod.Cash ? 'bg-blue-600 text-white border-blue-600' : 'bg-transparent'}`}>{t('cash')}</button>
            </div>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
            {isProcessing ? t('processing_order') : t('place_order')}
          </button>
        </div>
      </form>
    </div>
  );
};
