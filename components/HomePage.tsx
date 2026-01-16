
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Restaurant, MediaType, MediaContent } from '../types';
import { QRCodeWrapper, VideoIcon, XIcon, SparklesIcon } from './Shared';

interface HomePageProps {
  restaurants: Restaurant[];
}

const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-all duration-300 group border border-gray-100 dark:border-slate-700"
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
          <img src={restaurant.bannerUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
              <span className="text-xs font-bold text-gray-800">4.5 ★</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold leading-tight">{restaurant.name}</h3>
              <div className="flex items-center space-x-2 text-xs opacity-90 mt-1">
                  <span className="bg-blue-500 px-1.5 py-0.5 rounded text-[10px] font-black uppercase">Promo</span>
                  <span>• 20-30 min</span>
              </div>
          </div>
      </div>
      <div className="p-4 bg-white dark:bg-slate-800">
        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1 italic">{restaurant.description}</p>
      </div>
    </div>
  );
}

const FeaturedVideoModal: React.FC<{ video: MediaContent & { restaurantName: string }, onClose: () => void }> = ({ video, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex justify-center items-center">
            <div className="w-full h-full max-w-lg relative flex flex-col">
                <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-gray-300 z-[110] bg-white/10 rounded-full p-2 backdrop-blur-md">
                    <XIcon className="w-6 h-6"/>
                </button>
                <div className="flex-grow flex items-center justify-center bg-black">
                    <video src={video.source} controls autoPlay loop className="w-full h-auto max-h-screen"></video>
                </div>
                <div className="p-8 bg-gradient-to-t from-black/90 to-transparent absolute bottom-0 w-full text-white pointer-events-none">
                    <div className="flex items-center space-x-3 mb-2">
                         <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white overflow-hidden">
                            <img src={`https://picsum.photos/100/100?random=${video.id}`} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xl font-black">{video.restaurantName}</h3>
                    </div>
                    <p className="text-lg font-medium opacity-90">{video.title}</p>
                    <p className="text-sm opacity-60 mt-1">{video.description}</p>
                </div>
            </div>
        </div>
    )
}

const DiscoverSection: React.FC<{ restaurants: Restaurant[] }> = ({ restaurants }) => {
    const { t } = useTranslation();
    const [selectedVideo, setSelectedVideo] = useState<(MediaContent & { restaurantName: string }) | null>(null);

    const videos = useMemo(() => {
        return restaurants.flatMap(r => 
            (r.media || []).filter(m => m.type === MediaType.Video).map(m => ({ ...m, restaurantName: r.name, restaurantId: r.id }))
        );
    }, [restaurants]);

    if (videos.length === 0) return null;

    return (
        <section className="mb-10 mt-4">
            <h2 className="text-xl font-black text-slate-700 dark:text-slate-200 mb-4 flex items-center tracking-tight">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mr-3">
                    <VideoIcon className="w-5 h-5 text-blue-500" />
                </div>
                {t('discover_feed')}
            </h2>
            <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide px-2 -mx-2">
                {videos.map((video, idx) => (
                    <div 
                        key={`${video.id}-${idx}`} 
                        onClick={() => setSelectedVideo(video)}
                        className="flex-shrink-0 w-32 group cursor-pointer"
                    >
                        <div className="w-32 h-48 relative rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all transform group-hover:-translate-y-1 ring-2 ring-transparent group-hover:ring-blue-500/50">
                            <video src={video.source} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" muted loop playsInline />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center">
                                    <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderLeft: '12px solid white', borderBottom: '6px solid transparent', marginLeft: '4px' }}></div>
                                </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-[10px] font-black uppercase leading-none truncate">{video.restaurantName}</p>
                            </div>
                        </div>
                        <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-2 truncate text-center">{video.title}</p>
                    </div>
                ))}
            </div>
            {selectedVideo && <FeaturedVideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
        </section>
    );
}

const PushSubscriptionBanner: React.FC = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);
    const [subscribed, setSubscribed] = useState(false);

    if (!visible) return null;

    return (
         <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 text-white p-6 rounded-3xl shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center animate-fade-in-down border border-white/10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
                    <h3 className="font-black text-xl tracking-tight">{subscribed ? t('notifications_active') : t('get_updates')}</h3>
                </div>
                <p className="text-sm opacity-80 max-w-sm leading-relaxed">{subscribed ? t('you_will_receive_promos') : t('enable_push_desc')}</p>
            </div>
            
            <div className="relative z-10 flex items-center space-x-4">
                {subscribed ? (
                     <button onClick={() => setVisible(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                        <XIcon className="w-5 h-5"/>
                     </button>
                ) : (
                    <>
                        <button onClick={() => setVisible(false)} className="text-sm font-black uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">{t('maybe_later')}</button>
                        <button 
                            onClick={() => { setSubscribed(true); }}
                            className="bg-white text-indigo-700 px-8 py-3 rounded-full font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/50"
                        >
                            {t('enable_notifications')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export const HomePage: React.FC<HomePageProps> = ({ restaurants }) => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl animate-fade-in">
        <PushSubscriptionBanner />
        <DiscoverSection restaurants={restaurants} />

        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-700 dark:text-slate-200 tracking-tight">{t('all_restaurants')}</h2>
            <div className="flex items-center text-sm font-bold text-blue-500 cursor-pointer hover:underline">
                <span>Ver más &rarr;</span>
            </div>
        </div>
        
        {restaurants.length === 0 ? (
             <div className="text-center py-20 px-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                <p className="text-lg text-gray-400 dark:text-gray-500 max-w-2xl mx-auto font-medium">{t('no_restaurants_found')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
        )}
        
        <div className="mt-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl p-10 text-center border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">{t('scan_direct_access')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">{t('scan_instruction')}</p>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeWrapper value={window.location.origin} />
            </div>
        </div>
      </div>
  );
};
