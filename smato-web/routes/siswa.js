const express = require("express");
const router = express.Router();

const Model_Users = require("../model/Model_Users.js");
const Model_Siswa = require("../model/Model_Siswa.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Mapel = require("../model/Model_Mapel.js");


// Cari siswa berdasarkan kode_kelas
router.get("/search", async function (req, res) {
  try {
    const level_users = req.session.level;
    const id = req.session.userId;
    const { kelas } = req.query; // ambil parameter dari URL, misal /siswa/search?kelas=XII-RPL

    const Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      let rows;

      if (kelas) {
        // kalau ada query kelas, cari berdasarkan kelas
        rows = await Model_Siswa.getByKelas(kelas);
      } else {
        // kalau tidak ada, tampilkan semua
        rows = await Model_Siswa.getAllWithKelas();
      }

      res.render("siswa/index", {
        data: rows,
        level: level_users,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
});


// Halaman utama siswa
router.get("/", async function (req, res) {
  try {
    const level_users = req.session.level;
    const id = req.session.userId;
    const Data = await Model_Users.getId(id);
    if (Data.length > 0) {
      // Mengambil data siswa dengan informasi kelas (kode_kelas)
      const rows = await Model_Siswa.getAllWithKelas();
      res.render("siswa/index", {
        data: rows,
        level: level_users,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/login");
  }
});



// Form tambah siswa
router.get("/create", async function (req, res) {
  const level_users = req.session.level;
  const kelas = await Model_Kelas.getAll();

  res.render("siswa/create", {
    id_kelas: "",
    nama_siswa: "",
    nis: "",
    alamat: "",
    password: "",
    level: level_users,
    data_kelas: kelas,
    error: req.flash("error"),  // TAMBAH INI
    success: req.flash("success"), // TAMBAH INI (opsional)
  });
});


// Proses simpan siswa
router.post("/store", async function (req, res) {
  try {
    const { id_kelas, nama_siswa, nis, alamat, password } = req.body;

    if (!id_kelas || !nama_siswa || !nis || !alamat || !password) {
      req.flash("error", "Semua kolom wajib diisi!");
      return res.redirect("/siswa/create");
    }

    // Cek apakah NIS sudah digunakan
    const nisExists = await Model_Siswa.isNisExist(nis);
    if (nisExists) {
      req.flash("error", "NIS sudah terdaftar, gunakan NIS lain.");
      return res.redirect("/siswa/create");
    }

    const Data = {
      id_kelas,
      nama_siswa,
      nis: parseInt(nis) || 0,
      alamat,
      password,
    };

    await Model_Siswa.Store(Data);
    req.flash("success", "Berhasil menyimpan data siswa!");
    res.redirect("/siswa");

  } catch (error) {
    console.error("Error saat menyimpan data siswa:", error);
    req.flash("error", "Terjadi kesalahan pada fungsi store");
    res.redirect("/siswa");
  }
});

  

// Form edit siswa
router.get("/edit/:id", async function (req, res) {
  const level_users = req.session.level;
  const id = req.params.id;

  const rows = await Model_Siswa.getId(id);
  const kelas = await Model_Kelas.getAll();

  if (rows.length > 0) {
    res.render("siswa/edit", {
      id: rows[0].id_siswa,
      id_kelas: rows[0].id_kelas,
      nama_siswa: rows[0].nama_siswa,
      nis: rows[0].nis,
      alamat: rows[0].alamat,
      password: rows[0].password,
      level: level_users,
      data_kelas: kelas
    });
  } else {
    req.flash("error", "Data tidak ditemukan");
    res.redirect("/siswa");
  }
});
// Proses update siswa
router.post("/update/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const {id_kelas, nama_siswa, nis, alamat, password } = req.body;

    const Data = {
        id_kelas,
      nama_siswa,
      nis,
      alamat,
      password,
    };

    await Model_Siswa.Update(id, Data);
    req.flash("success", "Berhasil memperbarui data siswa");
    res.redirect("/siswa");
  } catch (error) {
    console.log(error);
    req.flash("error", "Terjadi kesalahan pada fungsi update");
    res.redirect("/siswa");
  }
});

// Proses hapus siswa
router.get("/delete/:id", async function (req, res) {
  try {
    const id = req.params.id;
    await Model_Siswa.Delete(id);
    req.flash("success", "Data siswa berhasil dihapus!");
    res.redirect("/siswa");
  } catch (error) {
    req.flash("error", "Terjadi kesalahan saat menghapus");
    res.redirect("/siswa");
  }
});

// POST /siswa/login
router.post('/login', async (req, res) => {
  const { nis, password } = req.body;

  try {
    const result = await Model_Siswa.login(nis, password);

    if (result.length > 0) {
      res.json({
        message: 'Login berhasil',
        data: result[0]
      });
    } else {
      res.json({
        message: 'NIS atau password salah'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan pada server'
    });
  }
});

module.exports = router;
