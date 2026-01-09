
import React, { useState, useMemo } from 'react';
import { Restaurant, MenuItemTemplate, CartItem, MediaContent, MediaType, Allergen, Intolerance, MenuTemplate, Ingredient, Promotion, PromotionType } from '../types';
import { generateDescription } from '../services/geminiService';
import { QRCodeWrapper, SparklesIcon, GlutenFreeIcon, VegetarianIcon, SpicyIcon, LactoseIcon, NutsIcon, XIcon } from './Shared';
import { useLanguage } from '../i18nContext';

interface RestaurantPageProps {
  restaurant: Restaurant;
  menuTemplates: MenuTemplate[];
  allItems: MenuItemTemplate[];
  ingredients: Ingredient[];
  promotions: Promotion[]; // Added Prop
  onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  onBack: () => void;
}

const AllergenIcon: React.FC<{ allergen: Allergen }> = ({ allergen }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'gf': <GlutenFreeIcon className="w-5 h-5 text-blue-500" title="Gluten-Free"/>,
        'v': <VegetarianIcon className="w-5 h-5 text-green-500" title="Vegetarian"/>,
        's': <SpicyIcon className="w-5 h-5 text-red-500" title="Spicy"/>,
    };
    return <span className="tooltip" title={allergen.name}>{iconMap[allergen.id]}</span>;
}

const IntoleranceIcon: React.FC<{ intolerance: Intolerance }> = ({ intolerance }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'LactoseIcon': <LactoseIcon className="w-5 h-5 text-indigo-500" />,
        'NutsIcon': <NutsIcon className="w-5 h-5 text-amber-700" />,
    };
    return <span className="tooltip" title={intolerance.name}>{iconMap[intolerance.icon]}</span>;
};

