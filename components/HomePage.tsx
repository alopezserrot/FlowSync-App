
import React from 'react';
import { Restaurant, User, UserRole } from '../types';
import { QRCodeWrapper } from './Shared';
import { useLanguage } from '../i18nContext';

interface HomePageProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (id: number) => void;
  currentUser: User;
}

const RestaurantCard: React.FC<{ restaurant: Restaurant; onClick: () => void }> = ({ restaurant, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300"
    onClick={onClick}
  >
    <img src={restaurant.bannerUrl} alt={restaurant.name} className="w-full h-40 object-cover" />
    <div className="p-4">
      <h3 className="text-xl font-bold text-secondary">{restaurant.name}</h3>
      <p className="text-gray-600 mt-1 text-sm">{restaurant.description}</p>
    </div>
  </div>
);

const ConsumerHomePage: React.FC<{
    restaurants: Restaurant[];
    linkedRestaurantIds: number[];
    onSelectRestaurant: (id: number) => void;
}> = ({ restaurants, linkedRestaurantIds, onSelectRestaurant }) => {
    const { t } = useLanguage();
    
    // We are now showing ALL restaurants to represent the "Event" view, 
    // rather than filtering by visited (linked) restaurants.
    // const linkedRestaurants = restaurants.filter(r => linkedRestaurantIds.includes(r.id));

    return (
         <section>
            <h2 className="text-3xl font-extrabold text-secondary mb-6">{t('your_event')}</h2>
            
            {restaurants.length === 0 ? (
                 <div className="text-center py-20 px-4">
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('no_restaurants_found')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => onSelectRestaurant(restaurant.id)} />
                  ))}
                </div>
            )}
            
            <div className="mt-12 border-t pt-8 text-center">
                <p className="text-gray-600 mb-4">{t('scan_instruction')}</p>
                <div className="inline-block">
                    <QRCodeWrapper value={window.location.href.split('#')[0]}/>
                </div>
            </div>
          </section>
    )
}


const HomePage: React.FC<HomePageProps> = ({ restaurants, onSelectRestaurant, currentUser }) => {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {currentUser.role === UserRole.Consumer ? (
            <ConsumerHomePage
                restaurants={restaurants}
                linkedRestaurantIds={currentUser.linkedRestaurantIds || []}
                onSelectRestaurant={onSelectRestaurant}
            />
        ) : (
            <section>
                <h2 className="text-3xl font-extrabold text-secondary mb-6">{t('all_restaurants')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} onClick={() => onSelectRestaurant(restaurant.id)} />
                ))}
                </div>
            </section>
        )}
    </div>
  );
};

export default HomePage;
