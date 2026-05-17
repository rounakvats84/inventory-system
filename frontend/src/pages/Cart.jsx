import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Clock } from 'lucide-react';
import api from '../api';

const Cart = ({ user }) => {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [orderResult, setOrderResult] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (err) {
            console.error("Error fetching cart", err);
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            const res = await api.post('/cart/update', { productId, quantity: newQuantity });
            setCart(res.data);
        } catch (err) {
            console.error("Error updating quantity", err);
        }
    };

    const removeItem = async (productId) => {
        try {
            const res = await api.post('/cart/remove', { productId });
            setCart(res.data);
        } catch (err) {
            console.error("Error removing item", err);
        }
    };

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) return;
        setIsCheckingOut(true);
        try {
            const items = cart.items.map(item => ({
                product_id: item.product._id,
                quantity: item.quantity
            }));
            const res = await api.post('/orders', { user_id: user.id, items });
            setOrderResult(res.data.order);
            await api.post('/cart/clear');
            setCart(null);
        } catch (err) {
            console.error("Checkout error", err);
            alert("Error during checkout");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (isLoading) return <div className="text-slate-400 p-8">Loading cart...</div>;

    if (orderResult) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto text-center"
            >
                <div className="mx-auto w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Order Placed Successfully!</h2>
                <p className="text-slate-400 mb-8">Your batch order has been scheduled for manufacturing.</p>
                
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 text-left space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-slate-400">Order ID</span>
                        <span className="font-bold text-slate-200">#{orderResult._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-slate-400">Total Amount</span>
                        <span className="font-bold text-emerald-400 text-xl">₹{Number(orderResult.total_price * 1.18).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block mb-2">Estimated Delivery Time</span>
                        <div className="flex items-center space-x-3">
                            <Clock className="w-6 h-6 text-indigo-400" />
                            <span className="text-3xl font-bold text-indigo-400">{orderResult.estimated_delivery_days} Days</span>
                        </div>
                        {orderResult.shortage_delay_days > 0 && (
                            <p className="text-xs text-amber-400 mt-3 font-medium bg-amber-500/10 border border-amber-500/20 inline-block px-3 py-2 rounded-lg">
                                Includes {orderResult.shortage_delay_days} days procurement delay due to raw material shortage.
                            </p>
                        )}
                    </div>
                </div>
                
                <button onClick={() => window.location.href = '/orders'} className="mt-8 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all">
                    View My Orders
                </button>
            </motion.div>
        );
    }

    const subtotal = cart?.total_amount || 0;
    const gst = subtotal * 0.18;
    const finalTotal = subtotal + gst;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                    <ShoppingBag className="w-8 h-8 mr-3 text-indigo-400"/> My Shopping Cart
                </h2>
                <p className="mt-2 text-sm text-slate-400">Review your products before placing a batch order.</p>
            </div>

            {(!cart || cart.items.length === 0) ? (
                <div className="glass-panel p-12 text-center rounded-2xl">
                    <ShoppingBag className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-slate-300">Your cart is empty</h3>
                    <p className="text-slate-500 mt-2">Browse the catalog to add products.</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        <AnimatePresence>
                            {cart.items.map(item => (
                                <motion.div 
                                    key={item.product._id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-slate-100">{item.product.name}</h3>
                                        <p className="text-sm text-emerald-400 font-medium mt-1">₹{item.product.selling_price.toLocaleString()} per unit</p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <Minus className="w-4 h-4"/>
                                            </button>
                                            <span className="w-12 text-center font-bold text-slate-200">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                                <Plus className="w-4 h-4"/>
                                            </button>
                                        </div>
                                        
                                        <div className="w-24 text-right">
                                            <span className="font-bold text-slate-100 block">₹{item.price.toLocaleString()}</span>
                                        </div>
                                        
                                        <button onClick={() => removeItem(item.product._id)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                            <Trash2 className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="glass-panel p-6 rounded-2xl sticky top-8">
                            <h3 className="text-xl font-bold text-slate-100 mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between text-slate-300">
                                    <span>Subtotal ({cart.items.length} items)</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Estimated GST (18%)</span>
                                    <span>₹{gst.toLocaleString()}</span>
                                </div>
                                
                                <div className="pt-4 border-t border-white/10 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-bold text-slate-200">Total Amount</span>
                                        <span className="text-2xl font-bold text-emerald-400">₹{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout} disabled={isCheckingOut}
                                className="w-full mt-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                            >
                                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                            </button>
                            <p className="text-xs text-center text-slate-500 mt-4">
                                Delivery time will be calculated dynamically based on raw material availability and manufacturing batches.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
