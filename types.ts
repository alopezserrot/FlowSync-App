
export enum UserRole {
  Consumer = 'Consumer',
  Vendor = 'Vendor',
  SuperAdmin = 'SuperAdmin',
  RestaurantAdmin = 'RestaurantAdmin',
}

export interface RestaurantPermissions {
  canViewAnalytics: boolean;
  canManageMenu: boolean;
  canManageSettings: boolean;
  canManageOrders: boolean;
}

export interface ActiveHours {
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface PermissionSchedule {
  monday: ActiveHours;
  tuesday: ActiveHours;
  wednesday: ActiveHours;
  thursday: ActiveHours;
  friday: ActiveHours;
  saturday: ActiveHours;
  sunday: ActiveHours;
}

export interface User {
  id: number;
  name: string;
  username: string;
  password?: string; // Optional for security, but we'll use it for our simulation
  role: UserRole;
  vendorId?: number; 
  restaurantId?: number; // For RestaurantAdmin
  linkedRestaurantIds?: number[]; // For consumers linked to restaurants
  permissions?: RestaurantPermissions;
  permissionSchedule?: PermissionSchedule;
}

export enum MediaType {
  Video = 'video',
  Audio = 'audio',
  Text = 'text',
  Link = 'link',
  Image = 'image',
}

export interface MediaContent {
  id: number;
  type: MediaType;
  title: string;
  source: string; // URL for video/audio/link/image, content for text
  description?: string;
}

export interface Allergen {
  id: string;
  name: string;
}

export interface Intolerance {
    id: string;
    name: string;
    icon: string;
}

export interface StockLocation {
    id: string;
    name: string;
    quantity: number;
}

export interface Ingredient {
  id: string;
  vendorId: number;
  sku: string; // Added SKU
  name: string;
  category: string; // Changed to string to allow custom categories via datalist
  stock: number; // Total stock (sum of locations)
  locations: StockLocation[]; // Added Multi-location support
  unit: 'units' | 'g' | 'kg' | 'ml' | 'l';
  costPerUnit: number; 
}

export interface ProductionSpace { // Renamed from PointOfSale
  id: string;
  vendorId: number;
  name: string;
  boardTemplateId: number;
  concurrentCapacity: number; // Total capacity units of this space
}

export interface MenuItemTemplate {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  prepTime: number; // Estimated preparation time in minutes
  allergens?: Allergen[];
  intolerances?: Intolerance[];
  discount?: {
      percentage: number;
      showToConsumer: boolean;
  };
  composition: { 
      ingredientId: string; 
      quantity: number;
      isMandatory: boolean; // Added Mandatory flag
  }[];
  productionSpaceIds: string[]; // Changed from single ID to array
  capacityUsage: number; // How much capacity this item consumes (default 1)
  isSeparateFulfillment?: boolean; // Added for separate fulfillment items (e.g. drinks)
}

export interface MenuSection {
    id: string;
    title: string;
    itemIds: number[];
}

export interface MenuTemplate {
    id: number;
    vendorId: number;
    name:string;
    sections: MenuSection[];
}

export interface RestaurantBranding {
  primaryColor: string;
  logoUrl: string;
}

export enum PaymentMethod {
    CreditCard = 'Credit Card',
    PayPal = 'PayPal',
    Bizum = 'Bizum',
    Stripe = 'Stripe',
    Cash = 'Cash',
}

export interface OrderStatusConfig {
  id: string; // e.g., 'pending', 'baking', 'ready'
  label: string; // e.g., 'Pending', 'Baking', 'Ready for Pickup'
  color: string; // Hex color code
}

export interface RejectionReason {
  id: string;
  message: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  statusIds: string[]; // Array of OrderStatusConfig ids
  icon?: string;
  titleColor?: string;
  columnColor?: string;
}

export interface OrderManagementConfig {
  statuses: OrderStatusConfig[];
  columns: KanbanColumn[];
  rejectionReasons: RejectionReason[];
  // Key is the status ID, value is an array of allowed next status IDs
  statusTransitions: Record<string, string[]>;
}

export interface BoardTemplate {
    id: number;
    name: string;
    vendorId: number;
    config: OrderManagementConfig;
}

export interface DayOpeningHours {
  isOpen: boolean;
  open: string;
  close: string;
}

export interface Restaurant {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  bannerUrl: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  openingHours: {
    monday: DayOpeningHours;
    tuesday: DayOpeningHours;
    wednesday: DayOpeningHours;
    thursday: DayOpeningHours;
    friday: DayOpeningHours;
    saturday: DayOpeningHours;
    sunday: DayOpeningHours;
  };
  paymentMethods: PaymentMethod[];
  branding: RestaurantBranding;
  media: MediaContent[];
  productionSpaceIds?: string[]; // Renamed from pointOfSaleIds
  assignedMenuTemplateIds?: number[];
}

export interface Vendor {
    id: number;
    name: string;
}

export interface CartItem extends MenuItemTemplate {
  cartItemId: number; // Unique identifier for this specific item in the cart
  quantity: number;
  restaurantId: number;
  removedIngredients?: string[];
}

export interface NotificationMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface Order {
    id: string;
    restaurantId: number;
    items: CartItem[];
    total: number;
    status: string;
    orderTime: Date;
    lastUpdateTime: Date;
    customerPhoneNumber?: string;
    completionTime?: number; // in minutes
    rejectionReason?: string;
}

export enum PromotionType {
    PercentageOff = 'percentage_off',
    FixedAmountOff = 'fixed_amount_off',
    BOGO = 'buy_one_get_one',
}

export interface Promotion {
    id: string;
    vendorId: number;
    restaurantId: number;
    title: string;
    description: string;
    type: PromotionType;
    value: number; // e.g., 10 for 10% or $10
    targetItemIds?: number[]; // Specific items, or null for global
    isActive: boolean;
    isAutoGenerated?: boolean;
}

export type View = 'home' | 'restaurant' | 'checkout' | 'vendorDashboard' | 'superAdminDashboard' | 'orderStatus' | 'login';
