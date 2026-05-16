import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Star, Clock, Bike, Plus, Minus, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantAPI } from '@/api';
import useCartStore from '@/context/CartStore';
import MainLayout from '@/components/layout/MainLayout';

// ── Menu Item Card ────────────────────────────────────────────────────────
const MenuItemCard = ({ item, restaurant }) => {
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    const result = addItem(
      { id: item.id, name: item.name, price: parseFloat(item.discountedPrice || item.price),
        image: item.image },
      { id: restaurant.id, name: restaurant.name }
    );
    if (result?.error === 'different_restaurant') {
      toast.error(`Clear cart first — it has items from ${result.restaurantName}`);
    } else {
      toast.success(`${item.name} added!`, { duration: 1500 });
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Item info */}
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center
            ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </span>
          {item.isBestseller && (
            <span className="text-xs text-orange-500 font-semibold">★ Bestseller</span>
          )}
        </div>
        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{item.description}</p>
        <div className="mt-1.5">
          {item.discountedPrice && parseFloat(item.discountedPrice) < parseFloat(item.price) ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">₹{item.discountedPrice}</span>
              <span className="text-gray-400 line-through text-xs">₹{item.price}</span>
            </div>
          ) : (
            <span className="font-bold text-gray-800">₹{item.price}</span>
          )}
        </div>
      </div>

      {/* Add/Qty controls */}
      <div className="flex-shrink-0">
        {quantity === 0 ? (
          <button onClick={handleAdd}
            className="border-2 border-orange-500 text-orange-500 font-bold px-5 py-1.5
                       rounded-xl text-sm hover:bg-orange-50 transition">
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-2 border-2 border-orange-500 rounded-xl overflow-hidden">
            <button onClick={() => updateQuantity(item.id, quantity - 1)}
              className="px-2.5 py-1.5 text-orange-500 hover:bg-orange-50 font-bold">
              <Minus size={14} />
            </button>
            <span className="font-bold text-orange-500 text-sm w-4 text-center">{quantity}</span>
            <button onClick={() => updateQuantity(item.id, quantity + 1)}
              className="px-2.5 py-1.5 text-orange-500 hover:bg-orange-50 font-bold">
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── RestaurantPage ────────────────────────────────────────────────────────
const RestaurantPage = () => {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const items          = useCartStore((s) => s.items);
  const totalItems     = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal       = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: restData, isLoading: restLoading } = useQuery(
    ['restaurant', id],
    () => restaurantAPI.getById(id)
  );

  const { data: menuData, isLoading: menuLoading } = useQuery(
    ['menu', id],
    () => restaurantAPI.getMenu(id)
  );

  const restaurant = restData?.data?.restaurant;
  const menu       = menuData?.data?.menu || {};
  const categories = Object.keys(menu);

  if (restLoading || menuLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-52 bg-gray-200 rounded-2xl" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </MainLayout>
    );
  }

  if (!restaurant) return (
    <MainLayout>
      <p className="text-center py-20 text-gray-500">Restaurant not found.</p>
    </MainLayout>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-52 bg-gray-200">
        {restaurant.coverImage
          ? <img src={restaurant.coverImage} alt={restaurant.name}
              className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
        }
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Restaurant info */}
        <div className="bg-white rounded-2xl shadow-sm p-5 -mt-6 relative mb-5">
          <h1 className="text-xl font-bold text-gray-800">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm">{restaurant.category} · {restaurant.city}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <Star size={14} fill="currentColor" /> {restaurant.rating} ({restaurant.totalRatings})
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {restaurant.deliveryTime} mins
            </span>
            <span className="flex items-center gap-1">
              <Bike size={14} />
              {parseFloat(restaurant.deliveryFee) === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
            </span>
          </div>
          {!restaurant.isOpen && (
            <div className="mt-3 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
              ⚠️ This restaurant is currently closed
            </div>
          )}
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                  ${activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu */}
        {categories.map((cat) => (
          <div key={cat} id={`cat-${cat}`} className="bg-white rounded-2xl shadow-sm p-5 mb-4">
            <h3 className="font-bold text-gray-800 mb-2 text-base">
              {cat} <span className="text-gray-400 font-normal text-sm">({menu[cat].length})</span>
            </h3>
            {menu[cat].map((item) => (
              <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
            ))}
          </div>
        ))}

        <div className="h-24" /> {/* Spacer for cart bar */}
      </div>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4">
          <button onClick={() => navigate('/cart')}
            className="w-full max-w-3xl mx-auto flex items-center justify-between
                       bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-xl">
            <span className="bg-orange-600 px-2 py-0.5 rounded-lg text-sm font-bold">
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </span>
            <span className="font-bold text-base">View Cart</span>
            <span className="font-bold">₹{subtotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;