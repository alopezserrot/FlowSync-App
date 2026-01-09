
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Vendor, Restaurant, MenuItemTemplate, Order, User, UserRole, RestaurantPermissions, PermissionSchedule, ActiveHours, OrderManagementConfig, BoardTemplate, MediaType, MediaContent, MenuTemplate, MenuSection, Ingredient, ProductionSpace, Promotion, PromotionType, DayOpeningHours } from '../types';
import { fileToBase64, ChartIcon, SettingsIcon, MenuBookIcon, PlusIcon, EditIcon, TrashIcon, ClipboardListIcon, ChefHatIcon, ShoppingBagIcon, CheckCircleIcon, HourglassIcon, FlagCheckeredIcon, PackageIcon, SparklesIcon, XCircleIcon, VideoIcon } from './Shared';
import { useLanguage } from '../i18nContext';

const ICON_MAP: Record<string, React.FC<{className?: string}>> = {
    ClipboardListIcon,
    ChefHatIcon,
    ShoppingBagIcon,
    CheckCircleIcon,
    HourglassIcon,
    XCircleIcon,
    ChartIcon,
    SettingsIcon,
    MenuBookIcon,
    FlagCheckeredIcon,
    PackageIcon,
    SparklesIcon,
};

const isUserActive = (user: User): boolean => {
    if (user.role !== UserRole.RestaurantAdmin || !user.permissionSchedule) {
        return true; 
    }
    const now = new Date();
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()] as keyof PermissionSchedule;
    const scheduleForToday = user.permissionSchedule[dayOfWeek];
    if (!scheduleForToday || !scheduleForToday.isActive) return false;

    const { startTime, endTime } = scheduleForToday;
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
};

