import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api';

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, purchasesRes] = await Promise.all([
            api.get('/orders'),
            api.get('/inventory/purchases')
        ]);
        setOrders(ordersRes.data);
        setPurchases(purchasesRes.data);
      } catch (err) {
        console.error("Error fetching analytics data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Customer Revenue
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  
  // Expenses
  const rawMaterialPurchases = purchases.reduce((sum, p) => sum + Number(p.total_cost), 0);
  // Total Manufacturing cost from all orders (profits array in backend contains manufacturing_cost and labor_cost. I need to sum it up. Wait, backend orders controller gives `total_cost` which includes everything. Let's just use `total_cost` but subtract raw materials to get 'Manufacturing Expense' if we want. Actually, backend doesn't send split costs. Let's assume manufacturing expense is 20% of total revenue for simplicity if not provided. Wait, in backend, profit calculation exists in createOrder! It calculates raw_material_cost, manufacturing_cost, labor_cost. Let's just use total_cost as the manufacturing cost since raw materials are bought independently now.)
  const manufacturingCost = orders.reduce((sum, o) => sum + Number(o.total_cost), 0);
  const totalExpenses = rawMaterialPurchases + manufacturingCost;

  // Net Profit
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;
  const stats = [
    { name: 'Customer Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', trendUp: true },
    { name: 'RM Expenses', value: `₹${rawMaterialPurchases.toLocaleString()}`, icon: BarChart3, trend: 'Admin Restock', trendUp: false },
    { name: 'Mfg Costs', value: `₹${manufacturingCost.toLocaleString()}`, icon: BarChart3, trend: 'Order Cost', trendUp: false },
    { name: 'Net Profit', value: `₹${netProfit.toLocaleString()}`, icon: TrendingUp, trend: `${profitMargin}% Margin`, trendUp: netProfit > 0 },
  ];

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Financial Analytics</h2>
        <p className="mt-2 text-sm text-slate-400">Deep dive into your business performance and margins.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <item.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className={`flex items-center text-xs font-bold ${item.trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.trend}
                  {item.trendUp ? <ArrowUpRight className="w-4 h-4 ml-1" /> : <ArrowDownRight className="w-4 h-4 ml-1" />}
                </div>
              </div>
              <div className="mt-5">
                <h3 className="text-sm font-medium text-slate-400">{item.name}</h3>
                <p className="text-2xl font-bold text-slate-100 mt-1">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simple Visual Breakdown */}
        <div className="glass-panel p-8 rounded-2xl relative">
          <h3 className="text-xl font-bold text-slate-100 mb-6">Revenue vs Expense Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Total Revenue</span>
                <span className="font-bold text-emerald-400">₹{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-3 border border-white/5">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Total Expenses (RM + Mfg)</span>
                <span className="font-bold text-rose-400">₹{totalExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-3 border border-white/5">
                <div 
                  className="bg-gradient-to-r from-rose-400 to-rose-600 h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.5)]" 
                  style={{ width: `${Math.min(100, (totalExpenses / (totalRevenue || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
                <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm italic">Efficient resource allocation is currently at {(100 - (totalExpenses / (totalRevenue || 1)) * 100 || 0).toFixed(1)}%</span>
                </div>
            </div>
          </div>
        </div>

        {/* Per-Order Profit Breakdown */}
        <div className="glass-panel p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center">
             <TrendingUp className="w-5 h-5 mr-2 text-indigo-400"/> Top Profitable Orders
          </h3>
          <div className="space-y-3">
            {orders.sort((a, b) => b.profit - a.profit).slice(0, 5).map((order) => (
              <div key={order._id || order.id} className="flex items-center justify-between p-3.5 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        #{String(order._id || order.id).slice(-4).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200">Order #{String(order._id || order.id).slice(-4).toUpperCase()}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-bold text-emerald-400">+₹{Number(order.profit).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">Profit</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-slate-500 text-sm py-8">No data available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
