import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useCartStore from '@/context/CartStore';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const items            = useCartStore((s) => s.items);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-orange-500 font-bold text-xl">
          <UtensilsCrossed size={24} />
          FoodApp
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:bg-orange-50 rounded-full transition">
            <ShoppingCart size={22} className="text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs
                               w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Profile */}
          <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-full transition">
            <User size={22} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.name?.split(' ')[0]}
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-full transition"
            title="Logout"
          >
            <LogOut size={22} className="text-gray-500 hover:text-red-500" />
          </button>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;