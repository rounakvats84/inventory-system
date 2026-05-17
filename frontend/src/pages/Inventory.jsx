import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Save } from 'lucide-react';
import api from '../api';

const Inventory = () => {
    const [materials, setMaterials] = useState([]);
    const [adminCart, setAdminCart] = useState({});
    const [isPurchasing, setIsPurchasing] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setMaterials(res.data);
            setOriginal(JSON.parse(JSON.stringify(res.data)));
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = (m, qty) => {
        const amount = parseInt(qty) || 0;
        if (amount <= 0) return;
        setAdminCart(prev => ({ ...prev, [m.id]: (prev[m.id] || 0) + amount }));
    };

    const updateCartQty = (id, val) => {
        const amount = parseInt(val) || 0;
        if (amount <= 0) {
            const newCart = {...adminCart};
            delete newCart[id];
            setAdminCart(newCart);
        } else {
            setAdminCart(prev => ({ ...prev, [id]: amount }));
        }
    };

    const cartItems = Object.keys(adminCart).map(id => {
        const m = materials.find(mat => mat.id === id);
        return {
            raw_material: id,
            name: m?.name,
            unit_cost: m?.unit_cost,
            quantity: adminCart[id],
            cost: (m?.unit_cost || 0) * adminCart[id]
        };
    });

    const totalCartCost = cartItems.reduce((sum, item) => sum + item.cost, 0);

    const handlePurchase = async () => {
        if (cartItems.length === 0) return;
        setIsPurchasing(true);
        try {
            await api.post('/inventory/purchase', {
                items: cartItems.map(i => ({ raw_material: i.raw_material, quantity: i.quantity, cost: i.cost })),
                total_cost: totalCartCost
            });
            alert('Raw Materials Purchased Successfully!');
            setAdminCart({});
            fetchInventory();
        } catch (err) {
            console.error(err);
            alert('Failed to place purchase order.');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="space-y-6 relative flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Raw Materials Procurement</h2>
                    <p className="mt-2 text-sm text-slate-400">Add materials to your restock cart to purchase from suppliers.</p>
                </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Available Quantity</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Unit Cost</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Procurement Time</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {materials.map(m => {
                                const isLowStock = m.available_quantity <= m.minimum_threshold;
                                return (
                                <tr key={m.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-200 flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                                            <Database className="w-5 h-5 text-indigo-400"/>
                                        </div>
                                        <span className="text-base">{m.name}</span>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap flex items-center space-x-2">
                                        <span className="w-16 font-bold text-slate-200 text-lg">{m.available_quantity}</span>
                                        <button 
                                            onClick={() => addToCart(m, 50)}
                                            className="bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-indigo-500/30 transition-colors"
                                            title="Add 50 to Cart"
                                        >
                                            +50 Buy
                                        </button>
                                        <button 
                                            onClick={() => addToCart(m, 500)}
                                            className="bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-500/30 transition-colors"
                                            title="Add 500 to Cart"
                                        >
                                            +500 Buy
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-emerald-400">₹{m.unit_cost}</td>
                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-300 font-medium">{m.procurement_time} Days</td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex flex-col space-y-2">
                                            <span className={`w-fit px-3 py-1.5 inline-flex text-xs font-bold rounded-full border ${isLowStock ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                                {isLowStock ? 'Low Stock Alert' : 'Sufficient'}
                                            </span>
                                            {isLowStock && (
                                                <button onClick={() => addToCart(m, Math.max(100, m.minimum_threshold - m.available_quantity + 500))} className="text-xs text-amber-400 font-medium hover:text-amber-300 text-left cursor-pointer">
                                                    Suggestion: Buy +{Math.max(100, m.minimum_threshold - m.available_quantity + 500)} units
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
            
            {/* Admin Cart Side Panel */}
            <div className="w-full xl:w-96 flex-shrink-0">
                <div className="glass-panel p-6 rounded-2xl sticky top-8">
                    <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
                        <Save className="w-6 h-6 mr-2 text-indigo-400" /> Restock Cart
                    </h3>
                    
                    {cartItems.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-8">Cart is empty. Select materials to restock.</p>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {cartItems.map(item => (
                                <div key={item.raw_material} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-slate-200">{item.name}</span>
                                        <span className="font-bold text-emerald-400">₹{item.cost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between space-x-2">
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="number" min="0" value={item.quantity}
                                                onChange={(e) => updateCartQty(item.raw_material, e.target.value)}
                                                className="w-20 rounded-lg bg-black/20 border border-white/10 text-slate-100 text-sm px-2 py-1"
                                            />
                                            <span className="text-xs text-slate-500">x ₹{item.unit_cost}</span>
                                        </div>
                                        <button onClick={() => updateCartQty(item.raw_material, 0)} className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-rose-500/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {cartItems.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-slate-300">Total Cost</span>
                                <span className="text-2xl font-bold text-indigo-400">₹{totalCartCost.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={handlePurchase} disabled={isPurchasing}
                                className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                            >
                                {isPurchasing ? 'Processing...' : 'Place Purchase Order'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;
