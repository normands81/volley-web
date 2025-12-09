import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewsDetails from './pages/NewsDetails';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news/:id" element={<NewsDetails />} />
      </Routes>
    </HashRouter>
  );
};

export default App;