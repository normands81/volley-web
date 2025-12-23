import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';
import Login from './backend/Login';
import UpdatePassword from './backend/UpdatePassword';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/backend" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    </HashRouter>
  );
};

export default App;