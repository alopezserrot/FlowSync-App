
import React, { useState, useMemo } from 'react';
import { Restaurant, User, UserRole, MediaType, MediaContent } from '../types';
import { QRCodeWrapper, VideoIcon, XIcon } from './Shared';
import { useLanguage } from '../i18nContext';

interface HomePageProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (id: number) => void;
  currentUser: User;
}

const RestaurantCard: React.FC<{ restaurant: Restaurant; onClick: () => void }> = ({ restaurant, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
    onClick={onClick}
  >
    <div className="relative h-40 overflow-hidden">
        <img src={restaurant.bannerUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <span className="text-white font-semibold text-sm">View Menu &rarr;</span>
        </div>
    </div>
    <div className="p-4">
      <h3 className="text-xl font-bold text-secondary">{restaurant.name}</h3>
      <p className="text-gray-600 mt-1 text-sm line-clamp-2">{restaurant.description}</p>
    </div>
  </div>
);

const FeaturedVideoModal: React.FC<{ video: MediaContent & { restaurantName: string }, onClose: () => void }> = ({ video, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[80] flex justify-center items-center p-4">
            <div className="w-full max-w-4xl relative bg-black rounded-lg overflow-hidden shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2">
                    <XIcon className="w-6 h-6"/>
                </button>
                <video src={video.source} controls autoPlay className="w-full h-auto max-h-[80vh] mx-auto"></video>
                <div className="p-4 bg-gradient-to-t from-black to-transparent absolute bottom-0 w-full text-white">
                    <h3 className="text-lg font-bold">{video.restaurantName}</h3>
                    <p>{video.title}</p>
                </div>
            </div>
        </div>
    )
}

const DiscoverSection: React.FC<{ restaurants: Restaurant[] }> = ({ restaurants }) => {
    const { t } = useLanguage();
    const [selectedVideo, setSelectedVideo] = useState<(MediaContent & { restaurantName: string }) | null>(null);

    const videos = useMemo(() => {
        return restaurants.flatMap(r => 
            (r.media || []).filter(m => m.type === MediaType.Video).map(m => ({ ...m, restaurantName: r.name, restaurantId: r.id }))
        );
    }, [restaurants]);

    if (videos.length === 0) return null;

    return (
        <section className="mb-12">
            <h2 className="text-2xl font-extrabold text-secondary mb-4 flex items-center">
                <VideoIcon className="w-6 h-6 mr-2 text-primary" /> {t('discover_feed')}
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {videos.map((video, idx) => (
                    <div 
                        key={`${video.id}-${idx}`} 
                        onClick={() => setSelectedVideo(video)}
                        className="flex-shrink-0 w-64 h-80 relative rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 group"
                    >
                        <video src={video.source} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-bold text-sm truncate">{video.title}</p>
                            <p className="text-gray-300 text-xs">{video.restaurantName}</p>
                        </div>
                    </div>
                ))}
            </div>
            {selectedVideo && <FeaturedVideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </section>
    );
}

const PushSubscriptionBanner: React.FC = () => {
    const { t } = useLanguage();
    const [visible, setVisible] = useState(true);
    const [subscribed, setSubscribed] = useState(false);

    if (!visible) return null;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-lg shadow-lg mb-8 flex justify-between items-center animate-fade-in-down">
            <div>
                <h3 className="font-bold text-lg">{subscribed ? t('notifications_active') : t('get_updates')}</h3>
                <p className="text-sm opacity-90">{subscribed ? t('you_will_receive_promos') : t('enable_push_desc')}</p>
            </div>
            {subscribed ? (
                 <button onClick={() => setVisible(false)} className="text-white opacity-75 hover:opacity-100">
                    <XIcon className="w-5 h-5"/>
                 </button>
            ) : (
                <div className="flex space-x-3">
                    <button onClick={() => setVisible(false)} className="text-sm font-medium opacity-75 hover:opacity-100">{t('maybe_later')}</button>
                    <button 
                        onClick={() => {
                            // Simulate permission request
                            if ('Notification' in window) {
                                Notification.requestPermission();
                            }
                            setSubscribed(true);
                            setTimeout(() => {
                                // Simulate an immediate push upon subscribing
                                const event = new CustomEvent('simulate-push', { 
                                    detail: { message: "🎉 Thanks for subscribing! Here is a 10% discount code: WELCOME10", type: 'success' } 
                                });
                                window.dispatchEvent(event);
                            }, 1500);
                        }}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors shadow-md"
                    >
                        {t('enable_notifications')}
                    </button>
                </div>
            )}
        </div>
    );
};

const ConsumerHomePage: React.FC<{
    restaurants: Restaurant[];
    linkedRestaurantIds: number[];
    onSelectRestaurant: (id: number) => void;
}> = ({ restaurants, linkedRestaurantIds, onSelectRestaurant }) => {
    const { t } = useLanguage();
    
    return (
         <section>
            <PushSubscriptionBanner />
            <DiscoverSection restaurants={restaurants} />

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
