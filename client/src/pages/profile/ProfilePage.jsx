import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, LogOut, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
  ];

  return (
    <MainLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-5">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-500 font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.role}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail size={16} className="text-gray-400" />
            <span>{user?.email}</span>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone size={16} className="text-gray-400" />
              <span>{user?.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <button key={path} onClick={() => navigate(path)}
            className="w-full flex items-center gap-4 px-5 py-4
                       border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
            <Icon size={18} className="text-gray-500" />
            <span className="flex-1 text-left text-sm font-medium text-gray-700">{label}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50
                   text-red-500 font-semibold py-4 rounded-2xl hover:bg-red-100 transition">
        <LogOut size={18} />
        Logout
      </button>
    </MainLayout>
  );
};

export default ProfilePage;