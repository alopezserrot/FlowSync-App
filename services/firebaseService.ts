
import { User, Vendor, Restaurant, Order, UserRole, RestaurantPermissions, PermissionSchedule, BoardTemplate, MenuItemTemplate, MenuTemplate, Ingredient, ProductionSpace, Promotion } from '../types';
import { USERS, VENDORS, RESTAURANTS, ORDERS, BOARD_TEMPLATES, MENU_ITEM_TEMPLATES, MENU_TEMPLATES, INGREDIENTS, PRODUCTION_SPACES, PROMOTIONS } from '../data';

// This is a SIMULATED backend service.
// In a real application, you would replace the logic in these functions
// with calls to the Firebase SDK (e.g., Firestore, Firebase Auth).

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Simulated Database ---
// In a real app, this data would live in Firestore.
let usersDB = [...USERS];
let vendorsDB = [...VENDORS];
let restaurantsDB = [...RESTAURANTS];
let ordersDB = [...ORDERS];
let boardTemplatesDB = [...BOARD_TEMPLATES];
let menuItemTemplatesDB = [...MENU_ITEM_TEMPLATES];
let menuTemplatesDB = [...MENU_TEMPLATES];
let ingredientsDB = [...INGREDIENTS];
let productionSpacesDB = [...PRODUCTION_SPACES];
let promotionsDB = [...PROMOTIONS];


// --- Auth Functions ---
export const signInUser = async (username: string, password?: string): Promise<User | null> => {
    await delay(500);
    const user = usersDB.find(u => u.username === username && u.password === password);
    return user ? { ...user } : null;
};

export const signOutUser = async (): Promise<void> => {
    await delay(200);
    return;
};


// --- Data Fetching Functions ---
export const fetchUsers = async (): Promise<User[]> => {
    await delay(300);
    return [...usersDB];
};

export const fetchVendors = async (): Promise<Vendor[]> => {
    await delay(300);
    return [...vendorsDB];
};

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    await delay(400);
    return [...restaurantsDB];
};

export const fetchOrders = async (): Promise<Order[]> => {
    await delay(500);
    return [...ordersDB];
};

export const fetchBoardTemplates = async (): Promise<BoardTemplate[]> => {
    await delay(300);
    return [...boardTemplatesDB];
};

export const fetchMenuItemTemplates = async (): Promise<MenuItemTemplate[]> => {
    await delay(300);
    return [...menuItemTemplatesDB];
};

export const fetchMenuTemplates = async (): Promise<MenuTemplate[]> => {
    await delay(300);
    return [...menuTemplatesDB];
};

export const fetchIngredients = async (): Promise<Ingredient[]> => {
    await delay(300);
    return [...ingredientsDB];
};

export const fetchPointsOfSale = async (): Promise<ProductionSpace[]> => {
    await delay(300);
    return [...productionSpacesDB];
};

export const fetchPromotions = async (): Promise<Promotion[]> => {
    await delay(300);
    return [...promotionsDB];
};


// --- Data Mutation Functions ---

export const createVendor = async (vendorName: string, adminUsername: string, adminPassword: string) => {
    await delay(500);
    const newVendorId = Math.max(0, ...vendorsDB.map(v => v.id)) + 1;
    const newVendor: Vendor = { id: newVendorId, name: vendorName };
    
    const newUserId = Math.max(0, ...usersDB.map(u => u.id)) + 1;
    const newVendorAdmin: User = {
        id: newUserId,
        name: `${newVendor.name} Admin`,
        username: adminUsername,
        password: adminPassword,
        role: UserRole.Vendor,
        vendorId: newVendorId,
    };

    vendorsDB.push(newVendor);
    usersDB.push(newVendorAdmin);

    return { newVendor, newVendorAdmin };
};

export const updateVendor = async (updated: Vendor): Promise<Vendor> => {
    await delay(300);
    vendorsDB = vendorsDB.map(v => v.id === updated.id ? { ...v, ...updated } : v);
    return updated;
};

