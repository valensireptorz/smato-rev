var express = require("express");
var router = express.Router();
const moment = require("moment-timezone");

const Model_Tugas = require("../model/Model_Tugas.js");
const Model_Mapel = require("../model/Model_Mapel.js");
const Model_Users = require("../model/Model_Users.js");
const Model_Guru = require("../model/Model_Guru.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Guru_Kelas = require("../model/Model_Guru_Kelas.js");

// Tambahkan ini di router GET "/" untuk debugging
router.get("/", async (req, res) => {
  let nama_mapel = req.query.nama_mapel;
  let kode_kelas = req.query.kode_kelas;
  let bulan = req.query.bulan || moment().format("MM");
  let tahun = req.query.tahun || moment().format("YYYY");
  const userLevel = req.session.level;
  const userId = req.session.userId;

  console.log("=== DEBUG INFO ===");
  console.log("User Level:", userLevel);
  console.log("Filter - Bulan:", bulan, "Tahun:", tahun);
  console.log("Filter - Mapel:", nama_mapel, "Kelas:", kode_kelas);

  try {
    let dataMapel = [];
    let dataTugas = [];
    let dataKelas = await Model_Kelas.getAll();
    let id_mapel = null;

    // DEBUG: Cek total tugas di database
    const allTugas = await Model_Tugas.getAll();
    console.log("Total tugas di database:", allTugas.length);
    
    // DEBUG: Cek tugas dengan deadline bulan ini
    if (allTugas.length > 0) {
      console.log("Sample tugas:", {
        nama: allTugas[0].nama_tugas,
        deadline: allTugas[0].deadline,
        bulan_deadline: new Date(allTugas[0].deadline).getMonth() + 1,
        tahun_deadline: new Date(allTugas[0].deadline).getFullYear()
      });
    }

    if (userLevel === 'guru') {
      const guruData = await Model_Users.getGuruMapel(userId);
      console.log("Guru Data:", guruData);
      
      if (guruData && guruData.length > 0) {
        const guruMapelId = guruData[0].id_mapel;
        if (guruMapelId) {
          id_mapel = guruMapelId;
          const mapelGuru = await Model_Mapel.getById(id_mapel);
          if (mapelGuru) {
            dataMapel = [mapelGuru];
            if (!nama_mapel) {
              nama_mapel = mapelGuru.nama_mapel;
            }
            
            // SEMENTARA: Gunakan getAll() untuk testing
            if (kode_kelas) {
              dataTugas = await Model_Tugas.getByMapelDateAndKelas(id_mapel, bulan, tahun, kode_kelas);
            } else {
              // UBAH INI untuk testing - hapus filter date
              dataTugas = await Model_Tugas.getByMapel(id_mapel); // Tanpa filter date
            }
          }
        }
      }
    } else {
      dataMapel = await Model_Mapel.getAll();
      
      if (nama_mapel && kode_kelas) {
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataTugas = await Model_Tugas.getByMapelDateAndKelas(id_mapel, bulan, tahun, kode_kelas);
        }
      } else if (nama_mapel) {
        const mapel = await Model_Mapel.getByNama(nama_mapel);
        if (mapel) {
          id_mapel = mapel.id_mapel;
          dataTugas = await Model_Tugas.getByMapel(id_mapel); // Tanpa filter date untuk testing
        }
      } else if (kode_kelas) {
        dataTugas = await Model_Tugas.getByKelas(kode_kelas); // Tanpa filter date
      } else {
        // SEMENTARA: Ambil semua data tanpa filter
        dataTugas = await Model_Tugas.getAll();
      }
    }

    console.log("Hasil query - Jumlah tugas:", dataTugas.length);
    if (dataTugas.length > 0) {
      console.log("Sample hasil:", {
        nama: dataTugas[0].nama_tugas,
        mapel: dataTugas[0].nama_mapel,
        kelas: dataTugas[0].kode_kelas
      });
    }

    // ... rest of the code remains the same
    const months = [
      { value: "01", name: 'Januari' },
      { value: "02", name: 'Februari' },
      // ... etc
    ];

    const currentYear = parseInt(moment().format("YYYY"));
    const years = [
      (currentYear - 2).toString(), 
      (currentYear - 1).toString(), 
      currentYear.toString(), 
      (currentYear + 1).toString()
    ];

    res.render("tugas/index", {
      dataMapel,
      dataTugas,
      dataKelas,
      nama_mapel,
      kode_kelas,
      id_mapel,
      bulan,
      tahun,
      months,
      years,
      level: userLevel,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });

  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Terjadi kesalahan: " + err.message);
    res.redirect("/");
  }
});


