const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Tambahkan import bcrypt

const Model_Users = require("../model/Model_Users.js");
const Model_Siswa = require("../model/Model_Siswa.js");
const Model_Kelas = require("../model/Model_Kelas.js");
const Model_Mapel = require("../model/Model_Mapel.js");

// Route untuk menampilkan halaman promosi siswa
router.get("/promote", async function (req, res) {
  try {
    const level_users = req.session.level;
    const id = req.session.userId;
    const { filterKelas } = req.query; // Menangkap kelas yang difilter dari query

    const Data = await Model_Users.getId(id);

    if (Data.length > 0) {
      const classes = await Model_Kelas.getAll(); // Mendapatkan semua kelas
      const students = await Model_Siswa.getAll(); // Mendapatkan semua siswa

      res.render("siswa/promote", {
        students: students,
        classes: classes,
        level: level_users,
        error: req.flash("error"),
        success: req.flash("success"),
        filterKelas: filterKelas || '', // Kirim filterKelas untuk menampilkan pilihan yang sesuai
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error);
    res.redirect("/login");
  }
});

// Route untuk menangani promosi siswa
router.post("/promote", async function (req, res) {
  try {
    let { selectedStudents, newClass } = req.body;

    if (!selectedStudents || !newClass) {
      req.flash("error", "Harap pilih siswa dan kelas baru");
      return res.redirect("/siswa/promote");
    }

    // Pastikan selectedStudents adalah array, jika tidak buat menjadi array
    if (!Array.isArray(selectedStudents)) {
      selectedStudents = [selectedStudents]; // Jika hanya 1 siswa yang dipilih
    }

    // Menaikkan kelas siswa yang dipilih ke kelas baru
    for (let id of selectedStudents) {
      await Model_Siswa.promoteToNewClass(id, newClass);
    }

    req.flash("success", "Siswa berhasil dinaikkan kelas!");
    res.redirect("/siswa");
  } catch (error) {
    console.error(error);
    req.flash("error", "Terjadi kesalahan saat menaikkan kelas siswa");
    res.redirect("/siswa");
  }
});


// Route untuk menangani proses promosi
router.post("/promote", async function (req, res) {
  try {
    let { selectedStudents, newClass } = req.body;

    if (!selectedStudents || !newClass) {
      req.flash("error", "Harap pilih siswa dan kelas baru");
      return res.redirect("/siswa/promote");
    }

    // Pastikan selectedStudents adalah array, jika tidak buat menjadi array
    if (!Array.isArray(selectedStudents)) {
      selectedStudents = [selectedStudents]; // Jika hanya 1 siswa yang dipilih
    }

    // Menaikkan kelas siswa yang dipilih ke kelas baru
    for (let id of selectedStudents) {
      await Model_Siswa.promoteToNewClass(id, newClass);
    }

    req.flash("success", "Siswa berhasil dinaikkan kelas!");
    res.redirect("/siswa");
  } catch (error) {
    console.error(error);
    req.flash("error", "Terjadi kesalahan saat menaikkan kelas siswa");
    res.redirect("/siswa");
  }
});



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
    error: req.flash("error"),
    success: req.flash("success"),
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

    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const Data = {
      id_kelas,
      nama_siswa,
      nis: parseInt(nis) || 0,
      alamat,
      password: hashedPassword, // Simpan password yang sudah di-hash
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
  try {
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
        password: "", // Jangan tampilkan password lama untuk keamanan
        level: level_users,
        data_kelas: kelas,
        error: req.flash("error"),
        success: req.flash("success")
      });
    } else {
      req.flash("error", "Data tidak ditemukan");
      res.redirect("/siswa");
    }
  } catch (error) {
    console.error("Error saat mengambil data edit:", error);
    req.flash("error", "Terjadi kesalahan saat memuat data");
    res.redirect("/siswa");
  }
});

// Proses update siswa
router.post("/update/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const { id_kelas, nama_siswa, nis, alamat, password } = req.body;

    // Validasi input wajib
    if (!id_kelas || !nama_siswa || !nis || !alamat) {
      req.flash("error", "Semua kolom wajib diisi kecuali password!");
      return res.redirect(`/siswa/edit/${id}`);
    }

    // Cek apakah NIS sudah digunakan oleh siswa lain
    const nisExists = await Model_Siswa.isNisExistForUpdate(nis, id);
    if (nisExists) {
      req.flash("error", "NIS sudah terdaftar oleh siswa lain, gunakan NIS lain.");
      return res.redirect(`/siswa/edit/${id}`);
    }

    let Data = {
      id_kelas,
      nama_siswa,
      nis: parseInt(nis) || 0,
      alamat,
    };

    // Jika password diisi, hash password baru
    if (password && password.trim() !== "") {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      Data.password = hashedPassword;
    }

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
    // Ambil data siswa berdasarkan NIS
    const siswaData = await Model_Siswa.getByNIS(nis);

    if (siswaData.length > 0) {
      const siswa = siswaData[0];
      
      // Bandingkan password yang diinput dengan hash yang tersimpan
      const isPasswordValid = await bcrypt.compare(password, siswa.password);

      if (isPasswordValid) {
        // Jangan kirim password dalam response
        const { password: _, ...siswaWithoutPassword } = siswa;
        
        res.json({
          message: 'Login berhasil',
          data: siswaWithoutPassword
        });
      } else {
        res.json({
          message: 'NIS atau password salah'
        });
      }
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

// ✅ Tambahan: Route untuk reset password siswa (opsional)
router.post('/reset-password/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.trim() === '') {
      req.flash("error", "Password baru harus diisi!");
      return res.redirect(`/siswa/edit/${id}`);
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await Model_Siswa.Update(id, { password: hashedPassword });
    
    req.flash("success", "Password berhasil direset!");
    res.redirect("/siswa");
  } catch (error) {
    console.error("Error reset password:", error);
    req.flash("error", "Terjadi kesalahan saat reset password");
    res.redirect("/siswa");
  }
});

module.exports = router;