const RestaurantDetailsForm: React.FC<{restaurant: Restaurant, onSave: (r: Restaurant) => void}> = ({ restaurant, onSave }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Restaurant>(restaurant);
    const [editingMedia, setEditingMedia] = useState<Partial<MediaContent> | null>(null);
    const mediaFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(restaurant);
    }, [restaurant]);

    const handleHourChange = (day: keyof Restaurant['openingHours'], field: keyof DayOpeningHours, value: any) => {
        setFormData(prev => ({
            ...prev,
            openingHours: {
                ...prev.openingHours,
                [day]: { ...prev.openingHours[day], [field]: value }
            }
        }));
    };

    const handleSaveMedia = (media: Partial<MediaContent>) => {
        const newMediaList = [...(formData.media || [])];
        if (media.id) {
            const idx = newMediaList.findIndex(m => m.id === media.id);
            if (idx > -1) newMediaList[idx] = media as MediaContent;
        } else {
            newMediaList.push({ ...media, id: Date.now() } as MediaContent);
        }
        setFormData(prev => ({ ...prev, media: newMediaList }));
        setEditingMedia(null);
    };

    const handleMediaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && editingMedia) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setEditingMedia(prev => prev ? ({ ...prev, source: base64 }) : null);
            } catch (error) {
                console.error("Failed to convert media file to Base64", error);
            }
        }
    };

    const removeMedia = (id: number) => {
        setFormData(prev => ({ ...prev, media: prev.media.filter(m => m.id !== id) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-secondary border-b pb-3 mb-4">{t('basic_information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('restaurant_name')}</label>
                        <input 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full p-2.5 border rounded-lg bg-white text-black focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('brand_color')}</label>
                        <div className="flex items-center space-x-3">
                            <input 
                                type="color" 
                                value={formData.branding.primaryColor} 
                                onChange={e => setFormData({...formData, branding: {...formData.branding, primaryColor: e.target.value}})} 
                                className="h-10 w-20 border rounded cursor-pointer p-1"
                            />
                            <span className="text-xs font-mono text-gray-500">{formData.branding.primaryColor.toUpperCase()}</span>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('description')}</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            rows={3}
                            className="w-full p-2.5 border rounded-lg bg-white text-black focus:ring-2 focus:ring-primary/20" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-secondary border-b pb-3 mb-4">{t('contact_details')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('phone')}</label>
                        <input 
                            value={formData.contact.phone} 
                            onChange={e => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})} 
                            className="w-full p-2.5 border rounded-lg bg-white text-black" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('email')}</label>
                        <input 
                            type="email"
                            value={formData.contact.email} 
                            onChange={e => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})} 
                            className="w-full p-2.5 border rounded-lg bg-white text-black" 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t('address')}</label>
                        <input 
                            value={formData.contact.address} 
                            onChange={e => setFormData({...formData, contact: {...formData.contact, address: e.target.value}})} 
                            className="w-full p-2.5 border rounded-lg bg-white text-black" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-secondary border-b pb-3 mb-4">{t('opening_hours')}</h3>
                <div className="space-y-3">
                    {Object.entries(formData.openingHours).map(([day, hoursUntyped]) => {
                        const hours = hoursUntyped as DayOpeningHours;
                        return (
                            <div key={day} className="flex flex-wrap items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="w-24 font-bold text-gray-700 capitalize">{day}</div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={hours.isOpen} 
                                            onChange={e => handleHourChange(day as any, 'isOpen', e.target.checked)}
                                            className="h-4 w-4 text-primary rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-600">{hours.isOpen ? t('open') : t('closed')}</span>
                                    </label>
                                    {hours.isOpen && (
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="time" 
                                                value={hours.open} 
                                                onChange={e => handleHourChange(day as any, 'open', e.target.value)}
                                                className="p-1 border rounded text-sm bg-white text-black"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input 
                                                type="time" 
                                                value={hours.close} 
                                                onChange={e => handleHourChange(day as any, 'close', e.target.value)}
                                                className="p-1 border rounded text-sm bg-white text-black"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-secondary">{t('media_multimedia')}</h3>
                    <button 
                        type="button" 
                        onClick={() => setEditingMedia({ type: MediaType.Video, source: '' })}
                        className="text-primary font-bold text-sm flex items-center hover:text-orange-700"
                    >
                        <PlusIcon className="w-4 h-4 mr-1"/> {t('add_content')}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.media.map(item => (
                        <div key={item.id} className="border rounded-lg p-3 relative group hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                                    {item.type}
                                </span>
                                <div className="flex space-x-1">
                                    <button type="button" onClick={() => setEditingMedia(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><EditIcon className="w-4 h-4"/></button>
                                    <button type="button" onClick={() => removeMedia(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                            <h4 className="font-bold text-secondary text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{item.source?.startsWith('data:') ? 'Uploaded File' : item.source}</p>
                        </div>
                    ))}
                    {formData.media.length === 0 && (
                        <div className="col-span-full py-10 text-center text-gray-400 italic bg-gray-50 rounded-lg border-2 border-dashed">
                            No multimedia content added yet.
                        </div>
                    )}
                </div>
            </div>

            <div className="sticky bottom-4 flex justify-end">
                <button 
                    type="submit" 
                    className="bg-primary text-white px-10 py-3 rounded-full font-black text-lg shadow-xl hover:bg-orange-600 transform hover:-translate-y-1 transition-all active:scale-95"
                >
                    {t('save_profile_changes')}
                </button>
            </div>

            {editingMedia && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md space-y-4">
                        <h3 className="text-xl font-bold text-secondary">{editingMedia.id ? 'Edit Content' : 'Add Content'}</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                            <select 
                                value={editingMedia.type} 
                                onChange={e => setEditingMedia({...editingMedia, type: e.target.value as MediaType})}
                                className="w-full p-2 border rounded-lg bg-white text-black"
                            >
                                <option value={MediaType.Video}>Video</option>
                                <option value={MediaType.Image}>Image</option>
                                <option value={MediaType.Audio}>Audio</option>
                                <option value={MediaType.Link}>External Link</option>
                                <option value={MediaType.Text}>Text Update</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                            <input 
                                value={editingMedia.title || ''} 
                                onChange={e => setEditingMedia({...editingMedia, title: e.target.value})}
                                className="w-full p-2 border rounded-lg bg-white text-black"
                                placeholder="Display title..."
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-700">Source / Content</label>
                                {[MediaType.Video, MediaType.Image, MediaType.Audio].includes(editingMedia.type as MediaType) && (
                                    <button 
                                        type="button" 
                                        onClick={() => mediaFileInputRef.current?.click()}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        Upload File
                                    </button>
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={mediaFileInputRef} 
                                onChange={handleMediaFileUpload} 
                                className="hidden" 
                                accept={
                                    editingMedia.type === MediaType.Video ? "video/*" : 
                                    editingMedia.type === MediaType.Image ? "image/*" : 
                                    editingMedia.type === MediaType.Audio ? "audio/*" : undefined
                                }
                            />
                            {editingMedia.source?.startsWith('data:') && (
                                <div className="mb-2 p-2 bg-green-50 text-green-700 text-[10px] rounded border border-green-200 flex items-center">
                                    <CheckCircleIcon className="w-3 h-3 mr-1" /> File processed & ready to save
                                </div>
                            )}
                            {editingMedia.type === MediaType.Text ? (
                                <textarea 
                                    value={editingMedia.source || ''} 
                                    onChange={e => setEditingMedia({...editingMedia, source: e.target.value})}
                                    className="w-full p-2 border rounded-lg bg-white text-black"
                                    rows={4}
                                />
                            ) : (
                                <input 
                                    value={editingMedia.source?.startsWith('data:') ? '' : editingMedia.source || ''} 
                                    onChange={e => setEditingMedia({...editingMedia, source: e.target.value})}
                                    className="w-full p-2 border rounded-lg bg-white text-black"
                                    placeholder={editingMedia.source?.startsWith('data:') ? "File is uploaded" : "https://..."}
                                />
                            )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <button type="button" onClick={() => setEditingMedia(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">Cancel</button>
                            <button type="button" onClick={() => handleSaveMedia(editingMedia)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

const Analytics: React.FC<{restaurant: Restaurant, orders: Order[], users: User[], ingredients: Ingredient[], menuItems: MenuItemTemplate[]}> = ({ restaurant, orders, users, ingredients, menuItems }) => {
    const { t } = useLanguage();
    const { 
        todaysStats, avgPrepTime, financials, hourlyHeatmapData, itemPerformanceData, completedOrderTimes
    } = useMemo(() => {
        const restaurantOrders = orders.filter(o => o.restaurantId === restaurant.id);
        const completedOrders = restaurantOrders.filter(o => o.status === 'completed');
        const today = new Date();
        const isToday = (date: Date) => date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        
        const todaysOrders = restaurantOrders.filter(o => isToday(o.orderTime));
        const statusCounts = todaysOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalPrepTime = completedOrders.reduce((sum, order) => sum + (order.completionTime || 0), 0);
        const avgPrepTime = completedOrders.length > 0 ? (totalPrepTime / completedOrders.length).toFixed(1) : 'N/A';
        
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
        let totalCOGS = 0;
        completedOrders.forEach(order => {
            order.items.forEach(orderItem => {
                const template = menuItems.find(t => t.id === orderItem.id);
                if (template) {
                    let itemCost = 0;
                    template.composition.forEach(comp => {
                        const ing = ingredients.find(i => i.id === comp.ingredientId);
                        if (ing) {
                            itemCost += ing.costPerUnit * comp.quantity;
                        }
                    });
                    totalCOGS += itemCost * orderItem.quantity;
                }
            });
        });

        const grossMargin = totalRevenue - totalCOGS;
        const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;
        const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        const financials = {
            revenue: totalRevenue,
            cogs: totalCOGS,
            margin: grossMargin,
            marginPercent: grossMarginPercent,
            aov: averageOrderValue
        };

        const hourCounts = new Array(24).fill(0);
        restaurantOrders.forEach(order => {
            const hour = new Date(order.orderTime).getHours();
            hourCounts[hour]++;
        });
        const hourlyHeatmapData = hourCounts.map((count, hour) => ({
            hour: `${hour}:00`,
            orders: count
        })).filter((_, i) => i >= 10 && i <= 23); 

        const itemStats = completedOrders.flatMap(o => o.items).reduce((acc, item) => {
            const existing = acc[item.id] || { name: item.name, sold: 0, revenue: 0, cost: 0, prepTimes: [] };
            existing.sold += item.quantity;
            existing.revenue += item.quantity * item.price;
            
            const template = menuItems.find(t => t.id === item.id);
            if (template) {
                const unitCost = template.composition.reduce((sum, comp) => {
                    const ing = ingredients.find(i => i.id === comp.ingredientId);
                    return sum + (ing ? ing.costPerUnit * comp.quantity : 0);
                }, 0);
                existing.cost += unitCost * item.quantity;
            }

            acc[item.id] = existing;
            return acc;
        }, {} as Record<number, {name: string, sold: number, revenue: number, cost: number, prepTimes: number[]}>);
        
        const itemPerformanceData = (Object.values(itemStats) as {name: string, sold: number, revenue: number, cost: number, prepTimes: number[]}[])
            .map(s => ({ ...s, profit: s.revenue - s.cost }))
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5);
        
        const completedOrderTimes = completedOrders.map(o => ({
            id: o.id,
            time: o.completionTime || 0,
            items: o.items.length,
            date: new Date(o.orderTime).toLocaleDateString()
        })).sort((a, b) => b.time - a.time);

        return { todaysStats: { received: todaysOrders.length, ...statusCounts }, avgPrepTime, financials, hourlyHeatmapData, itemPerformanceData, completedOrderTimes };
    }, [orders, restaurant, ingredients, menuItems]);

    return (
        <div className="space-y-8 animate-fade-in-down">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">{t('financial_analytics')}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{t('live_data')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">{t('total_revenue')}</p>
                    <p className="text-3xl font-bold text-gray-800">${financials.revenue.toFixed(2)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">{t('gross_margin')}</p>
                    <p className="text-3xl font-bold text-gray-800">${financials.margin.toFixed(2)}</p>
                    <p className={`text-sm font-bold mt-1 ${financials.marginPercent > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {financials.marginPercent.toFixed(1)}% Margin
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">{t('avg_order_value')}</p>
                    <p className="text-3xl font-bold text-gray-800">${financials.aov.toFixed(2)}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">{t('orders_today')}</p>
                    <p className="text-3xl font-bold text-gray-800">{todaysStats.received || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{avgPrepTime} min avg prep time</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-bold text-lg mb-4 text-secondary flex items-center">
                        <HourglassIcon className="w-5 h-5 mr-2 text-primary"/> {t('hourly_heatmap')}
                    </h4>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hourlyHeatmapData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}/>
                            <Bar dataKey="orders" fill="#F97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-bold text-lg mb-4 text-secondary flex items-center">
                        <FlagCheckeredIcon className="w-5 h-5 mr-2 text-green-600"/> {t('top_items')}
                    </h4>
                    <div className="overflow-y-auto max-h-[300px]">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-2 text-left font-semibold text-gray-600">{t('name')}</th>
                                    <th className="p-2 text-right font-semibold text-gray-600">{t('sold')}</th>
                                    <th className="p-2 text-right font-semibold text-gray-600">{t('profit')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {itemPerformanceData.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                        <td className="p-3 text-right text-gray-600">{item.sold}</td>
                                        <td className="p-3 text-right font-bold text-green-600">${item.profit.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BoardTemplateModal: React.FC<{
    template: Partial<BoardTemplate>;
    onSave: (template: Partial<BoardTemplate>) => void;
    onClose: () => void;
}> = ({ template, onSave, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(template.name || 'New Board Template');
    const [boardConfig, setBoardConfig] = useState<OrderManagementConfig>(template.config || { statuses: [], columns: [], rejectionReasons: [], statusTransitions: {} });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...template, name, config: boardConfig });
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-secondary">{t('edit_board_template')}</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-800">{t('template_name')}</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                    </div>
                    <p className="text-gray-500 italic text-sm">{t('detailed_config_hint')}</p>
                </div>
                <div className="p-4 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{t('save_template')}</button>
                </div>
            </form>
        </div>
    )
};

const RestaurantAdminModal: React.FC<{
    user: Partial<User>;
    restaurant: Restaurant;
    onSave: (user: Partial<User>) => void;
    onClose: () => void;
}> = ({ user, restaurant, onSave, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Partial<User>>(user);
    const [schedule, setSchedule] = useState<PermissionSchedule>(user.permissionSchedule || {
        monday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        tuesday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        wednesday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        thursday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        friday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        saturday: { isActive: false, startTime: '09:00', endTime: '17:00' },
        sunday: { isActive: false, startTime: '09:00', endTime: '17:00' },
    });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, permissionSchedule: schedule, restaurantId: restaurant.id });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
                 <div className="p-4 border-b">
                    <h3 className="text-xl font-bold text-secondary">{t('restaurant_admin')}</h3>
                </div>
                <div className="p-4 flex-grow text-black">
                    <div><label className="block text-sm font-medium text-gray-800">{t('name')}</label><input value={formData.name || ''} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required /></div>
                </div>
                <div className="p-4 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{t('save_changes')}</button>
                </div>
            </form>
        </div>
    )
};

const MenuItemTemplateModal: React.FC<{
    item: Partial<MenuItemTemplate>;
    vendorId: number;
    ingredients: Ingredient[];
    productionSpaces: ProductionSpace[];
    orders: Order[];
    onSave: (item: Partial<MenuItemTemplate>) => void;
    onClose: () => void;
}> = ({ item, vendorId, ingredients = [], productionSpaces = [], orders = [], onSave, onClose }) => {
    const { t } = useLanguage();
    const isNewItem = !item.id;
    const [formData, setFormData] = useState<Partial<MenuItemTemplate>>({
        name: '', description: '', price: 0, imageUrl: '',
        composition: [], allergens: [], intolerances: [],
        discount: { percentage: 0, showToConsumer: false },
        capacityUsage: 1, 
        prepTime: 10,
        isSeparateFulfillment: false,
        ...item,
        productionSpaceIds: item.productionSpaceIds || [] 
    });
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [ingredientQuantity, setIngredientQuantity] = useState(1);
    const [isMandatoryInput, setIsMandatoryInput] = useState(true); 
    const imageInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setFormData(prev => ({ ...prev, imageUrl: base64 }));
            } catch (error) {
                console.error("Failed to convert file to Base64", error);
            }
        }
    };
    
    const handleAddIngredient = () => {
        if (selectedIngredient && ingredientQuantity > 0) {
            const alreadyAdded = formData.composition?.some(c => c.ingredientId === selectedIngredient);
            if(alreadyAdded) return;
            setFormData(prev => ({ ...prev, composition: [...(prev.composition || []), { ingredientId: selectedIngredient, quantity: ingredientQuantity, isMandatory: isMandatoryInput }]}));
            setSelectedIngredient('');
            setIngredientQuantity(1);
            setIsMandatoryInput(true);
        }
    };
    
    const handleRemoveIngredient = (ingredientId: string) => {
        setFormData(prev => ({ ...prev, composition: prev.composition?.filter(c => c.ingredientId !== ingredientId)}));
    };

    const handleSpaceToggle = (spaceId: string) => {
        setFormData(prev => {
            const current = prev.productionSpaceIds || [];
            if (current.includes(spaceId)) {
                return { ...prev, productionSpaceIds: current.filter(id => id !== spaceId) };
            } else {
                return { ...prev, productionSpaceIds: [...current, spaceId] };
            }
        });
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, vendorId });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-secondary">{t('create_edit_item')}</h3>
                    <button type="button" onClick={onClose} className="p-1"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4 text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-800">{t('name')}</label>
                            <input id="name" name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-800">{t('assigned_spaces')}</label>
                            <div className="mt-1 p-2 border rounded-md bg-white max-h-32 overflow-y-auto">
                                {productionSpaces.map(space => (
                                    <label key={space.id} className="flex items-center space-x-2 mb-1">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.productionSpaceIds?.includes(space.id) || false} 
                                            onChange={() => handleSpaceToggle(space.id)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm text-black">{space.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-800">{t('description')}</label>
                        <textarea id="description" name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-800">{t('price')}</label>
                            <input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                        </div>
                        <div>
                            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-800">{t('prep_time')}</label>
                            <input id="prepTime" name="prepTime" type="number" step="1" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: parseInt(e.target.value)})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                        </div>
                        <div>
                            <label htmlFor="capacityUsage" className="block text-sm font-medium text-gray-800">{t('capacity_load')}</label>
                            <input id="capacityUsage" name="capacityUsage" type="number" step="0.1" value={formData.capacityUsage} onChange={e => setFormData({...formData, capacityUsage: parseFloat(e.target.value)})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                        </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                        <label className="flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="isSeparateFulfillment"
                                checked={formData.isSeparateFulfillment || false} 
                                onChange={e => setFormData({...formData, isSeparateFulfillment: e.target.checked})}
                                className="h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-800">{t('separate_fulfillment')}</span>
                            </div>
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-800">{t('image')}</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <input name="imageUrl" value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder={t('paste_image_url')} className="w-full p-2 border rounded-md bg-white text-black" />
                            <button type="button" onClick={() => imageInputRef.current?.click()} className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm">{t('upload')}</button>
                            <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        {formData.imageUrl?.startsWith('data:') && (
                            <div className="mt-1 flex items-center text-[10px] text-green-600 font-bold">
                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Image file uploaded & ready
                            </div>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-800">{t('ingredients')}</label>
                        <div className="p-2 border rounded-md mt-1">
                            <ul className="space-y-1 mb-2 max-h-24 overflow-y-auto">
                                {formData.composition?.map((comp) => (
                                    <li key={comp.ingredientId} className="flex justify-between items-center text-sm bg-gray-100 p-1 rounded">
                                        <span className="text-gray-800">
                                            {ingredients.find(i => i.id === comp.ingredientId)?.name} - {comp.quantity} {ingredients.find(i => i.id === comp.ingredientId)?.unit}
                                            {comp.isMandatory ? ` (${t('mandatory')})` : ` (${t('optional')})`}
                                        </span>
                                        <button type="button" onClick={() => handleRemoveIngredient(comp.ingredientId)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex space-x-2 items-end flex-wrap">
                                <select value={selectedIngredient} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedIngredient(e.target.value)} className="flex-grow p-2 border rounded-md bg-white text-black min-w-[150px]">
                                    <option value="">-- {t('select_ingredient')} --</option>
                                    {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                                </select>
                                <input type="number" min="0.01" step="0.01" value={ingredientQuantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIngredientQuantity(parseFloat(e.target.value))} className="w-20 p-2 border rounded-md bg-white text-black" placeholder="Qty" />
                                <label className="flex items-center p-2 bg-white rounded border">
                                    <input type="checkbox" checked={isMandatoryInput} onChange={(e) => setIsMandatoryInput(e.target.checked)} className="mr-2"/>
                                    <span className="text-xs text-black">{t('mandatory')}</span>
                                </label>
                                <button type="button" onClick={handleAddIngredient} className="px-4 py-2 bg-green-500 text-white rounded-md text-sm">{t('add')}</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{t('save_item')}</button>
                </div>
            </form>
        </div>
    );
};

const MenuTemplateModal: React.FC<{
    template: Partial<MenuTemplate>;
    vendorId: number;
    menuItemTemplates: MenuItemTemplate[];
    onSave: (t: Partial<MenuTemplate>) => void;
    onClose: () => void;
}> = ({ template, vendorId, menuItemTemplates, onSave, onClose }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(template.name || '');
    const [sections, setSections] = useState<MenuSection[]>(template.sections || []);

    const handleAddSection = () => {
        setSections([...sections, { id: `sec-${Date.now()}`, title: t('new_section'), itemIds: [] }]);
    };

    const handleUpdateSection = (sectionId: string, field: keyof MenuSection, value: any) => {
        setSections(sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s));
    };
    
    const handleRemoveSection = (sectionId: string) => {
        setSections(sections.filter(s => s.id !== sectionId));
    };

    const toggleItemInSection = (sectionId: string, itemId: number) => {
         setSections(sections.map(s => {
             if (s.id === sectionId) {
                 const newItemIds = s.itemIds.includes(itemId) 
                    ? s.itemIds.filter(id => id !== itemId)
                    : [...s.itemIds, itemId];
                 return { ...s, itemIds: newItemIds };
             }
             return s;
         }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...template, name, sections, vendorId });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h3 className="text-xl font-bold">{t('edit_menu')}</h3><button onClick={onClose}>x</button></div>
                <div className="p-6 flex-grow overflow-y-auto space-y-4 text-black">
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded bg-white text-black" placeholder={t('menu_name')} required />
                    {sections.map(section => (
                         <div key={section.id} className="border p-4 rounded bg-gray-50 mb-2">
                             <input value={section.title} onChange={e => handleUpdateSection(section.id, 'title', e.target.value)} className="border-b font-bold bg-white mb-2 text-black"/>
                             <div className="max-h-32 overflow-y-auto">
                                 {menuItemTemplates.map(item => (
                                     <label key={item.id} className="flex space-x-2">
                                         <input type="checkbox" checked={section.itemIds.includes(item.id)} onChange={() => toggleItemInSection(section.id, item.id)}/>
                                         <span className="text-black">{item.name}</span>
                                     </label>
                                 ))}
                             </div>
                             <button type="button" onClick={() => handleRemoveSection(section.id)} className="text-red-500 text-xs mt-2">{t('remove')}</button>
                         </div>
                    ))}
                    <button type="button" onClick={handleAddSection} className="text-primary font-bold">+ {t('add_section')}</button>
                </div>
                <div className="p-4 border-t flex justify-end"><button type="submit" className="bg-primary text-white px-4 py-2 rounded">{t('save')}</button></div>
            </form>
        </div>
    )
};

const MenuManager: React.FC<{
    vendorId: number;
    menuTemplates: MenuTemplate[];
    menuItemTemplates: MenuItemTemplate[];
    ingredients: Ingredient[];
    productionSpaces: ProductionSpace[]; 
    orders: Order[];
    onCreateMenuTemplate: (t: Omit<MenuTemplate, 'id'>) => void;
    onUpdateMenuTemplate: (t: MenuTemplate) => void;
    onDeleteMenuTemplate: (id: number) => void;
    onCreateMenuItemTemplate: (i: Omit<MenuItemTemplate, 'id'>) => void;
    onUpdateMenuItemTemplate: (i: MenuItemTemplate) => void;
    onDeleteMenuItemTemplate: (id: number) => void;
}> = (props) => {
    const { t } = useLanguage();
    const [editingMenu, setEditingMenu] = useState<Partial<MenuTemplate> | null>(null);
    const [editingItem, setEditingItem] = useState<Partial<MenuItemTemplate> | null>(null);

    return (
        <div className="space-y-10">
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{t('menu_templates')}</h3>
                    <button onClick={() => setEditingMenu({})} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm"><PlusIcon className="w-4 h-4 mr-1"/> {t('create_menu')}</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {props.menuTemplates.map(menu => (
                        <div key={menu.id} className="bg-white p-5 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-secondary">{menu.name}</h4>
                                <div className="flex space-x-2">
                                    <button onClick={() => setEditingMenu(menu)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => props.onDeleteMenuTemplate(menu.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500">{menu.sections.length} Sections</p>
                        </div>
                    ))}
                    {props.menuTemplates.length === 0 && <p className="text-gray-500 italic">{t('no_menus')}</p>}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4 border-t pt-8">
                    <h3 className="text-xl font-bold text-gray-800">{t('item_library')}</h3>
                    <button onClick={() => setEditingItem({})} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm"><PlusIcon className="w-4 h-4 mr-1"/> {t('create_item')}</button>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {props.menuItemTemplates.map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow flex flex-col">
                            <div className="h-32 bg-gray-200 relative">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400"><ShoppingBagIcon className="w-8 h-8"/></div>
                                )}
                                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-bold text-gray-800 shadow">
                                    ${item.price.toFixed(2)}
                                </div>
                            </div>
                            <div className="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
                                    {item.isSeparateFulfillment && (
                                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">Separate Ticket</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                     <div className="flex space-x-2">
                                        <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><EditIcon className="w-4 h-4"/></button>
                                        <button onClick={() => props.onDeleteMenuItemTemplate(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon className="w-4 h-4"/></button>
                                     </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {props.menuItemTemplates.length === 0 && <p className="text-gray-500 italic col-span-full">{t('no_items')}</p>}
                </div>
            </div>
            
            {editingMenu && <MenuTemplateModal template={editingMenu} vendorId={props.vendorId} menuItemTemplates={props.menuItemTemplates} onSave={t => { if(t.id) props.onUpdateMenuTemplate(t as MenuTemplate); else props.onCreateMenuTemplate(t as any); setEditingMenu(null); }} onClose={() => setEditingMenu(null)} />}
            {editingItem && <MenuItemTemplateModal item={editingItem} vendorId={props.vendorId} ingredients={props.ingredients} productionSpaces={props.productionSpaces} orders={props.orders} onSave={i => { if(i.id) props.onUpdateMenuItemTemplate(i as MenuItemTemplate); else props.onCreateMenuItemTemplate(i as any); setEditingItem(null); }} onClose={() => setEditingItem(null)} />}
        </div>
    );
};

const InventoryManager: React.FC<{
    ingredients: Ingredient[];
    vendorId: number;
    onCreateIngredient: (i: Omit<Ingredient, 'id'>) => void;
    onUpdateIngredient: (i: Ingredient) => void;
}> = ({ ingredients, vendorId, onCreateIngredient, onUpdateIngredient }) => {
    const { t } = useLanguage();
    const [editingIng, setEditingIng] = useState<Partial<Ingredient> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const myIngredients = ingredients.filter(i => i.vendorId === vendorId);

    const existingCategories = useMemo(() => Array.from(new Set(myIngredients.map(i => i.category || 'Other'))), [myIngredients]);

    const filteredIngredients = myIngredients.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedIngredients = filteredIngredients.reduce((acc, ing) => {
        const cat = ing.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ing);
        return acc;
    }, {} as Record<string, Ingredient[]>);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIng && editingIng.name) {
            const totalStock = editingIng.locations?.reduce((sum, loc) => sum + loc.quantity, 0) || 0;
            const finalIng = { ...editingIng, stock: totalStock } as Ingredient;

            if (finalIng.id) onUpdateIngredient(finalIng);
            else onCreateIngredient({ ...finalIng, vendorId } as any);
            setEditingIng(null);
        }
    };

    const addLocation = () => {
        if(editingIng) {
            setEditingIng({
                ...editingIng,
                locations: [...(editingIng.locations || []), { id: `loc-${Date.now()}`, name: '', quantity: 0 }]
            });
        }
    }

    const updateLocation = (index: number, field: string, value: any) => {
        if (editingIng && editingIng.locations) {
            const newLocs = [...editingIng.locations];
            newLocs[index] = { ...newLocs[index], [field]: value };
            setEditingIng({ ...editingIng, locations: newLocs });
        }
    }

    const removeLocation = (index: number) => {
        if (editingIng && editingIng.locations) {
             setEditingIng({ ...editingIng, locations: editingIng.locations.filter((_, i) => i !== index) });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">{t('inventory_management')}</h3>
                <div className="flex space-x-2">
                     <input 
                        placeholder={t('search_inventory')}
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        className="p-1.5 border rounded bg-white text-black placeholder-gray-500"
                     />
                    <button onClick={() => setEditingIng({ stock: 0, costPerUnit: 0, unit: 'units', category: 'Food', locations: [] })} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm"><PlusIcon className="w-4 h-4 mr-1"/> {t('add_ingredient')}</button>
                </div>
            </div>
            
            {(Object.entries(groupedIngredients) as [string, Ingredient[]][]).map(([category, items]) => (
                <div key={category} className="bg-white rounded shadow overflow-hidden mb-6">
                    <h4 className="bg-gray-100 p-3 font-bold text-gray-700 uppercase text-xs">{category}</h4>
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('sku')}</th>
                                <th className="p-3 text-left font-semibold text-gray-600">{t('ingredients')}</th>
                                <th className="p-3 text-right font-semibold text-gray-600">{t('stock')}</th>
                                <th className="p-3 text-right font-semibold text-gray-600">{t('cost_unit')}</th>
                                <th className="p-3 text-right font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(ing => (
                                <tr key={ing.id} className="border-t hover:bg-gray-50">
                                    <td className="p-3 text-gray-500 font-mono text-xs">{ing.sku || '-'}</td>
                                    <td className="p-3 text-gray-800 font-medium">{ing.name}</td>
                                    <td className="p-3 text-right text-gray-600">
                                        {ing.stock} {ing.unit}
                                        <div className="text-[10px] text-gray-400">
                                            {ing.locations?.length || 0} locations
                                        </div>
                                    </td>
                                    <td className="p-3 text-right text-gray-600">${ing.costPerUnit.toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => setEditingIng(ing)} className="text-blue-500"><EditIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            {editingIng && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto text-black">
                        <h3 className="text-xl font-bold text-secondary">{editingIng.id ? t('edit') : t('add')} {t('ingredients')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-sm font-medium">{t('name')}</label><input value={editingIng.name || ''} onChange={e => setEditingIng({...editingIng, name: e.target.value})} className="w-full border rounded p-2 bg-white text-black" required /></div>
                             <div><label className="text-sm font-medium">{t('sku')}</label><input value={editingIng.sku || ''} onChange={e => setEditingIng({...editingIng, sku: e.target.value})} className="w-full border rounded p-2 bg-white text-black" /></div>
                        </div>
                         <div>
                            <label className="text-sm font-medium">{t('category')}</label>
                            <input 
                                list="categories" 
                                value={editingIng.category || ''} 
                                onChange={e => setEditingIng({...editingIng, category: e.target.value})} 
                                className="w-full border rounded p-2 bg-white text-black"
                                placeholder="Select or type a category..."
                            />
                            <datalist id="categories">
                                <option value="Food"/>
                                <option value="Drink"/>
                                <option value="Side"/>
                                <option value="Packaging"/>
                                {existingCategories.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-sm font-medium">{t('cost_unit')}</label><input type="number" step="0.01" value={editingIng.costPerUnit} onChange={e => setEditingIng({...editingIng, costPerUnit: parseFloat(e.target.value)})} className="w-full border rounded p-2 bg-white text-black" required /></div>
                             <div>
                                <label className="text-sm font-medium">{t('unit')}</label>
                                <select value={editingIng.unit} onChange={e => setEditingIng({...editingIng, unit: e.target.value as any})} className="w-full border rounded p-2 bg-white text-black">
                                    <option value="units">units</option><option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">l</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-2 flex justify-between">
                                <span>{t('storage_locations')}</span>
                                <button type="button" onClick={addLocation} className="text-primary text-xs font-bold">+ {t('add_location')}</button>
                            </h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-2 rounded">
                                {editingIng.locations?.map((loc, idx) => (
                                    <div key={idx} className="flex space-x-2 items-center">
                                        <input placeholder={t('location_name')} value={loc.name} onChange={e => updateLocation(idx, 'name', e.target.value)} className="flex-grow p-1 text-sm border rounded bg-white text-black"/>
                                        <input type="number" placeholder="Qty" value={loc.quantity} onChange={e => updateLocation(idx, 'quantity', parseFloat(e.target.value))} className="w-20 p-1 text-sm border rounded bg-white text-black"/>
                                        <button type="button" onClick={() => removeLocation(idx)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                {(!editingIng.locations || editingIng.locations.length === 0) && <p className="text-xs text-gray-500 italic">{t('no_locations')}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-4">
                            <button type="button" onClick={() => setEditingIng(null)} className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{t('save')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const SpaceManager: React.FC<{
    vendorId: number;
    productionSpaces: ProductionSpace[];
    boardTemplates: BoardTemplate[];
    onCreateSpace: (pos: Omit<ProductionSpace, 'id'>) => void;
    onUpdateSpace: (pos: ProductionSpace) => void;
    onDeleteSpace: (posId: string) => void;
}> = ({ vendorId, productionSpaces, boardTemplates, onCreateSpace, onUpdateSpace, onDeleteSpace }) => {
    const { t } = useLanguage();
    const [editingSpace, setEditingSpace] = useState<Partial<ProductionSpace> | null>(null);
    const myTemplates = boardTemplates.filter(t => t.vendorId === vendorId);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSpace && editingSpace.name && editingSpace.boardTemplateId) {
            if (editingSpace.id) onUpdateSpace(editingSpace as ProductionSpace);
            else onCreateSpace({ ...editingSpace, vendorId } as any);
            setEditingSpace(null);
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-end">
                <button onClick={() => setEditingSpace({ concurrentCapacity: 10 })} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm"><PlusIcon className="w-4 h-4 mr-1"/> {t('add_space')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productionSpaces.map(pos => (
                    <div key={pos.id} className="bg-white p-4 rounded shadow border flex flex-col justify-between">
                        <div>
                            <h4 className="font-bold text-gray-800">{pos.name}</h4>
                            <p className="text-sm text-gray-500">{t('workflow_template')}: {boardTemplates.find(t => t.id === pos.boardTemplateId)?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{t('total_capacity')}: {pos.concurrentCapacity}</p>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                             <button onClick={() => setEditingSpace(pos)} className="text-blue-500 p-1"><EditIcon className="w-5 h-5"/></button>
                             <button onClick={() => onDeleteSpace(pos.id)} className="text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {editingSpace && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
                    <form onSubmit={handleSave} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4 text-black">
                        <h3 className="text-xl font-bold text-secondary">{editingSpace.id ? t('edit_space') : t('create_space')}</h3>
                        <div><label className="text-sm font-medium">{t('name')}</label><input value={editingSpace.name || ''} onChange={e => setEditingSpace({...editingSpace, name: e.target.value})} className="w-full border rounded p-2 bg-white text-black" required placeholder="e.g. Grill Station, Bar, Oven"/></div>
                        <div>
                            <label className="text-sm font-medium">{t('workflow_template')}</label>
                            <select value={editingSpace.boardTemplateId || ''} onChange={e => setEditingSpace({...editingSpace, boardTemplateId: parseInt(e.target.value)})} className="w-full border rounded p-2 bg-white text-black" required>
                                <option value="">-- {t('workflow_template')} --</option>
                                {myTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                         <div><label className="text-sm font-medium">{t('total_capacity')}</label><input type="number" min="1" value={editingSpace.concurrentCapacity} onChange={e => setEditingSpace({...editingSpace, concurrentCapacity: parseInt(e.target.value)})} className="w-full border rounded p-2 bg-white text-black" required /></div>
                        
                        <div className="flex justify-end space-x-3 mt-4">
                            <button type="button" onClick={() => setEditingSpace(null)} className="px-4 py-2 bg-gray-200 rounded">{t('cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">{t('save')}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const OrderManager: React.FC<{
    restaurantId: number;
    activeRestaurant: Restaurant; 
    orders: Order[];
    boardTemplates: BoardTemplate[];
    productionSpaces: ProductionSpace[]; 
    menuItemTemplates: MenuItemTemplate[];
    onUpdateOrderStatus: (id: string, status: string, reason?: string) => void;
}> = ({ restaurantId, activeRestaurant, orders, boardTemplates, productionSpaces, menuItemTemplates, onUpdateOrderStatus }) => {
    const { t } = useLanguage();
    const [now, setNow] = useState(new Date());
    const [showCompleted, setShowCompleted] = useState(true);
    const [showRejected, setShowRejected] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 10000); 
        return () => clearInterval(interval);
    }, []);

    const spaceId = activeRestaurant.productionSpaceIds?.[0];
    const space = productionSpaces.find(p => p.id === spaceId);
    const template = boardTemplates.find(t => t.id === space?.boardTemplateId) || boardTemplates[0];

    const restaurantOrders = useMemo(() => 
        orders.filter(o => o.restaurantId === restaurantId),
        [orders, restaurantId]
    );

    const handleReject = (orderId: string) => {
        const reason = prompt(t("reason") + ":", "Restaurant is too busy.");
        if (reason) {
            onUpdateOrderStatus(orderId, 'rejected', reason);
        }
    };

    if (!template || !template.config) return <div>No Board Template configured. Please check settings.</div>;

    const { columns, statuses, statusTransitions } = template.config;

    return (
        <div className="flex flex-col h-full">
            <div className="flex space-x-4 mb-4 bg-white p-3 rounded-lg border shadow-sm flex-shrink-0">
                <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${showCompleted ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <CheckCircleIcon className={`w-4 h-4 mr-2 ${showCompleted ? 'text-white' : 'text-gray-400'}`} />
                    {showCompleted ? 'Hide Completed' : 'Show Completed'}
                </button>
                <button 
                    onClick={() => setShowRejected(!showRejected)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${showRejected ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    <XCircleIcon className={`w-4 h-4 mr-2 ${showRejected ? 'text-white' : 'text-gray-400'}`} />
                    {showRejected ? 'Hide Rejected' : 'Show Rejected'}
                </button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 flex-grow h-0">
                {columns.map(column => {
                    const columnOrders = restaurantOrders.filter(o => {
                        const isInCol = column.statusIds.includes(o.status);
                        if (!isInCol) return false;
                        if (o.status === 'completed' && !showCompleted) return false;
                        if (o.status === 'rejected' && !showRejected) return false;
                        return true;
                    });

                    // Hide the column entirely if it only contains archive statuses and they are all toggled off
                    const isExclusivelyArchive = column.statusIds.every(sid => sid === 'completed' || sid === 'rejected');
                    if (isExclusivelyArchive && columnOrders.length === 0) {
                        return null;
                    }

                    const ColumnIcon = column.icon ? ICON_MAP[column.icon] : null;

                    return (
                        <div key={column.id} className="min-w-[320px] max-w-[320px] rounded-lg flex flex-col max-h-full border border-gray-200 shadow-sm transition-all" style={{ backgroundColor: column.columnColor || '#F3F4F6' }}>
                            <div className="p-3 border-b flex items-center justify-between" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                                <div className="flex items-center space-x-2">
                                    {ColumnIcon && <ColumnIcon className="w-5 h-5 text-gray-600"/>}
                                    <span className="font-bold text-gray-800" style={{ color: column.titleColor }}>{column.title}</span>
                                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{columnOrders.length}</span>
                                </div>
                            </div>

                            <div className="p-2 space-y-3 overflow-y-auto flex-grow">
                                {columnOrders.map(order => {
                                    const orderTemplateItems = order.items.map(i => menuItemTemplates.find(t => t.id === i.id)).filter(Boolean) as MenuItemTemplate[];
                                    const estimatedPrepTime = Math.max(...orderTemplateItems.map(i => i.prepTime || 10), 0); 
                                    const elapsedMinutes = (now.getTime() - new Date(order.orderTime).getTime()) / 60000;
                                    const isDelayed = elapsedMinutes > estimatedPrepTime;
                                    const progress = Math.min((elapsedMinutes / estimatedPrepTime) * 100, 100);
                                    const remainingMins = Math.max(0, Math.ceil(estimatedPrepTime - elapsedMinutes));

                                    return (
                                        <div 
                                            key={order.id} 
                                            className={`bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all border-l-4 ${isDelayed && order.status === 'in-progress' ? 'border-red-500' : 'border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="max-w-[70%]">
                                                    <span className="font-bold text-gray-800 text-sm break-all leading-tight">{order.id}</span>
                                                    <div className="text-[10px] text-gray-500 flex items-center mt-1">
                                                        <HourglassIcon className="w-3 h-3 mr-1"/>
                                                        {Math.floor(elapsedMinutes)} {t('min_ago')}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-800 block text-sm">${order.total.toFixed(2)}</span>
                                                    {order.status !== 'completed' && order.status !== 'rejected' && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDelayed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                            {isDelayed ? t('delayed') : t('on_time')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 mb-3 border-t border-b py-2 border-gray-100">
                                                {order.items.map(i => (
                                                    <div key={i.cartItemId} className="flex justify-between">
                                                        <span>{i.quantity}x {i.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {['accepted', 'in-progress'].includes(order.status) && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                        <span>{t('progress')}</span>
                                                        <span className={isDelayed ? "text-red-500 font-bold" : ""}>
                                                            {isDelayed ? `+${Math.floor(elapsedMinutes - estimatedPrepTime)}m over` : `${remainingMins}m left`}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                        <div 
                                                            className={`h-1.5 rounded-full ${isDelayed ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {(statusTransitions[order.status] as string[] | undefined)?.map(nextStatusId => {
                                                    const nextStatus = statuses.find(s => s.id === nextStatusId);
                                                    if (!nextStatus) return null;
                                                    return (
                                                        <button 
                                                            key={nextStatusId}
                                                            onClick={() => onUpdateOrderStatus(order.id, nextStatusId)}
                                                            className="flex-grow text-xs py-1.5 px-2 rounded font-medium text-white transition-colors"
                                                            style={{ backgroundColor: nextStatus.color }}
                                                        >
                                                            {nextStatus.label}
                                                        </button>
                                                    )
                                                })}
                                                {order.status === 'pending' && (
                                                    <button onClick={() => handleReject(order.id)} className="flex-grow bg-red-100 text-red-600 text-xs py-1.5 px-2 rounded font-medium hover:bg-red-200">
                                                        {t('reject')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MarketingManager: React.FC<{
    promotions: Promotion[];
    restaurantId: number;
    vendorId: number;
    orders: Order[];
    items: MenuItemTemplate[];
    ingredients: Ingredient[];
    onCreatePromotion: (p: Omit<Promotion, 'id'>) => void;
    onUpdatePromotion: (p: Promotion) => void;
    onDeletePromotion: (id: string) => void;
}> = ({ promotions, restaurantId, vendorId, orders, items, ingredients, onCreatePromotion, onUpdatePromotion, onDeletePromotion }) => {
    const { t } = useLanguage();
    const [isCreating, setIsCreating] = useState(false);
    const [newPromo, setNewPromo] = useState<Partial<Promotion>>({
        title: '', description: '', type: PromotionType.PercentageOff, value: 0, isActive: true, targetItemIds: []
    });

    const activePromotions = promotions.filter(p => p.restaurantId === restaurantId);

    const smartInsight = useMemo(() => {
        const currentHour = new Date().getHours();
        const hourCounts = new Array(24).fill(0);
        orders.filter(o => o.restaurantId === restaurantId).forEach(order => {
            const h = new Date(order.orderTime).getHours();
            hourCounts[h]++;
        });
        const currentDemand = hourCounts[currentHour];
        const avgDemand = hourCounts.reduce((a, b) => a + b, 0) / 24;
        const isLowDemand = currentDemand < (avgDemand * 0.8); 

        if (!isLowDemand) return null;

        let bestItem: MenuItemTemplate | null = null;
        let maxMargin = 0;

        items.filter(i => i.vendorId === vendorId).forEach(item => {
             const cost = item.composition.reduce((sum, comp) => {
                const ing = ingredients.find(i => i.id === comp.ingredientId);
                return sum + (ing ? ing.costPerUnit * comp.quantity : 0);
            }, 0);
            const margin = item.price - cost;
            const marginPercent = (margin / item.price);

            if (marginPercent > maxMargin) {
                maxMargin = marginPercent;
                bestItem = item;
            }
        });

        if (bestItem) {
            return {
                message: `Traffic is lower than average right now. "${(bestItem as MenuItemTemplate).name}" has a high profit margin (${(maxMargin * 100).toFixed(0)}%). Creating a discount could boost sales without hurting profits.`,
                suggestedPromo: {
                    title: `Flash Deal: ${(bestItem as MenuItemTemplate).name}`,
                    description: `Get 20% off on our delicious ${(bestItem as MenuItemTemplate).name} for the next hour!`,
                    type: PromotionType.PercentageOff,
                    value: 20,
                    targetItemIds: [(bestItem as MenuItemTemplate).id],
                    isActive: true,
                    isAutoGenerated: true
                }
            };
        }
        return null;
    }, [orders, restaurantId, items, ingredients, vendorId]);

    const handleApplyInsight = () => {
        if (smartInsight?.suggestedPromo) {
            onCreatePromotion({ 
                ...smartInsight.suggestedPromo, 
                vendorId, 
                restaurantId 
            } as Omit<Promotion, 'id'>);
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreatePromotion({ ...newPromo, vendorId, restaurantId } as Omit<Promotion, 'id'>);
        setIsCreating(false);
        setNewPromo({ title: '', description: '', type: PromotionType.PercentageOff, value: 0, isActive: true, targetItemIds: [] });
    };

    return (
        <div className="space-y-8 animate-fade-in-down">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">{t('marketing_promotions')}</h3>
                <button onClick={() => setIsCreating(true)} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm hover:bg-orange-600 transition-colors">
                    <PlusIcon className="w-4 h-4 mr-1"/> {t('new_promotion')}
                </button>
            </div>

            {smartInsight && (
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <SparklesIcon className="w-32 h-32"/>
                    </div>
                    <div className="relative z-10">
                        <h4 className="font-bold text-xl flex items-center mb-2">
                            <SparklesIcon className="w-6 h-6 mr-2 text-yellow-300 animate-pulse"/> {t('ai_insight')}
                        </h4>
                        <p className="mb-4 max-w-2xl">{smartInsight.message}</p>
                        <button 
                            onClick={handleApplyInsight}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md"
                        >
                            {t('apply_deal')}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePromotions.map(promo => (
                    <div key={promo.id} className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg text-gray-800">{promo.title}</h4>
                             <div className="flex space-x-1">
                                <button onClick={() => onUpdatePromotion({...promo, isActive: !promo.isActive})} className={`p-1 rounded ${promo.isActive ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'}`}>
                                    {promo.isActive ? t('active') : t('paused')}
                                </button>
                                <button onClick={() => onDeletePromotion(promo.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{promo.description}</p>
                        <div className="flex items-center text-xs font-semibold text-gray-500 bg-gray-50 p-2 rounded">
                            <span className="uppercase mr-2">{promo.type.replace('_', ' ')}</span>
                            <span className="text-primary text-lg">{promo.value}{promo.type === PromotionType.PercentageOff ? '%' : ''}</span>
                        </div>
                    </div>
                ))}
            </div>

            {isCreating && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
                    <form onSubmit={handleCreateSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4 text-black">
                        <h3 className="text-xl font-bold text-secondary">{t('create_promotion')}</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-800">{t('title')}</label>
                            <input value={newPromo.title} onChange={e => setNewPromo({...newPromo, title: e.target.value})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" placeholder="e.g. Summer Sale" required />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-800">{t('type')}</label>
                                <select value={newPromo.type} onChange={e => setNewPromo({...newPromo, type: e.target.value as PromotionType})} className="w-full mt-1 p-2 border rounded-md bg-white text-black">
                                    <option value={PromotionType.PercentageOff}>Percentage Off</option>
                                    <option value={PromotionType.FixedAmountOff}>Fixed Amount ($)</option>
                                    <option value={PromotionType.BOGO}>Buy One Get One</option>
                                </select>
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-800">{t('value')}</label>
                                <input type="number" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: parseFloat(e.target.value)})} className="w-full mt-1 p-2 border rounded-md bg-white text-black" required />
                             </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-800">{t('specific_item')}</label>
                            <select 
                                onChange={e => setNewPromo({...newPromo, targetItemIds: e.target.value ? [parseInt(e.target.value)] : []})}
                                className="w-full mt-1 p-2 border rounded-md bg-white text-black"
                            >
                                <option value="">-- {t('apply_whole_order')} --</option>
                                {items.filter(i => i.vendorId === vendorId).map(i => (
                                    <option key={i.id} value={i.id}>{i.name}</option>
                                ))}
                            </select>
                         </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md font-bold">Create Promo</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};


interface VendorDashboardProps {
  currentUser: User;
  vendor: Vendor;
  restaurants: Restaurant[];
  orders: Order[];
  users: User[];
  boardTemplates: BoardTemplate[];
  menuTemplates: MenuTemplate[];
  menuItemTemplates: MenuItemTemplate[];
  ingredients: Ingredient[];
  pointsOfSale: ProductionSpace[]; 
  promotions: Promotion[]; 
  onCreateRestaurant: (data: Omit<Restaurant, 'id'>) => void;
  onUpdateRestaurant: (data: Restaurant) => void;
  onDeleteRestaurant: (id: number) => void;
  onUpdateOrderStatus: (id: string, status: string, reason?: string) => void;
  onCreateRestaurantAdmin: (name: string, username: string, pass: string, rId: number) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: number) => void;
  onCreateBoardTemplate: (t: Omit<BoardTemplate, 'id'>) => void;
  onUpdateBoardTemplate: (t: BoardTemplate) => void;
  onDeleteBoardTemplate: (id: number) => void;
  onCreateMenuTemplate: (t: Omit<MenuTemplate, 'id'>) => void;
  onUpdateMenuTemplate: (t: MenuTemplate) => void;
  onDeleteMenuTemplate: (id: number) => void;
  onCreateMenuItemTemplate: (i: Omit<MenuItemTemplate, 'id'>) => void;
  onUpdateMenuItemTemplate: (i: MenuItemTemplate) => void;
  onDeleteMenuItemTemplate: (id: number) => void;
  onCreateIngredient: (i: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredient: (i: Ingredient) => void;
  onCreatePointOfSale: (pos: Omit<ProductionSpace, 'id'>) => void;
  onUpdatePointOfSale: (pos: ProductionSpace) => void;
  onDeletePointOfSale: (posId: string) => void;
  onCreatePromotion: (p: Omit<Promotion, 'id'>) => void; 
  onUpdatePromotion: (p: Promotion) => void; 
  onDeletePromotion: (id: string) => void; 
}

const VendorDashboard: React.FC<VendorDashboardProps> = (props) => {
    const { currentUser, restaurants } = props;
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<number>(restaurants[0]?.id || 0);

    const activeRestaurant = restaurants.find(r => r.id === selectedRestaurantId);
    
    const hasPermission = (perm: keyof RestaurantPermissions) => {
        if (currentUser.role === UserRole.Vendor) return true;
        if (currentUser.role === UserRole.RestaurantAdmin) {
             if (!isUserActive(currentUser)) return false;
             return currentUser.permissions?.[perm] || false;
        }
        return false;
    };

    if (restaurants.length === 0) {
        return <div className="p-8 text-center text-gray-500">{t('no_restaurants_found')}</div>;
    }

    if (!activeRestaurant) return <div>Select a restaurant</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-neutral">
            <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-gray-500 font-medium">{t('managing')}</span>
                    <select 
                        value={selectedRestaurantId} 
                        onChange={e => setSelectedRestaurantId(parseInt(e.target.value))}
                        className="p-2 border rounded-md bg-gray-50 font-bold text-gray-800 focus:ring-primary focus:border-primary"
                    >
                        {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                 {currentUser.role === UserRole.RestaurantAdmin && !isUserActive(currentUser) && (
                    <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-sm">
                        {t('shift_ended')}
                    </span>
                )}
            </div>

            <div className="flex flex-grow overflow-hidden">
                <nav className="w-64 bg-secondary text-white flex-shrink-0 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        {hasPermission('canManageOrders') && (
                            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                <ClipboardListIcon className="w-5 h-5 mr-3"/> {t('orders')}
                            </button>
                        )}
                        {hasPermission('canManageMenu') && (
                             <button onClick={() => setActiveTab('marketing')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'marketing' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                <SparklesIcon className="w-5 h-5 mr-3"/> {t('promotions')}
                            </button>
                        )}
                        {hasPermission('canViewAnalytics') && (
                            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                <ChartIcon className="w-5 h-5 mr-3"/> {t('analytics')}
                            </button>
                        )}
                        {hasPermission('canManageMenu') && (
                            <>
                                <button onClick={() => setActiveTab('menu')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'menu' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                    <MenuBookIcon className="w-5 h-5 mr-3"/> {t('menu')}
                                </button>
                                <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                    <PackageIcon className="w-5 h-5 mr-3"/> {t('inventory')}
                                </button>
                            </>
                        )}
                        {hasPermission('canManageSettings') && (
                            <>
                                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                    <SettingsIcon className="w-5 h-5 mr-3"/> {t('settings')}
                                </button>
                                {currentUser.role === UserRole.Vendor && (
                                     <button onClick={() => setActiveTab('boards')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'boards' ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'}`}>
                                        <div className="flex items-center"><span className="text-lg mr-3 font-bold">⋮</span> {t('boards')}</div>
                                     </button>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                <main className="flex-grow p-8 overflow-y-auto bg-neutral">
                    {activeTab === 'orders' && <OrderManager restaurantId={activeRestaurant.id} activeRestaurant={activeRestaurant} orders={props.orders} boardTemplates={props.boardTemplates} productionSpaces={props.pointsOfSale} menuItemTemplates={props.menuItemTemplates} onUpdateOrderStatus={props.onUpdateOrderStatus} />}
                    {activeTab === 'marketing' && <MarketingManager promotions={props.promotions} restaurantId={activeRestaurant.id} vendorId={props.vendor.id} orders={props.orders} items={props.menuItemTemplates} ingredients={props.ingredients} onCreatePromotion={props.onCreatePromotion} onUpdatePromotion={props.onUpdatePromotion} onDeletePromotion={props.onDeletePromotion} />}
                    {activeTab === 'analytics' && <Analytics restaurant={activeRestaurant} orders={props.orders} users={props.users} ingredients={props.ingredients} menuItems={props.menuItemTemplates} />}
                    {activeTab === 'menu' && <MenuManager vendorId={props.vendor.id} menuTemplates={props.menuTemplates} menuItemTemplates={props.menuItemTemplates} ingredients={props.ingredients} productionSpaces={props.pointsOfSale} orders={props.orders} onCreateMenuTemplate={props.onCreateMenuTemplate} onUpdateMenuTemplate={props.onUpdateMenuTemplate} onDeleteMenuTemplate={props.onDeleteMenuTemplate} onCreateMenuItemTemplate={props.onCreateMenuItemTemplate} onUpdateMenuItemTemplate={props.onUpdateMenuItemTemplate} onDeleteMenuItemTemplate={props.onDeleteMenuItemTemplate} />}
                    {activeTab === 'inventory' && <InventoryManager ingredients={props.ingredients} vendorId={props.vendor.id} onCreateIngredient={props.onCreateIngredient} onUpdateIngredient={props.onUpdateIngredient} />}
                    {activeTab === 'settings' && (
                        <div className="space-y-12">
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{t('restaurant_profile_config')}</h2>
                                <RestaurantDetailsForm restaurant={activeRestaurant} onSave={props.onUpdateRestaurant} />
                            </section>
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">{t('manage_spaces')}</h2>
                                <SpaceManager 
                                    vendorId={props.vendor.id} 
                                    productionSpaces={props.pointsOfSale.filter(p => p.vendorId === props.vendor.id)}
                                    boardTemplates={props.boardTemplates}
                                    onCreateSpace={props.onCreatePointOfSale}
                                    onUpdateSpace={props.onUpdateSpace}
                                    onDeleteSpace={props.onDeletePointOfSale}
                                />
                            </section>
                            <section>
                                <div className="flex justify-between items-center mb-4 border-b pb-2">
                                     <h2 className="text-2xl font-bold text-gray-800">{t('staff_management')}</h2>
                                </div>
                                <StaffList 
                                    restaurant={activeRestaurant} 
                                    users={props.users} 
                                    onUpdateUser={props.onUpdateUser} 
                                    onDeleteUser={props.onDeleteUser}
                                    onCreateUser={(name, user, pass) => props.onCreateRestaurantAdmin(name, user, pass, activeRestaurant.id)}
                                />
                            </section>
                        </div>
                    )}
                    {activeTab === 'boards' && <BoardTemplateManager vendorId={props.vendor.id} boardTemplates={props.boardTemplates} onCreate={props.onCreateBoardTemplate} onUpdate={props.onUpdateBoardTemplate} onDelete={props.onDeleteBoardTemplate} />}
                </main>
            </div>
        </div>
    );
};

const StaffList: React.FC<{
    restaurant: Restaurant, 
    users: User[], 
    onUpdateUser: (u: User) => void, 
    onDeleteUser: (id: number) => void,
    onCreateUser: (n: string, u: string, p: string) => void
}> = ({ restaurant, users, onUpdateUser, onDeleteUser, onCreateUser }) => {
    const { t } = useLanguage();
    const staff = users.filter(u => u.restaurantId === restaurant.id && u.role === UserRole.RestaurantAdmin);
    const [isCreating, setIsCreating] = useState(false);
    const [newUser, setNewUser] = useState({name: '', username: '', password: ''});
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateUser(newUser.name, newUser.username, newUser.password);
        setIsCreating(false);
        setNewUser({name: '', username: '', password: ''});
    }

    return (
        <div className="space-y-4">
            {staff.map(u => (
                <div key={u.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                    <div>
                        <p className="font-bold text-gray-800">{u.name}</p>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => setEditingUser(u)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => onDeleteUser(u.id)} className="text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
            {isCreating ? (
                <form onSubmit={handleCreate} className="bg-gray-50 p-4 rounded border text-black">
                    <input placeholder={t('name')} className="block w-full mb-2 p-2 border rounded bg-white text-black" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required/>
                    <input placeholder={t('username')} className="block w-full mb-2 p-2 border rounded bg-white text-black" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required/>
                    <input placeholder={t('password')} type="password" className="block w-full mb-2 p-2 border rounded bg-white text-black" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required/>
                    <div className="flex space-x-2">
                        <button type="submit" className="bg-primary text-white px-3 py-1 rounded font-bold">{t('create')}</button>
                        <button type="button" onClick={() => setIsCreating(false)} className="bg-gray-300 px-3 py-1 rounded font-bold">{t('cancel')}</button>
                    </div>
                </form>
            ) : (
                <button onClick={() => setIsCreating(true)} className="text-primary font-bold hover:underline text-sm">+ {t('add_manager')}</button>
            )}
            {editingUser && <RestaurantAdminModal user={editingUser} restaurant={restaurant} onSave={onUpdateUser} onClose={() => setEditingUser(null)} />}
        </div>
    )
}

const BoardTemplateManager: React.FC<{
    vendorId: number;
    boardTemplates: BoardTemplate[];
    onCreate: (t: Omit<BoardTemplate, 'id'>) => void;
    onUpdate: (t: BoardTemplate) => void;
    onDelete: (id: number) => void;
}> = ({ vendorId, boardTemplates, onCreate, onUpdate, onDelete }) => {
    const { t } = useLanguage();
    const [editingTemplate, setEditingTemplate] = useState<Partial<BoardTemplate> | null>(null);

    const handleSave = (t: Partial<BoardTemplate>) => {
        if(t.id) onUpdate(t as BoardTemplate);
        else onCreate({...t, vendorId} as Omit<BoardTemplate, 'id'>);
        setEditingTemplate(null);
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{t('workflow_templates')}</h3>
                <button onClick={() => setEditingTemplate({})} className="bg-primary text-white px-3 py-1.5 rounded-md flex items-center text-sm font-bold">
                    <PlusIcon className="w-4 h-4 mr-1"/> {t('create_template')}
                </button>
            </div>
            {boardTemplates.map(t => (
                <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <span className="font-bold text-gray-800">{t.name}</span>
                    <div className="flex space-x-2">
                        <button onClick={() => setEditingTemplate(t)} className="text-blue-500 p-1"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => onDelete(t.id)} className="text-red-500 p-1"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                </div>
            ))}
            {editingTemplate && <BoardTemplateModal template={editingTemplate} onSave={handleSave} onClose={() => setEditingTemplate(null)} />}
        </div>
    )
}

export default VendorDashboard;
