
import { User, UserRole, Vendor, Restaurant, Allergen, Order, MediaType, PaymentMethod, BoardTemplate, MenuItemTemplate, MenuTemplate, Intolerance, Ingredient, ProductionSpace, Promotion, PromotionType } from './types';

// NOTE: The default consumer user has been removed. Consumers will now be handled as "guests".
export const USERS: User[] = [
  { id: 2, name: 'Burger Queen Admin', username: 'vendor1', password: 'password', role: UserRole.Vendor, vendorId: 1 },
  { id: 3, name: 'Pizza Palace Admin', username: 'vendor2', password: 'password', role: UserRole.Vendor, vendorId: 2 },
  { id: 4, name: 'Super Admin', username: 'superadmin', password: 'password', role: UserRole.SuperAdmin },
  { 
    id: 5, 
    name: 'Burger Restaurant Manager', 
    username: 'restadmin1', 
    password: 'password', 
    role: UserRole.RestaurantAdmin, 
    vendorId: 1, 
    restaurantId: 1,
    permissions: {
        canViewAnalytics: true,
        canManageMenu: true,
        canManageSettings: false,
        canManageOrders: true,
    },
    permissionSchedule: {
      monday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      tuesday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      wednesday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      thursday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      friday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      saturday: { isActive: true, startTime: '00:00', endTime: '23:59' },
      sunday: { isActive: true, startTime: '00:00', endTime: '23:59' },
    }
  },
];

export const VENDORS: Vendor[] = [
    { id: 1, name: 'Burger Queen Group' },
    { id: 2, name: 'Pizza Palace Inc.' },
];

export const ALLERGENS: Allergen[] = [
    { id: 'gf', name: 'Gluten-Free' },
    { id: 'v', name: 'Vegetarian' },
    { id: 's', name: 'Spicy' },
];

export const INTOLERANCES: Intolerance[] = [
    { id: 'lactose', name: 'Lactose', icon: 'LactoseIcon' },
    { id: 'nuts', name: 'Nuts', icon: 'NutsIcon' },
];

