
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    Timestamp 
} from "firebase/firestore";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";

import { db, auth } from "../firebaseConfig";
import { User, Vendor, Restaurant, Order, UserRole, BoardTemplate, MenuItemTemplate, MenuTemplate, Ingredient, ProductionSpace, Promotion } from '../types';

// Helper to convert Firestore ID (string) to Number if your app uses numbers for IDs
const toNumberId = (id: string) => {
    const parsed = parseInt(id);
    return isNaN(parsed) ? id : parsed;
};

// --- Auth Functions ---

export const signInUser = async (username: string, password?: string): Promise<User | null> => {
    try {
        const email = username.includes('@') ? username : `${username}@flowapp.test`;
        // Handle credential verification
        await signInWithEmailAndPassword(auth, email, password || 'password');
        
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { ...userDoc.data(), id: toNumberId(userDoc.id) } as User;
        }
        return null;
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            console.warn("Login failed: Invalid credentials provided.");
        } else {
            console.error("Login failed with unexpected error:", error);
        }
        return null;
    }
};

export const signOutUser = async (): Promise<void> => {
    await signOut(auth);
};

// --- Data Fetching Functions ---

export const fetchUsers = async (): Promise<User[]> => {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as User));
};

export const fetchVendors = async (): Promise<Vendor[]> => {
    const snapshot = await getDocs(collection(db, "vendors"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as Vendor));
};

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
    const snapshot = await getDocs(collection(db, "restaurants"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as Restaurant));
};

export const fetchOrders = async (): Promise<Order[]> => {
    const snapshot = await getDocs(collection(db, "orders"));
    return snapshot.docs.map(d => {
        const data = d.data();
        return {
            ...data,
            id: d.id,
            orderTime: data.orderTime?.toDate ? data.orderTime.toDate() : new Date(data.orderTime),
            lastUpdateTime: data.lastUpdateTime?.toDate ? data.lastUpdateTime.toDate() : new Date(data.lastUpdateTime)
        } as Order;
    }).sort((a, b) => b.orderTime.getTime() - a.orderTime.getTime());
};

export const fetchBoardTemplates = async (): Promise<BoardTemplate[]> => {
    const snapshot = await getDocs(collection(db, "boardTemplates"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as BoardTemplate));
};

export const fetchMenuItemTemplates = async (): Promise<MenuItemTemplate[]> => {
    const snapshot = await getDocs(collection(db, "menuItemTemplates"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as MenuItemTemplate));
};

export const fetchMenuTemplates = async (): Promise<MenuTemplate[]> => {
    const snapshot = await getDocs(collection(db, "menuTemplates"));
    return snapshot.docs.map(d => ({ ...d.data(), id: toNumberId(d.id) } as MenuTemplate));
};

export const fetchIngredients = async (): Promise<Ingredient[]> => {
    const snapshot = await getDocs(collection(db, "ingredients"));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Ingredient));
};

export const fetchPointsOfSale = async (): Promise<ProductionSpace[]> => {
    const snapshot = await getDocs(collection(db, "productionSpaces"));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ProductionSpace));
};

export const fetchPromotions = async (): Promise<Promotion[]> => {
    const snapshot = await getDocs(collection(db, "promotions"));
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Promotion));
};

// --- Data Mutation Functions ---

export const createVendor = async (vendorName: string, adminUsername: string, adminPassword: string) => {
    const email = `${adminUsername}@flowapp.test`;
    try {
        try {
            await createUserWithEmailAndPassword(auth, email, adminPassword);
        } catch (authErr: any) {
            if (authErr.code !== 'auth/email-already-in-use') throw authErr;
        }

        const newVendorId = Date.now();
        const newVendor: Vendor = { id: newVendorId, name: vendorName };
        await setDoc(doc(db, "vendors", newVendorId.toString()), newVendor);

        const newUserId = Date.now() + 1;
        const newVendorAdmin: User = {
            id: newUserId,
            name: `${newVendor.name} Admin`,
            username: adminUsername,
            role: UserRole.Vendor,
            vendorId: newVendorId,
        };
        await setDoc(doc(db, "users", newUserId.toString()), newVendorAdmin);

        return { newVendor, newVendorAdmin };
    } catch (e) {
        console.error("Error creating vendor", e);
        throw e;
    }
};

export const updateVendor = async (updated: Vendor): Promise<Vendor> => {
    await updateDoc(doc(db, "vendors", updated.id.toString()), { ...updated });
    return updated;
};

export const deleteVendor = async (vendorId: number): Promise<void> => {
    await deleteDoc(doc(db, "vendors", vendorId.toString()));
};

export const createRestaurant = async (newRestaurantData: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    const newId = Date.now();
    const newRestaurant = { ...newRestaurantData, id: newId };
    await setDoc(doc(db, "restaurants", newId.toString()), newRestaurant);
    return newRestaurant;
};

export const updateRestaurant = async (updated: Restaurant): Promise<Restaurant> => {
    await updateDoc(doc(db, "restaurants", updated.id.toString()), { ...updated });
    return updated;
};

export const deleteRestaurant = async (restaurantId: number): Promise<void> => {
    await deleteDoc(doc(db, "restaurants", restaurantId.toString()));
};

export const updateUser = async (updated: User): Promise<User> => {
    await updateDoc(doc(db, "users", updated.id.toString()), { ...updated });
    return updated;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await deleteDoc(doc(db, "users", userId.toString()));
};