export const deleteVendor = async (vendorId: number): Promise<void> => {
    await delay(600);
    vendorsDB = vendorsDB.filter(v => v.id !== vendorId);
    restaurantsDB = restaurantsDB.filter(r => r.vendorId !== vendorId);
    usersDB = usersDB.filter(u => u.vendorId !== vendorId);
    boardTemplatesDB = boardTemplatesDB.filter(t => t.vendorId !== vendorId);
    menuTemplatesDB = menuTemplatesDB.filter(t => t.vendorId !== vendorId);
    menuItemTemplatesDB = menuItemTemplatesDB.filter(t => t.vendorId !== vendorId);
    ingredientsDB = ingredientsDB.filter(i => i.vendorId !== vendorId);
    productionSpacesDB = productionSpacesDB.filter(p => p.vendorId !== vendorId);
    promotionsDB = promotionsDB.filter(p => p.vendorId !== vendorId);
};

export const createRestaurant = async (newRestaurantData: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    await delay(500);
    const newRestaurantId = Math.max(0, ...restaurantsDB.map(r => r.id)) + 1;
    const defaultHours = {
        monday: { isOpen: true, open: '09:00', close: '22:00' },
        tuesday: { isOpen: true, open: '09:00', close: '22:00' },
        wednesday: { isOpen: true, open: '09:00', close: '22:00' },
        thursday: { isOpen: true, open: '09:00', close: '22:00' },
        friday: { isOpen: true, open: '09:00', close: '22:00' },
        saturday: { isOpen: true, open: '09:00', close: '22:00' },
        sunday: { isOpen: false, open: '09:00', close: '22:00' },
    };
    const newRestaurant: Restaurant = { 
        ...newRestaurantData, 
        id: newRestaurantId,
        openingHours: newRestaurantData.openingHours || defaultHours,
    };
    restaurantsDB.push(newRestaurant);
    return newRestaurant;
};

export const updateRestaurant = async (updated: Restaurant): Promise<Restaurant> => {
    await delay(400);
    restaurantsDB = restaurantsDB.map(r => r.id === updated.id ? updated : r);
    return updated;
};

export const deleteRestaurant = async (restaurantId: number): Promise<void> => {
    await delay(500);
    restaurantsDB = restaurantsDB.filter(r => r.id !== restaurantId);
    // Also update users who might be linked
    usersDB = usersDB.map(u => ({
        ...u,
        linkedRestaurantIds: u.linkedRestaurantIds?.filter(id => id !== restaurantId)
    })).filter(u => u.restaurantId !== restaurantId);
    promotionsDB = promotionsDB.filter(p => p.restaurantId !== restaurantId);
};

export const updateUser = async (updated: User): Promise<User> => {
    await delay(300);
    usersDB = usersDB.map(u => u.id === updated.id ? { ...u, ...updated } : u);
    return updated;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await delay(400);
    usersDB = usersDB.filter(u => u.id !== userId);
};