export const INGREDIENTS: Ingredient[] = [
    // Vendor 1 (Burger Queen)
    { id: 'ing-1', vendorId: 1, sku: 'BF-001', name: 'Beef Patty (1/3 lb)', category: 'Food', stock: 100, locations: [{id: 'loc-1', name: 'Main Freezer', quantity: 100}], unit: 'units', costPerUnit: 1.50 },
    { id: 'ing-2', vendorId: 1, sku: 'DY-001', name: 'Cheddar Cheese Slice', category: 'Food', stock: 200, locations: [{id: 'loc-2', name: 'Fridge A', quantity: 200}], unit: 'units', costPerUnit: 0.20 },
    { id: 'ing-3', vendorId: 1, sku: 'VG-001', name: 'Dill Pickles', category: 'Food', stock: 500, locations: [{id: 'loc-3', name: 'Pantry', quantity: 500}], unit: 'g', costPerUnit: 0.01 },
    { id: 'ing-4', vendorId: 1, sku: 'VG-002', name: 'White Onion', category: 'Food', stock: 1000, locations: [{id: 'loc-3', name: 'Pantry', quantity: 1000}], unit: 'g', costPerUnit: 0.005 },
    { id: 'ing-5', vendorId: 1, sku: 'BK-001', name: 'Toasted Sesame Bun', category: 'Food', stock: 150, locations: [{id: 'loc-3', name: 'Pantry', quantity: 150}], unit: 'units', costPerUnit: 0.30 },
    { id: 'ing-6', vendorId: 1, sku: 'MT-002', name: 'Crispy Bacon', category: 'Food', stock: 100, locations: [{id: 'loc-2', name: 'Fridge A', quantity: 100}], unit: 'units', costPerUnit: 0.40 }, 
    { id: 'ing-7', vendorId: 1, sku: 'CD-001', name: 'Deluxe Sauce', category: 'Food', stock: 2000, locations: [{id: 'loc-2', name: 'Fridge A', quantity: 2000}], unit: 'ml', costPerUnit: 0.02 },
    { id: 'ing-8', vendorId: 1, sku: 'DY-002', name: 'Pepper Jack Cheese', category: 'Food', stock: 150, locations: [{id: 'loc-2', name: 'Fridge A', quantity: 150}], unit: 'units', costPerUnit: 0.25 },
    { id: 'ing-9', vendorId: 1, sku: 'VG-003', name: 'Fresh Jalapeños', category: 'Food', stock: 500, locations: [{id: 'loc-3', name: 'Pantry', quantity: 500}], unit: 'g', costPerUnit: 0.03 },
    { id: 'ing-10', vendorId: 1, sku: 'CD-002', name: 'Spicy Mayo', category: 'Food', stock: 1500, locations: [{id: 'loc-2', name: 'Fridge A', quantity: 1500}], unit: 'ml', costPerUnit: 0.02 },
    { id: 'ing-11', vendorId: 1, sku: 'VG-004', name: 'Potatoes', category: 'Food', stock: 50, locations: [{id: 'loc-4', name: 'Basement', quantity: 50}], unit: 'kg', costPerUnit: 1.00 },
    { id: 'ing-22', vendorId: 1, sku: 'DR-001', name: 'Soda Syrup', category: 'Drink', stock: 10, locations: [{id: 'loc-5', name: 'Bar Store', quantity: 10}], unit: 'l', costPerUnit: 2.00 },


    // Vendor 2 (Pizza Palace)
    { id: 'ing-12', vendorId: 2, sku: 'DZ-001', name: 'Pizza Dough Ball', category: 'Food', stock: 80, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 80}], unit: 'units', costPerUnit: 0.50 },
    { id: 'ing-13', vendorId: 2, sku: 'DY-003', name: 'Fresh Mozzarella', category: 'Food', stock: 10, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 10}], unit: 'kg', costPerUnit: 8.00 },
    { id: 'ing-14', vendorId: 2, sku: 'CD-003', name: 'San Marzano Tomato Sauce', category: 'Food', stock: 20, locations: [{id: 'loc-7', name: 'Dry Store', quantity: 20}], unit: 'l', costPerUnit: 3.00 },
    { id: 'ing-15', vendorId: 2, sku: 'VG-005', name: 'Fresh Basil', category: 'Food', stock: 500, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 500}], unit: 'g', costPerUnit: 0.05 },
    { id: 'ing-16', vendorId: 2, sku: 'MT-003', name: 'Spicy Pepperoni', category: 'Food', stock: 5, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 5}], unit: 'kg', costPerUnit: 12.00 },
    { id: 'ing-17', vendorId: 2, sku: 'VG-006', name: 'Bell Peppers', category: 'Food', stock: 2, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 2}], unit: 'kg', costPerUnit: 3.00 },
    { id: 'ing-18', vendorId: 2, sku: 'VG-007', name: 'Red Onions', category: 'Food', stock: 3, locations: [{id: 'loc-7', name: 'Dry Store', quantity: 3}], unit: 'kg', costPerUnit: 2.50 },
    { id: 'ing-19', vendorId: 2, sku: 'VG-008', name: 'Black Olives', category: 'Food', stock: 1, locations: [{id: 'loc-7', name: 'Dry Store', quantity: 1}], unit: 'kg', costPerUnit: 4.00 },
    { id: 'ing-20', vendorId: 2, sku: 'VG-009', name: 'Mushrooms', category: 'Food', stock: 1.5, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 1.5}], unit: 'kg', costPerUnit: 5.00 },
    { id: 'ing-21', vendorId: 2, sku: 'CD-004', name: 'Garlic Butter', category: 'Food', stock: 1, locations: [{id: 'loc-6', name: 'Walk-in Fridge', quantity: 1}], unit: 'l', costPerUnit: 4.50 },
];

export const PRODUCTION_SPACES: ProductionSpace[] = [
    { id: 'pos-1', vendorId: 1, name: 'Kitchen (Grill)', boardTemplateId: 1, concurrentCapacity: 10 },
    { id: 'pos-2', vendorId: 1, name: 'Bar', boardTemplateId: 1, concurrentCapacity: 20 },
    { id: 'pos-3', vendorId: 2, name: 'Pizza Oven', boardTemplateId: 2, concurrentCapacity: 8 },
];

