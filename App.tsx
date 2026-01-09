
import React, { useState, useEffect } from 'react';
import { User, Vendor, Restaurant, Order, View, CartItem, UserRole, ProductionSpace, MenuItemTemplate, MenuTemplate, Ingredient, Promotion } from './types';
import * as firebaseService from './services/firebaseService';
import Header from './components/Header';
import HomePage from './components/HomePage';
import RestaurantPage from './components/RestaurantPage';
import Cart from './components/Cart';
import CheckoutPage from './components/CheckoutPage';
import LoginPage from './components/LoginPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import VendorDashboard from './components/VendorDashboard';
import ConsumerOrderPage from './components/ConsumerOrderPage';
import { Notification, NotificationMessage } from './components/Shared';
import { DatabaseSeeder } from './components/DatabaseSeeder';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boardTemplates, setBoardTemplates] = useState([]);
  const [menuTemplates, setMenuTemplates] = useState([]);
  const [menuItemTemplates, setMenuItemTemplates] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [productionSpaces, setProductionSpaces] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [v, r, u, o, bt, mt, mit, ing, ps, prom] = await Promise.all([
          firebaseService.fetchVendors(),
          firebaseService.fetchRestaurants(),
          firebaseService.fetchUsers(),
          firebaseService.fetchOrders(),
          firebaseService.fetchBoardTemplates(),
          firebaseService.fetchMenuTemplates(),
          firebaseService.fetchMenuItemTemplates(),
          firebaseService.fetchIngredients(),
          firebaseService.fetchPointsOfSale(),
          firebaseService.fetchPromotions()
        ]);
        setVendors(v);
        setRestaurants(r);
        setUsers(u);
        setOrders(o);
        setBoardTemplates(bt as any);
        setMenuTemplates(mt as any);
        setMenuItemTemplates(mit as any);
        setIngredients(ing as any);
        setProductionSpaces(ps as any);
        setPromotions(prom as any);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    const handleSimulatePush = (e: any) => {
      addNotification(e.detail.message, e.detail.type);
    };
    window.addEventListener('simulate-push', handleSimulatePush);
    return () => window.removeEventListener('simulate-push', handleSimulatePush);
  }, []);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogin = async (username: string, pass: string) => {
    const user = await firebaseService.signInUser(username, pass);
    if (user) {
      setCurrentUser(user);
      setView(user.role === UserRole.SuperAdmin ? 'superAdminDashboard' : 'vendorDashboard');
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    await firebaseService.signOutUser();
    setCurrentUser(null);
    setView('home');
    setCart([]);
  };

  const handleAddToCart = (item: Omit<CartItem, 'cartItemId'>) => {
    const newCartItem = { ...item, cartItemId: Date.now() };
    setCart(prev => [...prev, newCartItem]);
    addNotification(`${item.name} added to cart!`, 'success');
  };

  const handlePlaceOrder = async (phone: string) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = await firebaseService.createOrder({
      restaurantId: selectedRestaurantId!,
      items: cart,
      total,
      customerPhoneNumber: phone
    });
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setView('orderStatus');
    addNotification('Order placed successfully!', 'success');
  };

  const handleUpdateOrderStatus = async (id: string, status: string, reason?: string) => {
    const updated = await firebaseService.updateOrderStatus(id, status, reason);
    if (updated) {
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      addNotification(`Order ${id} is now ${status}`, 'info');
    }
  };

  const handleCreateRestaurant = async (data: Omit<Restaurant, 'id'>) => {
    const newR = await firebaseService.createRestaurant(data);
    setRestaurants(prev => [...prev, newR]);
    addNotification('Restaurant created successfully', 'success');
  };

  const handleUpdateRestaurant = async (data: Restaurant) => {
    await firebaseService.updateRestaurant(data);
    setRestaurants(prev => prev.map(r => r.id === data.id ? data : r));
    addNotification('Restaurant updated', 'success');
  };

  const handleDeleteRestaurant = async (id: number) => {
    await firebaseService.deleteRestaurant(id);
    setRestaurants(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateVendor = async (name: string, user: string, pass: string) => {
    const { newVendor, newVendorAdmin } = await firebaseService.createVendor(name, user, pass);
    setVendors(prev => [...prev, newVendor]);
    setUsers(prev => [...prev, newVendorAdmin]);
  };

  const handleUpdateVendor = async (v: Vendor) => {
    await firebaseService.updateVendor(v);
    setVendors(prev => prev.map(old => old.id === v.id ? v : old));
  };

  const handleDeleteVendor = async (id: number) => {
    await firebaseService.deleteVendor(id);
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  const handleUpdateUser = async (u: User) => {
    await firebaseService.updateUser(u);
    setUsers(prev => prev.map(old => old.id === u.id ? u : old));
  };

  const handleDeleteUser = async (id: number) => {
    await firebaseService.deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const renderView = () => {
    if (isLoading) return <div className="flex items-center justify-center h-screen font-bold">Loading FlowApp...</div>;

    switch (view) {
      case 'home':
        return <HomePage restaurants={restaurants} currentUser={currentUser || { role: UserRole.Consumer } as User} onSelectRestaurant={(id) => { setSelectedRestaurantId(id); setView('restaurant'); }} />;
      case 'restaurant':
        const rest = restaurants.find(r => r.id === selectedRestaurantId);
        return rest ? <RestaurantPage restaurant={rest} menuTemplates={menuTemplates.filter(t => rest.assignedMenuTemplateIds?.includes(t.id))} allItems={menuItemTemplates} ingredients={ingredients} promotions={promotions} onAddToCart={handleAddToCart} onBack={() => setView('home')} /> : null;
      case 'checkout':
        return <CheckoutPage cart={cart} restaurant={restaurants.find(r => r.id === selectedRestaurantId) || null} onPlaceOrder={handlePlaceOrder} onBack={() => setView('restaurant')} />;
      case 'orderStatus':
        return <ConsumerOrderPage activeOrders={orders.filter(o => ['pending', 'accepted', 'in-progress', 'ready-for-pickup', 'completed', 'rejected'].includes(o.status))} allOrders={orders} restaurants={restaurants} pointsOfSale={productionSpaces} menuItemTemplates={menuItemTemplates} onOrderFinished={(id) => handleUpdateOrderStatus(id, 'archived')} onBackToRestaurant={() => setView('home')} />;
      case 'vendorDashboard':
        const vendorRestaurants = currentUser?.role === UserRole.Vendor 
          ? restaurants.filter(r => r.vendorId === currentUser.vendorId)
          : restaurants.filter(r => r.id === currentUser?.restaurantId);
        return currentUser ? <VendorDashboard 
          currentUser={currentUser} 
          vendor={vendors.find(v => v.id === currentUser.vendorId)!} 
          restaurants={vendorRestaurants} 
          orders={orders} 
          users={users} 
          boardTemplates={boardTemplates} 
          menuTemplates={menuTemplates.filter(t => t.vendorId === currentUser.vendorId)} 
          menuItemTemplates={menuItemTemplates.filter(t => t.vendorId === currentUser.vendorId)} 
          ingredients={ingredients} 
          pointsOfSale={productionSpaces} 
          promotions={promotions}
          onCreateRestaurant={handleCreateRestaurant}
          onUpdateRestaurant={handleUpdateRestaurant}
          onDeleteRestaurant={handleDeleteRestaurant}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onCreateRestaurantAdmin={(n, u, p, rid) => firebaseService.createRestaurantAdmin(n, u, p, rid, currentUser.vendorId).then(newU => setUsers(prev => [...prev, newU]))}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onCreateBoardTemplate={(t) => firebaseService.createBoardTemplate(t).then(newT => setBoardTemplates(prev => [...prev, newT as any]))}
          onUpdateBoardTemplate={(t) => firebaseService.updateBoardTemplate(t).then(upT => setBoardTemplates(prev => prev.map(o => o.id === upT.id ? upT : o)))}
          onDeleteBoardTemplate={(id) => firebaseService.deleteBoardTemplate(id).then(() => setBoardTemplates(prev => prev.filter(o => o.id !== id)))}
          onCreateMenuTemplate={(t) => firebaseService.createMenuTemplate(t).then(newT => setMenuTemplates(prev => [...prev, newT as any]))}
          onUpdateMenuTemplate={(t) => firebaseService.updateMenuTemplate(t).then(upT => setMenuTemplates(prev => prev.map(o => o.id === upT.id ? upT : o)))}
          onDeleteMenuTemplate={(id) => firebaseService.deleteMenuTemplate(id).then(() => setMenuTemplates(prev => prev.filter(o => o.id !== id)))}
          onCreateMenuItemTemplate={(t) => firebaseService.createMenuItemTemplate(t).then(newT => setMenuItemTemplates(prev => [...prev, newT as any]))}
          onUpdateMenuItemTemplate={(t) => firebaseService.updateMenuItemTemplate(t).then(upT => setMenuItemTemplates(prev => prev.map(o => o.id === upT.id ? upT : o)))}
          onDeleteMenuItemTemplate={(id) => firebaseService.deleteMenuItemTemplate(id).then(() => setMenuItemTemplates(prev => prev.filter(o => o.id !== id)))}
          onCreateIngredient={(i) => firebaseService.createIngredient(i).then(newI => setIngredients(prev => [...prev, newI as any]))}
          onUpdateIngredient={(i) => firebaseService.updateIngredient(i).then(upI => setIngredients(prev => prev.map(o => o.id === upI.id ? upI : o)))}
          onCreatePointOfSale={(p) => firebaseService.createPointOfSale(p).then(newP => setProductionSpaces(prev => [...prev, newP as any]))}
          onUpdatePointOfSale={(p) => firebaseService.updatePointOfSale(p).then(upP => setProductionSpaces(prev => prev.map(o => o.id === upP.id ? upP : o)))}
          onDeletePointOfSale={(id) => firebaseService.deletePointOfSale(id).then(() => setProductionSpaces(prev => prev.filter(o => o.id !== id)))}
          onCreatePromotion={(p) => firebaseService.createPromotion(p).then(newP => setPromotions(prev => [...prev, newP as any]))}
          onUpdatePromotion={(p) => firebaseService.updatePromotion(p).then(upP => setPromotions(prev => prev.map(o => o.id === upP.id ? upP : o)))}
          onDeletePromotion={(id) => firebaseService.deletePromotion(id).then(() => setPromotions(prev => prev.filter(o => o.id !== id)))}
        /> : null;
      case 'superAdminDashboard':
        return <SuperAdminDashboard vendors={vendors} restaurants={restaurants} users={users} onCreateVendor={handleCreateVendor} onUpdateVendor={handleUpdateVendor} onUpdateUser={handleUpdateUser} onUpdateRestaurant={handleUpdateRestaurant} onCreateRestaurant={handleCreateRestaurant} onDeleteVendor={handleDeleteVendor} onDeleteRestaurant={handleDeleteRestaurant} onDeleteUser={handleDeleteUser} onSelectRestaurant={(id) => { setSelectedRestaurantId(id); setView('restaurant'); }} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onAdminLogin={() => setView('login')}
        onExitToGuestView={() => { setCurrentUser(null); setView('home'); }}
        cart={cart}
        onNavigate={setView}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onFindOrder={() => setView('orderStatus')}
        activeOrderCount={orders.filter(o => ['pending', 'accepted', 'in-progress', 'ready-for-pickup'].includes(o.status)).length}
      />
      <main className="flex-grow">{renderView()}</main>
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemoveItem={(id) => setCart(cart.filter(i => i.cartItemId !== id))} onUpdateQuantity={(id, q) => setCart(cart.map(i => i.cartItemId === id ? { ...i, quantity: q } : i))} onCheckout={() => { setIsCartOpen(false); setView('checkout'); }} />
      {notifications.map(n => <Notification key={n.id} notification={n} onDismiss={removeNotification} />)}
      <DatabaseSeeder />
    </div>
  );
};

export default App;
