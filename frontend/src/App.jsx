import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
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
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={loginUser} />} />
        
        <Route path="/" element={user ? <Layout user={user} onLogout={logoutUser} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard user={user} />} />
          <Route path="products" element={<Products user={user} />} />
          {user?.role === 'Admin' && (
            <>
              <Route path="inventory" element={<Inventory />} />
              <Route path="analytics" element={<Analytics />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
