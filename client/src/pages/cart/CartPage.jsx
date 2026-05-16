import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '@/api';
import useCartStore from '@/context/CartStore';
import MainLayout from '@/components/layout/MainLayout';

const CartPage = () => {
  const navigate  = useNavigate();
  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart } = useCartStore();
  const [loading, setLoading]     = useState(false);
  const [addressId, setAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [instructions, setInstructions]   = useState('');

  const subtotal    = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = 30;
  const taxes       = parseFloat((subtotal * 0.05).toFixed(2));
  const total       = subtotal + deliveryFee + taxes;

  const handlePlaceOrder = async () => {
    if (!addressId.trim()) {
      toast.error('Please enter your address ID');
      return;
    }
    setLoading(true);
    try {
      const { data } = await orderAPI.place({
        restaurantId,
        addressId,
        paymentMethod,
        specialInstructions: instructions,
        items: items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag size={64} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add items from a restaurant to get started</p>
          <button onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600">
            Browse Restaurants
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 mb-5 hover:text-orange-500">
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="text-xl font-bold text-gray-800 mb-1">Your Cart</h1>
      <p className="text-sm text-gray-500 mb-5">from {restaurantName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-orange-500 font-bold mt-0.5">₹{(item.price * item.quantity).toFixed(2)}</p>
                <p className="text-gray-400 text-xs">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-2 border-2 border-orange-500 rounded-xl overflow-hidden">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2.5 py-1.5 text-orange-500 hover:bg-orange-50">
                  <Minus size={14} />
                </button>
                <span className="font-bold text-orange-500 text-sm w-5 text-center">
                  {item.quantity}
                </span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2.5 py-1.5 text-orange-500 hover:bg-orange-50">
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Special Instructions
            </label>
            <textarea
              value={instructions} onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Extra spicy, no onions..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span><span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span><span>₹{taxes}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Address ID
            </label>
            <input
              type="text" value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
              placeholder="Paste your address ID here"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Address management coming in Day 6
            </p>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-3">Payment</label>
            <div className="space-y-2">
              {['cod', 'razorpay'].map((method) => (
                <label key={method} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="payment"
                    value={method} checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-orange-500" />
                  <span className="text-sm text-gray-700 capitalize">
                    {method === 'cod' ? '💵 Cash on Delivery' : '💳 Razorpay (coming soon)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder} disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold
                       py-4 rounded-2xl transition disabled:opacity-50 text-base">
            {loading ? 'Placing Order...' : `Place Order · ₹${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;