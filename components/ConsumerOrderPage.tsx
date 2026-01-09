
import React, { useEffect, useMemo, useState } from 'react';
import { Order, Restaurant, ProductionSpace, MenuItemTemplate, CartItem } from '../types';
import { CheckCircleIcon, ChefHatIcon, ShoppingBagIcon, XCircleIcon, QRCodeWrapper } from './Shared';
import { useLanguage } from '../i18nContext';

interface OrderCardProps {
    order: Order;
    allOrders: Order[];
    restaurant: Restaurant;
    pointsOfSale: ProductionSpace[];
    menuItemTemplates: MenuItemTemplate[];
    onOrderFinished: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, allOrders, restaurant, pointsOfSale, menuItemTemplates, onOrderFinished }) => {
    const { t } = useLanguage();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (order.status === 'completed' || order.status === 'rejected') {
            const timer = setTimeout(() => {
                onOrderFinished(order.id);
            }, 8000); 
            return () => clearTimeout(timer);
        }
    }, [order.status, order.id, onOrderFinished]);

    // Split items based on fulfillment type
    const { preparedItems, immediateItems } = useMemo(() => {
        const prepared: CartItem[] = [];
        const immediate: CartItem[] = [];
        order.items.forEach(item => {
            const template = menuItemTemplates.find(t => t.id === item.id);
            if (template?.isSeparateFulfillment) {
                immediate.push(item);
            } else {
                prepared.push(item);
            }
        });
        return { preparedItems: prepared, immediateItems: immediate };
    }, [order.items, menuItemTemplates]);

    const { ordersAhead, estimatedWaitTime } = useMemo(() => {
        const activeStatuses = ['in-progress', 'accepted', 'pending'];
        
        const involvedPosIds = new Set(
            preparedItems
                .flatMap(item => menuItemTemplates.find(t => t.id === item.id)?.productionSpaceIds || [])
        );

        if (involvedPosIds.size === 0) {
            return { ordersAhead: 0, estimatedWaitTime: 5 };
        }

        let maxPosWaitTime = 0;
        let totalOrdersAhead = 0;

        const ordersAheadList = allOrders.filter(o => 
            o.restaurantId === order.restaurantId && 
            activeStatuses.includes(o.status) && 
            new Date(o.orderTime) < new Date(order.orderTime)
        );
        totalOrdersAhead = ordersAheadList.length;

        involvedPosIds.forEach(posId => {
            const pos = pointsOfSale.find(p => p.id === posId);
            if (!pos) return;

            let queuedCapacityUsage = 0;
            
            ordersAheadList.forEach(queuedOrder => {
                queuedOrder.items.forEach(item => {
                    const template = menuItemTemplates.find(t => t.id === item.id);
                    if (template?.productionSpaceIds.includes(posId) && !template.isSeparateFulfillment) {
                        queuedCapacityUsage += (template.capacityUsage || 1) * (template.prepTime || 10) * item.quantity;
                    }
                });
            });

            const queueDrainTime = queuedCapacityUsage / (pos.concurrentCapacity || 1);

            let myMaxPrepForPos = 0;
            preparedItems.forEach(item => {
                const template = menuItemTemplates.find(t => t.id === item.id);
                if (template?.productionSpaceIds.includes(posId)) {
                    myMaxPrepForPos = Math.max(myMaxPrepForPos, template.prepTime || 10);
                }
            });

            const totalTimeForThisPos = queueDrainTime + myMaxPrepForPos;
            
            if (totalTimeForThisPos > maxPosWaitTime) {
                maxPosWaitTime = totalTimeForThisPos;
            }
        });

        return { ordersAhead: totalOrdersAhead, estimatedWaitTime: Math.ceil(maxPosWaitTime) };
    }, [allOrders, order, restaurant, pointsOfSale, menuItemTemplates, preparedItems]);

    const steps = [
        { status: 'accepted', title: t('status_accepted'), icon: <CheckCircleIcon className="w-6 h-6" /> },
        { status: 'in-progress', title: t('status_in_progress'), icon: <ChefHatIcon className="w-6 h-6" /> },
        { status: 'ready-for-pickup', title: t('status_ready_for_pickup'), icon: <ShoppingBagIcon className="w-6 h-6" /> },
    ];
    
    const statusMap = ['pending', ...steps.map(s => s.status)];
    const currentStepIndex = statusMap.indexOf(order.status);
    
    const elapsedMinutes = (now.getTime() - new Date(order.orderTime).getTime()) / 60000;
    const progressPercent = Math.min((elapsedMinutes / estimatedWaitTime) * 100, 95); 
    const remainingTime = Math.max(0, Math.ceil(estimatedWaitTime - elapsedMinutes));

    if (order.status === 'completed') {
        return (
             <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center transform transition-all">
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary mb-2">{t('order_completed_title')}</h2>
                <p className="text-gray-600">{t('order_completed_msg')}</p>
                <div className="flex justify-center mt-6">
                    <QRCodeWrapper value={order.id} />
                </div>
                <button
                    onClick={() => onOrderFinished(order.id)}
                    className="mt-6 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                >
                    {t('mark_received')}
                </button>
            </div>
        );
    }

    if (order.status === 'rejected') {
        return (
            <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center transform transition-all">
                <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary mb-2">{t('order_rejected_title')}</h2>
                <p className="text-gray-600">{t('order_rejected_msg')}</p>
                <p className="text-sm text-gray-500 mt-1">{t('reason')}: {order.rejectionReason}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            
            {/* IMMEDIATE PICKUP TICKET (e.g. Drinks) */}
            {immediateItems.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                        {t('quick_pickup')}
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                                <ShoppingBagIcon className="w-6 h-6 mr-2 text-green-600"/>
                                {t('status_ready_for_pickup')}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">{t('ready_pickup_msg')}</p>
                            <div className="space-y-1 mb-4 bg-green-50 p-3 rounded">
                                {immediateItems.map(item => (
                                    <div key={item.cartItemId} className="flex justify-between text-gray-800 font-medium text-sm">
                                        <span>{item.quantity} x {item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="ml-0 md:ml-6 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <QRCodeWrapper value={`${order.id}-IMMEDIATE`} />
                            <span className="text-xs font-mono mt-2 text-gray-500 font-bold">{order.id}-QUICK</span>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN KITCHEN TICKET */}
            {preparedItems.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg text-center transform transition-all">
                    <div className="flex justify-between items-center mb-4">
                         <span className="text-lg text-gray-500">{t('kitchen_order')}</span>
                         <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                            {t('est_wait')}: {estimatedWaitTime} min
                         </span>
                    </div>
                   
                    <div className="flex justify-center mb-2">
                        <QRCodeWrapper value={order.id} />
                    </div>

                    <p className="text-4xl sm:text-5xl font-mono text-primary bg-neutral p-4 rounded-md inline-block my-2">{order.id}</p>
                    
                    <div className="my-6 w-full max-w-md mx-auto text-left border-t border-b py-4">
                        <h3 className="font-bold text-lg text-secondary mb-3 text-center">{t('your_order')}</h3>
                        <div className="space-y-2">
                            {preparedItems.map(item => (
                                <div key={item.cartItemId}>
                                    <div className="flex justify-between text-gray-700">
                                        <span>{item.quantity} x {item.name}</span>
                                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                    {item.removedIngredients && item.removedIngredients.length > 0 && (
                                        <p className="text-xs text-red-600 pl-2"> - No: {item.removedIngredients.join(', ')}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t text-gray-800">
                            <span>{t('total')}</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-6 rounded-lg mb-6">
                        <div className="text-center border-r">
                            <p className="text-4xl sm:text-5xl font-bold text-secondary">{ordersAhead}</p>
                            <p className="text-gray-600 font-semibold">{t('orders_ahead')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl sm:text-5xl font-bold text-primary animate-pulse">{remainingTime}</p>
                            <p className="text-gray-600 font-semibold">{t('mins_remaining')}</p>
                        </div>
                    </div>

                    {/* Progress Tracker with Percentage */}
                    <div className="mt-8">
                        <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-white bg-primary">
                                        Status: {Math.floor(progressPercent)}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold inline-block text-primary">
                                        {remainingTime > 0 ? `${remainingTime} mins left` : 'Almost ready!'}
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
                                <div style={{ width: `${progressPercent}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500 ease-in-out relative">
                                     <span className="absolute right-2 font-bold">{Math.floor(progressPercent)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center relative mt-8">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200" style={{ transform: 'translateY(-50%)' }}></div>
                            <div className="absolute left-0 top-1/2 h-1 bg-primary" style={{ transform: 'translateY(-50%)', width: `${Math.max(0, ((currentStepIndex + 0.5) / steps.length) * 100)}%`, transition: 'width 0.5s ease' }}></div>
                            
                            {steps.map((step, index) => {
                                const isActive = (index + 1) <= currentStepIndex || (index === 0 && currentStepIndex === -1); 
                                return (
                                    <div key={step.status} className="z-10 text-center relative">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-colors duration-300 ${isActive ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-gray-200 text-gray-500'}`}>
                                            {step.icon}
                                        </div>
                                        <p className={`mt-2 font-semibold text-xs sm:text-sm absolute -left-1/2 w-[200%] ${isActive ? 'text-primary' : 'text-gray-400'}`}>{step.title}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


interface ConsumerOrderPageProps {
  activeOrders: Order[];
  allOrders: Order[];
  restaurants: Restaurant[];
  pointsOfSale: ProductionSpace[];
  menuItemTemplates: MenuItemTemplate[];
  onOrderFinished: (orderId: string) => void;
  onBackToRestaurant: () => void;
}

const ConsumerOrderPage: React.FC<ConsumerOrderPageProps> = (props) => {
  const { t } = useLanguage();
  const { activeOrders, allOrders, restaurants, pointsOfSale, menuItemTemplates, onOrderFinished, onBackToRestaurant } = props;
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-extrabold text-secondary mb-8 text-center">{t('your_order')}s</h2>
      
      {activeOrders.length === 0 ? (
          <p className="text-center text-gray-500">{t('empty_cart')}</p>
      ) : (
          <div className="space-y-8">
            {activeOrders.map(order => {
                const restaurant = restaurants.find(r => r.id === order.restaurantId);
                if (!restaurant) return null;
                return <OrderCard 
                    key={order.id} 
                    order={order} 
                    allOrders={allOrders} 
                    restaurant={restaurant}
                    pointsOfSale={pointsOfSale}
                    menuItemTemplates={menuItemTemplates}
                    onOrderFinished={onOrderFinished} 
                />
            })}
          </div>
      )}
      
      <div className="mt-12 text-center">
        <button
          onClick={onBackToRestaurant}
          className="bg-primary text-white py-3 px-8 rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-lg transform hover:scale-105"
        >
          &larr; {t('back')}
        </button>
      </div>
    </div>
  );
};

export default ConsumerOrderPage;