// Form tambah tugas
router.get("/create/:id_mapel", async function (req, res) {
  try {
    const id_mapel = req.params.id_mapel;

    if (!id_mapel || isNaN(id_mapel)) {
      req.flash("error", "ID Mata Pelajaran tidak valid");
      return res.redirect("/tugas");
    }

    // Ambil data mapel
    const mapelData = await Model_Mapel.getId(id_mapel);
    if (!mapelData || mapelData.length === 0) {
      req.flash("error", "Mata Pelajaran tidak ditemukan");
      return res.redirect("/tugas");
    }

    // Dapatkan id guru dari session
    const id_guru_login = req.session.userId;
    
    // Ambil data user yang login
    const userData = await Model_Users.getId(id_guru_login);
    if (!userData || userData.length === 0) {
      req.flash("error", "Data user tidak ditemukan");
      return res.redirect("/tugas");
    }
    
    // Ambil ID guru dari tabel users
    const id_guru = userData[0].id_guru;
    const nama_guru_login = req.session.username;
    
    // Jika tidak ada id_guru yang terkait, berarti user bukan guru
    if (!id_guru) {
      req.flash("error", "Akun Anda tidak terkait dengan data guru");
      return res.redirect("/tugas");
    }
    
    // Ambil kelas yang diampu oleh guru tersebut
    const kelasData = await Model_Guru_Kelas.getKelas(id_guru);
    
    // Default deadline (seminggu dari sekarang, jam 23:59)
    const nextWeek = moment().tz('Asia/Jakarta').add(1, 'weeks').format("YYYY-MM-DDT23:59");

    res.render("tugas/create", {
      id_mapel: mapelData[0].id_mapel,
      nama_mapel: mapelData[0].nama_mapel,
      id_guru_login: id_guru,
      nama_guru_login: nama_guru_login,
      dataKelas: kelasData,
      level: req.session.level,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan: " + err.message);
    res.redirect("/tugas");
  }
});

// Simpan tugas baru
router.post("/store", async function (req, res) {
  try {
    const { id_mapel, id_guru, id_kelas, nama_tugas, deskripsi, deadline } = req.body;
    
    // Validasi input
    if (!id_mapel || !id_guru || !id_kelas || !nama_tugas || !deskripsi || !deadline) {
      req.flash("error", "Semua field harus diisi!");
      return res.redirect(`/tugas/create/${id_mapel}`);
    }
    
    // Data untuk disimpan - TANPA kolom tanggal
    const Data = { 
      id_mapel, 
      id_guru, 
      id_kelas, 
      nama_tugas, 
      deskripsi, 
      deadline
      // Hapus kolom tanggal karena tidak ada di tabel
    };
    
    await Model_Tugas.Store(Data);
    req.flash("success", "Berhasil menyimpan data tugas!");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi: " + err.message);
    res.redirect("/tugas");
  }
});

// Edit tugas
router.get("/edit/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const tugasData = await Model_Tugas.getId(id);
    
    if (!tugasData) {
      req.flash("error", "Data tugas tidak ditemukan");
      return res.redirect("/tugas");
    }
    
    // Dapatkan id guru dari session
    const id_guru_login = req.session.userId;
    
    // Ambil data user yang login
    const userData = await Model_Users.getId(id_guru_login);
    if (!userData || userData.length === 0) {
      req.flash("error", "Data user tidak ditemukan");
      return res.redirect("/tugas");
    }
    
    // Ambil ID guru dari tabel users
    const id_guru = userData[0].id_guru;
    
    // Jika user adalah guru tetapi bukan pembuat tugas ini, redirect
    if (req.session.level === 'guru' && tugasData.id_guru !== id_guru) {
      req.flash("error", "Anda hanya dapat mengedit tugas yang Anda buat");
      return res.redirect("/tugas");
    }
    
    const mapelData = await Model_Mapel.getAll();
    
    // Ambil kelas yang diampu oleh guru tersebut
    const kelasData = await Model_Guru_Kelas.getKelas(id_guru);

    // Format deadline untuk input datetime-local
    const deadline = moment(tugasData.deadline).format("YYYY-MM-DDTHH:mm");

    res.render("tugas/edit", {
      id: tugasData.id_tugas,
      id_mapel: tugasData.id_mapel,
      nama_mapel: tugasData.nama_mapel,
      id_guru: tugasData.id_guru,
      id_kelas: tugasData.id_kelas,
      nama_tugas: tugasData.nama_tugas,
      deskripsi: tugasData.deskripsi,
      deadline: deadline,
      dataMapel: mapelData,
      dataKelas: kelasData,
      level: req.session.level,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Gagal memuat data tugas: " + err.message);
    res.redirect("/tugas");
  }
});

// Update tugas
router.post("/update/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const { id_mapel, id_guru, id_kelas, nama_tugas, deskripsi, deadline } = req.body;
    
    // Validasi input
    if (!id_mapel || !id_guru || !id_kelas || !nama_tugas || !deskripsi || !deadline) {
      req.flash("error", "Semua field harus diisi!");
      return res.redirect(`/tugas/edit/${id}`);
    }
    
    const Data = { id_mapel, id_guru, id_kelas, nama_tugas, deskripsi, deadline };
    await Model_Tugas.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan pada fungsi: " + err.message);
    res.redirect("/tugas");
  }
});

// Hapus tugas
router.get("/delete/:id", async function (req, res) {
  try {
    const id = req.params.id;
    
    // Ambil data tugas
    const tugasData = await Model_Tugas.getId(id);
    if (!tugasData) {
      req.flash("error", "Data tugas tidak ditemukan");
      return res.redirect("/tugas");
    }
    
    // Dapatkan id guru dari session
    const id_guru_login = req.session.userId;
    
    // Ambil data user yang login
    const userData = await Model_Users.getId(id_guru_login);
    
    // Jika user adalah guru, periksa apakah dia yang membuat tugas ini
    if (req.session.level === 'guru') {
      const id_guru = userData[0].id_guru;
      if (tugasData.id_guru !== id_guru) {
        req.flash("error", "Anda hanya dapat menghapus tugas yang Anda buat");
        return res.redirect("/tugas");
      }
    }
    
    await Model_Tugas.Delete(id);
    req.flash("success", "Data tugas berhasil dihapus!");
    res.redirect("/tugas");
  } catch (err) {
    console.log(err);
    req.flash("error", "Terjadi kesalahan saat menghapus: " + err.message);
    res.redirect("/tugas");
  }
});

module.exports = router;