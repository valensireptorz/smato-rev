const express = require("express");
const router = express.Router();
const Model_Kelas = require("../../model/Model_Kelas.js"); // pastikan file model ini ada

// Ambil semua data kelas
router.get("/getall", async (req, res) => {
  try {
    const data = await Model_Kelas.getAll();
    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data kelas",
      data: data,
    });
  } catch (error) {
    console.error("Error getAll kelas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data kelas",
      error: error.message,
    });
  }
});

// Ambil kelas berdasarkan ID
router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Model_Kelas.getById(id);
    if (data.length > 0) {
      res.status(200).json({
        success: true,
        message: "Berhasil mengambil data kelas",
        data: data[0],
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data kelas tidak ditemukan",
      });
    }
  } catch (error) {
    console.error("Error getById kelas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data kelas",
      error: error.message,
    });
  }
});

// Tambah data kelas
router.post("/store", async (req, res) => {
  const { kode_kelas } = req.body;

  if (!kode_kelas) {
    return res.status(400).json({
      success: false,
      message: "Kode kelas wajib diisi",
    });
  }

  try {
    await Model_Kelas.store({ kode_kelas });
    res.status(201).json({
      success: true,
      message: "Data kelas berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Error store kelas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan data kelas",
      error: error.message,
    });
  }
});

// Update data kelas
router.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { kode_kelas } = req.body;

  try {
    await Model_Kelas.update(id, { kode_kelas });
    res.status(200).json({
      success: true,
      message: "Data kelas berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error update kelas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui data kelas",
      error: error.message,
    });
  }
});

// Hapus data kelas
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Model_Kelas.delete(id);
    res.status(200).json({
      success: true,
      message: "Data kelas berhasil dihapus",
    });
  } catch (error) {
    console.error("Error delete kelas:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus data kelas",
      error: error.message,
    });
  }
});

module.exports = router;