export const MENU_ITEM_TEMPLATES: MenuItemTemplate[] = [
    { id: 101, vendorId: 1, name: 'Classic Cheeseburger', description: 'A timeless classic with a juicy beef patty, melted cheddar, pickles, onions, ketchup, and mustard on a toasted bun.', price: 8.99, imageUrl: 'https://picsum.photos/400/300?random=21', prepTime: 12, composition: [{ingredientId: 'ing-1', quantity: 1, isMandatory: true}, {ingredientId: 'ing-2', quantity: 1, isMandatory: true}, {ingredientId: 'ing-5', quantity: 1, isMandatory: true}, {ingredientId: 'ing-3', quantity: 10, isMandatory: false}], intolerances: [INTOLERANCES[0]], productionSpaceIds: ['pos-1'], capacityUsage: 1 },
    { id: 102, vendorId: 1, name: 'Bacon Deluxe', description: 'Our classic burger topped with crispy bacon and our special deluxe sauce.', price: 10.99, imageUrl: 'https://picsum.photos/400/300?random=22', prepTime: 15, composition: [{ingredientId: 'ing-1', quantity: 1, isMandatory: true}, {ingredientId: 'ing-6', quantity: 2, isMandatory: true}, {ingredientId: 'ing-2', quantity: 1, isMandatory: true}, {ingredientId: 'ing-5', quantity: 1, isMandatory: true}], discount: { percentage: 10, showToConsumer: true }, productionSpaceIds: ['pos-1'], capacityUsage: 1 },
    { id: 103, vendorId: 1, name: 'Spicy Jalapeño Burger', description: 'For those who like it hot! Featuring pepper jack cheese and fresh jalapeños.', price: 9.99, imageUrl: 'https://picsum.photos/400/300?random=23', prepTime: 14, composition: [{ingredientId: 'ing-1', quantity: 1, isMandatory: true}, {ingredientId: 'ing-8', quantity: 1, isMandatory: true}, {ingredientId: 'ing-9', quantity: 20, isMandatory: false}, {ingredientId: 'ing-5', quantity: 1, isMandatory: true}], allergens: [ALLERGENS[2]], productionSpaceIds: ['pos-1'], capacityUsage: 1 },
    { id: 104, vendorId: 1, name: 'Crispy Fries', description: 'Golden, crispy, and perfectly salted.', price: 3.50, imageUrl: 'https://picsum.photos/400/300?random=24', prepTime: 5, composition: [{ingredientId: 'ing-11', quantity: 0.2, isMandatory: true}], allergens: [ALLERGENS[0], ALLERGENS[1]], productionSpaceIds: ['pos-1'], capacityUsage: 0.5 },
    { id: 105, vendorId: 1, name: 'Fountain Soda', description: 'Refreshing bubbly goodness.', price: 2.50, imageUrl: 'https://picsum.photos/400/300?random=25', prepTime: 1, composition: [{ingredientId: 'ing-22', quantity: 0.1, isMandatory: true}], productionSpaceIds: ['pos-2'], capacityUsage: 0.2 },
    { id: 201, vendorId: 2, name: 'Margherita Pizza', description: 'Classic pizza with fresh mozzarella, San Marzano tomatoes, and basil.', price: 14.00, imageUrl: 'https://picsum.photos/400/300?random=31', prepTime: 15, composition: [{ingredientId: 'ing-12', quantity: 1, isMandatory: true}, {ingredientId: 'ing-13', quantity: 0.1, isMandatory: true}, {ingredientId: 'ing-14', quantity: 0.2, isMandatory: true}], allergens: [ALLERGENS[1]], intolerances: [INTOLERANCES[0]], productionSpaceIds: ['pos-3'], capacityUsage: 1 },
    { id: 202, vendorId: 2, name: 'Pepperoni Passion', description: 'Loaded with spicy pepperoni and gooey mozzarella.', price: 16.50, imageUrl: 'https://picsum.photos/400/300?random=32', prepTime: 15, composition: [{ingredientId: 'ing-12', quantity: 1, isMandatory: true}, {ingredientId: 'ing-16', quantity: 0.08, isMandatory: true}, {ingredientId: 'ing-13', quantity: 0.08, isMandatory: true}], productionSpaceIds: ['pos-3'], capacityUsage: 1 },
    { id: 203, vendorId: 2, name: 'Veggie Supreme', description: 'A garden on a pizza! Bell peppers, onions, olives, and mushrooms.', price: 15.50, imageUrl: 'https://picsum.photos/400/300?random=33', prepTime: 18, composition: [{ingredientId: 'ing-12', quantity: 1, isMandatory: true}, {ingredientId: 'ing-17', quantity: 0.05, isMandatory: false}, {ingredientId: 'ing-18', quantity: 0.05, isMandatory: false}, {ingredientId: 'ing-19', quantity: 0.05, isMandatory: false}, {ingredientId: 'ing-20', quantity: 0.05, isMandatory: false}], allergens: [ALLERGENS[1]], productionSpaceIds: ['pos-3'], capacityUsage: 1 },
    { id: 204, vendorId: 2, name: 'Garlic Knots', description: 'Warm, buttery, and garlicky. Perfect for dipping.', price: 5.00, imageUrl: 'https://picsum.photos/400/300?random=34', prepTime: 8, composition: [{ingredientId: 'ing-12', quantity: 0.5, isMandatory: true}, {ingredientId: 'ing-21', quantity: 0.05, isMandatory: true}], allergens: [ALLERGENS[1]], productionSpaceIds: ['pos-3'], capacityUsage: 0.5 },
];

