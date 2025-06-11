import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Users from './pages/Users/mega.jsx';  // Pastikan path benar
import LoginForm from './pages/Auth/Loginform'; 
import Jadwal from './pages/Jadwal/jadwal'; 
import Tugas from './pages/Tugas/tugas'; 
import Absen from './pages/Absen/absen'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route untuk halaman Users/mega, hanya bisa diakses jika level adalah 'guru' */}
          <Route path="/Users/mega" element={<Users />} />
          {/* Definisikan route untuk halaman Login */}
          <Route path="/login" element={<LoginForm />} />
          {/* Definisikan route untuk halaman Login */}
          <Route path="/jadwal" element={<Jadwal />} />
          {/* Definisikan route untuk halaman Login */}
          <Route path="/tugas" element={<Tugas />} />
          {/* Definisikan route untuk halaman Login */}
          <Route path="/absen" element={<Absen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
