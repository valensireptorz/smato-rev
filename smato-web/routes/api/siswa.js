const express = require("express");
const router = express.Router();
const Model_Siswa = require("../../model/Model_Siswa.js");
const Model_Kelas = require("../../model/Model_Kelas.js");

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
