var express = require("express");
var router = express.Router();
const connection = require("../config/database.js");
const Model_Absen = require("../model/Model_Absen.js");
const Model_Mapel = require("../model/Model_Mapel.js");
const Model_Users = require("../model/Model_Users.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Guru_Kelas = require('../model/Model_Guru_Kelas');
const Model_Jadwal = require("../model/Model_Jadwal.js");
const Model_Siswa = require("../model/Model_Siswa.js");

// Add this route handler or update any existing route that uses getByKelas
router.get("/kelas/:kode_kelas", async (req, res) => {
  const kode_kelas = req.params.kode_kelas;
  const userLevel = req.session.level;
  
  // Get month and year parameters, default to current month if not provided
  const currentDate = new Date();
  const month = req.query.month ? parseInt(req.query.month) : currentDate.getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

  try {
    // Get data filtered by kelas and month
    let dataAbsen = await Model_Absen.getByMonthAndKelas(month, year, kode_kelas);
    
    // Get class info
    let kelasInfo = await Model_Kelas.getByKode(kode_kelas);
    
    // Get list of months for dropdown
    const months = [
      { value: 1, name: 'Januari' },
      { value: 2, name: 'Februari' },
      { value: 3, name: 'Maret' },
      { value: 4, name: 'April' },
      { value: 5, name: 'Mei' },
      { value: 6, name: 'Juni' },
      { value: 7, name: 'Juli' },
      { value: 8, name: 'Agustus' },
      { value: 9, name: 'September' },
      { value: 10, name: 'Oktober' },
      { value: 11, name: 'November' },
      { value: 12, name: 'Desember' }
    ];

    // Get list of years (current year and 2 years back)
    const currentYear = currentDate.getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    res.render("absen/kelas", {
      dataAbsen,
      kelas: kelasInfo,
      kode_kelas,
      level: userLevel,
      month,  // Add selected month to template
      year,   // Add selected year to template
      months, // Add months list for dropdown
      years,  // Add years list for dropdown
      messages: req.flash()
    });

  } catch (err) {
    console.error("Error:", err);
    req.flash('error', 'Gagal mengambil data absen: ' + err.message);
    res.redirect('/absen');
  }
});

// Updated router.get("/") handler with monthly filter
// Updated router.get("/") handler with monthly and class filter
router.get("/", async (req, res) => {
  // Extract parameters from query
  let nama_mapel = req.query.nama_mapel;
  const userLevel = req.session.level;
  const userId = req.session.userId;
  
  // Get the selected class code
  const kode_kelas = req.query.kode_kelas;
  
  // Get month and year parameters, default to current month if not provided
  const currentDate = new Date();
  const month = req.query.month ? parseInt(req.query.month) : currentDate.getMonth() + 1; // JavaScript months are 0-indexed
  const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();

  try {
    let dataMapel = [];
    let dataAbsen = [];
    let id_mapel = null;
    let dataKelas = await Model_Kelas.getAll(); // Get all classes for dropdown

    // Jika user adalah guru, filter berdasarkan mata pelajaran yang diampu
    if (userLevel === 'guru') {
      const guruData = await Model_Users.getGuruMapel(userId);
      
      if (guruData && guruData.length > 0) {
        // Guru hanya melihat mapel yang diampu
        const guruMapelId = guruData[0].id_mapel;
        if (guruMapelId) {
          // Set id_mapel dari data guru
          id_mapel = guruMapelId;
          
          // Dapatkan data mapel yang diampu
          const mapelGuru = await Model_Mapel.getById(id_mapel);
          if (mapelGuru) {
            dataMapel = [mapelGuru]; // Hanya tampilkan mata pelajaran yang diampu
            
            // Set nama_mapel default dari mata pelajaran guru
            if (!nama_mapel) {
              nama_mapel = mapelGuru.nama_mapel;
            }
            
            // Filter based on class if provided
            if (kode_kelas) {
              // Get attendance data filtered by subject, month, and class
              dataAbsen = await Model_Absen.getByMonthMapelAndKelas(month, year, id_mapel, kode_kelas);
            } else {
              // If no class selected, show data for all classes but only for teacher's subject
              dataAbsen = await Model_Absen.getByMonthAndMapel(month, year, id_mapel);
            }
          }
        }
      }
    } else {
      // Jika bukan guru, tampilkan semua mapel
      dataMapel = await Model_Mapel.getAll();
      
      // Filtering logic for non-teacher users
      if (nama_mapel && kode_kelas) {
        // Filter by both subject and class
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataAbsen = await Model_Absen.getByMonthMapelAndKelas(month, year, id_mapel, kode_kelas);
        }
      } else if (nama_mapel) {
        // Filter only by subject
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataAbsen = await Model_Absen.getByMonthAndMapel(month, year, id_mapel);
        }
      } else if (kode_kelas) {
        // Filter only by class
        dataAbsen = await Model_Absen.getByMonthAndKelas(month, year, kode_kelas);
      } else {
        // No filters - show all attendance data for the month
        dataAbsen = await Model_Absen.getByMonth(month, year);
      }
    }

    // Get list of months for dropdown
    const months = [
      { value: 1, name: 'Januari' },
      { value: 2, name: 'Februari' },
      { value: 3, name: 'Maret' },
      { value: 4, name: 'April' },
      { value: 5, name: 'Mei' },
      { value: 6, name: 'Juni' },
      { value: 7, name: 'Juli' },
      { value: 8, name: 'Agustus' },
      { value: 9, name: 'September' },
      { value: 10, name: 'Oktober' },
      { value: 11, name: 'November' },
      { value: 12, name: 'Desember' }
    ];

    // Get list of years (current year and 2 years back)
    const currentYear = currentDate.getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    res.render("absen/index", {
      dataMapel,
      dataAbsen,
      dataKelas,
      nama_mapel,
      id_mapel,
      kode_kelas,  // Add selected class to template
      level: userLevel,
      month,        // Add selected month to template
      year,         // Add selected year to template
      months,       // Add months list for dropdown
      years,        // Add years list for dropdown
      messages: req.flash()
    });

  } catch (err) {
    console.error("Error:", err);
    req.flash('error', 'Gagal mengambil data absen: ' + err.message);
    res.redirect('/');
  }
});




