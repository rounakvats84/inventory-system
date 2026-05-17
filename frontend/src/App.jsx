import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Cart from './pages/Cart';
import Purchases from './pages/Purchases';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch(e) {}
    }
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate via window.location to forcefully clear React state without unmount crashes
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={loginUser} />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={logoutUser} /> : <Navigate to="/login" />}>
          {/* Customer Routes */}
          {user?.role === 'Customer' && (
            <>
              <Route index element={<Navigate to="/products" replace />} />
              <Route path="products" element={<Products user={user} />} />
              <Route path="cart" element={<Cart user={user} />} />
              <Route path="orders" element={<Dashboard user={user} />} />
            </>
          )}

          {/* Admin Routes */}
          {user?.role === 'Admin' && (
            <>
              <Route index element={<Navigate to="/inventory" replace />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="admin-orders" element={<Dashboard user={user} />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