export const createRestaurantAdmin = async (name: string, username: string, password: string, restaurantId: number, vendorId?: number): Promise<User> => {
    const email = `${username}@flowapp.test`;
    try {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (authErr: any) {
            if (authErr.code !== 'auth/email-already-in-use') throw authErr;
        }

        const newUserId = Date.now();
        const newAdmin: User = {
            id: newUserId,
            name,
            username,
            role: UserRole.RestaurantAdmin,
            vendorId,
            restaurantId,
            permissions: {
                canViewAnalytics: true,
                canManageMenu: true,
                canManageSettings: true,
                canManageOrders: true,
            },
            permissionSchedule: {
                monday: { isActive: true, startTime: '09:00', endTime: '22:00' },
                tuesday: { isActive: true, startTime: '09:00', endTime: '22:00' },
                wednesday: { isActive: true, startTime: '09:00', endTime: '22:00' },
                thursday: { isActive: true, startTime: '09:00', endTime: '22:00' },
                friday: { isActive: true, startTime: '09:00', endTime: '23:00' },
                saturday: { isActive: true, startTime: '09:00', endTime: '23:00' },
                sunday: { isActive: true, startTime: '09:00', endTime: '22:00' },
            }
        };
        await setDoc(doc(db, "users", newUserId.toString()), newAdmin);
        return newAdmin;
    } catch (e) {
        console.error("Error creating rest admin", e);
        throw e;
    }
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'status' | 'orderTime' | 'lastUpdateTime'>): Promise<Order> => {
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const newOrder: Order = {
        ...orderData,
        id: newOrderId,
        status: 'pending',
        orderTime: now,
        lastUpdateTime: now,
    };
    
    const firestoreOrder = {
        ...newOrder,
        orderTime: Timestamp.fromDate(now),
        lastUpdateTime: Timestamp.fromDate(now)
    };

    await setDoc(doc(db, "orders", newOrderId), firestoreOrder);
    return newOrder;
};

export const updateOrderStatus = async (orderId: string, status: string, reason?: string): Promise<Order | null> => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) return null;

    const data = orderSnap.data();
    const toDate = (val: any): Date => {
        if (val?.toDate) return val.toDate();
        if (val instanceof Date) return val;
        return new Date(val);
    };

    const currentOrder: Order = {
        ...(data as any),
        id: orderSnap.id,
        orderTime: toDate(data.orderTime),
        lastUpdateTime: toDate(data.lastUpdateTime)
    };

    const now = new Date();
    const updates: any = {
        status,
        lastUpdateTime: Timestamp.fromDate(now)
    };

    if (reason) updates.rejectionReason = reason;
    if (status === 'completed') {
        const diff = (now.getTime() - currentOrder.orderTime.getTime()) / 60000;
        updates.completionTime = Math.round(diff);
    }

    await updateDoc(orderRef, updates);
    return { ...currentOrder, ...updates, lastUpdateTime: now };
};

export const findOrdersByPhone = async (phone: string): Promise<Order[]> => {
    const q = query(
        collection(db, "orders"), 
        where("customerPhoneNumber", "==", phone),
        where("status", "in", ['pending', 'accepted', 'in-progress', 'ready-for-pickup'])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ 
        ...d.data(), 
        id: d.id,
        orderTime: d.data().orderTime.toDate(),
        lastUpdateTime: d.data().lastUpdateTime.toDate()
    } as Order));
};

const createGeneric = async (collectionName: string, data: any) => {
    const id = data.id || Date.now();
    await setDoc(doc(db, collectionName, id.toString()), { ...data, id });
    return { ...data, id };
};

const updateGeneric = async (collectionName: string, data: any) => {
    await updateDoc(doc(db, collectionName, data.id.toString()), data);
    return data;
};

const deleteGeneric = async (collectionName: string, id: string | number) => {
    await deleteDoc(doc(db, collectionName, id.toString()));
};

export const createBoardTemplate = (d: any) => createGeneric("boardTemplates", d);
export const updateBoardTemplate = (d: any) => updateGeneric("boardTemplates", d);
export const deleteBoardTemplate = (id: number) => deleteGeneric("boardTemplates", id);

export const createMenuTemplate = (d: any) => createGeneric("menuTemplates", d);
export const updateMenuTemplate = (d: any) => updateGeneric("menuTemplates", d);
export const deleteMenuTemplate = (id: number) => deleteGeneric("menuTemplates", id);

export const createMenuItemTemplate = (d: any) => createGeneric("menuItemTemplates", d);
export const updateMenuItemTemplate = (d: any) => updateGeneric("menuItemTemplates", d);
export const deleteMenuItemTemplate = (id: number) => deleteGeneric("menuItemTemplates", id);

export const createIngredient = async (d: any) => {
    const id = `ing-${Date.now()}`;
    await setDoc(doc(db, "ingredients", id), { ...d, id });
    return { ...d, id };
};
export const updateIngredient = (d: any) => updateGeneric("ingredients", d);

export const createPointOfSale = async (d: any) => {
    const id = `pos-${Date.now()}`;
    await setDoc(doc(db, "productionSpaces", id), { ...d, id });
    return { ...d, id };
};
export const updatePointOfSale = (d: any) => updateGeneric("productionSpaces", d);
export const deletePointOfSale = (id: string) => deleteGeneric("productionSpaces", id);

export const createPromotion = async (d: any) => {
    const id = `promo-${Date.now()}`;
    await setDoc(doc(db, "promotions", id), { ...d, id });
    return { ...d, id };
};
export const updatePromotion = (d: any) => updateGeneric("promotions", d);
export const deletePromotion = (id: string) => deleteGeneric("promotions", id);
