
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'es';

type Translations = {
    [key: string]: string;
};

const dictionary: Record<Language, Translations> = {
    en: {
        // General
        'loading': 'Loading...',
        'welcome': 'Welcome',
        'logout': 'Logout',
        'admin_login': 'Admin Login',
        'exit_guest': 'Exit to Guest View',
        'find_order': 'Find Order',
        'follow_orders': 'Track Orders',
        'dashboard': 'Dashboard',
        'search_placeholder': 'Search...',
        'cancel': 'Cancel',
        'save': 'Save',
        'delete': 'Delete',
        'edit': 'Edit',
        'create': 'Create',
        'back': 'Back',
        'submit': 'Submit',
        'remove': 'Remove',
        'add': 'Add',
        'upload': 'Upload',
        'quantity': 'Quantity',
        'description': 'Description',
        'image': 'Image',
        'name': 'Name',
        
        // Home
        'welcome_title': 'Welcome to FlowApp!',
        'welcome_subtitle': 'Scan a QR code at a restaurant to begin, or select from your history below.',
        'your_restaurants': 'Your Restaurants',
        'your_event': 'Your Event',
        'all_restaurants': 'All Restaurants',
        'scan_instruction': 'Scan QR codes at restaurants to begin.',
        'discover_feed': 'Discover',
        'get_updates': 'Get Real-time Updates',
        'enable_push_desc': 'Enable push notifications to get order status updates and exclusive deals.',
        'notifications_active': 'Notifications Active',
        'you_will_receive_promos': 'You will receive order updates and promos.',
        'enable_notifications': 'Enable',
        'maybe_later': 'Maybe Later',

        // Restaurant Page
        'back_to_restaurants': 'Back to all restaurants',
        'whats_new': "What's New",
        'restaurant_info': 'Restaurant Info',
        'scan_direct_access': 'Scan for Direct Access!',
        'add_to_cart': 'Add to Cart',
        'sold_out': 'SOLD OUT',
        'contains': 'Contains',
        'note_stock_issue': 'Note: Some non-essential ingredients are out of stock.',
        'generating_ai': 'Generating delicious description...',
        'customize_ingredients': 'Customize Ingredients',
        'essential': 'Essential',
        'hours': 'Hours',
        'address': 'Address',
        'phone': 'Phone',
        'email': 'Email',

        // Cart & Checkout
        'your_order': 'Your Order',
        'empty_cart': 'Your cart is empty.',
        'subtotal': 'Subtotal',
        'taxes': 'Taxes & Fees',
        'delivery': 'Delivery',
        'total': 'Total',
        'checkout': 'Checkout',
        'place_order': 'Place Order',
        'payment_method': 'Payment Method',
        'contact_payment': 'Contact & Payment',
        'phone_label': 'Phone Number for Tracking',
        'name_on_card': 'Name on Card',
        'card_number': 'Card Number',
        'expiry': 'Expiry',
        'cvc': 'CVC',
        'pay_paypal': 'Redirecting to PayPal...',
        'pay_cash': 'Pay at counter.',
        'pay_bizum': 'Bizum instructions will follow.',
        'go_to_checkout': 'Go to Checkout',
        'back_to_restaurant': 'Back to Restaurant',

        // Login
        'admin_sign_in': 'Administrator Sign In',
        'username': 'Username',
        'password': 'Password',
        'sign_in': 'Sign in',
        'signing_in': 'Signing in...',
        'demo_logins': 'Demo Logins',
        'scan_test_customer': 'Scan to test the Customer View',
        'invalid_credentials': 'Invalid credentials. Please try again.',

        // Vendor Dashboard Tabs
        'analytics': 'Analytics',
        'orders': 'Orders',
        'menu': 'Menu',
        'inventory': 'Inventory',
        'spaces': 'Spaces',
        'promotions': 'Promotions',
        'settings': 'Settings',
        'boards': 'Templates',

        // Analytics
        'total_revenue': 'Total Revenue',
        'gross_margin': 'Gross Margin',
        'avg_order_value': 'Avg Order Value',
        'orders_today': 'Orders Today',
        'hourly_heatmap': 'Hourly Sales Heatmap',
        'top_items': 'Top Items Performance',
        'order_completion_times': 'Order Completion Times',
        'live_data': 'Live Data',
        'financial_analytics': 'Financial & Operational Analytics',
        'sold': 'Sold',
        'profit': 'Profit',
        'duration': 'Duration',
        'no_completed_orders': 'No completed orders data available.',

        // Orders Status
        'status_pending': 'Pending',
        'status_accepted': 'Accepted',
        'status_in_progress': 'Cooking',
        'status_ready_for_pickup': 'Ready',
        'status_completed': 'Completed',
        'status_rejected': 'Rejected',
        'delayed': 'Delayed',
        'on_time': 'On Time',
        'progress': 'Progress',
        'min_ago': 'min ago',
        'reject': 'Reject',
        
        // Consumer Order Page
        'tracking_order': 'Tracking Order',
        'est_total': 'Est. Total',
        'est_wait': 'Est. Wait',
        'mins_remaining': 'Mins Remaining',
        'orders_ahead': 'Orders Ahead',
        'kitchen_order': 'Kitchen Order',
        'quick_pickup': 'QUICK PICKUP',
        'ready_pickup_msg': 'Go to the counter to collect these items immediately.',
        'order_completed_title': 'Order Completed!',
        'order_completed_msg': 'Thank you for your order. Enjoy your meal!',
        'mark_received': 'Mark as Received',
        'order_rejected_title': 'Order Rejected',
        'order_rejected_msg': 'We are sorry, the restaurant could not accept this order.',
        'reason': 'Reason',
        
        // Menu Manager
        'menu_templates': 'Menu Templates',
        'item_library': 'Item Library',
        'create_menu': 'Create Menu',
        'create_item': 'Create Item',
        'ingredients': 'Ingredients',
        'price': 'Price',
        'prep_time': 'Prep Time (min)',
        'capacity_load': 'Capacity Load',
        'separate_fulfillment': 'Separate Ticket / Quick Pickup',
        'menu_name': 'Menu Name',
        'new_section': 'New Section',
        'add_section': 'Add Section',
        'select_ingredient': 'Select Ingredient',
        'mandatory': 'Mandatory?',
        'paste_image_url': 'Paste Image URL',
        'assigned_spaces': 'Assigned Production Spaces',
        'no_menus': 'No menus created yet.',
        'no_items': 'No items created yet.',
        'create_edit_item': 'Create/Edit Menu Item',
        'edit_menu': 'Edit Menu',
        
        // Inventory
        'inventory_management': 'Inventory Management',
        'add_ingredient': 'Add Ingredient',
        'sku': 'SKU',
        'stock': 'Stock',
        'cost_unit': 'Cost/Unit',
        'storage_locations': 'Storage Locations',
        'add_location': 'Add Location',
        'location_name': 'Location Name',
        'category': 'Category',
        'no_locations': 'No locations defined.',
        
        // Spaces
        'manage_spaces': 'Manage Spaces',
        'add_space': 'Add Production Space',
        'workflow_template': 'Workflow Template',
        'total_capacity': 'Total Installed Capacity (Units)',
        'edit_space': 'Edit Space',
        'create_space': 'Crear Espacio',

        // Settings & Staff
        'restaurant_details': 'Restaurant Details',
        'save_details': 'Save Details',
        'staff_management': 'Staff Management',
        'add_manager': 'Add Manager',
        'restaurant_admin': 'Restaurant Admin',
        'save_changes': 'Save Changes',
        'managing': 'Managing:',
        'shift_ended': 'Shift Ended - Read Only Mode',
        'no_restaurants_found': 'No restaurants found.',

        // Board Templates
        'workflow_templates': 'Workflow Templates',
        'create_template': 'Create Template',
        'edit_board_template': 'Edit Board Template',
        'template_name': 'Template Name',
        
        // Marketing
        'marketing_promotions': 'Marketing & Promotions',
        'new_promotion': 'New Promotion',
        'ai_insight': 'AI Growth Insight',
        'apply_deal': 'Apply Recommended Deal',
        'active': 'Active',
        'paused': 'Paused',
        'create_promotion': 'Create Promotion',
        'title': 'Title',
        'type': 'Type',
        'value': 'Value',
        'specific_item': 'Specific Item (Optional)',
        'apply_whole_order': 'Apply to Whole Order',
        'create_promo_btn': 'Create Promo',
    },
    es: {
        // General
        'loading': 'Cargando...',
        'welcome': 'Bienvenido',
        'logout': 'Cerrar Sesión',
        'admin_login': 'Acceso Admin',
        'exit_guest': 'Salir a Vista Invitado',
        'find_order': 'Buscar Pedido',
        'follow_orders': 'Seguir Pedidos',
        'dashboard': 'Panel de Control',
        'search_placeholder': 'Buscar...',
        'cancel': 'Cancelar',
        'save': 'Guardar',
        'delete': 'Eliminar',
        'edit': 'Editar',
        'create': 'Crear',
        'back': 'Volver',
        'submit': 'Enviar',
        'remove': 'Eliminar',
        'add': 'Añadir',
        'upload': 'Subir',
        'quantity': 'Cantidad',
        'description': 'Descripción',
        'image': 'Imagen',
        'name': 'Nombre',

        // Home
        'welcome_title': '¡Bienvenido a FlowApp!',
        'welcome_subtitle': 'Escanea un código QR en un restaurante para comenzar, o selecciona de tu historial.',
        'your_restaurants': 'Tus Restaurantes',
        'your_event': 'Tu Evento',
        'all_restaurants': 'Todos los Restaurantes',
        'scan_instruction': 'Escanea códigos QR en restaurantes para empezar.',
        'discover_feed': 'Descubrir',
        'get_updates': 'Recibir Alertas',
        'enable_push_desc': 'Activa notificaciones para seguir tu pedido y recibir ofertas.',
        'notifications_active': 'Notificaciones Activas',
        'you_will_receive_promos': 'Recibirás actualizaciones y promos.',
        'enable_notifications': 'Activar',
        'maybe_later': 'Quizás Luego',

        // Restaurant Page
        'back_to_restaurants': 'Volver a todos los restaurantes',
        'whats_new': 'Novedades',
        'restaurant_info': 'Info del Restaurante',
        'scan_direct_access': '¡Escanea para Acceso Directo!',
        'add_to_cart': 'Añadir al Carrito',
        'sold_out': 'AGOTADO',
        'contains': 'Contiene',
        'note_stock_issue': 'Nota: Faltan algunos ingredientes no esenciales.',
        'generating_ai': 'Generando descripción deliciosa...',
        'customize_ingredients': 'Personalizar Ingredientes',
        'essential': 'Esencial',
        'hours': 'Horario',
        'address': 'Dirección',
        'phone': 'Teléfono',
        'email': 'Email',

        // Cart & Checkout
        'your_order': 'Tu Pedido',
        'empty_cart': 'Tu carrito está vacío.',
        'subtotal': 'Subtotal',
        'taxes': 'Impuestos y Tasas',
        'delivery': 'Entrega',
        'total': 'Total',
        'checkout': 'Pagar',
        'place_order': 'Realizar Pedido',
        'payment_method': 'Método de Pago',
        'contact_payment': 'Contacto y Pago',
        'phone_label': 'Número de Teléfono (Seguimiento)',
        'name_on_card': 'Nombre en Tarjeta',
        'card_number': 'Número de Tarjeta',
        'expiry': 'Vencimiento',
        'cvc': 'CVC',
        'pay_paypal': 'Redirigiendo a PayPal...',
        'pay_cash': 'Pagar en mostrador.',
        'pay_bizum': 'Instrucciones de Bizum seguirán.',
        'go_to_checkout': 'Ir a Pagar',
        'back_to_restaurant': 'Volver al Restaurante',

        // Login
        'admin_sign_in': 'Acceso de Administrador',
        'username': 'Usuario',
        'password': 'Contraseña',
        'sign_in': 'Iniciar Sesión',
        'signing_in': 'Iniciando...',
        'demo_logins': 'Logins de Demo',
        'scan_test_customer': 'Escanea para probar la Vista de Cliente',
        'invalid_credentials': 'Credenciales inválidas. Intenta de nuevo.',

        // Vendor Dashboard Tabs
        'analytics': 'Analítica',
        'orders': 'Pedidos',
        'menu': 'Menú',
        'inventory': 'Inventario',
        'spaces': 'Espacios',
        'promotions': 'Marketing',
        'settings': 'Configuración',
        'boards': 'Plantillas',

        // Analytics
        'total_revenue': 'Ingresos Totales',
        'gross_margin': 'Margen Bruto',
        'avg_order_value': 'Valor Promedio',
        'orders_today': 'Pedidos Hoy',
        'hourly_heatmap': 'Mapa de Calor (Ventas/Hora)',
        'top_items': 'Productos Más Vendidos',
        'order_completion_times': 'Tiempos de Preparación',
        'live_data': 'En Vivo',
        'financial_analytics': 'Analítica Financiera y Operativa',
        'sold': 'Vendidos',
        'profit': 'Ganancia',
        'duration': 'Duración',
        'no_completed_orders': 'No hay datos de pedidos completados.',

        // Orders Status
        'status_pending': 'Pendiente',
        'status_accepted': 'Aceptado',
        'status_in_progress': 'Cocinando',
        'status_ready_for_pickup': 'Listo para Retirar',
        'status_completed': 'Completado',
        'status_rejected': 'Rechazado',
        'delayed': 'Retrasado',
        'on_time': 'A tiempo',
        'progress': 'Progreso',
        'min_ago': 'min atrás',
        'reject': 'Rechazar',

        // Consumer Order Page
        'tracking_order': 'Siguiendo Pedido',
        'est_total': 'Est. Total',
        'est_wait': 'Espera Est.',
        'mins_remaining': 'Mins Restantes',
        'orders_ahead': 'Pedidos Delante',
        'kitchen_order': 'Pedido de Cocina',
        'quick_pickup': 'RETIRO RÁPIDO',
        'ready_pickup_msg': 'Ve al mostrador para retirar estos artículos inmediatamente.',
        'order_completed_title': '¡Pedido Completado!',
        'order_completed_msg': 'Gracias por tu pedido. ¡Buen provecho!',
        'mark_received': 'Marcar como Recibido',
        'order_rejected_title': 'Pedido Rechazado',
        'order_rejected_msg': 'Lo sentimos, el restaurante no pudo aceptar este pedido.',
        'reason': 'Razón',

        // Menu Manager
        'menu_templates': 'Plantillas de Menú',
        'item_library': 'Biblioteca de Platos',
        'create_menu': 'Crear Menú',
        'create_item': 'Crear Plato',
        'ingredients': 'Ingredientes',
        'price': 'Precio',
        'prep_time': 'Tiempo Prep. (min)',
        'capacity_load': 'Carga Capacidad',
        'separate_fulfillment': 'Ticket Separado / Retiro Inmediato',
        'menu_name': 'Nombre del Menú',
        'new_section': 'Nueva Sección',
        'add_section': 'Añadir Sección',
        'select_ingredient': 'Seleccionar Ingrediente',
        'mandatory': 'Obligatorio?',
        'paste_image_url': 'Pegar URL de Imagen',
        'assigned_spaces': 'Espacios de Producción Asignados',
        'no_menus': 'Aún no hay menús creados.',
        'no_items': 'Aún no hay platos creados.',
        'create_edit_item': 'Crear/Editar Plato',
        'edit_menu': 'Editar Menú',

        // Inventory
        'inventory_management': 'Gestión de Inventario',
        'add_ingredient': 'Agregar Ingrediente',
        'sku': 'SKU',
        'stock': 'Stock',
        'cost_unit': 'Costo/Unidad',
        'storage_locations': 'Ubicaciones de Almacenamiento',
        'add_location': 'Añadir Ubicación',
        'location_name': 'Nombre Ubicación',
        'category': 'Categoría',
        'no_locations': 'No hay ubicaciones definidas.',

        // Spaces
        'manage_spaces': 'Gestionar Espacios',
        'add_space': 'Añadir Espacio',
        'workflow_template': 'Plantilla de Flujo',
        'total_capacity': 'Capacidad Total (Unidades)',
        'edit_space': 'Editar Espacio',
        'create_space': 'Crear Espacio',

        // Settings & Staff
        'restaurant_details': 'Detalles del Restaurante',
        'save_details': 'Guardar Detalles',
        'staff_management': 'Gestión de Personal',
        'add_manager': 'Añadir Gerente',
        'restaurant_admin': 'Admin de Restaurante',
        'save_changes': 'Guardar Cambios',
        'managing': 'Gestionando:',
        'shift_ended': 'Turno Finalizado - Modo Solo Lectura',
        'no_restaurants_found': 'No se encontraron restaurantes.',

        // Board Templates
        'workflow_templates': 'Plantillas de Flujo de Trabajo',
        'create_template': 'Crear Plantilla',
        'edit_board_template': 'Editar Plantilla de Tablero',
        'template_name': 'Nombre de Plantilla',

        // Marketing
        'marketing_promotions': 'Marketing y Promociones',
        'new_promotion': 'Nueva Promoción',
        'ai_insight': 'Insight IA',
        'apply_deal': 'Aplicar Oferta Recomendada',
        'active': 'Activo',
        'paused': 'Pausado',
        'create_promotion': 'Crear Promoción',
        'title': 'Título',
        'type': 'Tipo',
        'value': 'Valor',
        'specific_item': 'Artículo Específico (Opcional)',
        'apply_whole_order': 'Aplicar a Todo el Pedido',
        'create_promo_btn': 'Crear Promo',
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => {},
    t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('es'); 

    const t = (key: string) => {
        return dictionary[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
