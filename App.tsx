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
import Athletes from './backend/Athletes';

import Partners from './backend/Partners';
import News from './backend/News';

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
            <Route path="/backend/atleti" element={<Athletes />} />
            <Route path="/backend/sponsor" element={<Partners />} />
            <Route path="/backend/news" element={<News />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;