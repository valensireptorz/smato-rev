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

router.get("/", async (req, res) => {
  // Gunakan 'let' untuk nama_mapel karena nilainya mungkin diubah nanti
  let nama_mapel = req.query.nama_mapel;
  const userLevel = req.session.level;
  const userId = req.session.userId;

  try {
    let dataMapel = [];
    let dataAbsen = [];
    let id_mapel = null;

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
            
            // Ambil absen berdasarkan mata pelajaran guru
            dataAbsen = await Model_Absen.getByMapel(id_mapel);
          }
        }
      }
    } else {
      // Jika bukan guru, tampilkan semua mapel
      dataMapel = await Model_Mapel.getAll();
      
      // Filter berdasarkan mata pelajaran yang dipilih
      if (nama_mapel) {
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataAbsen = await Model_Absen.getByMapel(id_mapel);
        }
      } else {
        // Jika tidak ada mapel yang dipilih, tampilkan semua absen
        dataAbsen = await Model_Absen.getAll();
      }
    }

    res.render("absen/index", {
      dataMapel,
      dataAbsen,
      nama_mapel,
      id_mapel,
      level: userLevel,
      messages: req.flash() // Tambahkan ini
    });

  } catch (err) {
    console.error("Error:", err);
    req.flash('error', 'Gagal mengambil data absen: ' + err.message); // Tambahkan ini
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
