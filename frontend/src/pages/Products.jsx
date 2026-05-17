import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X } from 'lucide-react';
import api from '../api';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartResult, setCartResult] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const openModal = (p) => {
    setSelectedProduct(p);
    setQuantity(1);
    setIsModalOpen(true);
    setCartResult(null);
  }

  const addToCart = async () => {
    setIsAddingToCart(true);
    try {
        const res = await api.post('/cart/add', {
            productId: selectedProduct.id,
            quantity
        });
        setCartResult(true);
    } catch(err) {
        alert(err.response?.data?.msg || 'Failed to add to cart');
    } finally {
        setIsAddingToCart(false);
    }
  }

  return (
    <div className="space-y-8 relative">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Product Catalog</h2>
        <p className="mt-2 text-sm text-slate-400">Browse and place orders for our steel products.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="glass-panel rounded-2xl overflow-hidden group flex flex-col relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 flex-1 relative">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                        <Package className="w-8 h-8"/>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    ₹{p.selling_price}
                    </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 tracking-tight group-hover:text-indigo-300 transition-colors">{p.name}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                    <p className="flex justify-between"><span>Production:</span> <span className="text-slate-200 font-medium">{p.production_time} days/unit</span></p>
                    <p className="flex justify-between"><span>Delivery:</span> <span className="text-slate-200 font-medium">{p.delivery_time} days</span></p>
                </div>
            </div>
            <div className="p-5 border-t border-white/5 bg-black/20 relative">
                <button 
                  onClick={() => openModal(p)}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
                >
                  Add to Cart
                </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modern Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel bg-slate-900/90 rounded-2xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden border border-white/10"
            >
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h3 className="text-xl font-bold text-slate-100">{cartResult ? 'Added to Cart!' : `Add to Cart: ${selectedProduct?.name}`}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="p-6">
                {!cartResult ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Quantity</label>
                            <input 
                              type="number" min="1" 
                              value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value) || 1)}
                              className="mt-1 block w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Unit Price</span>
                                <span className="font-medium text-slate-200">₹{selectedProduct?.selling_price}</span>
                             </div>
                             <div className="flex justify-between text-lg font-bold text-slate-100 pt-2 border-t border-white/5 mt-2">
                                <span>Total Price</span>
                                <span className="text-emerald-400">₹{(selectedProduct?.selling_price * quantity).toLocaleString()}</span>
                             </div>
                        </div>

                        <button 
                          onClick={addToCart} disabled={isAddingToCart}
                          className="w-full mt-4 flex justify-center py-3 px-4 rounded-xl shadow-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                        >
                          {isAddingToCart ? 'Adding...' : 'Confirm Add to Cart'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                           <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h4 className="text-2xl font-bold text-slate-100">Successfully Added!</h4>
                        
                        <div className="mt-6 flex gap-4">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
                                Continue Shopping
                            </button>
                            <button onClick={() => window.location.href = '/cart'} className="flex-1 py-2.5 bg-indigo-500/20 border border-indigo-500/30 font-bold text-indigo-400 hover:text-indigo-300 rounded-xl hover:bg-indigo-500/30 transition-colors">
                                Go to Cart
                            </button>
                        </div>
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Products;
