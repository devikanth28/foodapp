import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { orderAPI } from '@/api';
import MainLayout from '@/components/layout/MainLayout';

const STATUS_STYLES = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  preparing:        'bg-orange-100 text-orange-700',
  ready:            'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  preparing:        'Preparing',
  ready:            'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const OrdersPage = () => {
  const { data, isLoading } = useQuery('orders', () => orderAPI.getAll());
  const orders = data?.data?.orders || [];

  return (
    <MainLayout>
      <h1 className="text-xl font-bold text-gray-800 mb-5">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={64} className="text-gray-200 mb-4" />
          <h2 className="text-lg font-bold text-gray-700 mb-1">No orders yet</h2>
          <p className="text-gray-400 mb-6">Your order history will appear here</p>
          <Link to="/" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold">
            Order Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4
                         hover:shadow-md transition block">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 text-sm">{order.restaurant?.name}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                    ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {order.items?.map((i) => i.name).join(', ')}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">#{order.orderNumber}</span>
                  <span className="font-bold text-gray-800 text-sm">₹{order.totalAmount}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default OrdersPage;