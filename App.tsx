import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';
import Login from './backend/Login';
import UpdatePassword from './backend/UpdatePassword';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './backend/DashboardLayout';
import Dashboard from './backend/Dashboard';
import Teams from './backend/Teams';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthCallback />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/backend" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/backend/dashboard" element={<Dashboard />} />
            <Route path="/backend/squadre" element={<Teams />} />
            {/* Future routes: atleti, etc. */}
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;