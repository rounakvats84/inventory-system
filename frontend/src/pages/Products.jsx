import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X } from 'lucide-react';
import api from '../api';

const Products = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderResult, setOrderResult] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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
    setOrderResult(null);
  }

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    try {
        const res = await api.post('/orders', {
            user_id: user.id,
            items: [{ product_id: selectedProduct.id, quantity }]
        });
        setOrderResult(res.data.order);
    } catch(err) {
        alert(err.response?.data || 'Failed to place order');
    } finally {
        setIsPlacingOrder(false);
    }
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h2>
        <p className="mt-1 text-sm text-slate-500">Browse and place orders for our steel products.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={p.id} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Package className="w-8 h-8"/>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    ₹{p.selling_price}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{p.name}</h3>
                <div className="mt-3 space-y-1 text-sm text-slate-500">
                    <p>Production: <span className="text-slate-900 font-medium">{p.production_time} days/unit</span></p>
                    <p>Delivery: <span className="text-slate-900 font-medium">{p.delivery_time} days</span></p>
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={() => openModal(p)}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Configure Order
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full relative z-10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">{orderResult ? 'Order Placed!' : `Order: ${selectedProduct?.name}`}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5"/>
                </button>
              </div>

              <div className="p-6">
                {!orderResult ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Quantity</label>
                            <input 
                              type="number" min="1" 
                              value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value) || 1)}
                              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Unit Price</span>
                                <span className="font-medium">₹{selectedProduct?.selling_price}</span>
                             </div>
                             <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Estimate</span>
                                <span>₹{(selectedProduct?.selling_price * quantity).toLocaleString()}</span>
                             </div>
                        </div>

                        <button 
                          onClick={placeOrder} disabled={isPlacingOrder}
                          className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {isPlacingOrder ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 text-center pb-2">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                           <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">Successfully Scheduled</h4>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left mt-6">
                            <p className="text-sm text-slate-500 mb-1">Estimated Delivery Time (ETA)</p>
                            <p className="text-3xl font-bold text-indigo-600">{orderResult.estimated_time} Days</p>
                            {orderResult.estimated_wait_time > 0 && (
                                <p className="text-xs text-amber-600 mt-2 font-medium bg-amber-50 inline-block px-2 py-1 rounded-md">
                                  Includes {orderResult.estimated_wait_time} days procurement delay for missing materials.
                                </p>
                            )}
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4 flex justify-between">
                            <span className="text-slate-500 text-sm">Total Price</span>
                            <span className="text-slate-900 font-bold">₹{Number(orderResult.total_price).toLocaleString()}</span>
                        </div>

                        <button onClick={() => setIsModalOpen(false)} className="mt-6 w-full py-2 bg-slate-100 font-medium text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                            Close
                        </button>
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