export const createRestaurantAdmin = async (name: string, username: string, password: string, restaurantId: number, vendorId?: number): Promise<User> => {
    await delay(500);
    const newUserId = Math.max(0, ...usersDB.map(u => u.id)) + 1;
    
    const defaultSchedule: PermissionSchedule = {
      monday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      thursday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      friday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      saturday: { isActive: false, startTime: '09:00', endTime: '17:00' },
      sunday: { isActive: false, startTime: '09:00', endTime: '17:00' },
    };

    const defaultPermissions: RestaurantPermissions = {
      canViewAnalytics: true,
      canManageMenu: true,
      canManageSettings: true,
      canManageOrders: true,
    };

    const newAdmin: User = {
        id: newUserId,
        name,
        username,
        password,
        role: UserRole.RestaurantAdmin,
        vendorId,
        restaurantId,
        permissions: defaultPermissions,
        permissionSchedule: defaultSchedule,
    };
    usersDB.push(newAdmin);
    return newAdmin;
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'orderTime' | 'lastUpdateTime'>): Promise<Order> => {
    await delay(700);
    const now = new Date();
    const newOrder: Order = {
        ...orderData,
        id: `ORD-${Date.now().toString().slice(-4)}`,
        status: 'pending',
        orderTime: now,
        lastUpdateTime: now,
    };
    ordersDB.unshift(newOrder);
    return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: string, reason?: string): Promise<Order | null> => {
    await delay(400);
    let updatedOrder: Order | null = null;
    const orderToUpdate = ordersDB.find(o => o.id === orderId);

    if (!orderToUpdate) return null;

    // --- STOCK DEDUCTION LOGIC ---
    // Only deduct if status is changing to accepted
    if (status === 'accepted' && orderToUpdate.status === 'pending') {
        const stockToDeduct: Record<string, number> = {};
        for (const item of orderToUpdate.items) {
            const template = menuItemTemplatesDB.find(t => t.id === item.id);
            if (template) {
                for (const comp of template.composition) {
                    // Only check/deduct mandatory items here? 
                    // Current logic: deduct everything selected.
                    stockToDeduct[comp.ingredientId] = (stockToDeduct[comp.ingredientId] || 0) + (comp.quantity * item.quantity);
                }
            }
        }
        
        for (const ingredientId in stockToDeduct) {
            const ingredient = ingredientsDB.find(i => i.id === ingredientId);
            if (!ingredient || ingredient.stock < stockToDeduct[ingredientId]) {
                // Check if the ingredient is Mandatory in any of the items
                // This is a simplification. Ideally check item by item.
                // For now, if stock is missing, we reject.
                console.error(`Not enough stock for ingredient ${ingredient?.name}. Order rejected.`);
                return await updateOrderStatus(orderId, 'rejected', 'One or more items are out of stock.');
            }
        }
        
        ingredientsDB = ingredientsDB.map(ing => {
            if (stockToDeduct[ing.id]) {
                return { ...ing, stock: ing.stock - stockToDeduct[ing.id] };
            }
            return ing;
        });
    }

    ordersDB = ordersDB.map(o => {
        if (o.id === orderId) {
            updatedOrder = { ...o, status, lastUpdateTime: new Date() };
            if (status === 'completed') {
                const completionMinutes = (new Date().getTime() - new Date(o.orderTime).getTime()) / 60000;
                updatedOrder.completionTime = Math.round(completionMinutes);
            }
             if (reason) {
                updatedOrder.rejectionReason = reason;
            }
            return updatedOrder;
        }
        return o;
    });
    return updatedOrder;
};

export const findOrdersByPhone = async (phone: string): Promise<Order[]> => {
    await delay(400);
    const activeStatuses = ['pending', 'accepted', 'in-progress', 'ready-for-pickup'];
    return ordersDB.filter(o => o.customerPhoneNumber === phone && activeStatuses.includes(o.status));
};


export const createBoardTemplate = async (templateData: Omit<BoardTemplate, 'id'>): Promise<BoardTemplate> => {
    await delay(400);
    const newTemplate: BoardTemplate = { ...templateData, id: Date.now() };
    boardTemplatesDB.push(newTemplate);
    return newTemplate;
};

export const updateBoardTemplate = async (template: BoardTemplate): Promise<BoardTemplate> => {
    await delay(300);
    boardTemplatesDB = boardTemplatesDB.map(t => t.id === template.id ? template : t);
    return template;
};

export const deleteBoardTemplate = async (templateId: number): Promise<void> => {
    await delay(400);
    boardTemplatesDB = boardTemplatesDB.filter(t => t.id !== templateId);
};

// --- Menu Template Functions ---

export const createMenuItemTemplate = async (itemData: Omit<MenuItemTemplate, 'id'>): Promise<MenuItemTemplate> => {
    await delay(400);
    const newItem: MenuItemTemplate = { ...itemData, id: Date.now() };
    menuItemTemplatesDB.push(newItem);
    return newItem;
};

export const updateMenuItemTemplate = async (item: MenuItemTemplate): Promise<MenuItemTemplate> => {
    await delay(300);
    menuItemTemplatesDB = menuItemTemplatesDB.map(i => i.id === item.id ? item : i);
    return item;
};