router.post("/presensi", async function(req, res) {
  try {
    const { nama_siswa, nis, kelas, id_mapel, waktu } = req.body;
    await connection.query(
      "INSERT INTO presensi_siswa (nama_siswa, nis, kelas, id_mapel, waktu) VALUES (?, ?, ?, ?, ?)",
      [nama_siswa, nis, kelas, id_mapel, waktu]
    );
    req.flash("success", "Presensi berhasil!");
    res.redirect("back");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan saat presensi.");
    res.redirect("back");
  }
});


router.get("/create/:id_mapel", async function(req, res, next) {
  try {
    let id_mapel = req.params.id_mapel;
    let id_kelas = req.query.id_kelas; // Ambil id_kelas dari query parameter
    
    // Mendapatkan nama hari sekarang dalam Bahasa Indonesia
    const hariMap = {
      'Sunday': 'Minggu',
      'Monday': 'Senin',
      'Tuesday': 'Selasa',
      'Wednesday': 'Rabu',
      'Thursday': 'Kamis',
      'Friday': 'Jumat',
      'Saturday': 'Sabtu'
    };
    
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    const hari = hariMap[dayName]; // Konversi ke format bahasa Indonesia

    // Cek apakah id_mapel valid
    if (!id_mapel || isNaN(id_mapel)) {
      req.flash("error", "ID Mata Pelajaran tidak valid");
      return res.redirect("/absen");
    }

    // Ambil data mapel
    let mapel = await Model_Mapel.getId(id_mapel);
    if (!mapel || mapel.length === 0) {
      req.flash("error", "Mata Pelajaran tidak ditemukan");
      return res.redirect("/absen");
    }
    
    // Dapatkan id dan nama guru dari session
    const id_guru_login = req.session.userId;
    const nama_guru_login = req.session.username;

    // Ambil semua data kelas
    let kelas = await Model_Guru_Kelas.getKelas(id_guru_login);
    
    // Variabel untuk menyimpan data jadwal yang ditemukan
    let jam_mulai = '';
    let jam_selesai = '';
    
    // Jika id_kelas disediakan, cari jadwal yang sesuai
    if (id_kelas) {
      console.log("proses list jadwal")
      // Import Model_Jadwal jika belum
      const jadwalData = await Model_Jadwal.getJadwalByMapelKelasHari(id_mapel, id_kelas, hari);
      
      console.log(jadwalData);
      
      if (jadwalData) {
        jam_mulai = jadwalData.jam_mulai;
        jam_selesai = jadwalData.jam_selesai;
      }
    }

    // Render tampilan dengan data yang diperoleh
    res.render("absen/create", {
      id_mapel: mapel[0].id_mapel,
      nama_mapel: mapel[0].nama_mapel,
      dataKelas: kelas,
      level: req.session.level,
      id_guru_login: id_guru_login,
      nama_guru_login: nama_guru_login,
      jam_mulai: jam_mulai,
      jam_selesai: jam_selesai,
      id_kelas: id_kelas || '',
      hari: hari, // Kirim juga nama hari untuk ditampilkan
      messages: req.flash()
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan: " + err.message);
    res.redirect("/absen");
  }
});






router.post("/store", async function(req, res, next) {
  try {
    let { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas } = req.body; // Tambah id_guru
    let Data = { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas };     // Sertakan di objek
    await Model_Absen.Store(Data);
    req.flash("success", "Berhasil menyimpan data!");
    res.redirect("/absen");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/absen");
  }
});


router.get("/edit/(:id)", async function(req, res, next) {
  try {
    let level_users = req.session.level;
    let id = req.params.id;
    let rows = await Model_Absen.getId(id);
    if(!rows || rows.length === 0){
      req.flash('error', "Data Absen tidak ditemukan");
      return res.redirect('/absen');
    }
    let mapel = await Model_Mapel.getAll();
    let guru = await Model_Guru.getAll(); // Tambahkan ambil guru
    let kelas = await Model_Kelas.getAll(); // ambil semua data kelas
    res.render("absen/edit", {
      id: rows[0].id_absen,
      id_mapel: rows[0].id_mapel,
      id_guru: rows[0].id_guru,
      id_kelas: rows[0].id_kelas, // tambahkan ini
      nama_mapel: rows[0].nama_mapel,
      tanggal: rows[0].tanggal,
      jam_mulai: rows[0].jam_mulai,
      jam_selesai: rows[0].jam_selesai,
      dataMapel: mapel,
      dataGuru: guru,
      dataKelas: kelas, // tambahkan ini juga
      level: level_users,
      messages: req.flash()
    });
    
  } catch (err) {
    console.log(err);
    req.flash('error', "Gagal mengambil data absen");
    res.redirect('/absen');
  }
});


router.post("/update/(:id)", async function(req, res, next) {
  try {
    let id = req.params.id;
    let { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas } = req.body;
    let Data = { id_mapel, id_guru, tanggal, jam_mulai, jam_selesai, id_kelas };
    await Model_Absen.Update(id, Data);

    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/absen");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi");
    res.redirect("/absen");
  }
});


router.get("/delete/(:id)", async function(req, res) {
  let id = req.params.id;
  try{
    await Model_Absen.Delete(id);
    req.flash("success", "Data terhapus!");
    res.redirect("/absen");
  }catch(err){
    console.log(err);
    req.flash("error", "Gagal menghapus data");
    res.redirect('/absen');
  }
});

module.exports = router;
