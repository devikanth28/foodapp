import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { MapPin, Search, Star, Clock, Bike, LocateFixed } from 'lucide-react';
import { restaurantAPI } from '../../api';
import MainLayout from '../../components/layout/MainLayout';

// ── Restaurant Card ───────────────────────────────────────────────────────
const RestaurantCard = ({ restaurant }) => (
  <Link to={`/restaurant/${restaurant.id}`}
    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
    <div className="relative h-44 bg-gray-100 overflow-hidden">
      {restaurant.coverImage
        ? <img src={restaurant.coverImage} alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
      }
      {!restaurant.isOpen && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
            Currently Closed
          </span>
        </div>
      )}
    </div>

    <div className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base">{restaurant.name}</h3>
          <p className="text-gray-500 text-sm mt-0.5">{restaurant.category}</p>
        </div>
        <div className="flex items-center gap-1 bg-green-600 text-white text-xs
                        font-bold px-2 py-0.5 rounded-lg shrink-0">
          <Star size={11} fill="white" />
          {restaurant.rating}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {restaurant.deliveryTime} mins
        </span>
        <span className="flex items-center gap-1">
          <Bike size={12} />
          {parseFloat(restaurant.deliveryFee) === 0
            ? 'Free delivery'
            : `₹${restaurant.deliveryFee} delivery`}
        </span>
        {restaurant.distance_km && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {parseFloat(restaurant.distance_km).toFixed(1)} km
          </span>
        )}
      </div>

      {parseFloat(restaurant.minimumOrder) > 0 && (
        <p className="text-xs text-gray-400 mt-1">Min. order ₹{restaurant.minimumOrder}</p>
      )}
    </div>
  </Link>
);

// ── Default Hyderabad location (where all test data is) ───────────────────
const DEFAULT_LOCATION = { lat: 17.3850, lng: 78.4867, label: 'Hyderabad' };

// ── HomePage ──────────────────────────────────────────────────────────────
const HomePage = () => {
  const [location, setLocation]     = useState(DEFAULT_LOCATION);
  const [usingGPS, setUsingGPS]     = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');

  const categories = ['All', 'Biryani', 'South Indian', 'Pizza', 'Desserts', 'Chinese', 'Drinks'];

  // On mount — use default Hyderabad so restaurants always show
  // User can manually click "Use my location" button to override
  useEffect(() => {
    setLocation(DEFAULT_LOCATION);
  }, []);

  // Manual GPS detection button
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat:   pos.coords.latitude,
          lng:   pos.coords.longitude,
          label: 'Your location',
        });
        setUsingGPS(true);
        setLocLoading(false);
      },
      () => {
        // If GPS fails or denied, stay on Hyderabad
        setLocation(DEFAULT_LOCATION);
        setUsingGPS(false);
        setLocLoading(false);
      }
    );
  };

  const resetToDefault = () => {
    setLocation(DEFAULT_LOCATION);
    setUsingGPS(false);
  };

  const { data, isLoading } = useQuery(
    ['restaurants', location, search, category],
    () => restaurantAPI.getNearby(location.lat, location.lng, {
      radius:   15,
      search:   search   || undefined,
      category: category === 'All' || !category ? undefined : category,
    }),
    {
      enabled:   !!location,
      staleTime: 5 * 60 * 1000,
    }
  );

  const restaurants = data?.data?.restaurants || [];

  return (
    <MainLayout>
      {/* Location bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <MapPin size={15} className="text-orange-500" />
            {location.label}
            {usingGPS && (
              <span className="text-xs text-green-600 font-normal ml-1">• Live GPS</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Showing restaurants within 15 km
          </p>
        </div>

        {/* GPS toggle button */}
        {!usingGPS ? (
          <button
            onClick={detectLocation}
            disabled={locLoading}
            className="flex items-center gap-1.5 text-xs text-orange-500 border border-orange-300
                       px-3 py-1.5 rounded-full hover:bg-orange-50 transition font-medium"
          >
            <LocateFixed size={13} />
            {locLoading ? 'Detecting...' : 'Use my location'}
          </button>
        ) : (
          <button
            onClick={resetToDefault}
            className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5
                       rounded-full hover:bg-gray-50 transition"
          >
            Reset to Hyderabad
          </button>
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-4">What are you craving?</h1>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                     text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat === 'All' ? '' : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
              ${(cat === 'All' && !category) || cat === category
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-gray-600 font-semibold mb-1">No restaurants found nearby</p>
          <p className="text-gray-400 text-sm mb-4">
            All test data is in Hyderabad. Click below to reset.
          </p>
          <button
            onClick={resetToDefault}
            className="bg-orange-500 text-white px-6 py-2 rounded-xl text-sm font-semibold"
          >
            Show Hyderabad Restaurants
          </button>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{restaurants.length} restaurants nearby</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default HomePage;