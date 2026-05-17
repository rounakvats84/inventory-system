import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, Clock, TrendingUp } from 'lucide-react';
import api from '../api';

const SIMULATION_SPEED = 5000; // 5 seconds = 1 day

const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
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

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDynamicStatus = (order) => {
    const createdTime = new Date(order.createdAt || order.created_at || Date.now()).getTime();
    const elapsedRealMs = currentTime - createdTime;
    const elapsedSimDays = elapsedRealMs / SIMULATION_SPEED;

    // Delivery calculation logic from PRD
    // Pending -> Raw Material Check -> Manufacturing -> Packaging -> Shipped -> Delivered
    // shortage_delay_days is time waiting for raw material.
    // batch_max_days is time for max product (production + packaging + delivery)

    const matWait = order.shortage_delay_days || 0;
    // Assuming uniform split of batch max days for simulation:
    const mfgTime = (order.batch_max_days || 0) * 0.5;
    const pkgTime = (order.batch_max_days || 0) * 0.2;
    const shipTime = (order.batch_max_days || 0) * 0.3;

    if (elapsedSimDays < matWait) return 'Raw Material Check';
    if (elapsedSimDays < matWait + mfgTime) return 'Manufacturing';
    if (elapsedSimDays < matWait + mfgTime + pkgTime) return 'Packaging';
    if (elapsedSimDays < matWait + mfgTime + pkgTime + shipTime) return 'Shipped';
    return 'Delivered';
  };

  const getDynamicProgress = (order) => {
     const createdTime = new Date(order.createdAt || order.created_at || Date.now()).getTime();
     const elapsedRealMs = currentTime - createdTime;
     const elapsedSimDays = elapsedRealMs / SIMULATION_SPEED;
     const totalDays = (order.shortage_delay_days || 0) + (order.batch_max_days || 0);
     if (totalDays === 0) return 100;
     const progress = (elapsedSimDays / totalDays) * 100;
     return Math.min(100, Math.max(0, progress));
  };

  const visibleOrders = user.role === 'Admin' ? orders : orders.filter(o => typeof o.customer === 'object' ? o.customer._id === user.id : o.customer === user.id);

  const totalOrders = visibleOrders.length;
  const totalRevenue = visibleOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
  
  // To keep it simple, we just assume profit is roughly 30% if we don't have the profit object joined
  const totalProfit = visibleOrders.reduce((sum, o) => sum + Number(o.total_price * 0.3), 0);
  
  const statCards = [
    { title: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ...(user.role === 'Admin' ? [{ title: 'Est. Profit', value: `₹${totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' }] : [])
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Welcome back, {user.name}</h2>
        <p className="mt-2 text-sm text-slate-400">Live Dashboard Simulation (1 Day = 5 Seconds)</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="overflow-hidden rounded-2xl glass-panel relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6 relative">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-xl p-3 ${item.bg.replace('100', '500/20').replace('text', 'border')}`}>
                  <item.icon className={`h-6 w-6 ${item.color.replace('600', '400')}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-400">{item.title}</dt>
                    <dd className="text-2xl font-bold text-slate-100 mt-1">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <h3 className="text-xl font-bold text-slate-100 tracking-tight mt-10 mb-6 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-indigo-400"/> Live Orders Tracker
      </h3>
      <div className="glass-panel rounded-2xl overflow-hidden">
         <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-white/10">
               <thead className="bg-white/5">
                   <tr>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Order ID</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Products</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Progress</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Total Price</th>
                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">ETA</th>
                   </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                   {visibleOrders.map(order => {
                       const dynStatus = getDynamicStatus(order);
                       const progress = getDynamicProgress(order);
                       return (
                       <React.Fragment key={order._id || order.id}>
                           <tr 
                               onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                               className="hover:bg-white/5 transition-colors cursor-pointer"
                           >
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-200 flex items-center space-x-2">
                                   <div className={`transform transition-transform ${expandedOrderId === order._id ? 'rotate-90' : ''}`}>
                                       ▶
                                   </div>
                                   <span>#{ (order._id || order.id).toString().slice(-6).toUpperCase() }</span>
                               </td>
                               <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                   {order.items?.map(item => `${item.product?.name} (x${item.quantity})`).join(', ') || 'Various Items'}
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm">
                                   <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                       dynStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                       dynStatus === 'Raw Material Check' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                       'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                   }`}>
                                     {dynStatus}
                                   </span>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm w-48">
                                   <div className="w-full bg-slate-800/50 rounded-full h-3 border border-white/5 overflow-hidden">
                                     <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
                                   </div>
                                   <div className="text-xs text-slate-400 mt-2 font-medium">{Math.round(progress)}% completed</div>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">₹{Number(order.total_price).toLocaleString()}</td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">{order.estimated_delivery_days} days</td>
                           </tr>
                           {expandedOrderId === order._id && (
                               <tr>
                                   <td colSpan="6" className="bg-black/40 px-6 py-6 border-b border-white/10">
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                           <div>
                                               <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider">Order Details</h4>
                                               <div className="space-y-2 text-sm text-slate-300">
                                                   <p><span className="text-slate-500">Customer:</span> {order.customer?.name || 'Unknown'}</p>
                                                   <p><span className="text-slate-500">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
                                                   <p><span className="text-slate-500">Subtotal:</span> ₹{Number(order.total_price).toLocaleString()}</p>
                                                   <p><span className="text-slate-500">GST (18%):</span> ₹{(Number(order.total_price) * 0.18).toLocaleString()}</p>
                                                   <p className="font-bold text-emerald-400 pt-2 border-t border-white/10 mt-2">
                                                       <span className="text-slate-500 font-normal">Final Amount:</span> ₹{(Number(order.total_price) * 1.18).toLocaleString()}
                                                   </p>
                                               </div>
                                           </div>
                                           <div>
                                               <h4 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-wider">Item Breakdown</h4>
                                               <ul className="space-y-3">
                                                   {order.items?.map((item, idx) => (
                                                       <li key={idx} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-lg border border-white/5">
                                                           <div>
                                                               <p className="font-bold text-slate-200">{item.product?.name}</p>
                                                               <p className="text-xs text-slate-500">Qty: {item.quantity} x ₹{Number(item.price / item.quantity).toLocaleString()}</p>
                                                           </div>
                                                           <span className="font-bold text-emerald-400">₹{Number(item.price).toLocaleString()}</span>
                                                       </li>
                                                   ))}
                                               </ul>
                                           </div>
                                       </div>
                                   </td>
                                </tr>
                           )}
                       </React.Fragment>
                       )})}
                   {visibleOrders.length === 0 && (
                       <tr>
                           <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">No active orders found.</td>
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
