
import React, { useState } from 'react';
import { CartItem, Restaurant, PaymentMethod } from '../types';
import { CreditCardIcon, PayPalIcon, CashIcon } from './Shared';
import { useLanguage } from '../i18nContext';

interface CheckoutPageProps {
  cart: CartItem[];
  restaurant: Restaurant | null;
  onPlaceOrder: (phoneNumber: string) => void;
  onBack: () => void;
}

const COUNTRY_CODES = [
    { code: 'ES', dial_code: '+34', flag: '🇪🇸' },
    { code: 'US', dial_code: '+1', flag: '🇺🇸' },
    { code: 'MX', dial_code: '+52', flag: '🇲🇽' },
    { code: 'AR', dial_code: '+54', flag: '🇦🇷' },
    { code: 'CO', dial_code: '+57', flag: '🇨🇴' },
    { code: 'CL', dial_code: '+56', flag: '🇨🇱' },
    { code: 'PE', dial_code: '+51', flag: '🇵🇪' },
    { code: 'UK', dial_code: '+44', flag: '🇬🇧' },
    { code: 'FR', dial_code: '+33', flag: '🇫🇷' },
    { code: 'DE', dial_code: '+49', flag: '🇩🇪' },
    { code: 'IT', dial_code: '+39', flag: '🇮🇹' },
    { code: 'PT', dial_code: '+351', flag: '🇵🇹' },
];

const PaymentOption: React.FC<{
    method: PaymentMethod;
    children: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ method, children, isSelected, onSelect }) => {
    const ICONS: Record<PaymentMethod, React.ReactNode> = {
        [PaymentMethod.CreditCard]: <CreditCardIcon className="w-6 h-6 mr-3"/>,
        [PaymentMethod.Stripe]: <CreditCardIcon className="w-6 h-6 mr-3"/>,
        [PaymentMethod.PayPal]: <PayPalIcon className="w-6 h-6 mr-3 text-blue-800"/>,
        [PaymentMethod.Cash]: <CashIcon className="w-6 h-6 mr-3"/>,
        [PaymentMethod.Bizum]: <span className="font-bold text-lg mr-3">B</span>,
    }
    return (
         <div className={`border border-gray-200 rounded-lg p-4 transition-all duration-300 ${!isSelected ? 'opacity-50' : 'opacity-100'}`}>
            <label className="flex items-center cursor-pointer">
                <input 
                    type="radio" 
                    name="paymentMethod" 
                    value={method} 
                    checked={isSelected}
                    onChange={onSelect}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                <span className="ml-3 flex items-center font-medium text-gray-800">
                    {ICONS[method]}
                    {method}
                </span>
            </label>
            {isSelected && children}
        </div>
    )
}

const CreditCardForm: React.FC<{isRequired: boolean}> = ({ isRequired }) => {
    const { t } = useLanguage();
    return (
        <div className="mt-4 pl-8 space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name_on_card')}</label>
                <input type="text" id="name" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required={isRequired} />
            </div>
            <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">{t('card_number')}</label>
                <input type="text" id="card-number" placeholder="•••• •••• •••• 4242" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required={isRequired} />
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">{t('expiry')} (MM/YY)</label>
                <input type="text" id="expiry" placeholder="01/25" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required={isRequired} />
                </div>
                <div className="flex-1">
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">{t('cvc')}</label>
                <input type="text" id="cvc" placeholder="123" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" required={isRequired} />
                </div>
            </div>
        </div>
    );
};


const CheckoutPage: React.FC<CheckoutPageProps> = ({ cart, restaurant, onPlaceOrder, onBack }) => {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(restaurant?.paymentMethods[0] || null);
  
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].dial_code);
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxes = subtotal * 0.08;
  const deliveryFee = 5.00;
  const total = subtotal + taxes + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine country code and local number
    onPlaceOrder(`${countryCode} ${localPhoneNumber}`);
  };
  
  if (!restaurant) {
      return <div>{t('loading')}</div>
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="text-sm text-primary mb-4 hover:underline">
        &larr; {t('back_to_restaurant')}
      </button>
      <h2 className="text-3xl font-extrabold text-secondary mb-6">{t('checkout')}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: contact + payment */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-800">{t('contact_payment')}</h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('phone_label')}</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <select
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm focus:ring-primary focus:border-primary"
                                style={{ minWidth: '100px' }}
                            >
                                {COUNTRY_CODES.map((country) => (
                                    <option key={country.code} value={country.dial_code}>
                                        {country.flag} {country.dial_code}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={localPhoneNumber}
                                onChange={(e) => setLocalPhoneNumber(e.target.value)}
                                className="flex-1 block w-full min-w-0 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="612 345 678"
                                required
                            />
                        </div>
                    </div>
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-semibold mb-4 text-gray-800">{t('payment_method')}</h4>
                        <div className="space-y-4">
                            {restaurant.paymentMethods.includes(PaymentMethod.CreditCard) && <PaymentOption method={PaymentMethod.CreditCard} isSelected={selectedMethod === PaymentMethod.CreditCard} onSelect={() => setSelectedMethod(PaymentMethod.CreditCard)}><CreditCardForm isRequired={selectedMethod === PaymentMethod.CreditCard}/></PaymentOption>}
                            {restaurant.paymentMethods.includes(PaymentMethod.Stripe) && <PaymentOption method={PaymentMethod.Stripe} isSelected={selectedMethod === PaymentMethod.Stripe} onSelect={() => setSelectedMethod(PaymentMethod.Stripe)}><CreditCardForm isRequired={selectedMethod === PaymentMethod.Stripe}/></PaymentOption>}
                            {restaurant.paymentMethods.includes(PaymentMethod.PayPal) && <PaymentOption method={PaymentMethod.PayPal} isSelected={selectedMethod === PaymentMethod.PayPal} onSelect={() => setSelectedMethod(PaymentMethod.PayPal)}><p className="text-sm text-gray-500 mt-2 pl-8">{t('pay_paypal_hint')}</p></PaymentOption>}
                            {restaurant.paymentMethods.includes(PaymentMethod.Bizum) && <PaymentOption method={PaymentMethod.Bizum} isSelected={selectedMethod === PaymentMethod.Bizum} onSelect={() => setSelectedMethod(PaymentMethod.Bizum)}><p className="text-sm text-gray-500 mt-2 pl-8">{t('pay_bizum_hint')}</p></PaymentOption>}
                            {restaurant.paymentMethods.includes(PaymentMethod.Cash) && <PaymentOption method={PaymentMethod.Cash} isSelected={selectedMethod === PaymentMethod.Cash} onSelect={() => setSelectedMethod(PaymentMethod.Cash)}><p className="text-sm text-gray-500 mt-2 pl-8">{t('pay_cash_hint')}</p></PaymentOption>}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-800">{t('your_order')} from {restaurant.name}</h3>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.cartItemId}>
                <div className="flex justify-between">
                  <span className="text-gray-800">{item.quantity} x {item.name}</span>
                  <span className="text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.removedIngredients && item.removedIngredients.length > 0 && (
                    <p className="text-xs text-red-600 pl-2"> - No: {item.removedIngredients.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>{t('subtotal')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('taxes')}</span>
              <span>${taxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('delivery')}</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t text-gray-900">
              <span>{t('total')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
           <button
              type="submit"
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
            >
              {t('place_order')}
            </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