export const deleteMenuItemTemplate = async (itemId: number): Promise<void> => {
    await delay(400);
    menuItemTemplatesDB = menuItemTemplatesDB.filter(i => i.id !== itemId);
    // Also remove from any menus that use it
    menuTemplatesDB = menuTemplatesDB.map(menu => ({
        ...menu,
        sections: menu.sections.map(section => ({
            ...section,
            itemIds: section.itemIds.filter(id => id !== itemId)
        }))
    }));
};

export const createMenuTemplate = async (templateData: Omit<MenuTemplate, 'id'>): Promise<MenuTemplate> => {
    await delay(400);
    const newTemplate: MenuTemplate = { ...templateData, id: Date.now() };
    menuTemplatesDB.push(newTemplate);
    return newTemplate;
};

export const updateMenuTemplate = async (template: MenuTemplate): Promise<MenuTemplate> => {
    await delay(300);
    menuTemplatesDB = menuTemplatesDB.map(t => t.id === template.id ? template : t);
    return template;
};

export const deleteMenuTemplate = async (templateId: number): Promise<void> => {
    await delay(400);
    menuTemplatesDB = menuTemplatesDB.filter(t => t.id !== templateId);
    // Unlink from restaurants
    restaurantsDB = restaurantsDB.map(r => ({
        ...r,
        assignedMenuTemplateIds: r.assignedMenuTemplateIds?.filter(id => id !== templateId)
    }));
};

// --- Ingredient Functions ---

export const createIngredient = async (ingredientData: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    await delay(400);
    const newIngredient: Ingredient = { ...ingredientData, id: `ing-${Date.now()}` };
    ingredientsDB.push(newIngredient);
    return newIngredient;
};

export const updateIngredient = async (ingredient: Ingredient): Promise<Ingredient> => {
    await delay(200);
    ingredientsDB = ingredientsDB.map(i => i.id === ingredient.id ? ingredient : i);
    return ingredient;
};

// --- Production Space Functions (Renamed from POS) ---
export const createPointOfSale = async (posData: Omit<ProductionSpace, 'id'>): Promise<ProductionSpace> => {
    await delay(400);
    const newPos: ProductionSpace = { ...posData, id: `pos-${Date.now()}` };
    productionSpacesDB.push(newPos);
    return newPos;
};

export const updatePointOfSale = async (pos: ProductionSpace): Promise<ProductionSpace> => {
    await delay(300);
    productionSpacesDB = productionSpacesDB.map(p => p.id === pos.id ? pos : p);
    return pos;
};

export const deletePointOfSale = async (posId: string): Promise<void> => {
    await delay(400);
    productionSpacesDB = productionSpacesDB.filter(p => p.id !== posId);
    // Unlink from restaurants and menu items
    restaurantsDB = restaurantsDB.map(r => ({
        ...r,
        productionSpaceIds: r.productionSpaceIds?.filter(id => id !== posId)
    }));
    menuItemTemplatesDB = menuItemTemplatesDB.map(item => {
        if (item.productionSpaceIds.includes(posId)) {
            const { productionSpaceIds, ...rest } = item;
            return { ...rest, productionSpaceIds: productionSpaceIds.filter(id => id !== posId) };
        }
        return item;
    });
};

// --- Promotion Functions ---
export const createPromotion = async (promoData: Omit<Promotion, 'id'>): Promise<Promotion> => {
    await delay(400);
    const newPromo: Promotion = { ...promoData, id: `promo-${Date.now()}` };
    promotionsDB.push(newPromo);
    return newPromo;
};

export const updatePromotion = async (promo: Promotion): Promise<Promotion> => {
    await delay(300);
    promotionsDB = promotionsDB.map(p => p.id === promo.id ? promo : p);
    return promo;
};

export const deletePromotion = async (promoId: string): Promise<void> => {
    await delay(400);
    promotionsDB = promotionsDB.filter(p => p.id !== promoId);
};
