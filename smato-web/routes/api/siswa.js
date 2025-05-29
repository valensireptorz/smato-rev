const express = require("express");
const router = express.Router();
const Model_Siswa = require("../../model/Model_Siswa.js");
const Model_Kelas = require("../../model/Model_Kelas.js");

router.post("/change-password", async (req, res) => {
  try {
    const { nis, oldPassword, newPassword } = req.body;

    // Log input untuk debugging
    console.log('Change Password Request:', { nis, oldPassword: '****', newPassword: '****' });

    // Validasi input
    if (!nis || !oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "NIS, password lama, dan password baru wajib diisi" 
      });
    }

    // Validasi panjang password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 6 karakter"
      });
    }

    // Panggil method changePassword
    const result = await Model_Siswa.changePassword(nis, oldPassword, newPassword);

    return res.status(200).json(result);

  } catch (error) {
    // Log error detail untuk debugging
    console.error("Detailed Error change password:", error);
    
    // Handle berbagai jenis error
    if (error.message === 'Siswa tidak ditemukan') {
      return res.status(404).json({ 
        success: false, 
        message: 'Siswa tidak ditemukan' 
      });
    }

    if (error.message === 'Password lama salah') {
      return res.status(401).json({ 
        success: false, 
        message: 'Password lama salah' 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan saat mengubah password",
      error: error.message 
    });
  }
});

// ✅ API GET SEMUA DATA SISWA
router.get("/getall", async function (req, res) {
  try {
    const data = await Model_Siswa.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil data siswa",
      data: data
    });
  } catch (error) {
    console.error("Error getAll siswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data",
      error: error.message
    });
  }
});

// ✅ API GET SISWA BERDASARKAN ID (UNTUK FLUTTER)
router.get("/get/:id", async function (req, res) {
  const id = req.params.id;

  try {
    const data = await Model_Siswa.getById(id); // Pastikan fungsi ini mengembalikan 1 objek
    if (data) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data siswa berdasarkan ID",
        data: data // data adalah object, bukan array
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data siswa tidak ditemukan",
        data: null
      });
    }
  } catch (error) {
    console.error("Error getById siswa:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data berdasarkan ID",
      error: error.message
    });
  }
});


// file: routes/siswa.js

router.post("/login", async (req, res) => {
  try {
    const { nis, password } = req.body;

    if (!nis || !password) {
      return res.status(400).json({ message: "NIS dan password wajib diisi" });
    }

    const result = await Model_Siswa.login(nis, password);

    if (result.length === 0) {
      return res.status(401).json({ message: "Login gagal, NIS atau password salah" });
    }

    return res.status(200).json({
      message: "Login berhasil",
      data: result[0], // ini akan menyertakan kode_kelas
    });

  } catch (error) {
    console.error("Error login siswa:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});




module.exports = router;
