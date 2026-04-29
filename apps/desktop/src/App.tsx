import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Session from './pages/Session';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session/:id" element={<Session />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
