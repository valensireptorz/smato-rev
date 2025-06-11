import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './jadwal.css';

const Jadwal = () => {
  const [data, setData] = useState({
    jadwal: {},
    username: '',
    foto_users: '',
    currentDay: '', // Default hari kosong akan menampilkan semua jadwal
    currentGuruId: '',
  });

  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Cek sesi login
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const level = sessionStorage.getItem('level');

    if (!userId || level !== 'guru') {
      sessionStorage.clear();
      navigate('/login');
    } else {
      setSessionValid(true);
      setData(prev => ({
        ...prev,
        username: sessionStorage.getItem('username'),
        foto_users: sessionStorage.getItem('foto_users'),
        level: level
      }));
    }
  }, [navigate]);

  // Ambil data jadwal dari API
  useEffect(() => {
    if (!sessionValid) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3000/api/jadwalFE', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setData(prev => ({
            ...prev,
            jadwal: result.groupedData || {},
            currentDay: result.currentDay || '',  // Simpan hari default sesuai hari ini
            currentGuruId: result.currentGuruId,  // Menyimpan ID guru yang login
          }));
        } else {
          setError(result.error || 'Data jadwal tidak ditemukan');
        }
      } catch (err) {
        setError(err.message || 'Gagal menghubungi server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionValid]);

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

  // Fungsi untuk memperbarui jadwal berdasarkan pencarian kelas
  const handleSearch = (event) => {
    event.preventDefault();
    const kelas = event.target.kelas.value.trim();

    if (kelas) {
      console.log(`Mencari kelas: ${kelas}`);
      fetch(`http://localhost:3000/api/jadwalFE?kelas=${kelas}`, {
        method: 'GET',
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setData(prev => ({
              ...prev,
              jadwal: data.groupedData || {},
            }));
          } else {
            alert('Tidak ditemukan jadwal untuk kelas tersebut.');
          }
        })
        .catch((err) => {
          console.error('Error:', err);
          alert('Gagal menghubungi server.');
        });
    }
  };

  // Fungsi untuk menyaring berdasarkan hari yang dipilih
  const filterByDay = (selectedDay) => {
    setData((prev) => ({
      ...prev,
      currentDay: selectedDay,
    }));
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
            <Link to="/Users/mega" className="nav-link">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/jadwal" className="nav-link active">
              <span className="nav-icon">📅</span>
              Jadwal
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/tugas" className="nav-link">
              <span className="nav-icon">📝</span>
              Tugas
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/absen" className="nav-link">
              <span className="nav-icon">✅</span>
              Absen
            </Link>
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
              <h2>Hai, {data.username}!</h2>
              <img
                src={`http://localhost:3000/images/upload/${data.foto_users}`}
                alt="Foto Pengguna"
                className="user-photo"
              />
            </div>

            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {Object.keys(data.jadwal).length > 0 ? (
              <>
                {/* Control Panel */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body p-4">
                        <div className="row">
                          {/* Search Form */}
                          <div className="col-md-8">
                            <form onSubmit={handleSearch} className="mb-md-0 mb-3">
                              <div className="input-group input-group-merge shadow-sm">
                                <span className="input-group-text bg-transparent border-0"><i className="bx bx-search"></i></span>
                                <input
                                  type="text"
                                  className="form-control form-control-lg border-0"
                                  placeholder="Cari berdasarkan kelas..."
                                  name="kelas"
                                />
                                <button className="btn btn-primary" type="submit">Cari</button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Hari */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card shadow-sm mb-0">
                      <div className="card-body p-3">
                        <div className="d-flex flex-wrap gap-2" id="day-filters">
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'all' ? 'active' : ''}`} onClick={() => filterByDay('all')}>Semua Hari</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Senin' ? 'active' : ''}`} onClick={() => filterByDay('Senin')}>Senin</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Selasa' ? 'active' : ''}`} onClick={() => filterByDay('Selasa')}>Selasa</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Rabu' ? 'active' : ''}`} onClick={() => filterByDay('Rabu')}>Rabu</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Kamis' ? 'active' : ''}`} onClick={() => filterByDay('Kamis')}>Kamis</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Jumat' ? 'active' : ''}`} onClick={() => filterByDay('Jumat')}>Jumat</button>
                          <button className={`btn btn-sm btn-outline-primary ${data.currentDay === 'Sabtu' ? 'active' : ''}`} onClick={() => filterByDay('Sabtu')}>Sabtu</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jadwal Content */}
                <div className="jadwal-container mb-5" id="day-view">
                  <div className="row">
                    {Object.entries(data.jadwal).map(([day, jadwalItems]) => {
                      if (data.currentDay === 'all' || data.currentDay === day) {
                        return (
                          <div key={day} className="col-xl-4 col-md-6 mb-4 jadwal-day-card" data-day={day}>
                            <div className="card h-100 shadow-sm border-0 jadwal-card">
                              <div className="card-header bg-transparent py-3 position-relative">
                                <div className="d-flex align-items-center">
                                  <div className="day-indicator me-3">
                                    <span className={`badge bg-${day === 'Senin' ? 'primary' : day === 'Selasa' ? 'info' : day === 'Rabu' ? 'success' : day === 'Kamis' ? 'warning' : day === 'Jumat' ? 'danger' : 'secondary'} bg-opacity-10 text-${day === 'Senin' ? 'primary' : day === 'Selasa' ? 'info' : day === 'Rabu' ? 'success' : day === 'Kamis' ? 'warning' : day === 'Jumat' ? 'danger' : 'secondary'} fs-6 px-3 py-2 rounded-pill`}>
                                      <i className="bx bx-calendar-check me-1"></i> {day}
                                    </span>
                                  </div>
                                  <h5 className="card-title mb-0 fw-semibold">{jadwalItems.length} Pelajaran</h5>
                                </div>
                              </div>
                              <div className="card-body p-0">
                                <div className="timeline-container p-3">
                                  {jadwalItems.map((item, index) => {
                                    const isCurrentTeacher = item.id_guru === data.currentGuruId;
                                    return (
                                      <div key={item.id_jadwal} className={`timeline-item mb-3 position-relative ${index === jadwalItems.length - 1 ? '' : 'pb-3'}`}>
                                        <div className={`card shadow-sm border-0 hover-elevate ${isCurrentTeacher ? 'border-primary shadow-lg teacher-highlight' : ''}`}>
                                          <div className="card-body p-3">
                                            {isCurrentTeacher && (
                                              <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className="badge bg-primary">
                                                  <i className="bx bx-star me-1"></i>Jadwal Anda
                                                </span>
                                                <i className="bx bx-check-circle text-primary" style={{ fontSize: '1.5rem' }}></i>
                                              </div>
                                            )}
                                            <div className="d-flex justify-content-between">
                                              <div className="schedule-time pe-3">
                                                <span className="badge bg-label-primary p-2 rounded">{item.jam_mulai}</span>
                                                <div className="text-center my-1">|</div>
                                                <span className="badge bg-label-info p-2 rounded">{item.jam_selesai}</span>
                                              </div>
                                              <div className="schedule-content flex-grow-1">
                                                <h5 className="fw-semibold mb-1 text-primary">{item.nama_mapel}</h5>
                                                <div className="mb-2">
                                                  <small className="text-muted d-flex align-items-center">
                                                    <i className="bx bx-user me-1"></i>
                                                    <span className={isCurrentTeacher ? 'fw-bold text-primary' : ''}>{item.nama_guru}</span>
                                                    {isCurrentTeacher && <span className="badge bg-primary ms-2 badge-anda">Anda</span>}
                                                  </small>
                                                  <small className="text-muted d-flex align-items-center">
                                                    <i className="bx bx-building-house me-1"></i> {item.kode_kelas}
                                                  </small>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                📝 Belum ada data jadwal yang tersedia.
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

export default Jadwal;
