
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../firebaseConfig';
import { Restaurant, MenuItemTemplate, CartItem, MediaContent, MediaType, Allergen, Intolerance, MenuTemplate, Ingredient, Promotion, PromotionType } from '../types';
import { generateDescription } from '../services/geminiService';
import { QRCodeWrapper, SparklesIcon, GlutenFreeIcon, VegetarianIcon, SpicyIcon, LactoseIcon, NutsIcon, XIcon } from './Shared';

interface RestaurantPageProps {
  restaurants: Restaurant[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const AllergenIcon: React.FC<{ allergen: Allergen }> = ({ allergen }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'gf': <GlutenFreeIcon className="w-5 h-5 text-blue-500" title="Gluten-Free"/>,
        'v': <VegetarianIcon className="w-5 h-5 text-green-500" title="Vegetarian"/>,
        's': <SpicyIcon className="w-5 h-5 text-red-500" title="Spicy"/>,
    };
    return <span title={allergen.name}>{iconMap[allergen.id]}</span>;
}

const IntoleranceIcon: React.FC<{ intolerance: Intolerance }> = ({ intolerance }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        'LactoseIcon': <LactoseIcon className="w-5 h-5 text-indigo-500" />,
        'NutsIcon': <NutsIcon className="w-5 h-5 text-amber-700" />,
    };
    return <span title={intolerance.name}>{iconMap[intolerance.icon]}</span>;
};

const MediaCard: React.FC<{ item: MediaContent }> = ({ item }) => {
  const renderMedia = () => {
    switch (item.type) {
      case MediaType.Video:
        return <video controls src={item.source} className="w-full h-48 object-cover rounded-t-lg bg-black"></video>;
      case MediaType.Image:
        return <img src={item.source} alt={item.title} className="w-full h-48 object-cover rounded-t-lg bg-gray-100" />;
      default:
        return <p className="p-4">{item.title}</p>;
    }
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
      <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-700">{renderMedia()}</div>
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
      </div>
    </div>
  );
};

