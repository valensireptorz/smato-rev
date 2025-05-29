import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Guru from './pages/guru.jsx'; // Mengimpor Guru.jsx dari folder pages

function App() {
  return (
    <Router> {/* Membungkus aplikasi dengan Router */}
      <div className="App">
        <Routes>
          {/* Definisikan route untuk halaman Guru */}
          <Route path="/" element={<Guru />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
