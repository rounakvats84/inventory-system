import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Save } from 'lucide-react';
import api from '../api';

const Inventory = () => {
    const [materials, setMaterials] = useState([]);
    const [original, setOriginal] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleQuantityChange = (id, newQty) => {
        setMaterials(materials.map(m => m.id === id ? { ...m, available_quantity: parseInt(newQty) || 0 } : m));
    };

    const hasChanges = JSON.stringify(materials) !== JSON.stringify(original);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch('/inventory/update', { items: materials });
            setOriginal(JSON.parse(JSON.stringify(materials)));
            alert('Inventory updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update inventory.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Raw Materials Inventory</h2>
                    <p className="mt-1 text-sm text-slate-500">Manage and update stock levels.</p>
                </div>
                {hasChanges && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        onClick={handleSave} disabled={isSaving}
                        className="mt-4 sm:mt-0 flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4"/>
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </motion.button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Material</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Available Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Cost</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Procurement Time</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {materials.map(m => {
                                const isLowStock = m.available_quantity <= m.minimum_threshold;
                                return (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Database className="w-4 h-4 text-slate-500"/>
                                        </div>
                                        <span>{m.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input 
                                            type="number" min="0" value={m.available_quantity}
                                            onChange={(e) => handleQuantityChange(m.id, e.target.value)}
                                            className="w-24 rounded border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 border"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₹{m.unit_cost}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{m.procurement_time} Days</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {isLowStock ? 'Low Stock' : 'Sufficient'}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inventory;