const MediaCard: React.FC<{ item: MediaContent }> = ({ item }) => {
  const renderMedia = () => {
    switch (item.type) {
      case MediaType.Video:
        return <video controls src={item.source} className="w-full h-48 object-cover rounded-t-lg bg-black"></video>;
      case MediaType.Image:
        return <img src={item.source} alt={item.title} className="w-full h-48 object-cover rounded-t-lg bg-gray-100" />;
      case MediaType.Audio:
        return <div className="p-4"><audio controls src={item.source} className="w-full"></audio></div>;
      case MediaType.Text:
        return <p className="p-4 text-gray-700 h-full overflow-y-auto">{item.source}</p>;
      case MediaType.Link:
        return (
          <a href={item.source} target="_blank" rel="noopener noreferrer" className="block p-4 text-primary hover:underline">
            {item.description || 'Learn More'}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
      <div className="h-48 flex items-center justify-center bg-gray-50">{renderMedia()}</div>
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-secondary">{item.title}</h3>
        {item.type !== MediaType.Link && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
      </div>
    </div>
  );
};

const CustomizationModal: React.FC<{
    item: MenuItemTemplate;
    restaurantId: number;
    ingredients: Ingredient[];
    onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
    onClose: () => void;
}> = ({ item, restaurantId, ingredients, onAddToCart, onClose }) => {
    const { t } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());

    const getIngredientName = (id: string) => ingredients.find(i => i.id === id)?.name || id;

    const handleIngredientToggle = (ingredientId: string) => {
        const ingredientName = getIngredientName(ingredientId);
        setRemovedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ingredientName)) {
                newSet.delete(ingredientName);
            } else {
                newSet.add(ingredientName);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        onAddToCart({
            ...item,
            restaurantId,
            quantity,
            removedIngredients: Array.from(removedIngredients),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-secondary">{item.name}</h3>
                    <button onClick={onClose} className="p-1 -mt-2 -mr-2"><XIcon className="w-6 h-6"/></button>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-2">{t('quantity')}</h4>
                    <div className="flex items-center space-x-3">
                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-bold text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">-</button>
                        <span className="text-xl font-bold text-gray-900 w-10 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full bg-gray-200 text-gray-800 font-bold text-xl flex items-center justify-center hover:bg-gray-300 transition-colors">+</button>
                    </div>
                </div>
                
                {item.composition && item.composition.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-gray-800 mb-2">{t('customize_ingredients')}</h4>
                        <div className="space-y-2">
                            {item.composition.map(comp => (
                                <label key={comp.ingredientId} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer">
                                    <input type="checkbox" defaultChecked onChange={() => handleIngredientToggle(comp.ingredientId)} className="h-5 w-5 text-primary rounded focus:ring-primary" />
                                    <span className="text-black">{getIngredientName(comp.ingredientId)} {comp.isMandatory ? `(${t('essential')})` : ''}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end items-center pt-4 border-t space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors">{t('cancel')}</button>
                    <button onClick={handleSubmit} className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">{t('add_to_cart')}</button>
                </div>
            </div>
        </div>
    );
};


const MenuItemCard: React.FC<{ item: MenuItemTemplate; onCustomize: (item: MenuItemTemplate) => void; restaurantId: number; ingredients: Ingredient[] }> = ({ item, onCustomize, restaurantId, ingredients }) => {
  const { t } = useLanguage();
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ingredientNames = useMemo(() => item.composition.map(comp => ingredients.find(i => i.id === comp.ingredientId)?.name).filter(Boolean) as string[], [item.composition, ingredients]);

  // Updated Availability Logic
  const { isAvailable, missingOptional } = useMemo(() => {
    if (!item.composition || item.composition.length === 0) {
        return { isAvailable: true, missingOptional: false };
    }
    let mandatoryMissing = false;
    let optionalMissing = false;

    for (const required of item.composition) {
        const ingredient = ingredients.find(i => i.id === required.ingredientId);
        const hasStock = ingredient && ingredient.stock >= required.quantity;
        
        if (!hasStock) {
            if (required.isMandatory) {
                mandatoryMissing = true;
            } else {
                optionalMissing = true;
            }
        }
    }
    return { isAvailable: !mandatoryMissing, missingOptional: optionalMissing };
  }, [item.composition, ingredients]);

  const handleGenerateDescription = async () => {
    setIsLoading(true);
    setAiDescription(null);
    const desc = await generateDescription(item.name, ingredientNames);
    setAiDescription(desc);
    setIsLoading(false);
  };
  
  const discountedPrice = item.discount ? item.price * (1 - item.discount.percentage / 100) : null;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row relative ${!isAvailable ? 'opacity-50' : ''}`}>
        {!isAvailable && (
            <div className="absolute inset-0 bg-gray-500 bg-opacity-70 flex items-center justify-center z-10">
                <span className="text-white text-2xl font-bold transform -rotate-12 border-4 border-white px-4 py-2">{t('sold_out')}</span>
            </div>
        )}
      <img src={item.imageUrl} alt={item.name} className={`w-full md:w-1/3 h-48 md:h-auto object-cover ${!isAvailable ? 'grayscale' : ''}`}/>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between">
            <h4 className="text-xl font-bold text-secondary">{item.name}</h4>
            <div className="flex items-center space-x-2">
                {item.allergens?.map(a => <AllergenIcon key={a.id} allergen={a} />)}
                {item.intolerances?.map(i => <IntoleranceIcon key={i.id} intolerance={i} />)}
            </div>
        </div>
        <p className="text-gray-600 mt-1">{item.description}</p>
        
        {ingredientNames.length > 0 && (
            <div className="mt-2">
                <p className="text-sm font-semibold text-gray-700">{t('contains')}:</p>
                <p className="text-sm text-gray-500 italic">{ingredientNames.join(', ')}</p>
            </div>
        )}

        {missingOptional && isAvailable && (
            <div className="mt-2 text-xs text-orange-600 font-bold">
                {t('note_stock_issue')}
            </div>
        )}

        {isLoading && <p className="text-sm text-primary mt-2 animate-pulse">{t('generating_ai')}</p>}
        {aiDescription && (
            <div className="mt-2 p-3 bg-orange-50 border-l-4 border-primary rounded-r-lg">
                <p className="text-sm text-gray-800 italic">{aiDescription}</p>
            </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onCustomize(item)}
                    disabled={!isAvailable || isLoading}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {t('add_to_cart')}
                </button>
                 <button
                    onClick={handleGenerateDescription}
                    disabled={isLoading || !isAvailable}
                    className="flex items-center space-x-2 text-primary border border-primary px-3 py-2 rounded-lg hover:bg-orange-50 disabled:opacity-50 transition-colors"
                    title="Generate AI Description"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    <span>AI</span>
                </button>
            </div>
          <div className="text-right">
              {discountedPrice && item.discount?.showToConsumer ? (
                  <>
                      <span className="text-lg font-bold text-red-600">${discountedPrice.toFixed(2)}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">${item.price.toFixed(2)}</span>
                  </>
              ) : (
                  <span className="text-lg font-bold text-secondary">${item.price.toFixed(2)}</span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;
    return `${formattedHour}:${minutes} ${ampm}`;
};

const formatOpeningHours = (hours: Restaurant['openingHours']): string[] => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const grouped: { [key: string]: string[] } = {};

    days.forEach(day => {
        const dayInfo = hours[day as keyof typeof hours];
        const time = dayInfo.isOpen ? `${formatTime(dayInfo.open)} - ${formatTime(dayInfo.close)}` : 'Closed';
        if (!grouped[time]) {
            grouped[time] = [];
        }
        grouped[time].push(day.charAt(0).toUpperCase() + day.slice(1, 3));
    });

    return Object.entries(grouped).map(([time, dayArr]) => {
        if (dayArr.length === 1) {
            return `${dayArr[0]}: ${time}`;
        }
        if (dayArr.length > 2 && (dayArr.indexOf('Sun') === -1 || dayArr.indexOf('Sat') === -1 )) {
             const first = dayArr[0];
             const last = dayArr[dayArr.length - 1];
             return `${first}-${last}: ${time}`;
        }
        return `${dayArr.join(', ')}: ${time}`;
    });
};


const RestaurantPage: React.FC<RestaurantPageProps> = ({ restaurant, menuTemplates, allItems, ingredients, promotions, onAddToCart, onBack }) => {
  const { t } = useLanguage();
  const restaurantUrl = `${window.location.href.split('#')[0]}#restaurant/${restaurant.id}`;
  const [customizingItem, setCustomizingItem] = useState<MenuItemTemplate | null>(null);
  const formattedHours = formatOpeningHours(restaurant.openingHours);
  
  const activePromotions = promotions.filter(p => p.restaurantId === restaurant.id && p.isActive);

  return (
    <div>
      {/* Banner */}
      <div className="h-64 md:h-80 relative">
        <img src={restaurant.bannerUrl} alt={`${restaurant.name} banner`} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
            <button onClick={onBack} className="text-sm mb-2 hover:underline">
              &larr; {t('back_to_restaurants')}
            </button>
            <h2 className="text-4xl md:text-5xl font-extrabold">{restaurant.name}</h2>
            <p className="mt-2 max-w-2xl">{restaurant.description}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Promotion Banner */}
        {activePromotions.length > 0 && (
            <section className="mb-10 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-6 rounded-xl shadow-lg animate-fade-in-down">
                <h3 className="font-bold text-2xl mb-4 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2 text-yellow-200 animate-spin-slow"/> Special Offers!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activePromotions.map(promo => (
                        <div key={promo.id} className="bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
                            <h4 className="font-bold text-lg">{promo.title}</h4>
                            <p className="text-sm opacity-90">{promo.description}</p>
                            <div className="mt-2 inline-block bg-white text-red-600 font-bold px-2 py-1 rounded text-sm">
                                {promo.type === PromotionType.BOGO ? 'Buy 1 Get 1' : `${promo.value}${promo.type === PromotionType.PercentageOff ? '% OFF' : '$ OFF'}`}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Media Section */}
        {restaurant.media && restaurant.media.length > 0 && (
          <section className="mb-12">
            <h3 className="text-3xl font-extrabold text-secondary mb-6">{t('whats_new')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.media.map(item => <MediaCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-10">
            {menuTemplates.map(template => (
                <div key={template.id}>
                    <h3 className="text-3xl font-extrabold text-secondary mb-6">{template.name}</h3>
                    <div className="space-y-8">
                        {template.sections.map(section => (
                            <div key={section.id}>
                                <h4 className="text-2xl font-bold text-gray-800 border-b-2 border-primary pb-2 mb-4">{section.title}</h4>
                                <div className="space-y-6">
                                    {section.itemIds.map(itemId => {
                                        const item = allItems.find(i => i.id === itemId);
                                        return item ? <MenuItemCard key={item.id} item={item} onCustomize={setCustomizingItem} restaurantId={restaurant.id} ingredients={ingredients} /> : null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
          {/* Details & QR Code */}
          <div className="lg:col-span-1">
             <div className="sticky top-24 bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold border-b pb-2 mb-4 text-secondary">{t('restaurant_info')}</h3>
                <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>{t('address')}:</strong> {restaurant.contact.address}</p>
                    <p><strong>{t('phone')}:</strong> {restaurant.contact.phone}</p>
                    <p><strong>{t('email')}:</strong> {restaurant.contact.email}</p>
                    <div>
                        <p><strong>{t('hours')}:</strong></p>
                        <ul className="pl-4">
                            {formattedHours.map((line, index) => <li key={index}>{line}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <h4 className="font-semibold mb-2 text-secondary">{t('scan_direct_access')}</h4>
                    <div className="flex justify-center">
                      <QRCodeWrapper value={restaurantUrl} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      {customizingItem && (
          <CustomizationModal 
            item={customizingItem}
            restaurantId={restaurant.id}
            ingredients={ingredients}
            onAddToCart={onAddToCart}
            onClose={() => setCustomizingItem(null)}
          />
      )}
    </div>
  );
};

export default RestaurantPage;
