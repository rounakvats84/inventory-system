import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../api';

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalCost = orders.reduce((sum, o) => sum + Number(o.total_cost), 0);
  const totalProfit = orders.reduce((sum, o) => sum + Number(o.profit), 0);
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  const stats = [
    { name: 'Gross Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', trendUp: true },
    { name: 'Total Production Cost', value: `₹${totalCost.toLocaleString()}`, icon: BarChart3, trend: '+8.2%', trendUp: false },
    { name: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, icon: TrendingUp, trend: '+15.3%', trendUp: true },
    { name: 'Profit Margin', value: `${profitMargin}%`, icon: PieChart, trend: '+2.1%', trendUp: true },
  ];

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Deep dive into your business performance and margins.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <item.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className={`flex items-center text-xs font-medium ${item.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.trend}
                {item.trendUp ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-500">{item.name}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Simple Visual Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue vs Cost Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Total Revenue</span>
                <span className="font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Production Cost</span>
                <span className="font-bold text-slate-900">₹{totalCost.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div 
                  className="bg-rose-500 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: `${(totalCost / totalRevenue) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm italic">Efficient resource allocation is currently at {(100 - (totalCost / totalRevenue) * 100 || 0).toFixed(1)}%</span>
                </div>
            </div>
          </div>
        </div>

        {/* Per-Order Profit Breakdown */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Profitable Orders</h3>
          <div className="space-y-4">
            {orders.sort((a, b) => b.profit - a.profit).slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        #{order.id}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900">Order #{order.id}</p>
                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">+₹{Number(order.profit).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Profit</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No data available yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