const CustomizationModal: React.FC<{
    item: MenuItemTemplate;
    restaurantId: string;
    ingredients: Ingredient[];
    onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
    onClose: () => void;
}> = ({ item, restaurantId, ingredients, onAddToCart, onClose }) => {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(1);
    const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());

    const getIngredientName = (id: string) => ingredients.find(i => i.id === id)?.name || id;

    const handleIngredientToggle = (ingredientId: string) => {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        if (!ingredient || ingredient.isEssential) return;
        const ingredientName = ingredient.name;
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
            restaurantId: restaurantId,
            quantity,
            removedIngredients: Array.from(removedIngredients),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
                 <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.name}</h3>
                    <button onClick={onClose} className="p-1 -mt-2 -mr-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><XIcon className="w-6 h-6"/></button>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('quantity')}</h4>
                    <div className="flex items-center space-x-3">
                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xl flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">-</button>
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100 w-10 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xl flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">+</button>
                    </div>
                </div>
                {item.composition && item.composition.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('customize_ingredients')}</h4>
                        <div className="space-y-2">
                            {item.composition.map(comp => {
                                const ingredient = ingredients.find(i => i.id === comp.ingredientId);
                                const isEssential = ingredient?.isEssential;
                                return (
                                    <label key={comp.ingredientId} className={`flex items-center space-x-3 p-2 rounded ${isEssential ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer'}`}>
                                        <input type="checkbox" defaultChecked={!isEssential} disabled={isEssential} onChange={() => handleIngredientToggle(comp.ingredientId)} className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:cursor-not-allowed" />
                                        <span className="text-black dark:text-white">{getIngredientName(comp.ingredientId)} {isEssential ? `(${t('essential')})` : ''}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div className="flex justify-end items-center pt-4 border-t border-slate-200 dark:border-slate-700 space-x-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">{t('cancel')}</button>
                    <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">{t('add_to_cart')}</button>
                </div>
            </div>
        </div>
    );
};

const MenuItemCard: React.FC<{ item: MenuItemTemplate; onCustomize: (item: MenuItemTemplate) => void; ingredients: Ingredient[] }> = ({ item, onCustomize, ingredients }) => {
  const { t } = useTranslation();
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const ingredientNames = useMemo(() => item.composition.map(comp => ingredients.find(i => i.id === comp.ingredientId)?.name).filter(Boolean) as string[], [item.composition, ingredients]);

  const { isAvailable, missingOptional } = useMemo(() => {
    if (!item.composition) return { isAvailable: true, missingOptional: false };
    let mandatoryMissing = false;
    let optionalMissing = false;
    for (const required of item.composition) {
        const ingredient = ingredients.find(i => i.id === required.ingredientId);
        if (!ingredient || ingredient.stock < required.quantity) {
            if (ingredient?.isEssential) mandatoryMissing = true;
            else optionalMissing = true;
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
  
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row relative ${!isAvailable ? 'opacity-50' : ''}`}>
        {!isAvailable && (
            <div className="absolute inset-0 bg-gray-500 bg-opacity-70 flex items-center justify-center z-10">
                <span className="text-white text-2xl font-bold transform -rotate-12 border-4 border-white px-4 py-2">{t('sold_out')}</span>
            </div>
        )}
      <img src={item.imageUrl} alt={item.name} className={`w-full md:w-1/3 h-48 md:h-auto object-cover ${!isAvailable ? 'grayscale' : ''}`}/>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between">
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.name}</h4>
            <div className="flex items-center space-x-2">
                {item.allergens?.map(a => <AllergenIcon key={a.id} allergen={a} />)}
                {item.intolerances?.map(i => <IntoleranceIcon key={i.id} intolerance={i} />)}
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
        {aiDescription && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-slate-700 border-l-4 border-blue-500 rounded-r-lg">
                <p className="text-sm text-gray-800 dark:text-gray-200 italic">{aiDescription}</p>
            </div>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <button onClick={() => onCustomize(item)} disabled={!isAvailable} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400">{t('add_to_cart')}</button>
                <button onClick={handleGenerateDescription} disabled={isLoading || !isAvailable} className="flex items-center space-x-2 text-blue-600 border border-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50"><SparklesIcon className="w-5 h-5"/><span>AI</span></button>
            </div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">${item.price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};


const RestaurantPage: React.FC<RestaurantPageProps> = ({ restaurants, cart, setCart }) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuTemplates, setMenuTemplates] = useState<MenuTemplate[]>([]);
  const [allItems, setAllItems] = useState<MenuItemTemplate[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customizingItem, setCustomizingItem] = useState<MenuItemTemplate | null>(null);

  useEffect(() => {
    const currentRestaurant = restaurants.find(r => r.id === id);
    if (currentRestaurant) {
        setRestaurant(currentRestaurant);
    } else if (restaurants.length > 0) {
        console.warn(`Restaurant with id: ${id} not found.`);
        navigate('/');
    }
  }, [id, restaurants, navigate]);

  useEffect(() => {
    if (!restaurant) return;

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const itemsQuery = query(collection(db, 'items'), where('restaurantId', '==', restaurant.id));
            const menusQuery = query(collection(db, 'menus'), where('restaurantId', '==', restaurant.id));
            const ingredientsQuery = query(collection(db, 'ingredients'), where('restaurantId', '==', restaurant.id));
            const promotionsQuery = query(collection(db, 'promotions'), where('restaurantId', '==', restaurant.id));

            const [itemsSnapshot, menusSnapshot, ingredientsSnapshot, promotionsSnapshot] = await Promise.all([
                getDocs(itemsQuery),
                getDocs(menusQuery),
                getDocs(ingredientsQuery),
                getDocs(promotionsQuery),
            ]);

            setAllItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuItemTemplate));
            setMenuTemplates(menusSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuTemplate));
            setIngredients(ingredientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Ingredient));
            setPromotions(promotionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Promotion));

        } catch (e) {
            console.error("Error fetching restaurant data:", e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [restaurant]);

  const handleAddToCart = (item: Omit<CartItem, 'cartItemId'>) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(i => i.id === item.id && JSON.stringify(i.removedIngredients) === JSON.stringify(item.removedIngredients));
        if (existingItem) {
            return prevCart.map(i => i.cartItemId === existingItem.cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i);
        } else {
            const newCartItem = { ...item, cartItemId: `${item.id}-${Date.now()}` };
            return [...prevCart, newCartItem];
        }
    });
  };

  if (isLoading || !restaurant) {
      return <div className="text-center p-10">{t('loading')}</div>
  }
  
  const restaurantUrl = `${window.location.origin}/#/restaurant/${restaurant.id}`;

  return (
    <div className="animate-fade-in">
      <div className="h-64 md:h-80 relative">
        <img src={restaurant.bannerUrl} alt={`${restaurant.name} banner`} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-white">
            <button onClick={() => navigate('/')} className="text-sm mb-2 hover:underline">
              &larr; {t('back_to_restaurants')}
            </button>
            <h2 className="text-4xl md:text-5xl font-extrabold">{restaurant.name}</h2>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {menuTemplates.map(template => (
                <div key={template.id}>
                    <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">{template.name}</h3>
                    <div className="space-y-8">
                        {template.sections.map(section => (
                            <div key={section.id}>
                                <h4 className="text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-blue-500 pb-2 mb-4">{section.title}</h4>
                                <div className="space-y-6">
                                    {section.itemIds.map(itemId => {
                                        const item = allItems.find(i => i.id === itemId);
                                        return item ? <MenuItemCard key={item.id} item={item} onCustomize={setCustomizingItem} ingredients={ingredients} /> : null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
          </div>
          <div className="lg:col-span-1">
             <div className="sticky top-24 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold border-b pb-2 mb-4 text-slate-800 dark:text-slate-200">{t('restaurant_info')}</h3>
                 <div className="mt-6 text-center">
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">{t('scan_direct_access')}</h4>
                    <div className="flex justify-center bg-white p-2 rounded-lg">
                      <QRCodeWrapper value={restaurantUrl} />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      {customizingItem && restaurant && (
          <CustomizationModal 
            item={customizingItem}
            restaurantId={restaurant.id}
            ingredients={ingredients}
            onAddToCart={handleAddToCart}
            onClose={() => setCustomizingItem(null)}
          />
      )}
    </div>
  );
};

export default RestaurantPage;
