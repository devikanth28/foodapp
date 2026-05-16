import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, MapPin, CheckCircle, Circle } from 'lucide-react';
import { orderAPI } from '@/api';
import MainLayout from '@/components/layout/MainLayout';

const STEPS = [
  { key: 'pending',          label: 'Order Placed'     },
  { key: 'confirmed',        label: 'Confirmed'        },
  { key: 'preparing',        label: 'Preparing'        },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered'        },
];

const STATUS_INDEX = {
  pending: 0, confirmed: 1, preparing: 2,
  ready: 2, out_for_delivery: 3, delivered: 4,
};

const OrderDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery(
    ['order', id],
    () => orderAPI.getById(id),
    { refetchInterval: 15000 } // auto-refresh every 15 seconds for live tracking
  );

  const order = data?.data?.order;

  if (isLoading) return (
    <MainLayout>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    </MainLayout>
  );

  if (!order) return (
    <MainLayout>
      <p className="text-center py-20 text-gray-500">Order not found.</p>
    </MainLayout>
  );

  const currentStep  = STATUS_INDEX[order.status] ?? 0;
  const isCancelled  = order.status === 'cancelled';

  return (
    <MainLayout>
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-600 mb-5 hover:text-orange-500">
        <ArrowLeft size={18} /> My Orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="font-bold text-gray-800 text-base">{order.restaurant?.name}</h2>
            <p className="text-gray-400 text-sm">#{order.orderNumber}</p>
          </div>
          <span className="font-bold text-gray-800 text-lg">₹{order.totalAmount}</span>
        </div>
      </div>

      {/* Live Tracking */}
      {!isCancelled ? (
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-800 mb-5">Order Status</h3>
          <div className="relative">
            {STEPS.map((step, index) => {
              const done    = index <= currentStep;
              const active  = index === currentStep;
              return (
                <div key={step.key} className="flex items-start gap-4 mb-5 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center
                      ${done ? 'bg-orange-500' : 'bg-gray-100'}`}>
                      {done
                        ? <CheckCircle size={16} className="text-white" />
                        : <Circle size={16} className="text-gray-300" />
                      }
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 mt-1 ${done ? 'bg-orange-400' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-sm font-semibold
                      ${active ? 'text-orange-500' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-gray-400 mt-0.5">In progress...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
          <p className="text-red-600 font-semibold">Order Cancelled</p>
          {order.cancellationReason && (
            <p className="text-red-400 text-sm mt-1">{order.cancellationReason}</p>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Items</h3>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name} × {item.quantity}</span>
              <span className="font-semibold text-gray-800">₹{item.totalPrice}</span>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 space-y-1 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Subtotal</span><span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span><span>₹{order.deliveryFee}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes</span><span>₹{order.taxes}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-base pt-1">
            <span>Total</span><span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" /> Delivery Address
        </h3>
        <p className="text-gray-600 text-sm">
          {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
        </p>
      </div>
    </MainLayout>
  );
};

export default OrderDetailPage;