export const MENU_TEMPLATES: MenuTemplate[] = [
    { 
        id: 1, 
        vendorId: 1, 
        name: 'Main Menu (Burgers)', 
        sections: [
            { id: 'sec-1-1', title: 'Signature Burgers', itemIds: [101, 102, 103] },
            { id: 'sec-1-2', title: 'Sides', itemIds: [104] },
            { id: 'sec-1-3', title: 'Drinks', itemIds: [105] },
        ]
    },
    { 
        id: 2, 
        vendorId: 2, 
        name: 'Main Menu (Pizza)', 
        sections: [
            { id: 'sec-2-1', title: 'Pizzas', itemIds: [201, 202, 203] },
            { id: 'sec-2-2', title: 'Starters', itemIds: [204] }
        ]
    },
];

export const BOARD_TEMPLATES: BoardTemplate[] = [
    {
        id: 1,
        vendorId: 1,
        name: 'Standard Burger Workflow',
        config: {
            statuses: [
                { id: 'pending', label: 'Pending', color: '#fb923c' },
                { id: 'accepted', label: 'Accepted', color: '#3b82f6' },
                { id: 'in-progress', label: 'In Progress', color: '#a855f7' },
                { id: 'ready-for-pickup', label: 'Ready for Pickup', color: '#facc15' },
                { id: 'completed', label: 'Completed', color: '#22c55e' },
                { id: 'rejected', label: 'Rejected', color: '#ef4444' },
            ],
            columns: [
                { id: 'col-1', title: 'New Orders', statusIds: ['pending'], icon: 'ClipboardListIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
                { id: 'col-2', title: 'In Progress', statusIds: ['accepted', 'in-progress'], icon: 'ChefHatIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
                { id: 'col-3', title: 'Ready for Pickup', statusIds: ['ready-for-pickup'], icon: 'ShoppingBagIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
            ],
            rejectionReasons: [
                { id: 'reason-1', message: 'Restaurant is too busy to accept new orders.' },
                { id: 'reason-2', message: 'One or more items are out of stock.' },
                { id: 'reason-3', message: 'Closing soon and cannot fulfill the order in time.' },
            ],
            statusTransitions: {
                'pending': ['accepted', 'rejected'],
                'accepted': ['in-progress'],
                'in-progress': ['ready-for-pickup'],
                'ready-for-pickup': ['completed'],
                'completed': [],
                'rejected': [],
            },
        }
    },
    {
        id: 2,
        vendorId: 2,
        name: 'Standard Pizza Workflow',
        config: {
           statuses: [
                { id: 'pending', label: 'Pending', color: '#fb923c' },
                { id: 'accepted', label: 'Accepted', color: '#3b82f6' },
                { id: 'in-progress', label: 'In Progress', color: '#a855f7' },
                { id: 'ready-for-pickup', label: 'Ready for Pickup', color: '#facc15' },
                { id: 'completed', label: 'Completed', color: '#22c55e' },
                { id: 'rejected', label: 'Rejected', color: '#ef4444' },
            ],
            columns: [
                { id: 'col-1', title: 'New Orders', statusIds: ['pending'], icon: 'ClipboardListIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
                { id: 'col-2', title: 'In Progress', statusIds: ['accepted', 'in-progress'], icon: 'ChefHatIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
                { id: 'col-3', title: 'Ready for Pickup', statusIds: ['ready-for-pickup'], icon: 'ShoppingBagIcon', titleColor: '#374151', columnColor: '#F3F4F6' },
            ],
            rejectionReasons: [
                { id: 'reason-1', message: 'Restaurant is too busy to accept new orders.' },
                { id: 'reason-2', message: 'One or more items are out of stock.' },
                { id: 'reason-3', message: 'Closing soon and cannot fulfill the order in time.' },
            ],
            statusTransitions: {
                'pending': ['accepted', 'rejected'],
                'accepted': ['in-progress'],
                'in-progress': ['ready-for-pickup'],
                'ready-for-pickup': ['completed'],
                'completed': [],
                'rejected': [],
            },
        }
    }
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    vendorId: 1,
    name: 'Burger Queen',
    description: 'Home of the Flame-Grilled Masterpiece. We serve the juiciest burgers in town.',
    bannerUrl: 'https://picsum.photos/1200/400?random=1',
    contact: { phone: '555-1234', email: 'contact@burgerqueen.com', address: '123 Burger Lane, Foodville' },
    openingHours: {
        monday: { isOpen: true, open: '11:00', close: '22:00' },
        tuesday: { isOpen: true, open: '11:00', close: '22:00' },
        wednesday: { isOpen: true, open: '11:00', close: '22:00' },
        thursday: { isOpen: true, open: '11:00', close: '22:00' },
        friday: { isOpen: true, open: '11:00', close: '23:00' },
        saturday: { isOpen: true, open: '11:00', close: '23:00' },
        sunday: { isOpen: false, open: '11:00', close: '22:00' },
    },
    paymentMethods: [PaymentMethod.CreditCard, PaymentMethod.Cash, PaymentMethod.Stripe],
    branding: { primaryColor: '#D97706', logoUrl: 'https://picsum.photos/200/200?random=11' },
    media: [
      { id: 1, type: MediaType.Video, title: 'How We Make Our Famous Burgers', source: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'A quick look behind the scenes at Burger Queen.' },
      { id: 2, type: MediaType.Text, title: 'Employee of the Month!', source: 'Congrats to Sarah J. for her amazing work this month!', description: 'Celebrating our amazing team.' },
    ],
    productionSpaceIds: ['pos-1', 'pos-2'],
    assignedMenuTemplateIds: [1],
  },
  {
    id: 2,
    vendorId: 2,
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza with the freshest ingredients. A slice of heaven!',
    bannerUrl: 'https://picsum.photos/1200/400?random=2',
    contact: { phone: '555-5678', email: 'ciao@pizzapalace.com', address: '456 Pizza Plaza, Foodville' },
    openingHours: {
        monday: { isOpen: false, open: '12:00', close: '23:00' },
        tuesday: { isOpen: true, open: '12:00', close: '23:00' },
        wednesday: { isOpen: true, open: '12:00', close: '23:00' },
        thursday: { isOpen: true, open: '12:00', close: '23:00' },
        friday: { isOpen: true, open: '12:00', close: '00:00' },
        saturday: { isOpen: true, open: '12:00', close: '00:00' },
        sunday: { isOpen: true, open: '12:00', close: '23:00' },
    },
    paymentMethods: [PaymentMethod.CreditCard, PaymentMethod.PayPal, PaymentMethod.Bizum, PaymentMethod.Cash],
    branding: { primaryColor: '#DC2626', logoUrl: 'https://picsum.photos/200/200?random=12' },
    media: [
       { id: 3, type: MediaType.Audio, title: 'Message from the Chef', source: 'https://www.w3schools.com/html/horse.ogg', description: 'Listen to Chef Giovanni talk about his passion for pizza.' },
       { id: 4, type: MediaType.Link, title: 'Catering Services', source: '#', description: 'Planning a party? Click to learn more.' },
    ],
    productionSpaceIds: ['pos-3'],
    assignedMenuTemplateIds: [2],
  },
];

const restaurantsForOrders = MENU_ITEM_TEMPLATES.flatMap(m => ({ ...m, restaurantId: RESTAURANTS.find(r => r.vendorId === m.vendorId)!.id, cartItemId: 0 }));

export const ORDERS: Order[] = [
    { id: 'ORD-123', restaurantId: 1, items: [{...restaurantsForOrders[0], quantity: 1, removedIngredients: ['White Onion']}, {...restaurantsForOrders[3], quantity: 1}], total: 12.49, status: 'pending', orderTime: new Date(Date.now() - 5 * 60000), lastUpdateTime: new Date(Date.now() - 5 * 60000) },
    { id: 'ORD-124', restaurantId: 1, items: [{...restaurantsForOrders[1], quantity: 2}], total: 21.98, status: 'in-progress', orderTime: new Date(Date.now() - 10 * 60000), lastUpdateTime: new Date(Date.now() - 2 * 60000) },
    { id: 'ORD-125', restaurantId: 2, items: [{...restaurantsForOrders[5], quantity: 1}], total: 16.50, status: 'ready-for-pickup', orderTime: new Date(Date.now() - 15 * 60000), lastUpdateTime: new Date(Date.now() - 1 * 60000) },
    { id: 'ORD-126', restaurantId: 1, items: [{...restaurantsForOrders[2], quantity: 1}, {...restaurantsForOrders[4], quantity: 1}], total: 12.49, status: 'accepted', orderTime: new Date(Date.now() - 8 * 60000), lastUpdateTime: new Date(Date.now() - 4 * 60000) },
    { id: 'ORD-127', restaurantId: 1, items: [{...restaurantsForOrders[0], quantity: 1}], total: 8.99, status: 'completed', orderTime: new Date(Date.now() - 30 * 60000), lastUpdateTime: new Date(Date.now() - 10 * 60000), completionTime: 20 },
    { id: 'ORD-128', restaurantId: 2, items: [{...restaurantsForOrders[4], quantity: 2}], total: 28.00, status: 'completed', orderTime: new Date(Date.now() - 45 * 60000), lastUpdateTime: new Date(Date.now() - 25 * 60000), completionTime: 20 },
    { id: 'ORD-129', restaurantId: 1, items: [{...restaurantsForOrders[3], quantity: 3}], total: 10.50, status: 'completed', orderTime: new Date(Date.now() - 60 * 60000), lastUpdateTime: new Date(Date.now() - 48 * 60000), completionTime: 12 },
    { id: 'ORD-130', restaurantId: 1, items: [{...restaurantsForOrders[1], quantity: 1}], total: 10.99, status: 'rejected', orderTime: new Date(Date.now() - 5 * 60000), lastUpdateTime: new Date(Date.now() - 3 * 60000), rejectionReason: 'Restaurant is too busy to accept new orders.' },
];

export const PROMOTIONS: Promotion[] = [
    { id: 'promo-1', vendorId: 1, restaurantId: 1, title: 'Happy Hour!', description: '50% off all drinks between 5PM and 7PM.', type: PromotionType.PercentageOff, value: 50, targetItemIds: [105], isActive: true },
];
