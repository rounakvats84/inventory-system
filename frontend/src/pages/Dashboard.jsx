import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, Clock, TrendingUp } from 'lucide-react';
import api from '../api';

const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders", err);
      }
    };
    fetchOrders();
  }, []);

  // Compute stats
  // If customer, show only their orders
  const visibleOrders = user.role === 'Admin' ? orders : orders.filter(o => o.user_id === user.id);

  const totalOrders = visibleOrders.length;
  const totalRevenue = visibleOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const totalProfit = visibleOrders.reduce((sum, o) => sum + Number(o.profit), 0);
  
  const pendingCount = visibleOrders.filter(o => o.status === 'PENDING' || o.status === 'WAITING_FOR_MATERIAL').length;

  const statCards = [
    { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'In Progress / Waiting', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    ...(user.role === 'Admin' ? [{ title: 'Total Profit', value: `₹${totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' }] : [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.name}</h2>
        <p className="mt-1 text-sm text-slate-500">Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500">{item.title}</dt>
                    <dd className="text-2xl font-semibold text-slate-900">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* order table */}
      <h3 className="text-lg font-medium text-slate-900 tracking-tight mt-8 mb-4">Recent Orders</h3>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                   <tr>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Price</th>
                       {user.role === 'Admin' && <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Profit</th>}
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ETA (Days)</th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                   </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                   {visibleOrders.slice(0, 10).map(order => (
                       <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#ORD-{order.id}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm">
                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                   order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                   order.status === 'WAITING_FOR_MATERIAL' ? 'bg-red-100 text-red-800' :
                                   'bg-yellow-100 text-yellow-800'
                               }`}>
                                 {order.status.replace(/_/g, ' ')}
                               </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">₹{Number(order.total_price).toLocaleString()}</td>
                           {user.role === 'Admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">₹{Number(order.profit).toLocaleString()}</td>}
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.estimated_time} days</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                       </tr>
                   ))}
                   {visibleOrders.length === 0 && (
                       <tr>
                           <td colSpan={user.role === 'Admin' ? 6 : 5} className="px-6 py-8 text-center text-sm text-slate-500">No orders found.</td>
                       </tr>
                   )}
               </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
