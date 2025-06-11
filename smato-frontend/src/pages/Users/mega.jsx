// src/pages/Users/MegaUsers.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart } from 'chart.js/auto';
import './mega.css';

const MegaUsers = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const level = sessionStorage.getItem('level');
    const username = sessionStorage.getItem('username');
    const foto_users = sessionStorage.getItem('foto_users');

    if (!userId || level !== 'guru') {
      sessionStorage.clear();
      navigate('/login');
    } else {
      setSessionValid(true);
      setData(prev => ({ ...prev, username, foto_users }));
    }
  }, [navigate]);

  useEffect(() => {
    if (!sessionValid) return;
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/megausersFE', {
          method: 'GET',
          credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
          setData(prev => ({ ...prev, ...result }));
        } else {
          setError(result.error);
        }
      } catch {
        setError('Gagal menghubungi server');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionValid]);

  useEffect(() => {
    if (!data.kelasStats || data.kelasStats.length === 0) return;

    const ctx = document.getElementById('distribusiSiswa');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.kelasStats.map(k => k.kode_kelas),
        datasets: [{
          label: 'Jumlah Siswa',
          data: data.kelasStats.map(k => k.count),
          backgroundColor: ['rgba(78, 115, 223, 0.8)', 'rgba(28, 200, 138, 0.8)', 'rgba(54, 185, 204, 0.8)', 'rgba(246, 194, 62, 0.8)', 'rgba(231, 74, 59, 0.8)'],
          borderColor: ['rgba(78, 115, 223, 1)', 'rgba(28, 200, 138, 1)', 'rgba(54, 185, 204, 1)', 'rgba(246, 194, 62, 1)', 'rgba(231, 74, 59, 1)'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: context => {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `Jumlah Siswa: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });

    return () => chart.destroy();
  }, [data]);

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = 'http://localhost:3000';
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn d-lg-none" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h3>
            <img 
              src="http://localhost:3000/img/smato.png" 
              alt="Logo Sekolah" 
              className="school-logo"
            />
            <div className="school-name">
              <span className="school-main">SMAN 1 Bluto</span>
              <span className="school-sub">Sumenep</span>
            </div>
          </h3>
        </div>
        <ul className="sidebar-nav">
          <li className="nav-item">
            <a href="mega" className="nav-link active">
              <span className="nav-icon">📊</span>
              Dashboard
            </a>
          </li>
          <li className="nav-item">
            <a href="/jadwal" className="nav-link">
              <span className="nav-icon">📅</span>
              Jadwal
            </a>
          </li>
          <li className="nav-item">
            <a href="/tugas" className="nav-link">
              <span className="nav-icon">📝</span>
              Tugas
            </a>
          </li>
          <li className="nav-item">
            <a href="/absen" className="nav-link">
              <span className="nav-icon">✅</span>
              Absen
            </a>
          </li>
        </ul>
        <div className="sidebar-footer">
          <button className="nav-link btn" onClick={confirmLogout}>
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="container-fluid">
          <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header">
              <h2>Hai, {data.username}!!</h2>
              <img
                src={`http://localhost:3000/images/upload/${data.foto_users}`}
                alt="Foto Pengguna"
                className="user-photo"
              />
            </div>

            {data.kelasStats && data.kelasStats.length > 0 ? (
              <>
                {/* Statistics Cards */}
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <h5>Total Siswa</h5>
                    <p className="h4">{data.totalSiswa} Siswa</p>
                  </div>
                  <div className="stat-card success">
                    <h5>Jumlah Kelas</h5>
                    <p className="h4">{data.kelasStats.length} Kelas</p>
                  </div>
                  <div className="stat-card info">
                    <h5>Kelas Terbanyak</h5>
                    <p className="h4">{data.kelasStats[0].kode_kelas} ({data.kelasStats[0].count} Siswa)</p>
                  </div>
                </div>

                {/* Charts and Data */}
                <div className="content-grid">
                  <div className="card">
                    <div className="card-header">📊 Distribusi Siswa per Kelas</div>
                    <div className="card-body">
                      <div className="chart-area">
                        <canvas id="distribusiSiswa"></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-header">📈 Persentase Siswa per Kelas</div>
                    <div className="card-body">
                      {data.kelasStats.map((kelas, index) => (
                        <div key={kelas.kode_kelas} className="progress-item">
                          <div className="progress-header">
                            <span className="progress-label">{kelas.kode_kelas}</span>
                            <span className="progress-value">{kelas.count} Siswa ({kelas.percentage}%)</span>
                          </div>
                          <div className="progress">
                            <div
                              className={`progress-bar bg-${['primary', 'success', 'info', 'warning', 'danger'][index % 5]}`}
                              role="progressbar"
                              style={{ width: `${kelas.percentage}%` }}
                              aria-valuenow={kelas.percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                📝 Belum ada data siswa yang tersedia.
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-content">
              <h3>Konfirmasi Logout</h3>
              <p>Apakah Anda yakin ingin keluar dari sistem?</p>
              <div className="modal-actions">
                <button 
                  className="btn btn-cancel" 
                  onClick={cancelLogout}
                >
                  Batal
                </button>
                <button 
                  className="btn btn-confirm" 
                  onClick={handleLogout}
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MegaUsers;