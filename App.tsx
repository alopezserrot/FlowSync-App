
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Vendor, Restaurant, CartItem, NotificationMessage, View, Order, BoardTemplate, MenuTemplate, MenuItemTemplate, Ingredient, ProductionSpace, Promotion } from './types';
import * as api from './services/firebaseService'; // Use the new service layer

import Header from './components/Header';
import HomePage from './components/HomePage';
import RestaurantPage from './components/RestaurantPage';
import Cart from './components/Cart';
import CheckoutPage from './components/CheckoutPage';
import VendorDashboard from './components/VendorDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ConsumerOrderPage from './components/ConsumerOrderPage';
import LoginPage from './components/LoginPage';
import { Notification } from './components/Shared';
import { DatabaseSeeder } from './components/DatabaseSeeder';

const GUEST_USER: User = { id: 0, name: 'Guest', username: 'guest', role: UserRole.Consumer, linkedRestaurantIds: [] };

const FindOrderModal: React.FC<{
    onClose: () => void;
    onFind: (phone: string) => void;
}> = ({ onClose, onFind }) => {
    const [phone, setPhone] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFind(phone);
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h3 className="text-xl font-bold mb-4 text-secondary">Find Your Order</h3>
                    <p className="mb-4 text-gray-700">Enter the phone number you used during checkout to retrieve your active orders.</p>
                    <div>
                        <label htmlFor="find-phone" className="block text-sm font-medium text-gray-800">Phone Number</label>
                        <input
                            type="tel"
                            id="find-phone"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-md"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-semibold">Find Orders</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);
    const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([]);
    const [menuItemTemplates, setMenuItemTemplates] = useState<MenuItemTemplate[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [pointsOfSale, setPointsOfSale] = useState<ProductionSpace[]>([]);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [activeOrderIds, setActiveOrderIds] = useState<string[]>(() => {
        try {
            const item = window.localStorage.getItem('activeOrderIds');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.log(error);
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    const [currentView, setCurrentView] = useState<View>('login');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isFindOrderOpen, setIsFindOrderOpen] = useState(false);

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedUsers, fetchedVendors, fetchedRestaurants, fetchedOrders, fetchedBoards, fetchedMenus, fetchedItems, fetchedIngredients, fetchedPointsOfSale, fetchedPromotions] = await Promise.all([
                api.fetchUsers(),
                api.fetchVendors(),
                api.fetchRestaurants(),
                api.fetchOrders(),
                api.fetchBoardTemplates(),
                api.fetchMenuTemplates(),
                api.fetchMenuItemTemplates(),
                api.fetchIngredients(),
                api.fetchPointsOfSale(),
                api.fetchPromotions(),
            ]);
            setUsers(fetchedUsers);
            setVendors(fetchedVendors);
            setRestaurants(fetchedRestaurants);
            setOrders(fetchedOrders);
            setBoardTemplates(fetchedBoards);
            setMenuTemplates(fetchedMenus);
            setMenuItemTemplates(fetchedItems);
            setIngredients(fetchedIngredients);
            setPointsOfSale(fetchedPointsOfSale);
            setPromotions(fetchedPromotions);
        } catch (error) {
            console.error("Failed to fetch data", error);
            // addNotification("Could not load application data. Check your connection.", "error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);
    
     useEffect(() => {
        const handleNavigation = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#restaurant/')) {
                const restaurantId = parseInt(hash.split('/')[1]);
                if (restaurants.some(v => v.id === restaurantId)) {
                    setSelectedRestaurantId(restaurantId);
                    setCurrentView('restaurant');
                    
                    if (!currentUser || currentUser.role === UserRole.Consumer) {
                        setCurrentUser(prevUser => {
                            const isNew = !prevUser || !prevUser.linkedRestaurantIds?.includes(restaurantId);
                            if (isNew) {
                                const restaurant = restaurants.find(r => r.id === restaurantId);
                                addNotification(`You are now viewing ${restaurant?.name}!`, 'success');
                                const updatedGuest = {
                                    ...GUEST_USER,
                                    linkedRestaurantIds: [...(prevUser?.linkedRestaurantIds || []), restaurantId]
                                };
                                return updatedGuest;
                            }
                            return prevUser;
                        });
                    }
                    return;
                }
            }

            if (currentUser) {
                 if (currentUser.role === UserRole.Vendor || currentUser.role === UserRole.RestaurantAdmin) setCurrentView('vendorDashboard');
                else if (currentUser.role === UserRole.SuperAdmin) setCurrentView('superAdminDashboard');
                else if (currentUser.role === UserRole.Consumer) setCurrentView('home');
            } else {
                 setCurrentView('login');
            }
        };

        if (!isLoading) {
            handleNavigation();
        }
        window.addEventListener('hashchange', handleNavigation);
        return () => window.removeEventListener('hashchange', handleNavigation);
    }, [currentUser, restaurants, addNotification, isLoading]);


    useEffect(() => {
        // When user role changes to a non-consumer, clear cart state
        // but keep active order tracking for the session.
        if (currentUser?.role !== UserRole.Consumer) {
             setIsCartOpen(false);
             setCart([]);
        }
    }, [currentUser]);

    useEffect(() => {
        window.localStorage.setItem('activeOrderIds', JSON.stringify(activeOrderIds));
    }, [activeOrderIds]);
    
    // --- PUSH NOTIFICATION SIMULATION LISTENER ---
    useEffect(() => {
        const handleSimulatedPush = (e: any) => {
            const { message, type } = e.detail;
            addNotification(message, type || 'info');
        };
        window.addEventListener('simulate-push', handleSimulatedPush);
        return () => window.removeEventListener('simulate-push', handleSimulatedPush);
    }, [addNotification]);


    const dismissNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    
    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        const user = await api.signInUser(username, password);
        if (user) {
            setCurrentUser(user);
            window.location.hash = '';
            addNotification(`Welcome back, ${user.name}!`, 'success');
            return true;
        }
        addNotification('Invalid username or password.', 'error');
        return false;
    };

    const handleLogout = async () => {
        addNotification(`Goodbye, ${currentUser?.name}!`, 'info');
        await api.signOutUser();
        setCurrentUser(null);
        window.location.hash = '';
        setCurrentView('login');
    };
    
    const handleExitToGuestView = async () => {
        await handleLogout();
        addNotification(`Exiting admin session. Now viewing as a guest.`, 'info');
        const firstRestaurantId = restaurants[0]?.id;
        if (firstRestaurantId) {
            window.location.hash = `restaurant/${firstRestaurantId}`;
        } else {
            window.location.hash = '';
            setCurrentView('login');
        }
    };

    const handleAdminLoginNav = () => {
        setCurrentUser(null);
        window.location.hash = '';
        setCurrentView('login');
    };

    const handleAddToCart = (item: Omit<CartItem, 'cartItemId'>) => {
        if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
            addNotification("You can only order from one restaurant at a time.", "error"); return;
        }
        
        const newCartItem: CartItem = {
            ...item,
            cartItemId: Date.now()
        };

        setCart(prev => [...prev, newCartItem]);
        addNotification(`${item.name} added to cart!`, "success");
        setIsCartOpen(true);
    };


    const handleRemoveFromCart = (cartItemId: number) => setCart(cart => cart.filter(item => item.cartItemId !== cartItemId));

    const handleUpdateCartQuantity = (cartItemId: number, quantity: number) => {
        if(quantity < 1) { handleRemoveFromCart(cartItemId); return; }
        setCart(cart => cart.map(item => item.cartItemId === cartItemId ? {...item, quantity} : item));
    };
    
    const navigateTo = (view: View) => {
        setCurrentView(view);
        setIsCartOpen(false);
        if (['home', 'vendorDashboard', 'superAdminDashboard'].includes(view)) {
            window.location.hash = '';
            setSelectedRestaurantId(null);
        }
    }

    const handlePlaceOrder = async (phoneNumber: string) => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const newOrderData = {
            restaurantId: cart[0].restaurantId,
            items: cart,
            total,
            customerPhoneNumber: phoneNumber,
        };
        const newOrder = await api.createOrder(newOrderData);
        if (newOrder) {
            setOrders(prev => [newOrder, ...prev]);
            setCart([]);
            setActiveOrderIds(prev => [...prev, newOrder.id]);
            addNotification(`Order ${newOrder.id} placed successfully!`, "success");
            navigateTo('orderStatus');
        } else {
            addNotification("Failed to place order.", "error");
        }
    };

    const handleFindOrdersByPhone = async (phone: string) => {
        const foundOrders = await api.findOrdersByPhone(phone);
        if (foundOrders.length > 0) {
            const foundIds = foundOrders.map(o => o.id);
            setActiveOrderIds(prev => [...new Set([...prev, ...foundIds])]);
            addNotification(`Found ${foundOrders.length} active order(s).`, 'success');
            navigateTo('orderStatus');
        } else {
            addNotification('No active orders found for that phone number.', 'info');
        }
        setIsFindOrderOpen(false);
    };
    
    const handleUpdateOrderStatus = async (orderId: string, status: string, reason?: string) => {
        const updatedOrder = await api.updateOrderStatus(orderId, status, reason);
        if (updatedOrder) {
            setOrders(orders => orders.map(o => o.id === orderId ? updatedOrder : o));
            addNotification(`Order ${orderId} status updated to "${status}"`, "info");

            // Simulate sending SMS notification to the customer
            const customerPhoneNumber = updatedOrder.customerPhoneNumber;
            if (customerPhoneNumber) {
                let smsMessage = '';
                switch (updatedOrder.status) {
                    case 'accepted':
                        smsMessage = `Your order ${orderId} has been accepted!`;
                        break;
                    case 'rejected':
                        smsMessage = `Your order ${orderId} has been rejected. Reason: ${updatedOrder.rejectionReason}`;
                        break;
                    case 'ready-for-pickup':
                        smsMessage = `Your order ${orderId} is now ready for pickup.`;
                        break;
                }
                if (smsMessage) {
                    addNotification(`(SMS SIM) To ${customerPhoneNumber}: "${smsMessage}"`, 'success');
                }
            }

            // If stock deduction caused auto-rejection, need to refresh ingredients state
            if (updatedOrder.status === 'rejected' && reason === 'One or more items are out of stock.') {
                const refreshedIngredients = await api.fetchIngredients();
                setIngredients(refreshedIngredients);
            }
        }
    };

    const handleUpdateRestaurant = async (updated: Restaurant) => {
        const result = await api.updateRestaurant(updated);
        if (result) {
            setRestaurants(restaurants.map(r => r.id === updated.id ? result : r));
            addNotification("Restaurant details updated!", "success");
        }
    };

    const handleUpdateVendor = async (updated: Vendor) => {
        const result = await api.updateVendor(updated);
        if (result) {
            setVendors(vendors.map(v => v.id === updated.id ? result : v));
            addNotification("Vendor details updated!", "success");
        }
    };

    const handleUpdateUser = async (updated: User) => {
        const result = await api.updateUser(updated);
        if (result) {
            setUsers(users.map(u => u.id === updated.id ? result : u));
            addNotification("User details updated!", "success");
            // If the current user is being updated, refresh their state
            if (currentUser?.id === updated.id) {
                setCurrentUser(result);
            }
        }
    };

    const handleCreateVendor = async (vendorName: string, adminUsername: string, adminPassword: string) => {
        const result = await api.createVendor(vendorName, adminUsername, adminPassword);
        if (result) {
            setVendors(prev => [...prev, result.newVendor]);
            setUsers(prev => [...prev, result.newVendorAdmin]);
            addNotification(`Vendor "${result.newVendor.name}" and admin user created! (Username: ${result.newVendorAdmin.username})`, "success");
        }
    };
    
    const handleCreateRestaurantAdmin = async (name: string, username: string, password: string, restaurantId: number) => {
        const result = await api.createRestaurantAdmin(name, username, password, restaurantId, currentUser?.vendorId);
        if (result) {
            setUsers(prev => [...prev, result]);
            addNotification(`Restaurant Admin "${name}" created with username: ${result.username}`, 'success');
        }
    };

    const handleCreateRestaurant = async (newRestaurantData: Omit<Restaurant, 'id'>) => {
        const newRestaurant = await api.createRestaurant(newRestaurantData);
        if (newRestaurant) {
            setRestaurants(prev => [...prev, newRestaurant]);
            addNotification(`Restaurant "${newRestaurant.name}" created!`, "success");
        }
    };

    const handleDeleteVendor = async (vendorId: number) => {
        await api.deleteVendor(vendorId);
        fetchData(); // Refetch all data to ensure consistency
        addNotification('Vendor and all associated data deleted.', 'success');
    }

    const handleDeleteRestaurant = async (restaurantId: number) => {
        await api.deleteRestaurant(restaurantId);
        fetchData();
        addNotification('Restaurant deleted.', 'success');
    }

    const handleDeleteUser = async (userId: number) => {
        if (currentUser?.id === userId) {
            addNotification("You cannot delete yourself.", "error"); return;
        }
        await api.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        addNotification('User deleted.', 'success');
    }
    
    const handleSelectRestaurant = (id: number) => {
        setSelectedRestaurantId(id);
        setCurrentView('restaurant');
        window.location.hash = `restaurant/${id}`;
    };

    const handleOrderFinished = (orderId: string) => {
        setActiveOrderIds(prevIds => prevIds.filter(id => id !== orderId));
    };

    // --- TEMPLATE & INVENTORY & POS HANDLERS ---
    const handleCreateBoardTemplate = async (templateData: Omit<BoardTemplate, 'id'>) => {
        const newTemplate = await api.createBoardTemplate(templateData);
        if (newTemplate) { setBoardTemplates(p => [...p, newTemplate]); addNotification('Board template created!', 'success'); }
    };
    const handleUpdateBoardTemplate = async (template: BoardTemplate) => {
        const updated = await api.updateBoardTemplate(template);
        if (updated) { setBoardTemplates(p => p.map(t => t.id === template.id ? updated : t)); addNotification('Board template updated!', 'success'); }
    };
    const handleDeleteBoardTemplate = async (templateId: number) => {
        await api.deleteBoardTemplate(templateId);
        setBoardTemplates(p => p.filter(t => t.id !== templateId));
        setPointsOfSale(p => p.map(pos => pos.boardTemplateId === templateId ? {...pos, boardTemplateId: 0} : pos));
        addNotification('Board template deleted.', 'success');
    };
    const handleCreateMenuTemplate = async (templateData: Omit<MenuTemplate, 'id'>) => {
        const newTemplate = await api.createMenuTemplate(templateData);
        if (newTemplate) { setMenuTemplates(p => [...p, newTemplate]); addNotification('Menu template created!', 'success'); }
    };
    const handleUpdateMenuTemplate = async (template: MenuTemplate) => {
        const updated = await api.updateMenuTemplate(template);
        if (updated) { setMenuTemplates(p => p.map(t => t.id === template.id ? updated : t)); addNotification('Menu template updated!', 'success'); }
    };
    const handleDeleteMenuTemplate = async (templateId: number) => {
        await api.deleteMenuTemplate(templateId);
        setMenuTemplates(p => p.filter(t => t.id !== templateId));
        const updatedRestaurants = await api.fetchRestaurants(); setRestaurants(updatedRestaurants);
        addNotification('Menu template deleted.', 'success');
    };
    const handleCreateMenuItemTemplate = async (itemData: Omit<MenuItemTemplate, 'id'>) => {
        const newItem = await api.createMenuItemTemplate(itemData);
        if (newItem) { setMenuItemTemplates(p => [...p, newItem]); addNotification('Menu item created!', 'success'); }
    };
    const handleUpdateMenuItemTemplate = async (item: MenuItemTemplate) => {
        const updated = await api.updateMenuItemTemplate(item);
        if (updated) { setMenuItemTemplates(p => p.map(i => i.id === item.id ? updated : i)); addNotification('Menu item updated!', 'success'); }
    };
    const handleDeleteMenuItemTemplate = async (itemId: number) => {
        await api.deleteMenuItemTemplate(itemId);
        setMenuItemTemplates(p => p.filter(i => i.id !== itemId));
        const updatedMenus = await api.fetchMenuTemplates(); setMenuTemplates(updatedMenus);
        addNotification('Menu item deleted.', 'success');
    };
    const handleCreateIngredient = async (ingredientData: Omit<Ingredient, 'id'>) => {
        const newIngredient = await api.createIngredient(ingredientData);
        if (newIngredient) { setIngredients(p => [...p, newIngredient]); addNotification('Ingredient added!', 'success'); }
    };
    const handleUpdateIngredient = async (ingredient: Ingredient) => {
        const updated = await api.updateIngredient(ingredient);
        if (updated) { setIngredients(p => p.map(i => i.id === ingredient.id ? updated : i)); addNotification(`${ingredient.name} stock updated!`, 'success'); }
    };
    const handleCreatePointOfSale = async (posData: Omit<ProductionSpace, 'id'>) => {
        const newPos = await api.createPointOfSale(posData);
        if (newPos) { setPointsOfSale(p => [...p, newPos]); addNotification('Point of Sale created!', 'success'); }
    };
    const handleUpdatePointOfSale = async (pos: ProductionSpace) => {
        const updated = await api.updatePointOfSale(pos);
        if (updated) { setPointsOfSale(p => p.map(i => i.id === pos.id ? updated : i)); addNotification('Point of Sale updated!', 'success'); }
    };
    const handleDeletePointOfSale = async (posId: string) => {
        await api.deletePointOfSale(posId);
        setPointsOfSale(p => p.filter(i => i.id !== posId));
        setRestaurants(await api.fetchRestaurants());
        setMenuItemTemplates(await api.fetchMenuItemTemplates());
        addNotification('Point of Sale deleted.', 'success');
    };

    // --- PROMOTION HANDLERS ---
    const handleCreatePromotion = async (promoData: Omit<Promotion, 'id'>) => {
        const newPromo = await api.createPromotion(promoData);
        if (newPromo) { setPromotions(p => [...p, newPromo]); addNotification('Promotion launched!', 'success'); }
    }
    const handleUpdatePromotion = async (promo: Promotion) => {
        const updated = await api.updatePromotion(promo);
        if (updated) { setPromotions(p => p.map(pr => pr.id === promo.id ? updated : pr)); addNotification('Promotion updated!', 'success'); }
    }
    const handleDeletePromotion = async (promoId: string) => {
        await api.deletePromotion(promoId);
        setPromotions(p => p.filter(pr => pr.id !== promoId));
        addNotification('Promotion removed.', 'success');
    }
    
    const renderView = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading Application...</div>;
        }
        
        if (currentView === 'login' || !currentUser) return <LoginPage onLogin={handleLogin} />;
        
        switch (currentView) {
            case 'restaurant':
                const restaurant = restaurants.find(v => v.id === selectedRestaurantId);
                const assignedMenuTemplates = restaurant?.assignedMenuTemplateIds?.map(id => menuTemplates.find(m => m.id === id)).filter(Boolean) as MenuTemplate[] || [];
                const vendorIngredients = ingredients.filter(i => i.vendorId === restaurant?.vendorId);

                return restaurant ? <RestaurantPage restaurant={restaurant} menuTemplates={assignedMenuTemplates} allItems={menuItemTemplates} ingredients={vendorIngredients} promotions={promotions} onAddToCart={handleAddToCart} onBack={() => navigateTo('home')} /> : <HomePage currentUser={currentUser} restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />;
            
            case 'checkout':
                const restaurantForCheckout = restaurants.find(r => r.id === cart[0]?.restaurantId);
                const backToRestaurant = () => { if (cart[0]?.restaurantId) handleSelectRestaurant(cart[0].restaurantId); else navigateTo('home'); }
                return <CheckoutPage cart={cart} restaurant={restaurantForCheckout || null} onPlaceOrder={handlePlaceOrder} onBack={backToRestaurant} />;

            case 'vendorDashboard':
                const vendorForDashboard = vendors.find(v => v.id === currentUser.vendorId);
                const restaurantsForVendor = currentUser.role === UserRole.RestaurantAdmin 
                    ? restaurants.filter(r => r.id === currentUser.restaurantId)
                    : restaurants.filter(r => r.vendorId === currentUser.vendorId);
                const templatesForVendor = {
                    board: boardTemplates.filter(t => t.vendorId === currentUser.vendorId),
                    menu: menuTemplates.filter(t => t.vendorId === currentUser.vendorId),
                    menuItem: menuItemTemplates.filter(t => t.vendorId === currentUser.vendorId),
                };
                const ingredientsForVendor = ingredients.filter(i => i.vendorId === currentUser.vendorId);
                const pointsOfSaleForVendor = pointsOfSale.filter(p => p.vendorId === currentUser.vendorId);
                const promotionsForVendor = promotions.filter(p => p.vendorId === currentUser.vendorId);
                
                return vendorForDashboard || currentUser.role === UserRole.RestaurantAdmin ? <VendorDashboard 
                    currentUser={currentUser} vendor={vendorForDashboard!} restaurants={restaurantsForVendor} orders={orders} users={users} 
                    boardTemplates={templatesForVendor.board} menuTemplates={templatesForVendor.menu} menuItemTemplates={templatesForVendor.menuItem}
                    ingredients={ingredientsForVendor}
                    pointsOfSale={pointsOfSaleForVendor}
                    promotions={promotionsForVendor}
                    onUpdateRestaurant={handleUpdateRestaurant} onCreateRestaurant={handleCreateRestaurant} onDeleteRestaurant={handleDeleteRestaurant} 
                    onUpdateOrderStatus={handleUpdateOrderStatus} onCreateRestaurantAdmin={handleCreateRestaurantAdmin} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} 
                    onCreateBoardTemplate={handleCreateBoardTemplate} onUpdateBoardTemplate={handleUpdateBoardTemplate} onDeleteBoardTemplate={handleDeleteBoardTemplate}
                    onCreateMenuTemplate={handleCreateMenuTemplate} onUpdateMenuTemplate={handleUpdateMenuTemplate} onDeleteMenuTemplate={handleDeleteMenuTemplate}
                    onCreateMenuItemTemplate={handleCreateMenuItemTemplate} onUpdateMenuItemTemplate={handleUpdateMenuItemTemplate} onDeleteMenuItemTemplate={handleDeleteMenuItemTemplate}
                    onCreateIngredient={handleCreateIngredient} onUpdateIngredient={handleUpdateIngredient}
                    onCreatePointOfSale={handleCreatePointOfSale} onUpdatePointOfSale={handleUpdatePointOfSale} onDeletePointOfSale={handleDeletePointOfSale}
                    onCreatePromotion={handleCreatePromotion} onUpdatePromotion={handleUpdatePromotion} onDeletePromotion={handleDeletePromotion}
                    /> : <div>Dashboard access denied.</div>;

            case 'superAdminDashboard':
                return <SuperAdminDashboard vendors={vendors} restaurants={restaurants} users={users} onCreateVendor={handleCreateVendor} onUpdateVendor={handleUpdateVendor} onUpdateUser={handleUpdateUser} onUpdateRestaurant={handleUpdateRestaurant} onDeleteVendor={handleDeleteVendor} onDeleteRestaurant={handleDeleteRestaurant} onDeleteUser={handleDeleteUser} onSelectRestaurant={handleSelectRestaurant} />;
            
            case 'orderStatus':
                const activeOrders = orders.filter(o => activeOrderIds.includes(o.id));
                if (activeOrders.length > 0) {
                    return <ConsumerOrderPage
                        activeOrders={activeOrders}
                        allOrders={orders}
                        restaurants={restaurants}
                        pointsOfSale={pointsOfSale}
                        menuItemTemplates={menuItemTemplates}
                        onOrderFinished={handleOrderFinished}
                        onBackToRestaurant={() => handleSelectRestaurant(activeOrders[0].restaurantId)}
                    />;
                }
                navigateTo('home');
                return null;
            
            case 'home':
            default:
                return <HomePage currentUser={currentUser} restaurants={restaurants} onSelectRestaurant={handleSelectRestaurant} />;
        }
    };

    return (
        <div className="min-h-screen bg-neutral flex flex-col">
            {currentUser?.role === UserRole.SuperAdmin && <DatabaseSeeder />}
             {currentView !== 'login' && (
                <Header
                    currentUser={currentUser} onLogout={handleLogout} cart={cart}
                    onNavigate={(view) => navigateTo(view as View)}
                    onCartToggle={() => setIsCartOpen(!isCartOpen)}
                    onFindOrder={() => setIsFindOrderOpen(true)}
                    activeOrderCount={activeOrderIds.length}
                    onAdminLogin={handleAdminLoginNav}
                    onExitToGuestView={handleExitToGuestView}
                />
            )}
            <main className="flex-grow">{renderView()}</main>
            {currentUser?.role === UserRole.Consumer && (
                <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemoveItem={handleRemoveFromCart} onUpdateQuantity={handleUpdateCartQuantity} onCheckout={() => navigateTo('checkout')} />
            )}
            {isFindOrderOpen && <FindOrderModal onClose={() => setIsFindOrderOpen(false)} onFind={handleFindOrdersByPhone} />}
            <div className="fixed top-24 right-5 z-50 space-y-2">{notifications.map(n => (<Notification key={n.id} notification={n} onDismiss={dismissNotification} />))}</div>
             {currentView !== 'login' && !isLoading && (
                <footer className="bg-secondary text-white text-center p-4"><p>&copy; {new Date().getFullYear()} FlowApp. All rights reserved.</p></footer>
            )}
        </div>
    );
};

export default App;
