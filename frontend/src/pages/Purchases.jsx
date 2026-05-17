import { useState, useEffect } from 'react';
import { ShoppingCart, IndianRupee, Clock } from 'lucide-react';
import api from '../api';

const Purchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get('/inventory/purchases');
            setPurchases(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-8 text-slate-400">Loading purchase history...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Admin Purchase History</h2>
                <p className="mt-2 text-sm text-slate-400">Track all raw material restock orders.</p>
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Purchase ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Materials Restocked</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {purchases.map(p => (
                                <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200">
                                        #{p._id.toString().slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" /> {new Date(p.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                        {p.admin?.name || 'System Admin'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-300">
                                        <ul className="list-disc list-inside">
                                            {p.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.raw_material?.name} (x{item.quantity}) - <span className="text-emerald-400">₹{item.cost.toLocaleString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-rose-400">
                                        -₹{p.total_cost.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {purchases.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-400">No purchase history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchases;
